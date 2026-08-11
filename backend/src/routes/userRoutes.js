const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

router.use(authenticate);

router.get('/agents', authorize('agent', 'admin'), userController.listAgents);

router.get('/', authorize('admin'), userController.listUsers);

router.post(
  '/',
  authorize('admin'),
  [
    body('name').trim().isLength({ min: 2, max: 120 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('role').isIn(['customer', 'agent', 'admin']),
  ],
  validate,
  userController.createUser
);

router.patch(
  '/:id',
  authorize('admin'),
  [
    param('id').isUUID(),
    body('role').optional().isIn(['customer', 'agent', 'admin']),
    body('isActive').optional().isBoolean(),
  ],
  validate,
  userController.updateUser
);

module.exports = router;
