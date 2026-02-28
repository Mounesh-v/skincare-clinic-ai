/**
 * Minimal structured logger for production.
 * Wraps console with level-aware output; suppresses debug in production.
 */
const isProd = process.env.NODE_ENV === 'production';

const logger = {
    info: (...args) => console.info('[INFO]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args),
    error: (...args) => console.error('[ERROR]', ...args),
    debug: (...args) => { if (!isProd) console.debug('[DEBUG]', ...args); },
};

export default logger;
