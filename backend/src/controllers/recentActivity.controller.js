const RecentActivity = require('../models/RecentActivity');
const { validationResult } = require('express-validator');
const { asyncHandler } = require('../utils/asyncHandler');

// @desc    Get recent activities
// @route   GET /api/recent-activities
// @access  Private
const getRecentActivities = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    userId,
    action,
    entityType,
    startDate,
    endDate
  } = req.query;

  const skip = (page - 1) * limit;
  const query = {};

  // Build query filters
  if (userId) query.user = userId;
  if (action) query.action = action;
  if (entityType) query.entityType = entityType;
  
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // Get activities with pagination
  const activities = await RecentActivity.find(query)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip)
    .lean();

  // Get total count for pagination
  const total = await RecentActivity.countDocuments(query);

  res.json({
    success: true,
    data: activities,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get activity statistics
// @route   GET /api/recent-activities/stats
// @access  Private
const getActivityStats = asyncHandler(async (req, res) => {
  const { startDate, endDate, userId } = req.query;

  const stats = await RecentActivity.getActivityStats({
    startDate,
    endDate,
    userId
  });

  // Get total activities count
  const totalActivities = await RecentActivity.countDocuments(
    userId ? { user: userId } : {}
  );

  // Get activities by day for the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const dailyStats = await RecentActivity.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo },
        ...(userId && { user: new mongoose.Types.ObjectId(userId) })
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt'
          }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    success: true,
    data: {
      actionStats: stats,
      totalActivities,
      dailyStats
    }
  });
});

// @desc    Create activity log
// @route   POST /api/recent-activities
// @access  Private
const createActivity = asyncHandler(async (req, res) => {
  const {
    action,
    description,
    entityType,
    entityId,
    metadata
  } = req.body;

  const activity = await RecentActivity.logActivity({
    userId: req.user._id,
    action,
    description,
    entityType,
    entityId,
    metadata,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Populate user data for response
  await activity.populate('user', 'name email role');

  res.status(201).json({
    success: true,
    data: activity
  });
});

// @desc    Get user's recent activities
// @route   GET /api/recent-activities/user/:userId
// @access  Private
const getUserActivities = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const activities = await RecentActivity.find({ user: userId })
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip)
    .lean();

  const total = await RecentActivity.countDocuments({ user: userId });

  res.json({
    success: true,
    data: activities,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Delete old activities (cleanup)
// @route   DELETE /api/recent-activities/cleanup
// @access  Private (Admin only)
const cleanupOldActivities = asyncHandler(async (req, res) => {
  const { days = 90 } = req.query; // Default to 90 days
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

  const result = await RecentActivity.deleteMany({
    createdAt: { $lt: cutoffDate }
  });

  res.json({
    success: true,
    message: `Deleted ${result.deletedCount} old activity records`,
    data: {
      deletedCount: result.deletedCount,
      cutoffDate
    }
  });
});

// @desc    Get activities by entity
// @route   GET /api/recent-activities/entity/:entityType/:entityId
// @access  Private
const getActivitiesByEntity = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const activities = await RecentActivity.find({
    entityType,
    entityId
  })
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip)
    .lean();

  const total = await RecentActivity.countDocuments({
    entityType,
    entityId
  });

  res.json({
    success: true,
    data: activities,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

module.exports = {
  getRecentActivities,
  getActivityStats,
  createActivity,
  getUserActivities,
  cleanupOldActivities,
  getActivitiesByEntity
};