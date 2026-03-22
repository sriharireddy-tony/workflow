const mongoose = require('mongoose');
const Project = require('../../models/Project.model');
const Client = require('../../models/Client.model');
const Feature = require('../../models/Feature.model');
const User = require('../../models/User.model');
const ApiError = require('../../utils/ApiError');
const { parsePagination, paginatedMeta } = require('../../utils/pagination');
const { assertObjectId } = require('../../utils/id');

function toObjectId(id) {
  return id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id);
}

async function addFeatureCounts(tenantId, projects) {
  if (!projects.length) return projects;
  const tOid = toObjectId(tenantId);
  const projectIds = projects.map((p) => toObjectId(p._id));
  const agg = await Feature.aggregate([
    {
      $match: {
        tenantId: tOid,
        projectId: { $in: projectIds },
        isDeleted: false,
      },
    },
    { $group: { _id: '$projectId', featureCount: { $sum: 1 } } },
  ]);
  const map = Object.fromEntries(agg.map((x) => [x._id.toString(), x.featureCount]));
  return projects.map((p) => ({
    ...p,
    featureCount: map[p._id.toString()] || 0,
  }));
}

async function assertClientInTenant(tenantId, clientId) {
  const client = await Client.findOne({ _id: clientId, tenantId, isDeleted: false }).lean();
  if (!client) throw new ApiError(400, 'Invalid client for this tenant');
}

async function createProject(tenantId, payload) {
  await assertClientInTenant(tenantId, payload.clientId);
  const project = await Project.create({
    tenantId,
    clientId: payload.clientId,
    name: payload.name,
    key: payload.key.toUpperCase(),
    description: payload.description || '',
    status: payload.status,
    startDate: payload.startDate,
    endDate: payload.endDate,
    members: [],
  });
  return project.toObject();
}

async function listProjects(tenantId, query, userRole, userId) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { tenantId, isDeleted: false };
  if (query.clientId) filter.clientId = query.clientId;
  if (query.status) filter.status = query.status;

  if (userRole === 'EMPLOYEE') {
    filter['members.userId'] = new mongoose.Types.ObjectId(userId);
  }

  const q = Project.find(filter)
    .populate({ path: 'clientId', select: 'name code' })
    .populate({ path: 'members.userId', select: 'firstName lastName email' })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  const [rawItems, total] = await Promise.all([q, Project.countDocuments(filter)]);
  const items = await addFeatureCounts(tenantId, rawItems);
  return { items, meta: paginatedMeta({ total, page, limit }) };
}

async function getProject(tenantId, id, userRole, userId) {
  assertObjectId(id);
  const project = await Project.findOne({ _id: id, tenantId, isDeleted: false }).lean();
  if (!project) throw new ApiError(404, 'Project not found');
  if (userRole === 'EMPLOYEE') {
    const isMember = project.members.some((m) => m.userId.toString() === userId.toString());
    if (!isMember) throw new ApiError(403, 'Not a project member');
  }
  return project;
}

async function updateProject(tenantId, id, payload) {
  assertObjectId(id);
  const project = await Project.findOne({ _id: id, tenantId, isDeleted: false });
  if (!project) throw new ApiError(404, 'Project not found');
  if (payload.clientId) {
    await assertClientInTenant(tenantId, payload.clientId);
  }
  if (payload.key) payload.key = payload.key.toUpperCase();
  Object.assign(project, payload);
  await project.save();
  return project.toObject();
}

async function softDeleteProject(tenantId, id) {
  assertObjectId(id);
  const project = await Project.findOne({ _id: id, tenantId, isDeleted: false });
  if (!project) throw new ApiError(404, 'Project not found');
  project.isDeleted = true;
  await project.save();
  return { id: project._id, deleted: true };
}

async function addMembers(tenantId, projectId, membersInput) {
  assertObjectId(projectId);
  const project = await Project.findOne({ _id: projectId, tenantId, isDeleted: false });
  if (!project) throw new ApiError(404, 'Project not found');

  const userIds = [...new Set(membersInput.map((m) => m.userId))];
  const count = await User.countDocuments({
    _id: { $in: userIds },
    tenantId,
    isDeleted: false,
  });
  if (count !== userIds.length) throw new ApiError(400, 'One or more users invalid for tenant');

  for (const m of membersInput) {
    const uid = m.userId.toString();
    const exists = project.members.some((x) => x.userId.toString() === uid);
    if (!exists) {
      project.members.push({
        userId: m.userId,
        roleInProject: m.roleInProject || 'MEMBER',
        allocationPercent: m.allocationPercent ?? 100,
        joinedAt: new Date(),
      });
    }
  }
  await project.save();

  await User.updateMany(
    { _id: { $in: userIds }, tenantId },
    { $addToSet: { projectIds: project._id } }
  );

  return project.toObject();
}

async function listMembers(tenantId, projectId) {
  assertObjectId(projectId);
  const project = await Project.findOne({ _id: projectId, tenantId, isDeleted: false })
    .populate('members.userId', 'firstName lastName email role status')
    .lean();
  if (!project) throw new ApiError(404, 'Project not found');
  return project.members;
}

module.exports = {
  createProject,
  listProjects,
  getProject,
  updateProject,
  softDeleteProject,
  addMembers,
  listMembers,
};
