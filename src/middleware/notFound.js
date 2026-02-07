/**
 * 404 handler — catches requests that don't match any route.
 */
function notFound(req, res, _next) {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = notFound;
