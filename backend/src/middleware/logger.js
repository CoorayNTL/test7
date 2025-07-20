// Extra logger middleware stub for candidate to enhance
module.exports = (req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
};