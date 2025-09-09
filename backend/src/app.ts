import express from 'express';
import cors from 'cors';
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
import messageRoutes from './routes/message';
import uploadRoutes from './routes/upload';
import adminRoutes from './routes/admin';

// Enhanced routes with full field support
import guardsRoutes from './routes/guards';
import unitsEnhancedRoutes from './routes/units_enhanced';
import amenitiesRoutes from './routes/amenities';

import { errorHandler } from './middleware/errorHandler';

const app = express();
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/auth', authRoutes);
app.use('/societies', societyRoutes);
app.use('/societies', unitRoutes); // units are nested under societies
app.use('/', visitorRoutes); // visitor-passes and entry-logs
app.use('/', noticeRoutes); // notices and events
app.use('/', maintenanceRoutes);
app.use('/', complaintRoutes);
app.use('/', paymentRoutes);
app.use('/', messageRoutes);
app.use('/', uploadRoutes);
app.use('/admin', adminRoutes); // Admin-specific routes

// Enhanced routes with full field support
app.use('/api/guards', guardsRoutes); // Enhanced guards management
app.use('/api/units-enhanced', unitsEnhancedRoutes); // Enhanced units management (using different path to avoid conflicts)
app.use('/api/amenities', amenitiesRoutes); // Enhanced amenities management

// Global error handler
app.use(errorHandler);

export default app;
