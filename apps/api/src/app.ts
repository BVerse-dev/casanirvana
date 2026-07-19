import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth';
import societyRoutes from './routes/society';
import unitRoutes from './routes/unit';
import visitorRoutes from './routes/visitor';
import noticeRoutes from './routes/notice';
import maintenanceRoutes from './routes/maintenance';
import complaintRoutes from './routes/complaint';
import paymentRoutes from './routes/payment';
import expressPayRoutes from './routes/expresspay';
import messageRoutes from './routes/message';
import uploadRoutes from './routes/upload';
import adminRoutes from './routes/admin';
import onboardingRoutes from './routes/onboarding';
import accountRoutes from './routes/account';
import internalRoutes from './routes/internal';
import observabilityRoutes from './routes/observability';
import contactRoutes from './routes/contact';

// Enhanced routes with full field support
import guardsRoutes from './routes/guards';
import unitsEnhancedRoutes from './routes/units_enhanced';
import amenitiesRoutes from './routes/amenities';

import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { apiRateLimiter, adminRateLimiter, authRateLimiter, contactRateLimiter, onboardingRateLimiter } from './middleware/rateLimit';
import { initObservability } from './lib/observability';

initObservability();
const app = express();
app.disable('x-powered-by');

if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8080',
  'http://localhost:19006',
  'http://localhost:19000',
];
const allowList = corsOrigins.length > 0 ? corsOrigins : defaultOrigins;

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isOriginAllowed = (origin: string) => {
  return allowList.some((rule) => {
    if (rule === '*') return true;
    if (rule === origin) return true;

    // Allow simple wildcard rules like https://*.vercel.app
    if (rule.includes('*')) {
      const regex = new RegExp(`^${rule.split('*').map(escapeRegExp).join('.*')}$`);
      return regex.test(origin);
    }

    return false;
  });
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (isOriginAllowed(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
const isProd = process.env.NODE_ENV === 'production';
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    hsts: isProd
      ? {
          maxAge: 15552000,
          includeSubDomains: true,
          preload: true,
        }
      : false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);
app.use(requestLogger);
app.use(apiRateLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'casa-nirvana-backend',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use('/auth', authRateLimiter, authRoutes);
app.use('/societies', societyRoutes);
app.use('/societies', unitRoutes); // units are nested under societies
app.use('/', visitorRoutes); // visitor-passes and entry-logs
app.use('/', noticeRoutes); // notices and events
app.use('/', maintenanceRoutes);
app.use('/', complaintRoutes);
app.use('/', paymentRoutes);
app.use('/', expressPayRoutes);
app.use('/', messageRoutes);
app.use('/', uploadRoutes);
app.use('/admin', adminRateLimiter, adminRoutes); // Admin-specific routes
app.use('/onboarding', onboardingRateLimiter, onboardingRoutes); // Public onboarding requests (API key protected)
app.use('/contact', contactRateLimiter, contactRoutes); // Public marketing contact requests (API key protected)
app.use('/account', authRateLimiter, accountRoutes); // User account self-service actions
app.use('/internal', internalRoutes); // Internal API key protected automations
app.use('/observability', observabilityRoutes); // client-side error and telemetry ingest

// Enhanced routes with full field support
app.use('/api/guards', guardsRoutes); // Enhanced guards management
app.use('/api/units-enhanced', unitsEnhancedRoutes); // Enhanced units management (using different path to avoid conflicts)
app.use('/api/amenities', amenitiesRoutes); // Enhanced amenities management

// Global error handler
app.use(errorHandler);

export default app;
