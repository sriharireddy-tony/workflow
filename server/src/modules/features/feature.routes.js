const express = require('express');
const validate = require('../../middleware/validate.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireManagerPlus } = require('../../middleware/rbac.middleware');
const { createSchema, updateSchema, listQuerySchema, assignSchema } = require('./feature.validation');
const featureController = require('./feature.controller');

const router = express.Router();
router.use(authenticate);

router.post('/', requireManagerPlus, validate(createSchema), featureController.create);
router.get('/', validate(listQuerySchema, 'query'), featureController.list);
router.get('/:id', featureController.getOne);
router.put('/:id', requireManagerPlus, validate(updateSchema), featureController.update);
router.post('/:id/assign', requireManagerPlus, validate(assignSchema), featureController.assign);

module.exports = router;
