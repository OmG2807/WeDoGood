/**
 * Validation utilities for report data
 */

const MONTH_REGEX = /^\d{4}-\d{2}$/;

/**
 * Sanitize string input to prevent XSS
 * @param {string} str - Input string
 * @returns {string} Sanitized string
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>\"'&]/g, '').trim();
}

/**
 * Validate a single report object
 * @param {Object} report - Report data
 * @returns {{isValid: boolean, errors: string[], data: Object}}
 */
function validateReport(report) {
  const errors = [];
  const { ngo_id, month, people_helped, events_conducted, funds_utilized } = report;

  // NGO ID validation
  if (!ngo_id || typeof ngo_id !== 'string' || ngo_id.trim() === '') {
    errors.push('ngo_id is required and must be a non-empty string');
  }

  // Month validation
  if (!month || !MONTH_REGEX.test(month)) {
    errors.push('month is required and must be in YYYY-MM format');
  }

  // People helped validation
  const peopleNum = parseInt(people_helped);
  if (isNaN(peopleNum) || peopleNum < 0) {
    errors.push('people_helped must be a non-negative integer');
  }

  // Events conducted validation
  const eventsNum = parseInt(events_conducted);
  if (isNaN(eventsNum) || eventsNum < 0) {
    errors.push('events_conducted must be a non-negative integer');
  }

  // Funds utilized validation
  const fundsNum = parseFloat(funds_utilized);
  if (isNaN(fundsNum) || fundsNum < 0) {
    errors.push('funds_utilized must be a non-negative number');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      ngo_id: sanitizeString(ngo_id),
      month,
      people_helped: peopleNum,
      events_conducted: eventsNum,
      funds_utilized: fundsNum
    }
  };
}

/**
 * Normalize CSV record field names to standard names
 * @param {Object} record - Raw CSV record
 * @returns {Object} Normalized record
 */
function normalizeCSVRecord(record) {
  const columnMappings = {
    ngo_id: ['ngo_id', 'ngoid', 'ngo id', 'id', 'ngo'],
    month: ['month', 'report_month', 'reporting_month', 'period'],
    people_helped: ['people_helped', 'peoplehelped', 'people helped', 'beneficiaries', 'people'],
    events_conducted: ['events_conducted', 'eventsconducted', 'events conducted', 'events', 'event_count'],
    funds_utilized: ['funds_utilized', 'fundsutilized', 'funds utilized', 'funds', 'amount', 'budget_used']
  };

  const normalized = {};

  for (const [standardName, possibleNames] of Object.entries(columnMappings)) {
    for (const possibleName of possibleNames) {
      const variations = [
        possibleName,
        possibleName.toLowerCase(),
        possibleName.toUpperCase(),
        possibleName.replace(/_/g, ' '),
        possibleName.replace(/ /g, '_')
      ];
      
      for (const variation of variations) {
        if (record[variation] !== undefined) {
          normalized[standardName] = record[variation];
          break;
        }
      }
      if (normalized[standardName] !== undefined) break;
    }
  }

  return normalized;
}

module.exports = { validateReport, normalizeCSVRecord, MONTH_REGEX };

