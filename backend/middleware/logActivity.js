const Log = require('../models/Log');

function getIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.connection?.remoteAddress
      || req.ip
      || '';
}

// Dùng: logActivity('LOGIN', (req, res) => ({ email: req.body?.email, success: res.statusCode === 200 }))
function logActivity(action, metaBuilder) {
  return (req, res, next) => {
    const startedAt = Date.now();
    res.on('finish', async () => {
      try {
        const meta = typeof metaBuilder === 'function'
          ? await Promise.resolve(metaBuilder(req, res))
          : (metaBuilder || {});
        await Log.create({
          userId: req.user?.id || null,
          action: res.locals.logAction || action,
          ip: getIp(req),
          ua: req.headers['user-agent'] || '',
          path: req.originalUrl,
          method: req.method,
          status: res.statusCode,
          meta: { ...meta, durationMs: Date.now() - startedAt }
        });
      } catch (e) {
        console.error('logActivity error:', e.message);
      }
    });
    next();
  };
}

module.exports = { logActivity };
