import { ApiError } from '../utils/apiError.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Access forbidden: user role '${req.user.role}' is not authorized`)
      );
    }

    next();
  };
};
