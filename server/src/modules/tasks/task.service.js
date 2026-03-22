const mongoose = require('mongoose');
const Task = require('../../models/Task.model');
const Project = require('../../models/Project.model');
const Feature = require('../../models/Feature.model');
const Client = require('../../models/Client.model');
const ApiError = require('../../utils/ApiError');
const { parsePagination, paginatedMeta } = require('../../utils/pagination');
const { assertObjectId } = require('../../utils/id');

const TASK_LIST_POPULATE = [
  { path: 'clientId', select: 'name code' },
  { path: 'projectId', select: 'name key' },
  { path: 'featureId', select: 'name' },
  { path: 'assignees.userId', select: 'firstName lastName email' },
];

function populateTaskList(q) {
  return TASK_LIST_POPULATE.reduce((acc, p) => acc.populate(p), q);
}

function assigneeUserId(a) {
  return a.userId && a.userId._id ? a.userId._id : a.userId;
}

async function assertTaskHierarchy(tenantId, { clientId, projectId, featureId }) {
  const [client, project, feature] = await Promise.all([
    Client.findOne({ _id: clientId, tenantId, isDeleted: false }).lean(),
    Project.findOne({ _id: projectId, tenantId, isDeleted: false }).lean(),
    Feature.findOne({ _id: featureId, tenantId, isDeleted: false }).lean(),
  ]);
  if (!client) throw new ApiError(400, 'Invalid client');
  if (!project) throw new ApiError(400, 'Invalid project');
  if (!feature) throw new ApiError(400, 'Invalid feature');
  if (project.clientId.toString() !== clientId.toString()) {
    throw new ApiError(400, 'Project does not belong to client');
  }
  if (feature.projectId.toString() !== projectId.toString()) {
    throw new ApiError(400, 'Feature does not belong to project');
  }
}

function assigneesFromUserIds(userIds, assignedBy) {
  const unique = [...new Set(userIds || [])];
  return unique.map((userId) => ({
    userId,
    assignedBy,
    assignedAt: new Date(),
  }));
}

/**
 * Employee creates a task under a feature (must be a member of the feature's project).
 * Creator is recorded as the assignee so the task appears in their list.
 */
async function createTaskAsEmployee(tenantId, userId, payload) {
  assertObjectId(payload.featureId, 'featureId');
  const feature = await Feature.findOne({ _id: payload.featureId, tenantId, isDeleted: false }).lean();
  if (!feature) throw new ApiError(400, 'Invalid feature');

  const project = await Project.findOne({ _id: feature.projectId, tenantId, isDeleted: false }).lean();
  if (!project) throw new ApiError(400, 'Invalid project');

  const uid = userId.toString();
  const isMember = project.members.some((m) => m.userId.toString() === uid);
  if (!isMember) throw new ApiError(403, 'You must be a project member to create tasks for this feature');

  const clientId = project.clientId;
  await assertTaskHierarchy(tenantId, {
    clientId,
    projectId: project._id,
    featureId: feature._id,
  });

  const task = await Task.create({
    tenantId,
    clientId,
    projectId: project._id,
    featureId: feature._id,
    title: payload.title,
    description: payload.description || '',
    status: payload.status || 'TODO',
    priority: 'MEDIUM',
    startDate: payload.startDate,
    dueDate: payload.dueDate,
    assignees: assigneesFromUserIds([userId], userId),
    comments: [],
  });
  return task.toObject();
}

function employeeTaskFilter(userId) {
  return { 'assignees.userId': new mongoose.Types.ObjectId(userId) };
}

async function listTasks(tenantId, query, userRole, userId) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { tenantId, isDeleted: false };
  if (query.projectId) filter.projectId = query.projectId;
  if (query.featureId) filter.featureId = query.featureId;
  if (query.status) filter.status = query.status;
  if (userRole === 'EMPLOYEE') {
    Object.assign(filter, employeeTaskFilter(userId));
  }

  const q = populateTaskList(Task.find(filter))
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  const [items, total] = await Promise.all([q, Task.countDocuments(filter)]);
  return { items, meta: paginatedMeta({ total, page, limit }) };
}

