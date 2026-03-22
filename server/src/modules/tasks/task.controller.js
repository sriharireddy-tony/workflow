const asyncHandler = require('../../utils/asyncHandler');
const taskService = require('./task.service');

const create = asyncHandler(async (req, res) => {
  const task = await taskService.createTaskAsEmployee(req.user.tenantId, req.user.userId, req.body);
  res.status(201).json({ success: true, data: task });
});

const list = asyncHandler(async (req, res) => {
  const result = await taskService.listTasks(req.user.tenantId, req.query, req.user.role, req.user.userId);
  res.json({ success: true, data: result.items, meta: result.meta });
});

const getOne = asyncHandler(async (req, res) => {
  const task = await taskService.getTask(req.user.tenantId, req.params.id, req.user.role, req.user.userId);
  res.json({ success: true, data: task });
});

const update = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(
    req.user.tenantId,
    req.params.id,
    req.body,
    req.user.role,
    req.user.userId
  );
  res.json({ success: true, data: task });
});

const remove = asyncHandler(async (req, res) => {
  const result = await taskService.softDeleteTask(req.user.tenantId, req.params.id);
  res.json({ success: true, data: result });
});

const byProject = asyncHandler(async (req, res) => {
  const items = await taskService.listTasksByProject(
    req.user.tenantId,
    req.params.projectId,
    req.user.role,
    req.user.userId
  );
  res.json({ success: true, data: items });
});

const addComment = asyncHandler(async (req, res) => {
  const task = await taskService.addComment(
    req.user.tenantId,
    req.params.id,
    req.body.message,
    req.user.userId,
    req.user.role,
    req.user.userId
  );
  res.status(201).json({ success: true, data: task });
});

module.exports = { create, list, getOne, update, remove, byProject, addComment };
