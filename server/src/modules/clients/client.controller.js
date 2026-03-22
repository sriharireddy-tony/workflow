const asyncHandler = require('../../utils/asyncHandler');
const clientService = require('./client.service');

const create = asyncHandler(async (req, res) => {
  const client = await clientService.createClient(req.user.tenantId, req.body);
  res.status(201).json({ success: true, data: client });
});

const list = asyncHandler(async (req, res) => {
  const result = await clientService.listClients(req.user.tenantId, req.query);
  res.json({ success: true, data: result.items, meta: result.meta });
});

const getOne = asyncHandler(async (req, res) => {
  const client = await clientService.getClient(req.user.tenantId, req.params.id);
  res.json({ success: true, data: client });
});

const update = asyncHandler(async (req, res) => {
  const client = await clientService.updateClient(req.user.tenantId, req.params.id, req.body);
  res.json({ success: true, data: client });
});

const remove = asyncHandler(async (req, res) => {
  const result = await clientService.softDeleteClient(req.user.tenantId, req.params.id);
  res.json({ success: true, data: result });
});

const clientProjects = asyncHandler(async (req, res) => {
  const projects = await clientService.listClientProjects(req.user.tenantId, req.params.id);
  res.json({ success: true, data: projects });
});

module.exports = { create, list, getOne, update, remove, clientProjects };
