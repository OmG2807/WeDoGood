/**
 * Job service - handles all job-related database operations
 */
const { dbRun, dbGet, dbAll } = require('../utils/database');

/**
 * Create a new job record
 * @param {string} jobId - UUID for the job
 * @param {string} filename - Original filename
 * @returns {Promise<{lastID: number, changes: number}>}
 */
async function createJob(jobId, filename) {
  const sql = `
    INSERT INTO jobs (id, filename, status, total_rows, processed_rows, successful_rows, failed_rows)
    VALUES (?, ?, 'pending', 0, 0, 0, 0)
  `;
  return dbRun(sql, [jobId, filename]);
}

/**
 * Update job status and progress
 * @param {string} jobId - Job ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{changes: number}>}
 */
async function updateJob(jobId, updates) {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(jobId);

  const sql = `UPDATE jobs SET ${fields.join(', ')} WHERE id = ?`;
  return dbRun(sql, values);
}

/**
 * Get job by ID
 * @param {string} jobId - Job ID
 * @returns {Promise<Object|undefined>}
 */
async function getJobById(jobId) {
  const sql = `
    SELECT id, filename, status, total_rows, processed_rows, 
           successful_rows, failed_rows, errors, created_at, 
           updated_at, completed_at
    FROM jobs WHERE id = ?
  `;
  return dbGet(sql, [jobId]);
}

/**
 * Get jobs with optional status filter
 * @param {Object} options - Filter options
 * @returns {Promise<Array>}
 */
async function getJobs({ status, limit = 20, offset = 0 } = {}) {
  let sql = 'SELECT * FROM jobs WHERE 1=1';
  const params = [];

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  return dbAll(sql, params);
}

/**
 * Format job for API response
 * @param {Object} job - Raw job from database
 * @returns {Object} Formatted job
 */
function formatJobResponse(job) {
  let errors = [];
  if (job.errors) {
    try {
      errors = JSON.parse(job.errors);
    } catch (e) {
      errors = [];
    }
  }

  const progress = job.total_rows > 0 
    ? Math.round((job.processed_rows / job.total_rows) * 100) 
    : 0;

  return {
    job_id: job.id,
    filename: job.filename,
    status: job.status,
    progress,
    total_rows: job.total_rows,
    processed_rows: job.processed_rows,
    successful_rows: job.successful_rows,
    failed_rows: job.failed_rows,
    errors: errors.slice(0, 50),
    created_at: job.created_at,
    updated_at: job.updated_at,
    completed_at: job.completed_at
  };
}

module.exports = {
  createJob,
  updateJob,
  getJobById,
  getJobs,
  formatJobResponse
};

