/**
 * Utility Functions for Gestión de Promociones Bancarias
 *
 * Contains helper functions for:
 * - ID generation (UUID)
 * - Date manipulation
 * - Validation
 * - Formatting
 */

// ============================================================================
// ID GENERATION
// ============================================================================

/**
 * Generate a unique ID using UUID v4
 * @returns {string} A unique identifier
 */
function generateUUID() {
  return Utilities.getUuid();
}

/**
 * Generate a prefixed ID for specific entity types
 * @param {string} prefix - Entity prefix (e.g., 'PROMO', 'BANK', 'TRANS')
 * @returns {string} Prefixed unique identifier
 */
function generateID(prefix) {
  const uuid = Utilities.getUuid();
  // Take first 8 characters of UUID for readability
  const shortId = uuid.substring(0, 8).toUpperCase();
  return `${prefix}${shortId}`;
}

// ============================================================================
// DATE HELPERS
// ============================================================================

/**
 * Format date to YYYY-MM-DD string
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  if (!date || !(date instanceof Date)) {
    return '';
  }
  return Utilities.formatDate(date, Session.getScriptTimeZone(), DEFAULT_CONFIG.DATE_FORMAT);
}

/**
 * Format date to YYYY-MM-DD HH:MM:SS string
 * @param {Date} date - Date object
 * @returns {string} Formatted datetime string
 */
function formatDateTime(date) {
  if (!date || !(date instanceof Date)) {
    return '';
  }
  return Utilities.formatDate(date, Session.getScriptTimeZone(), DEFAULT_CONFIG.DATETIME_FORMAT);
}

/**
 * Parse date string to Date object
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Date|null} Date object or null if invalid
 */
function parseDate(dateString) {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    Logger.log('Error parsing date: ' + dateString + ' - ' + error.message);
    return null;
  }
}

/**
 * Get today's date at midnight
 * @returns {Date} Today's date
 */
function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Add days to a date
 * @param {Date} date - Starting date
 * @param {number} days - Number of days to add (can be negative)
 * @returns {Date} New date
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add months to a date
 * @param {Date} date - Starting date
 * @param {number} months - Number of months to add
 * @returns {Date} New date
 */
function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Calculate difference in days between two dates
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} Number of days (positive if date2 is later)
 */
function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
  return Math.round((date2.getTime() - date1.getTime()) / oneDay);
}

/**
 * Check if a date is in the past
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is before today
 */
function isPast(date) {
  return date < getToday();
}

/**
 * Check if a date is in the future
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is after today
 */
function isFuture(date) {
  return date > getToday();
}

/**
 * Check if a date is today
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is today
 */
function isToday(date) {
  const today = getToday();
  return date.toDateString() === today.toDateString();
}

/**
 * Get the day of month from a date
 * @param {Date} date - Date object
 * @returns {number} Day of month (1-31)
 */
function getDayOfMonth(date) {
  return date.getDate();
}

/**
 * Calculate next occurrence of a specific day in the month
 * @param {Date} fromDate - Starting date
 * @param {number} dayOfMonth - Target day (1-31)
 * @returns {Date} Next occurrence of that day
 */
