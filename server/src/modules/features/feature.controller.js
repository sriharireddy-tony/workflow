const asyncHandler = require('../../utils/asyncHandler');
const featureService = require('./feature.service');

const create = asyncHandler(async (req, res) => {
  const feature = await featureService.createFeature(req.user.tenantId, req.body);
  res.status(201).json({ success: true, data: feature });
});

const list = asyncHandler(async (req, res) => {
  const result = await featureService.listFeatures(req.user.tenantId, req.query, req.user.role, req.user.userId);
  res.json({ success: true, data: result.items, meta: result.meta });
});

const getOne = asyncHandler(async (req, res) => {
  const feature = await featureService.getFeature(
    req.user.tenantId,
    req.params.id,
    req.user.role,
    req.user.userId
  );
  res.json({ success: true, data: feature });
});

const byProject = asyncHandler(async (req, res) => {
  const projectId = req.params.projectId || req.params.id;
  const items = await featureService.listFeaturesByProject(
    req.user.tenantId,
    projectId,
    req.user.role,
    req.user.userId
  );
  res.json({ success: true, data: items });
});

const update = asyncHandler(async (req, res) => {
  const feature = await featureService.updateFeature(req.user.tenantId, req.params.id, req.body);
  res.json({ success: true, data: feature });
});

const assign = asyncHandler(async (req, res) => {
  const feature = await featureService.assignUsers(
    req.user.tenantId,
    req.params.id,
    req.body.userIds,
    req.user.userId
  );
  res.json({ success: true, data: feature });
});

module.exports = { create, list, getOne, byProject, update, assign };
