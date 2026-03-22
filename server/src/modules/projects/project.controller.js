const asyncHandler = require('../../utils/asyncHandler');
const projectService = require('./project.service');

const create = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.user.tenantId, req.body);
  res.status(201).json({ success: true, data: project });
});

const list = asyncHandler(async (req, res) => {
  const result = await projectService.listProjects(req.user.tenantId, req.query, req.user.role, req.user.userId);
  res.json({ success: true, data: result.items, meta: result.meta });
});

const getOne = asyncHandler(async (req, res) => {
  const project = await projectService.getProject(
    req.user.tenantId,
    req.params.id,
    req.user.role,
    req.user.userId
  );
  res.json({ success: true, data: project });
});

const update = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(req.user.tenantId, req.params.id, req.body);
  res.json({ success: true, data: project });
});

const remove = asyncHandler(async (req, res) => {
  const result = await projectService.softDeleteProject(req.user.tenantId, req.params.id);
  res.json({ success: true, data: result });
});

const addMembers = asyncHandler(async (req, res) => {
  const project = await projectService.addMembers(req.user.tenantId, req.params.id, req.body.members);
  res.json({ success: true, data: project });
});

const listMembers = asyncHandler(async (req, res) => {
  const members = await projectService.listMembers(req.user.tenantId, req.params.id);
  res.json({ success: true, data: members });
});

module.exports = { create, list, getOne, update, remove, addMembers, listMembers };
