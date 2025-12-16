const express = require('express');
const router = express.Router();

const { asyncHandler } = require('../middleware/errorHandler');
const { ValidationError } = require('../utils/errors');
const { MONTH_REGEX } = require('../utils/validation');
const { config } = require('../config');
const { 
  getDashboardStats, 
  getAvailableMonths, 
  getMonthlyTrends, 
  getAllNGOs,
  getReports,
} = require('../services/reportService');

/**
 * GET /dashboard?month=YYYY-MM - Get aggregated dashboard data
 */
router.get('/', asyncHandler(async (req, res) => {
  const { month } = req.query;

  if (!month || !MONTH_REGEX.test(month)) {
    throw new ValidationError('Invalid month parameter. Use format YYYY-MM (e.g., 2024-03)');
  }

  const data = await getDashboardStats(month);
  
  res.json({
    success: true,
    month,
    data
  });
}));

/**
 * GET /dashboard/months - Get list of months with data
 */
router.get('/months', asyncHandler(async (req, res) => {
  const months = await getAvailableMonths();
  res.json({ success: true, data: months });
}));

/**
 * GET /dashboard/ngos - Get list of all NGOs with stats
 */
router.get('/ngos', asyncHandler(async (req, res) => {
  const ngos = await getAllNGOs();
  res.json({ success: true, data: ngos });
}));

/**
 * GET /dashboard/trends - Get monthly trends
 */
router.get('/trends', asyncHandler(async (req, res) => {
  const { limit = 12 } = req.query;
  const safeLimit = Math.min(parseInt(limit) || 12, config.pagination.maxLimit);
  const trends = await getMonthlyTrends(safeLimit);
  res.json({ success: true, data: trends });
}));

/**
 * GET /dashboard/reports - Get paginated reports with filtering
 */
router.get('/reports', asyncHandler(async (req, res) => {
  const { 
    month, 
    ngo_id, 
    page = 1, 
    limit = config.pagination.defaultLimit 
  } = req.query;
  
  const safePage = Math.max(1, parseInt(page) || 1);
  const safeLimit = Math.min(
    Math.max(1, parseInt(limit) || config.pagination.defaultLimit),
    config.pagination.maxLimit
  );
  const offset = (safePage - 1) * safeLimit;

  const reports = await getReports({ 
    month, 
    ngo_id, 
    limit: safeLimit, 
    offset,
  });

  // Get total count for pagination
  const allReports = await getReports({ month, ngo_id, limit: 10000, offset: 0 });
  const totalCount = allReports.length;
  const totalPages = Math.ceil(totalCount / safeLimit);

  res.json({
    success: true,
    data: reports,
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalCount,
      totalPages,
      hasNext: safePage < totalPages,
      hasPrev: safePage > 1,
    },
    filters: {
      month: month || null,
      ngo_id: ngo_id || null,
    },
  });
}));

module.exports = router;
