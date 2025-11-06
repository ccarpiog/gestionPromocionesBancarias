/**
 * Configuration file for Gestión de Promociones Bancarias
 *
 * IMPORTANT: Set your SPREADSHEET_ID before deploying
 */

// ============================================================================
// SPREADSHEET CONFIGURATION
// ============================================================================

/**
 * YOUR SPREADSHEET ID HERE
 * Get this from the URL: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
 *
 * Example: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
 */
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

/**
 * Get the spreadsheet instance
 * @returns {Spreadsheet} The spreadsheet object
 */
function getSpreadsheet() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (error) {
    throw new Error('Could not open spreadsheet. Please check SPREADSHEET_ID in Config.js. Error: ' + error.message);
  }
}

// ============================================================================
// SHEET NAMES
// ============================================================================

const SHEET_NAMES = {
  BANKS: 'Banks',
  PROMOTIONS: 'Promotions',
  CONDITIONS: 'Conditions',
  PERIODS: 'Periods',
  EVALUATIONS: 'Evaluations',
  TRANSFERS: 'Transfers',
  DOCUMENTS: 'Documents',
  CONFIG: 'Configuración'
};

// ============================================================================
// COLUMN CONFIGURATIONS
// ============================================================================

/**
 * Column definitions for each sheet
 * Used for validation and data access
 */
const COLUMNS = {
  BANKS: {
    BANK_ID: 0,
    NAME: 1,
    IS_BODEGA: 2,
    SUPPORTS_BIZUM: 3,
    ACTIVE: 4
  },

  PROMOTIONS: {
    PROMO_ID: 0,
    BANK_ID: 1,
    ACCOUNT_NUMBER: 2,
    TYPE: 3,
    TITLE: 4,
    START_DATE: 5,
    END_DATE: 6,
    BENEFITS: 7,
    STATUS: 8,
    PERIOD_CYCLE_JSON: 9,
    NOTES: 10
  },

  CONDITIONS: {
    CONDITION_ID: 0,
    PROMO_ID: 1,
    TYPE: 2,
    PARAMS_JSON: 3,
    IS_RECURRING: 4
  },

  PERIODS: {
    PERIOD_ID: 0,
    PROMO_ID: 1,
    START_TS: 2,
    END_TS: 3,
    INDEX: 4,
    STATUS: 5
  },

  EVALUATIONS: {
    EVAL_ID: 0,
    CONDITION_ID: 1,
    PERIOD_ID: 2,
    STATUS: 3,
    USER_NOTES: 4,
    MARKED_BY: 5,
    MARKED_ON: 6
  },

  TRANSFERS: {
    TRANSFER_ID: 0,
    FROM_BANK_ID: 1,
    TO_BANK_ID: 2,
    AMOUNT: 3,
    DATE_PLANNED: 4,
    DATE_DONE: 5,
    IS_SALARY_MARKED: 6,
    PROMO_ID: 7,
    STATUS: 8
  },

  DOCUMENTS: {
    DOCUMENT_ID: 0,
    PROMO_ID: 1,
    FILE_ID: 2,
    FILENAME: 3,
    UPLOADED_ON: 4
  },

  CONFIG: {
    KEY: 0,
    VALUE: 1,
    DESCRIPTION: 2,
    TYPE: 3
  }
};

// ============================================================================
// ENUMS AND CONSTANTS
// ============================================================================

/**
 * Promotion types
 */
const PROMOTION_TYPES = {
  PLAZO_FIJO: 'Plazo fijo',
  PROMOCION_TRANSFERENCIAS: 'Promoción transferencias',
  OTRO: 'Otro'
};

/**
 * Promotion statuses
 */
const PROMOTION_STATUS = {
  ACTIVA: 'Activa',
  EN_PAUSA: 'En pausa',
  COMPLETADA: 'Completada',
  FALLIDA: 'Fallida',
  EXPIRADA: 'Expirada'
};

/**
 * Condition types
 */