async function listTasksByProject(tenantId, projectId, userRole, userId) {
  assertObjectId(projectId);
  const project = await Project.findOne({ _id: projectId, tenantId, isDeleted: false }).lean();
  if (!project) throw new ApiError(404, 'Project not found');
  if (userRole === 'EMPLOYEE') {
    const isMember = project.members.some((m) => m.userId.toString() === userId.toString());
    if (!isMember) throw new ApiError(403, 'Not a project member');
  }
  const filter = { tenantId, projectId, isDeleted: false };
  if (userRole === 'EMPLOYEE') Object.assign(filter, employeeTaskFilter(userId));
  return Task.find(filter).sort({ dueDate: 1, updatedAt: -1 }).lean();
}

async function listTasksByUser(tenantId, targetUserId, requesterRole, requesterId) {
  assertObjectId(targetUserId);
  if (requesterRole === 'EMPLOYEE' && targetUserId.toString() !== requesterId.toString()) {
    throw new ApiError(403, 'Insufficient permissions');
  }
  return populateTaskList(
    Task.find({
      tenantId,
      isDeleted: false,
      'assignees.userId': new mongoose.Types.ObjectId(targetUserId),
    })
  )
    .sort({ dueDate: 1, updatedAt: -1 })
    .lean();
}

async function getTask(tenantId, id, userRole, userId) {
  assertObjectId(id);
  const task = await populateTaskList(Task.findOne({ _id: id, tenantId, isDeleted: false })).lean();
  if (!task) throw new ApiError(404, 'Task not found');
  if (userRole === 'EMPLOYEE') {
    const isAssignee = task.assignees.some((a) => assigneeUserId(a).toString() === userId.toString());
    if (!isAssignee) throw new ApiError(403, 'You can only access tasks assigned to you');
  }
  return task;
}

async function updateTask(tenantId, id, payload, userRole, userId) {
  assertObjectId(id);
  const task = await Task.findOne({ _id: id, tenantId, isDeleted: false });
  if (!task) throw new ApiError(404, 'Task not found');

  if (['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
    throw new ApiError(403, 'You have view-only access to tasks');
  }

  if (userRole === 'EMPLOYEE') {
    const isAssignee = task.assignees.some((a) => a.userId.toString() === userId.toString());
    if (!isAssignee) throw new ApiError(403, 'You can only update your assigned tasks');
    const allowed = ['status', 'description', 'title', 'startDate', 'dueDate'];
    const keys = Object.keys(payload);
    const bad = keys.filter((k) => !allowed.includes(k));
    if (bad.length) throw new ApiError(403, `You may only update: ${allowed.join(', ')}`);
  }

  Object.assign(task, payload);
  await task.save();
  return populateTaskList(Task.findById(task._id)).lean();
}

async function softDeleteTask(tenantId, id) {
  assertObjectId(id);
  const task = await Task.findOne({ _id: id, tenantId, isDeleted: false });
  if (!task) throw new ApiError(404, 'Task not found');
  task.isDeleted = true;
  await task.save();
  return { id: task._id, deleted: true };
}

async function addComment(tenantId, taskId, message, createdBy, userRole, userId) {
  assertObjectId(taskId);
  const task = await Task.findOne({ _id: taskId, tenantId, isDeleted: false });
  if (!task) throw new ApiError(404, 'Task not found');
  if (['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
    throw new ApiError(403, 'You have view-only access to tasks');
  }
  if (userRole === 'EMPLOYEE') {
    const isAssignee = task.assignees.some((a) => a.userId.toString() === userId.toString());
    if (!isAssignee) throw new ApiError(403, 'You can only comment on your tasks');
  }
  task.comments.push({ message, createdBy, createdAt: new Date() });
  await task.save();
  return populateTaskList(Task.findById(task._id)).lean();
}

module.exports = {
  createTaskAsEmployee,
  listTasks,
  listTasksByProject,
  listTasksByUser,
  getTask,
  updateTask,
  softDeleteTask,
  addComment,
};
