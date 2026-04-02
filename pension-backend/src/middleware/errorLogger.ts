import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';

const errorLogger = (err: any, req: any, res: express.Response, next: express.NextFunction) => {
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

export default errorLogger;
