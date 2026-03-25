const { verifyToken } = require('../utils/jwt');
const { ApiError } = require('../utils/apiResponse');

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided',
      });
    }

    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden',
      });
    }
    next();
  };
};

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};

module.exports = {
  authenticate,
  authorize,
  errorHandler,
};
