const express = require('express');
const router = express.Router();

const { asyncHandler } = require('../middleware/errorHandler');
const { NotFoundError } = require('../utils/errors');
const { getJobById, getJobs, formatJobResponse } = require('../services/jobService');

/**
 * GET /job-status/:job_id - Get job processing status
 */
router.get('/:job_id', asyncHandler(async (req, res) => {
  const { job_id } = req.params;

  const job = await getJobById(job_id);

  if (!job) {
    throw new NotFoundError('Job');
  }

  res.json({
    success: true,
    data: formatJobResponse(job)
  });
}));

/**
 * GET /job-status - Get all jobs
 */
router.get('/', asyncHandler(async (req, res) => {
  const { status, limit = 20, offset = 0 } = req.query;
  
  const jobs = await getJobs({ status, limit, offset });
  const formattedJobs = jobs.map(formatJobResponse);

  res.json({
    success: true,
    data: formattedJobs,
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset)
    }
  });
}));

module.exports = router;
