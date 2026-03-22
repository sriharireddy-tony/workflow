const asyncHandler = require('../../utils/asyncHandler');
const dashboardService = require('./dashboard.service');

const clientProjectsCount = asyncHandler(async (req, res) => {
  const data = await dashboardService.clientProjectsCount(req.user.tenantId, req.params.clientId);
  res.json({ success: true, data });
});

const projectEmployeesCount = asyncHandler(async (req, res) => {
  const data = await dashboardService.projectEmployeesCount(req.user.tenantId, req.params.projectId);
  res.json({ success: true, data });
});

const userProjectsCount = asyncHandler(async (req, res) => {
  const data = await dashboardService.userProjectsCount(req.user.tenantId, req.params.userId);
  res.json({ success: true, data });
});

const projectSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.projectSummary(req.user.tenantId, req.params.projectId);
  res.json({ success: true, data });
});

module.exports = {
  clientProjectsCount,
  projectEmployeesCount,
  userProjectsCount,
  projectSummary,
};
