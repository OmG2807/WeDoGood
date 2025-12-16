const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const { asyncHandler } = require('../middleware/errorHandler');
const { ValidationError } = require('../utils/errors');
const { validateReport } = require('../utils/validation');
const { upsertReport, getReports } = require('../services/reportService');
const { createJob } = require('../services/jobService');
const { processCSVFile } = require('../services/csvProcessor');

/**
 * POST /report - Submit a single report
 */
router.post('/', asyncHandler(async (req, res) => {
  const validation = validateReport(req.body);

  if (!validation.isValid) {
    throw new ValidationError('Validation failed', validation.errors);
  }

  const result = await upsertReport(validation.data);

  res.status(201).json({
    success: true,
    message: 'Report submitted successfully',
    data: {
      id: result.lastID,
      ...validation.data
    }
  });
}));

/**
 * POST /reports/upload - Upload CSV file for bulk processing
 */
router.post('/upload', (req, res, next) => {
  const upload = req.app.get('upload');
  const uploadRateLimit = req.app.get('uploadRateLimit');
  
  // Apply stricter rate limit for uploads
  uploadRateLimit(req, res, (err) => {
    if (err) return next(err);
    
    upload.single('file')(req, res, async (uploadErr) => {
      if (uploadErr) {
        return next(new ValidationError(uploadErr.message));
      }

      if (!req.file) {
        return next(new ValidationError('No file uploaded. Please upload a CSV file.'));
      }

      try {
        const jobId = uuidv4();
        await createJob(jobId, req.file.originalname);

        // Start background processing
        processCSVFile(jobId, req.file.path);

        res.status(202).json({
          success: true,
          message: 'File uploaded successfully. Processing started.',
          data: {
            job_id: jobId,
            filename: req.file.originalname
          }
        });
      } catch (error) {
        next(error);
      }
    });
  });
});

/**
 * GET /reports - Get all reports (with optional filtering)
 */
router.get('/', asyncHandler(async (req, res) => {
  const { month, ngo_id, limit = 100, offset = 0 } = req.query;
  
  const reports = await getReports({ month, ngo_id, limit, offset });

  res.json({
    success: true,
    data: reports,
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset),
    }
  });
}));

module.exports = router;
