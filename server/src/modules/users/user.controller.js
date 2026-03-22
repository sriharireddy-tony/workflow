const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const userService = require('./user.service');
const taskService = require('../tasks/task.service');

const create = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.user.tenantId, req.body, req.user.role);
  res.status(201).json({ success: true, data: user });
});

const list = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.user.tenantId, req.query);
  res.json({ success: true, data: result.items, meta: result.meta });
});

const getOne = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isSelf = req.user.userId.toString() === id;
  if (!isSelf && !['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    throw new ApiError(403, 'Insufficient permissions');
  }
  const user = await userService.getUserById(req.user.tenantId, id);
  res.json({ success: true, data: user });
});

const update = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.user.tenantId, req.params.id, req.body, req.user.role);
  res.json({ success: true, data: user });
});

const remove = asyncHandler(async (req, res) => {
  const result = await userService.softDeleteUser(req.user.tenantId, req.params.id);
  res.json({ success: true, data: result });
});

const userProjects = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isSelf = req.user.userId.toString() === id;
  if (!isSelf && !['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    throw new ApiError(403, 'Insufficient permissions');
  }
  const projects = await userService.listUserProjects(req.user.tenantId, id);
  res.json({ success: true, data: projects });
});

const userTasks = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tasks = await taskService.listTasksByUser(
    req.user.tenantId,
    id,
    req.user.role,
    req.user.userId
  );
  res.json({ success: true, data: tasks });
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateMe(req.user.tenantId, req.user.userId, req.body);
  res.json({ success: true, data: user });
});

const changePassword = asyncHandler(async (req, res) => {
  await userService.changeMyPassword(
    req.user.tenantId,
    req.user.userId,
    req.body.currentPassword,
    req.body.newPassword
  );
  res.json({ success: true, data: { message: 'Password updated' } });
});

module.exports = {
  create,
  list,
  getOne,
  update,
  updateMe,
  changePassword,
  remove,
  userProjects,
  userTasks,
};
