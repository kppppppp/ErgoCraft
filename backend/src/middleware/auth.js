import { verifyToken } from '../utils/token.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Please log in to access this resource');
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      throw new ApiError(401, 'User belonging to this token no longer exists or is inactive');
    }
    if ((decoded.tokenVersion ?? 0) !== (user.tokenVersion || 0)) {
      throw new ApiError(401, 'Your session has expired. Please sign in again.');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error.message || 'Invalid or expired authentication token');
  }
});

// Optional authentication: populates req.user if valid token present, otherwise proceeds without error
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);
      if (user && user.isActive && (decoded.tokenVersion ?? 0) === (user.tokenVersion || 0)) {
        req.user = user;
      }
    } catch {
      // Ignore invalid token for optional auth
    }
  }
  next();
});
