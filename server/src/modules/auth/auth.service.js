const bcrypt = require('bcryptjs');
const Tenant = require('../../models/Tenant.model');
const User = require('../../models/User.model');
const ApiError = require('../../utils/ApiError');
const { signToken } = require('../../utils/jwt');

const SALT_ROUNDS = 12;

async function register({ tenantName, tenantCode, email, password, firstName, lastName }) {
  const existingTenant = await Tenant.findOne({ code: tenantCode, isDeleted: false });
  if (existingTenant) {
    throw new ApiError(409, 'Tenant code already registered');
  }

  const tenant = await Tenant.create({ name: tenantName, code: tenantCode });
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    tenantId: tenant._id,
    firstName,
    lastName,
    email,
    passwordHash,
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
  });

  const token = signToken({ userId: user._id, tenantId: tenant._id, role: user.role });

  return {
    token,
    tenant: { id: tenant._id, name: tenant.name, code: tenant.code },
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  };
}

async function login({ tenantCode, email, password }) {
  const tenant = await Tenant.findOne({ code: tenantCode, isDeleted: false });
  if (!tenant) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const user = await User.findOne({
    tenantId: tenant._id,
    email,
    isDeleted: false,
  });
  if (!user || user.status !== 'ACTIVE') {
    throw new ApiError(401, 'Invalid credentials');
  }

  if (!user.passwordHash) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = signToken({ userId: user._id, tenantId: tenant._id, role: user.role });

  return {
    token,
    tenant: {
      id: tenant._id,
      name: tenant.name,
      code: tenant.code,
    },
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      tenantId: tenant._id,
    },
  };
}

async function session(userId, tenantId) {
  const tenant = await Tenant.findOne({ _id: tenantId, isDeleted: false }).lean();
  const user = await User.findOne({ _id: userId, tenantId, isDeleted: false }).select('-passwordHash').lean();
  if (!user) throw new ApiError(401, 'Unauthorized');
  return {
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      tenantId: user.tenantId,
    },
    tenant: tenant
      ? { id: tenant._id, name: tenant.name, code: tenant.code }
      : { id: tenantId, name: '', code: '' },
  };
}

module.exports = { register, login, session };
