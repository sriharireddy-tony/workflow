const express = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/users/user.routes');
const clientRoutes = require('../modules/clients/client.routes');
const projectRoutes = require('../modules/projects/project.routes');
const featureRoutes = require('../modules/features/feature.routes');
const taskRoutes = require('../modules/tasks/task.routes');
const dashboardRoutes = require('../modules/dashboards/dashboard.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/clients', clientRoutes);
router.use('/projects', projectRoutes);
router.use('/features', featureRoutes);
router.use('/tasks', taskRoutes);
router.use('/dashboard', dashboardRoutes);

router.get('/health', (req, res) => {
  res.json({ success: true, data: { ok: true } });
});

module.exports = router;
