const express = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/rbac.middleware');
const dashboardController = require('./dashboard.controller');

const router = express.Router();
router.use(authenticate);
router.use(requireRoles('MANAGER', 'ADMIN', 'SUPER_ADMIN'));

router.get('/client/:clientId/projects-count', dashboardController.clientProjectsCount);
router.get('/project/:projectId/employees-count', dashboardController.projectEmployeesCount);
router.get('/user/:userId/projects-count', dashboardController.userProjectsCount);
router.get('/project/:projectId/summary', dashboardController.projectSummary);

module.exports = router;
