const express = require('express');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const ticketController = require('../controllers/ticketController');

const router = express.Router();

router.use(authenticate);

const STATUS_VALUES = ['open', 'in_progress', 'on_hold', 'resolved', 'closed'];
const PRIORITY_VALUES = ['low', 'medium', 'high', 'urgent'];

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(STATUS_VALUES),
    query('priority').optional().isIn(PRIORITY_VALUES),
  ],
  validate,
  ticketController.listTickets
);

router.get(
  '/:id',
  [param('id').isUUID()],
  validate,
  ticketController.getTicket
);

router.post(
  '/',
  [
    body('subject').trim().isLength({ min: 3, max: 200 }),
    body('description').trim().notEmpty(),
    body('priority').optional().isIn(PRIORITY_VALUES),
    body('category').optional().trim().isLength({ max: 60 }),
  ],
  validate,
  ticketController.createTicket
);

router.patch(
  '/:id',
  [
    param('id').isUUID(),
    body('version').isInt({ min: 1 }),
    body('status').optional().isIn(STATUS_VALUES),
    body('priority').optional().isIn(PRIORITY_VALUES),
    body('assignedTo').optional({ nullable: true }).isUUID(),
    body('subject').optional().trim().isLength({ min: 3, max: 200 }),
    body('description').optional().trim().notEmpty(),
  ],
  validate,
  ticketController.updateTicket
);

router.delete(
  '/:id',
  authorize('admin'),
  [param('id').isUUID()],
  validate,
  ticketController.deleteTicket
);

router.post(
  '/:id/comments',
  [
    param('id').isUUID(),
    body('body').trim().notEmpty().isLength({ max: 5000 }),
    body('isInternal').optional().isBoolean(),
  ],
  validate,
  ticketController.addComment
);

module.exports = router;
