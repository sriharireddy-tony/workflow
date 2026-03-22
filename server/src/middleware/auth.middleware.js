const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const User = require('../models/User.model');

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication required'));
  }
  const token = header.slice(7);
  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
  const user = await User.findOne({
    _id: payload.sub,
    tenantId: payload.tenantId,
    isDeleted: false,
    status: 'ACTIVE',
  }).lean();
  if (!user) {
    return next(new ApiError(401, 'User not found or inactive'));
  }
  req.user = {
    userId: user._id,
    tenantId: user.tenantId,
    role: user.role,
    email: user.email,
  };
  next();
}

module.exports = { authenticate };
