type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const ACTIVE_LOG_LEVEL = resolveLogLevel(process.env.LOG_LEVEL);
const SERVICE_NAME = process.env.SERVICE_NAME || 'casa-nirvana-backend';
const ENVIRONMENT = process.env.NODE_ENV || 'development';

type LogContext = Record<string, unknown>;

function resolveLogLevel(value?: string): LogLevel {
  if (!value) {
    return 'info';
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'debug' || normalized === 'info' || normalized === 'warn' || normalized === 'error') {
    return normalized;
  }

  return 'info';
}

function shouldLog(level: LogLevel) {
  return LOG_LEVEL_ORDER[level] >= LOG_LEVEL_ORDER[ACTIVE_LOG_LEVEL];
}

function serializeError(error: Error) {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack || null,
  };
}

function normalizeContextValue(value: unknown): unknown {
  if (value instanceof Error) {
    return serializeError(value);
  }

  if (Array.isArray(value)) {
    return value.map(normalizeContextValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, normalizeContextValue(entry)])
    );
  }

  return value;
}

function writeLog(level: LogLevel, message: string, context: LogContext = {}) {
  if (!shouldLog(level)) {
    return;
  }

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    service: SERVICE_NAME,
    environment: ENVIRONMENT,
    msg: message,
    ...normalizeContextValue(context),
  };

  const line = JSON.stringify(payload);

  if (level === 'error') {
    console.error(line);
    return;
  }

  if (level === 'warn') {
    console.warn(line);
    return;
  }

  console.log(line);
}

function child(defaultContext: LogContext) {
  return {
    debug: (message: string, context: LogContext = {}) => writeLog('debug', message, { ...defaultContext, ...context }),
    info: (message: string, context: LogContext = {}) => writeLog('info', message, { ...defaultContext, ...context }),
    warn: (message: string, context: LogContext = {}) => writeLog('warn', message, { ...defaultContext, ...context }),
    error: (message: string, context: LogContext = {}) => writeLog('error', message, { ...defaultContext, ...context }),
  };
}

export const logger = {
  debug: (message: string, context?: LogContext) => writeLog('debug', message, context),
  info: (message: string, context?: LogContext) => writeLog('info', message, context),
  warn: (message: string, context?: LogContext) => writeLog('warn', message, context),
  error: (message: string, context?: LogContext) => writeLog('error', message, context),
  child,
};

