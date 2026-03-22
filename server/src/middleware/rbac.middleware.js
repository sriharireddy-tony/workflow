const ApiError = require('../utils/ApiError');

const ROLE_RANK = {
  EMPLOYEE: 1,
  MANAGER: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

function requireRoles(...allowed) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }
    if (!allowed.includes(req.user.role)) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }
    next();
  };
}

/** ADMIN+ or SUPER_ADMIN */
function requireAdminPlus(req, res, next) {
  return requireRoles('ADMIN', 'SUPER_ADMIN')(req, res, next);
}

/** MANAGER+ */
function requireManagerPlus(req, res, next) {
  return requireRoles('MANAGER', 'ADMIN', 'SUPER_ADMIN')(req, res, next);
}

function hasRoleAtLeast(userRole, minimum) {
  return (ROLE_RANK[userRole] || 0) >= (ROLE_RANK[minimum] || 0);
}

module.exports = {
  requireRoles,
  requireAdminPlus,
  requireManagerPlus,
  hasRoleAtLeast,
  ROLE_RANK,
};
