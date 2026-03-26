const fs = require('fs');
const path = require('path');

const errorLogger = (err, req, res, next) => {
  const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url}
Error: ${err.message}
Stack: ${err.stack}
Body: ${JSON.stringify(req.body)}
User: ${JSON.stringify(req.user)}
--------------------------------------------------\n`;
  
  fs.appendFileSync(path.join(__dirname, '../../error_audit.log'), logMessage);
  
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorLogger;
