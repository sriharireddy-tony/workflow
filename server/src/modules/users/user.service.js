const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../../models/User.model');
const Project = require('../../models/Project.model');
const ApiError = require('../../utils/ApiError');
const { parsePagination, paginatedMeta } = require('../../utils/pagination');
const { assertObjectId } = require('../../utils/id');

const SALT_ROUNDS = 12;

function toPublicUser(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  delete o.passwordHash;
  return o;
}

async function createUser(tenantId, payload, actorRole) {
  if (payload.role === 'SUPER_ADMIN' && actorRole !== 'SUPER_ADMIN') {
    throw new ApiError(403, 'Cannot assign SUPER_ADMIN');
  }
  const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);
  const user = await User.create({
    tenantId,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    passwordHash,
    role: payload.role,
    managerId: payload.managerId || null,
    status: payload.status,
  });
  return toPublicUser(user);
}

async function listUsers(tenantId, query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { tenantId, isDeleted: false };
  if (query.status) filter.status = query.status;
  if (query.role) filter.role = query.role;
  if (query.search) {
    const s = query.search.trim();
    filter.$or = [
      { firstName: new RegExp(s, 'i') },
      { lastName: new RegExp(s, 'i') },
      { email: new RegExp(s, 'i') },
    ];
  }
  const [items, total] = await Promise.all([
    User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  return { items, meta: paginatedMeta({ total, page, limit }) };
}

async function getUserById(tenantId, id) {
  assertObjectId(id, 'user id');
  const user = await User.findOne({ _id: id, tenantId, isDeleted: false }).select('-passwordHash').lean();
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

async function updateUser(tenantId, id, payload, actorRole) {
  assertObjectId(id, 'user id');
  const user = await User.findOne({ _id: id, tenantId, isDeleted: false });
  if (!user) throw new ApiError(404, 'User not found');

  if (payload.role === 'SUPER_ADMIN' && actorRole !== 'SUPER_ADMIN') {
    throw new ApiError(403, 'Cannot assign SUPER_ADMIN');
  }

  if (payload.firstName !== undefined) user.firstName = payload.firstName;
  if (payload.lastName !== undefined) user.lastName = payload.lastName;
  if (payload.role !== undefined) user.role = payload.role;
  if (payload.managerId !== undefined) user.managerId = payload.managerId || null;
  if (payload.status !== undefined) user.status = payload.status;
  if (payload.password) {
    user.passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);
  }
  await user.save();
  return toPublicUser(user);
}

async function softDeleteUser(tenantId, id) {
  assertObjectId(id, 'user id');
  const user = await User.findOne({ _id: id, tenantId, isDeleted: false });
  if (!user) throw new ApiError(404, 'User not found');
  user.isDeleted = true;
  user.status = 'INACTIVE';
  await user.save();
  return { id: user._id, deleted: true };
}

async function updateMe(tenantId, userId, payload) {
  const user = await User.findOne({ _id: userId, tenantId, isDeleted: false });
  if (!user) throw new ApiError(404, 'User not found');

  if (payload.firstName !== undefined) user.firstName = payload.firstName;
  if (payload.lastName !== undefined) user.lastName = payload.lastName;
  if (payload.email !== undefined) {
    const email = payload.email;
    const dup = await User.findOne({
      tenantId,
      email,
      isDeleted: false,
      _id: { $ne: userId },
    }).lean();
    if (dup) throw new ApiError(409, 'Email already in use');
    user.email = email;
  }
  await user.save();
  return toPublicUser(user);
}

async function changeMyPassword(tenantId, userId, currentPassword, newPassword) {
  const user = await User.findOne({ _id: userId, tenantId, isDeleted: false });
  if (!user) throw new ApiError(404, 'User not found');
  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) throw new ApiError(401, 'Current password is incorrect');
  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.save();
  return { updated: true };
}

async function listUserProjects(tenantId, userId) {
  assertObjectId(userId, 'user id');
  const uid = new mongoose.Types.ObjectId(userId);
  const projects = await Project.find({
    tenantId,
    isDeleted: false,
    'members.userId': uid,
  })
    .select('name key status clientId members startDate endDate')
    .lean();
  return projects;
}

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  updateMe,
  changeMyPassword,
  softDeleteUser,
  listUserProjects,
};
