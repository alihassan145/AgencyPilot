const express = require('express');
const {
  getRecentActivities,
  getActivityStats,
  createActivity,
  getUserActivities,
  cleanupOldActivities,
  getActivitiesByEntity
} = require('../controllers/recentActivity.controller');
const { authenticate, allowRoles } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { body, param, query } = require('express-validator');

const router = express.Router();

// Validation rules
const createActivityValidation = [
  body('action')
    .isIn([
      'login', 'logout', 'task_created', 'task_updated', 'task_completed',
      'task_assigned', 'client_created', 'client_updated', 'client_deleted',
      'report_submitted', 'report_approved', 'report_rejected',
      'leave_requested', 'leave_approved', 'leave_rejected',
      'team_member_added', 'team_member_updated', 'team_member_deleted',
      'attendance_marked', 'payroll_generated', 'notification_sent',
      'profile_updated'
    ])
    .withMessage('Invalid action type'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('entityType')
    .optional()
    .isIn(['task', 'client', 'report', 'leave', 'user', 'attendance', 'payroll', 'notification'])
    .withMessage('Invalid entity type'),
  body('entityId')
    .optional()
    .isMongoId()
    .withMessage('Invalid entity ID'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const userIdValidation = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID')
];

const entityValidation = [
  param('entityType')
    .isIn(['task', 'client', 'report', 'leave', 'user', 'attendance', 'payroll', 'notification'])
    .withMessage('Invalid entity type'),
  param('entityId')
    .isMongoId()
    .withMessage('Invalid entity ID')
];

// Apply authentication to all routes
router.use(authenticate);

// @route   GET /api/recent-activities
// @desc    Get recent activities with filtering and pagination
// @access  Private
router.get(
  '/',
  paginationValidation,
  validate,
  getRecentActivities
);

// @route   GET /api/recent-activities/stats
// @desc    Get activity statistics
// @access  Private
router.get('/stats', getActivityStats);

// @route   POST /api/recent-activities
// @desc    Create new activity log
// @access  Private
router.post(
  '/',
  createActivityValidation,
  validate,
  createActivity
);

// @route   GET /api/recent-activities/user/:userId
// @desc    Get activities for specific user
// @access  Private
router.get(
  '/user/:userId',
  userIdValidation,
  paginationValidation,
  validate,
  getUserActivities
);

// @route   GET /api/recent-activities/entity/:entityType/:entityId
// @desc    Get activities for specific entity
// @access  Private
router.get(
  '/entity/:entityType/:entityId',
  entityValidation,
  paginationValidation,
  validate,
  getActivitiesByEntity
);

// @route   DELETE /api/recent-activities/cleanup
// @desc    Clean up old activity records (Admin only)
// @access  Private/Admin
router.delete(
  '/cleanup',
  allowRoles('admin'),
  [
    query('days')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('Days must be between 1 and 365')
  ],
  validate,
  cleanupOldActivities
);

module.exports = router;