const CONDITION_TYPES = {
  SALDO_MINIMO: 'Saldo mínimo',
  BIZUM_ACTIVO: 'Bizum activo',
  TRANSFERENCIAS_MINIMAS: 'Transferencias mínimas',
  RECIBOS_DOMICILIADOS: 'Recibos domiciliados',
  COMPRAS_TARJETA: 'Compras tarjeta',
  CONDICION_PUNTUAL: 'Condición puntual'
};

/**
 * Evaluation statuses
 */
const EVALUATION_STATUS = {
  PENDING: 'Pending',
  MET: 'Met',
  FAILED: 'Failed'
};

/**
 * Period statuses
 */
const PERIOD_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed'
};

/**
 * Transfer statuses
 */
const TRANSFER_STATUS = {
  PLANIFICADA: 'Planificada',
  REALIZADA: 'Realizada',
  ATRASADA: 'Atrasada',
  CANCELADA: 'Cancelada'
};

// ============================================================================
// APPLICATION SETTINGS
// ============================================================================

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  // Email notification settings
  NOTIFY_TRANSFERS_DAYS: 3,      // Days before transfer to notify
  NOTIFY_PERIOD_DAYS: 2,          // Days before period end to notify
  NOTIFY_PROMOTION_DAYS: 7,       // Days before promotion expires to notify

  // Period generation
  PERIODS_GENERATE_AHEAD: 12,     // Generate periods N months ahead

  // UI settings
  DEFAULT_SHOW_EXPIRED: false,    // Show expired promotions by default
  ITEMS_PER_PAGE: 20,             // Pagination

  // Date formats
  DATE_FORMAT: 'yyyy-MM-dd',
  DATETIME_FORMAT: 'yyyy-MM-dd HH:mm:ss',

  // Drive folder name for documents
  DRIVE_FOLDER_NAME: 'Promociones Bancarias - Documentos'
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get a sheet by name with error handling
 * @param {string} sheetName - Name of the sheet
 * @returns {Sheet} The sheet object
 */
function getSheet(sheetName) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found. Please check SETUP_GUIDE.md`);
  }

  return sheet;
}

/**
 * Validate that all required sheets exist
 * @returns {Object} Validation result with success and missing sheets
 */
function validateSheetsExist() {
  const ss = getSpreadsheet();
  const existingSheets = ss.getSheets().map(sheet => sheet.getName());
  const requiredSheets = Object.values(SHEET_NAMES);
  const missingSheets = requiredSheets.filter(name => !existingSheets.includes(name));

  return {
    success: missingSheets.length === 0,
    missing: missingSheets,
    existing: existingSheets
  };
}

/**
 * Get webapp URL (for use in emails/notifications)
 * @returns {string} The webapp URL
 */
function getWebAppUrl() {
  return ScriptApp.getService().getUrl();
}

/**
 * Get current user email
 * @returns {string} User email
 */
function getCurrentUserEmail() {
  return Session.getActiveUser().getEmail();
}

// ============================================================================
// TESTING FUNCTIONS
// ============================================================================

/**
 * Test configuration - run this to verify setup
 */
function testConfig() {
  Logger.log('Testing configuration...');

  try {
    // Test spreadsheet access
    const ss = getSpreadsheet();
    Logger.log('✓ Spreadsheet accessible: ' + ss.getName());

    // Test sheet validation
    const validation = validateSheetsExist();
    if (validation.success) {
      Logger.log('✓ All required sheets exist');
      Logger.log('  Sheets found: ' + validation.existing.join(', '));
    } else {
      Logger.log('✗ Missing sheets: ' + validation.missing.join(', '));
      Logger.log('  Please create missing sheets following SETUP_GUIDE.md');
      return false;
    }

    // Test user email
    const email = getCurrentUserEmail();
    Logger.log('✓ Current user: ' + email);

    Logger.log('\n✓ Configuration test passed!');
    return true;

  } catch (error) {
    Logger.log('✗ Configuration test failed: ' + error.message);
    return false;
  }
}
