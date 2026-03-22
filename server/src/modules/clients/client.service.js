const Client = require('../../models/Client.model');
const Project = require('../../models/Project.model');
const ApiError = require('../../utils/ApiError');
const { parsePagination, paginatedMeta } = require('../../utils/pagination');
const { assertObjectId } = require('../../utils/id');

async function createClient(tenantId, payload) {
  return Client.create({ tenantId, ...payload });
}

async function listClients(tenantId, query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { tenantId, isDeleted: false };
  if (query.status) filter.status = query.status;
  if (query.search) {
    const s = query.search.trim();
    filter.$or = [{ name: new RegExp(s, 'i') }, { code: new RegExp(s, 'i') }];
  }
  const [items, total] = await Promise.all([
    Client.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Client.countDocuments(filter),
  ]);
  return { items, meta: paginatedMeta({ total, page, limit }) };
}

async function getClient(tenantId, id) {
  assertObjectId(id);
  const client = await Client.findOne({ _id: id, tenantId, isDeleted: false }).lean();
  if (!client) throw new ApiError(404, 'Client not found');
  return client;
}

async function updateClient(tenantId, id, payload) {
  assertObjectId(id);
  const client = await Client.findOne({ _id: id, tenantId, isDeleted: false });
  if (!client) throw new ApiError(404, 'Client not found');
  Object.assign(client, payload);
  await client.save();
  return client.toObject();
}

async function softDeleteClient(tenantId, id) {
  assertObjectId(id);
  const client = await Client.findOne({ _id: id, tenantId, isDeleted: false });
  if (!client) throw new ApiError(404, 'Client not found');
  client.isDeleted = true;
  await client.save();
  return { id: client._id, deleted: true };
}

async function listClientProjects(tenantId, clientId) {
  await getClient(tenantId, clientId);
  return Project.find({ tenantId, clientId, isDeleted: false })
    .select('name key status members startDate endDate')
    .lean();
}

module.exports = {
  createClient,
  listClients,
  getClient,
  updateClient,
  softDeleteClient,
  listClientProjects,
};
