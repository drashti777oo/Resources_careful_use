export const logRequest = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl} ${req.ip}`);
  }
  next();
};