function getNextOccurrenceOfDay(fromDate, dayOfMonth) {
  const result = new Date(fromDate);
  result.setDate(dayOfMonth);

  // If the target day is before or equal to fromDate, move to next month
  if (result <= fromDate) {
    result.setMonth(result.getMonth() + 1);
  }

  // Handle months with fewer days (e.g., day 31 in February)
  if (result.getDate() !== dayOfMonth) {
    result.setDate(0); // Set to last day of previous month
  }

  return result;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Check if a string is empty or null
 * @param {string} str - String to check
 * @returns {boolean} True if empty or null
 */
function isEmpty(str) {
  return !str || str.trim().length === 0;
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
  if (isEmpty(email)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate that a value is a positive number
 * @param {any} value - Value to check
 * @returns {boolean} True if positive number
 */
function isPositiveNumber(value) {
  return typeof value === 'number' && value > 0 && !isNaN(value);
}

/**
 * Validate that a value is a boolean
 * @param {any} value - Value to check
 * @returns {boolean} True if boolean
 */
function isBoolean(value) {
  return typeof value === 'boolean' || value === 'TRUE' || value === 'FALSE';
}

/**
 * Convert string to boolean
 * @param {string|boolean} value - Value to convert
 * @returns {boolean} Boolean value
 */
function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toUpperCase() === 'TRUE';
  }
  return Boolean(value);
}

/**
 * Validate date range (end must be after start)
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {boolean} True if valid range
 */
function isValidDateRange(startDate, endDate) {
  if (!startDate || !endDate) return false;
  return endDate > startDate;
}

/**
 * Validate JSON string
 * @param {string} jsonString - JSON string to validate
 * @returns {boolean} True if valid JSON
 */
function isValidJSON(jsonString) {
  if (isEmpty(jsonString)) return false;
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validate that a value is in an enum
 * @param {string} value - Value to check
 * @param {Object} enumObject - Enum object (e.g., PROMOTION_STATUS)
 * @returns {boolean} True if value exists in enum
 */
function isValidEnum(value, enumObject) {
  return Object.values(enumObject).includes(value);
}

// ============================================================================
// JSON HELPERS
// ============================================================================

/**
 * Safely parse JSON string
 * @param {string} jsonString - JSON string
 * @returns {Object|null} Parsed object or null if invalid
 */
function safeJSONParse(jsonString) {
  if (isEmpty(jsonString)) return null;

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    Logger.log('Error parsing JSON: ' + jsonString + ' - ' + error.message);
    return null;
  }
}

/**
 * Safely stringify object to JSON
 * @param {Object} obj - Object to stringify
 * @returns {string} JSON string or empty string if error
 */
function safeJSONStringify(obj) {
  if (!obj) return '';

  try {
    return JSON.stringify(obj);
  } catch (error) {
    Logger.log('Error stringifying object: ' + error.message);
    return '';
  }
}

// ============================================================================
// FORMATTING HELPERS
// ============================================================================

/**
 * Format number as currency (EUR)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  if (!isPositiveNumber(amount) && amount !== 0) return '0€';
  return amount.toFixed(2) + '€';
}

/**
 * Truncate string to max length with ellipsis
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
function truncate(str, maxLength) {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================================
// ARRAY HELPERS
// ============================================================================

/**
 * Remove duplicates from array
 * @param {Array} arr - Array with potential duplicates
 * @returns {Array} Array without duplicates
 */
function removeDuplicates(arr) {
  return [...new Set(arr)];
}

/**
 * Sort array of objects by property
 * @param {Array} arr - Array of objects
 * @param {string} property - Property to sort by
 * @param {boolean} ascending - Sort direction (default: true)
 * @returns {Array} Sorted array
 */
function sortByProperty(arr, property, ascending = true) {
  return arr.sort((a, b) => {
    const aVal = a[property];
    const bVal = b[property];

    if (aVal < bVal) return ascending ? -1 : 1;
    if (aVal > bVal) return ascending ? 1 : -1;
    return 0;
  });
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Log error with context
 * @param {string} context - Context where error occurred
 * @param {Error} error - Error object
 */
function logError(context, error) {
  const message = `[ERROR in ${context}] ${error.message}`;
  Logger.log(message);
  console.error(message);

  // You could extend this to send errors to a monitoring service
  // or store them in a dedicated sheet
}

/**
 * Create standardized error response
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @returns {Object} Error response object
 */
function createErrorResponse(message, code = 'ERROR') {
  return {
    success: false,
    error: {
      message: message,
      code: code,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Create standardized success response
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @returns {Object} Success response object
 */
function createSuccessResponse(data, message = 'Success') {
  return {
    success: true,
    message: message,
    data: data,
    timestamp: new Date().toISOString()
  };
}

// ============================================================================
// TESTING FUNCTIONS
// ============================================================================

/**
 * Test utility functions
 */
function testUtils() {
  Logger.log('Testing utility functions...\n');

  // Test ID generation
  const uuid = generateUUID();
  const promoId = generateID('PROMO');
  Logger.log('✓ UUID: ' + uuid);
  Logger.log('✓ Promo ID: ' + promoId);

  // Test date functions
  const today = getToday();
  const tomorrow = addDays(today, 1);
  const nextMonth = addMonths(today, 1);
  Logger.log('✓ Today: ' + formatDate(today));
  Logger.log('✓ Tomorrow: ' + formatDate(tomorrow));
  Logger.log('✓ Next month: ' + formatDate(nextMonth));
  Logger.log('✓ Days between: ' + daysBetween(today, tomorrow));

  // Test validation
  Logger.log('✓ Valid email: ' + isValidEmail('test@example.com'));
  Logger.log('✓ Invalid email: ' + !isValidEmail('invalid'));
  Logger.log('✓ Positive number: ' + isPositiveNumber(100));
  Logger.log('✓ Valid JSON: ' + isValidJSON('{"key":"value"}'));

  // Test formatting
  Logger.log('✓ Currency: ' + formatCurrency(1234.56));
  Logger.log('✓ Truncate: ' + truncate('This is a very long string', 10));

  Logger.log('\n✓ All utility tests passed!');
}
