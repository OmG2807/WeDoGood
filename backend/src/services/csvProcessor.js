/**
 * CSV Processing Service - handles background CSV file processing with retry logic
 */
const fs = require('fs');
const { parse } = require('csv-parse');

const { validateReport, normalizeCSVRecord } = require('../utils/validation');
const { upsertReport } = require('./reportService');
const { updateJob } = require('./jobService');
const { logger } = require('../utils/logger');

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 100, // ms
  maxDelay: 1000, // ms
};

/**
 * Process CSV file asynchronously with retry logic
 * @param {string} jobId - Job ID for tracking
 * @param {string} filePath - Path to the CSV file
 */
async function processCSVFile(jobId, filePath) {
  const errors = [];
  const retriedRows = [];
  let totalRows = 0;
  let processedRows = 0;
  let successfulRows = 0;
  let failedRows = 0;

  logger.info('Starting CSV processing', { jobId, filePath });

  // Update job status to processing
  await updateJob(jobId, { status: 'processing' });

  try {
    // Parse CSV file
    const records = await parseCSVFile(filePath);
    totalRows = records.length;

    logger.info('CSV parsed successfully', { jobId, totalRows });

    // Update total rows count
    await updateJob(jobId, { total_rows: totalRows });

    // Process each row with retry logic
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNumber = i + 1;
      
      const result = await processRecordWithRetry(record, rowNumber);
      
      if (result.success) {
        successfulRows++;
        if (result.retried) {
          retriedRows.push({ row: rowNumber, attempts: result.attempts });
        }
      } else {
        failedRows++;
        errors.push({
          row: rowNumber,
          error: result.error,
          data: record,
          attempts: result.attempts,
        });
      }

      processedRows++;

      // Update progress
      await updateJob(jobId, {
        processed_rows: processedRows,
        successful_rows: successfulRows,
        failed_rows: failedRows,
        errors: JSON.stringify(errors),
      });

      // Small delay for real-time feedback
      await sleep(50);
    }

    // Mark job as completed
    await updateJob(jobId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });

    logger.info('CSV processing completed', {
      jobId,
      totalRows,
      successfulRows,
      failedRows,
      retriedRows: retriedRows.length,
    });

  } catch (error) {
    logger.error('CSV processing failed', { jobId, error: error.message });
    
    await updateJob(jobId, {
      status: 'failed',
      errors: JSON.stringify([{ error: error.message }]),
      completed_at: new Date().toISOString(),
    });
  } finally {
    // Clean up uploaded file
    cleanupFile(filePath);
  }
}

/**
 * Process a single record with retry logic
 * @param {Object} record - Raw CSV record
 * @param {number} rowNumber - Row number for error reporting
 * @returns {Promise<{success: boolean, error?: string, retried: boolean, attempts: number}>}
 */
async function processRecordWithRetry(record, rowNumber) {
  let lastError = null;
  
  for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      await processRecord(record, rowNumber);
      return { 
        success: true, 
        retried: attempt > 1, 
        attempts: attempt 
      };
    } catch (error) {
      lastError = error;
      
      // Don't retry validation errors (they won't succeed on retry)
      if (error.message.includes('must be') || error.message.includes('required')) {
        break;
      }
      
      // Only retry on transient errors (database busy, etc.)
      if (attempt < RETRY_CONFIG.maxRetries) {
        const delay = Math.min(
          RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1),
          RETRY_CONFIG.maxDelay
        );
        logger.debug('Retrying row', { rowNumber, attempt, delay });
        await sleep(delay);
      }
    }
  }
  
  return { 
    success: false, 
    error: lastError?.message || 'Unknown error',
    retried: true,
    attempts: RETRY_CONFIG.maxRetries,
  };
}

/**
 * Parse CSV file and return records
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<Array>}
 */
function parseCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const records = [];
    
    fs.createReadStream(filePath)
      .pipe(parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
      }))
      .on('data', (record) => records.push(record))
      .on('error', reject)
      .on('end', () => resolve(records));
  });
}

/**
 * Process a single CSV record
 * @param {Object} record - Raw CSV record
 * @param {number} rowNumber - Row number for error reporting
 */
async function processRecord(record, rowNumber) {
  // Normalize column names
  const normalizedRecord = normalizeCSVRecord(record);
  
  // Validate
  const validation = validateReport(normalizedRecord);
  
  if (!validation.isValid) {
    throw new Error(validation.errors.join('; '));
  }

  // Save to database
  await upsertReport(validation.data);
}

/**
 * Clean up uploaded file
 * @param {string} filePath - Path to file
 */
function cleanupFile(filePath) {
  try {
    fs.unlinkSync(filePath);
    logger.debug('Cleaned up file', { filePath });
  } catch (e) {
    logger.warn('Failed to delete uploaded file', { filePath, error: e.message });
  }
}

/**
 * Sleep utility
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { processCSVFile, RETRY_CONFIG };
