const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signToken({ userId, tenantId, role }) {
  return jwt.sign(
    { sub: userId.toString(), tenantId: tenantId.toString(), role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

module.exports = { signToken };
