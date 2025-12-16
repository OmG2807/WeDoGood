/**
 * Report service - handles all report-related database operations
 */
const { dbRun, dbGet, dbAll } = require('../utils/database');

/**
 * Upsert a report (insert or update if exists)
 * @param {Object} reportData - Validated report data
 * @returns {Promise<{lastID: number, changes: number}>}
 */
async function upsertReport(reportData) {
  const { ngo_id, month, people_helped, events_conducted, funds_utilized } = reportData;
  
  const sql = `
    INSERT INTO reports (ngo_id, month, people_helped, events_conducted, funds_utilized, updated_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(ngo_id, month) DO UPDATE SET
      people_helped = excluded.people_helped,
      events_conducted = excluded.events_conducted,
      funds_utilized = excluded.funds_utilized,
      updated_at = CURRENT_TIMESTAMP
  `;

  return dbRun(sql, [ngo_id, month, people_helped, events_conducted, funds_utilized]);
}

/**
 * Get reports with optional filters
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>}
 */
async function getReports({ month, ngo_id, limit = 100, offset = 0 } = {}) {
  let sql = 'SELECT * FROM reports WHERE 1=1';
  const params = [];

  if (month) {
    sql += ' AND month = ?';
    params.push(month);
  }

  if (ngo_id) {
    sql += ' AND ngo_id = ?';
    params.push(ngo_id);
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  return dbAll(sql, params);
}

/**
 * Get aggregated dashboard data for a month
 * @param {string} month - Month in YYYY-MM format
 * @returns {Promise<Object>}
 */
async function getDashboardStats(month) {
  const sql = `
    SELECT 
      COUNT(DISTINCT ngo_id) as total_ngos_reporting,
      COALESCE(SUM(people_helped), 0) as total_people_helped,
      COALESCE(SUM(events_conducted), 0) as total_events_conducted,
      COALESCE(SUM(funds_utilized), 0) as total_funds_utilized
    FROM reports
    WHERE month = ?
  `;

  const row = await dbGet(sql, [month]);
  
  return {
    total_ngos_reporting: row?.total_ngos_reporting || 0,
    total_people_helped: row?.total_people_helped || 0,
    total_events_conducted: row?.total_events_conducted || 0,
    total_funds_utilized: parseFloat((row?.total_funds_utilized || 0).toFixed(2))
  };
}

/**
 * Get list of months with data
 * @returns {Promise<string[]>}
 */
async function getAvailableMonths() {
  const sql = 'SELECT DISTINCT month FROM reports ORDER BY month DESC';
  const rows = await dbAll(sql);
  return rows.map(r => r.month);
}

/**
 * Get monthly trends
 * @param {number} limit - Number of months to return
 * @returns {Promise<Array>}
 */
async function getMonthlyTrends(limit = 12) {
  const sql = `
    SELECT 
      month,
      COUNT(DISTINCT ngo_id) as total_ngos_reporting,
      COALESCE(SUM(people_helped), 0) as total_people_helped,
      COALESCE(SUM(events_conducted), 0) as total_events_conducted,
      COALESCE(SUM(funds_utilized), 0) as total_funds_utilized
    FROM reports
    GROUP BY month
    ORDER BY month DESC
    LIMIT ?
  `;

  const rows = await dbAll(sql, [parseInt(limit)]);
  return rows.reverse(); // Return in chronological order
}

/**
 * Get all NGOs with their stats
 * @returns {Promise<Array>}
 */
async function getAllNGOs() {
  const sql = `
    SELECT DISTINCT ngo_id,
      COUNT(*) as reports_count,
      SUM(people_helped) as total_people_helped,
      SUM(events_conducted) as total_events_conducted,
      SUM(funds_utilized) as total_funds_utilized
    FROM reports 
    GROUP BY ngo_id
    ORDER BY ngo_id
  `;

  return dbAll(sql);
}

module.exports = {
  upsertReport,
  getReports,
  getDashboardStats,
  getAvailableMonths,
  getMonthlyTrends,
  getAllNGOs
};

