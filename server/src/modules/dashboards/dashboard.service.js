const mongoose = require('mongoose');
const Project = require('../../models/Project.model');
const Task = require('../../models/Task.model');
const Client = require('../../models/Client.model');
const ApiError = require('../../utils/ApiError');
const { assertObjectId } = require('../../utils/id');

async function clientProjectsCount(tenantId, clientId) {
  assertObjectId(clientId);
  const client = await Client.findOne({ _id: clientId, tenantId, isDeleted: false }).lean();
  if (!client) throw new ApiError(404, 'Client not found');
  const count = await Project.countDocuments({ tenantId, clientId, isDeleted: false });
  return { clientId, projectsCount: count };
}

async function projectEmployeesCount(tenantId, projectId) {
  assertObjectId(projectId);
  const project = await Project.findOne({ _id: projectId, tenantId, isDeleted: false }).lean();
  if (!project) throw new ApiError(404, 'Project not found');
  return { projectId, employeesCount: project.members.length };
}

async function userProjectsCount(tenantId, userId) {
  assertObjectId(userId);
  const uid = new mongoose.Types.ObjectId(userId);
  const count = await Project.countDocuments({
    tenantId,
    isDeleted: false,
    'members.userId': uid,
  });
  return { userId, projectsCount: count };
}

async function projectSummary(tenantId, projectId) {
  assertObjectId(projectId);
  const project = await Project.findOne({ _id: projectId, tenantId, isDeleted: false }).lean();
  if (!project) throw new ApiError(404, 'Project not found');

  const match = { tenantId, projectId, isDeleted: false };
  const byStatus = await Task.aggregate([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const tasksByStatus = byStatus.reduce((acc, row) => {
    acc[row._id] = row.count;
    return acc;
  }, {});

  const totalTasks = await Task.countDocuments(match);

  return {
    projectId,
    totalTasks,
    tasksByStatus,
    totalMembers: project.members.length,
  };
}

module.exports = {
  clientProjectsCount,
  projectEmployeesCount,
  userProjectsCount,
  projectSummary,
};
