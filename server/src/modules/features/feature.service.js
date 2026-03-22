const mongoose = require('mongoose');
const Feature = require('../../models/Feature.model');
const Project = require('../../models/Project.model');
const Task = require('../../models/Task.model');
const User = require('../../models/User.model');
const ApiError = require('../../utils/ApiError');
const { parsePagination, paginatedMeta } = require('../../utils/pagination');
const { assertObjectId } = require('../../utils/id');

function toObjectId(id) {
  return id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id);
}

/** Adds taskCount (non-deleted tasks per feature) to each lean feature doc. */
async function addTaskCounts(tenantId, features) {
  if (!features.length) return features;
  const tOid = toObjectId(tenantId);
  const featureIds = features.map((f) => toObjectId(f._id));
  const agg = await Task.aggregate([
    {
      $match: {
        tenantId: tOid,
        featureId: { $in: featureIds },
        isDeleted: false,
      },
    },
    { $group: { _id: '$featureId', taskCount: { $sum: 1 } } },
  ]);
  const map = Object.fromEntries(agg.map((x) => [x._id.toString(), x.taskCount]));
  return features.map((f) => ({
    ...f,
    taskCount: map[f._id.toString()] || 0,
  }));
}

async function assertProjectInTenant(tenantId, projectId) {
  const p = await Project.findOne({ _id: projectId, tenantId, isDeleted: false }).lean();
  if (!p) throw new ApiError(400, 'Invalid project for this tenant');
  return p;
}

async function createFeature(tenantId, payload) {
  await assertProjectInTenant(tenantId, payload.projectId);
  const feature = await Feature.create({
    tenantId,
    projectId: payload.projectId,
    name: payload.name,
    description: payload.description || '',
    status: payload.status,
    priority: payload.priority,
    startDate: payload.startDate,
    endDate: payload.endDate,
    assignments: [],
  });
  return feature.toObject();
}

async function listFeatures(tenantId, query, userRole, userId) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { tenantId, isDeleted: false };
  if (query.projectId) filter.projectId = query.projectId;
  if (query.status) filter.status = query.status;

  if (userRole === 'EMPLOYEE') {
    filter['assignments.userId'] = new mongoose.Types.ObjectId(userId);
  }

  const q = Feature.find(filter)
    .populate({ path: 'projectId', select: 'name key' })
    .populate({ path: 'assignments.userId', select: 'firstName lastName email' })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  const [rawItems, total] = await Promise.all([q, Feature.countDocuments(filter)]);
  const items = await addTaskCounts(tenantId, rawItems);
  return { items, meta: paginatedMeta({ total, page, limit }) };
}

async function listFeaturesByProject(tenantId, projectId, userRole, userId) {
  await assertProjectInTenant(tenantId, projectId);
  if (userRole === 'EMPLOYEE') {
    const project = await Project.findOne({
      _id: projectId,
      tenantId,
      isDeleted: false,
      'members.userId': new mongoose.Types.ObjectId(userId),
    }).lean();
    if (!project) throw new ApiError(403, 'Not a project member');
  }
  const raw = await Feature.find({ tenantId, projectId, isDeleted: false })
    .populate({ path: 'projectId', select: 'name key' })
    .populate({ path: 'assignments.userId', select: 'firstName lastName email' })
    .sort({ priority: 1, name: 1 })
    .lean();
  return addTaskCounts(tenantId, raw);
}

async function getFeature(tenantId, id, userRole, userId) {
  assertObjectId(id);
  const feature = await Feature.findOne({ _id: id, tenantId, isDeleted: false })
    .populate({ path: 'projectId', select: 'name key' })
    .populate({ path: 'assignments.userId', select: 'firstName lastName email' })
    .lean();
  if (!feature) throw new ApiError(404, 'Feature not found');
  if (userRole === 'EMPLOYEE') {
    const assigneeId = (a) => (a.userId && a.userId._id ? a.userId._id : a.userId);
    const assigned = feature.assignments.some((a) => assigneeId(a).toString() === userId.toString());
    const projectRefId = feature.projectId?._id || feature.projectId;
    const project = await Project.findOne({
      _id: projectRefId,
      tenantId,
      isDeleted: false,
      'members.userId': new mongoose.Types.ObjectId(userId),
    }).lean();
    if (!assigned && !project) throw new ApiError(403, 'Access denied');
  }
  const [withCount] = await addTaskCounts(tenantId, [feature]);
  return withCount;
}

async function updateFeature(tenantId, id, payload) {
  assertObjectId(id);
  const feature = await Feature.findOne({ _id: id, tenantId, isDeleted: false });
  if (!feature) throw new ApiError(404, 'Feature not found');
  const allowed = ['name', 'description', 'status', 'priority', 'startDate', 'endDate'];
  for (const k of allowed) {
    if (payload[k] !== undefined) feature[k] = payload[k];
  }
  await feature.save();
  const lean = await Feature.findById(feature._id)
    .populate({ path: 'projectId', select: 'name key' })
    .populate({ path: 'assignments.userId', select: 'firstName lastName email' })
    .lean();
  const [withCount] = await addTaskCounts(tenantId, [lean]);
  return withCount;
}

async function assignUsers(tenantId, featureId, userIds, assignedBy) {
  assertObjectId(featureId);
  const feature = await Feature.findOne({ _id: featureId, tenantId, isDeleted: false });
  if (!feature) throw new ApiError(404, 'Feature not found');

  const uniqueIds = [...new Set(userIds)];
  const count = await User.countDocuments({
    _id: { $in: uniqueIds },
    tenantId,
    isDeleted: false,
  });
  if (count !== uniqueIds.length) throw new ApiError(400, 'One or more users invalid for tenant');

  for (const uid of uniqueIds) {
    const exists = feature.assignments.some((a) => a.userId.toString() === uid.toString());
    if (!exists) {
      feature.assignments.push({
        userId: uid,
        assignedBy,
        assignedAt: new Date(),
      });
    }
  }
  await feature.save();

  await User.updateMany(
    { _id: { $in: uniqueIds }, tenantId },
    { $addToSet: { featureIds: feature._id } }
  );

  return feature.toObject();
}

module.exports = {
  createFeature,
  updateFeature,
  listFeatures,
  listFeaturesByProject,
  getFeature,
  assignUsers,
};
