const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.originalUrl}`,
  });
};

export default notFound;
