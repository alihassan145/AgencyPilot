const mongoose = require('mongoose');

const recentActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'task_created',
      'task_updated',
      'task_completed',
      'task_assigned',
      'client_created',
      'client_updated',
      'client_deleted',
      'report_submitted',
      'report_approved',
      'report_rejected',
      'leave_requested',
      'leave_approved',
      'leave_rejected',
      'team_member_added',
      'team_member_updated',
      'team_member_deleted',
      'attendance_marked',
      'payroll_generated',
      'notification_sent',
      'profile_updated'
    ]
  },
  description: {
    type: String,
    required: true
  },
  entityType: {
    type: String,
    enum: ['task', 'client', 'report', 'leave', 'user', 'attendance', 'payroll', 'notification'],
    required: false
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
recentActivitySchema.index({ createdAt: -1 });
recentActivitySchema.index({ user: 1, createdAt: -1 });
recentActivitySchema.index({ action: 1, createdAt: -1 });
recentActivitySchema.index({ entityType: 1, entityId: 1 });

// Static method to create activity log
recentActivitySchema.statics.logActivity = async function({
  userId,
  action,
  description,
  entityType = null,
  entityId = null,
  metadata = {},
  ipAddress = null,
  userAgent = null
}) {
  try {
    const activity = new this({
      user: userId,
      action,
      description,
      entityType,
      entityId,
      metadata,
      ipAddress,
      userAgent
    });
    
    await activity.save();
    return activity;
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};

// Static method to get recent activities with pagination
recentActivitySchema.statics.getRecentActivities = async function({
  limit = 20,
  skip = 0,
  userId = null,
  action = null,
  entityType = null
}) {
  const query = {};
  
  if (userId) query.user = userId;
  if (action) query.action = action;
  if (entityType) query.entityType = entityType;
  
  return this.find(query)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

// Static method to get activity statistics
recentActivitySchema.statics.getActivityStats = async function({
  startDate = null,
  endDate = null,
  userId = null
}) {
  const matchStage = {};
  
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  if (userId) matchStage.user = new mongoose.Types.ObjectId(userId);
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        lastActivity: { $max: '$createdAt' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('RecentActivity', recentActivitySchema);