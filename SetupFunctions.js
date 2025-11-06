/**
 * Setup Functions - Automate the setup process from SETUP_GUIDE.md
 *
 * These functions help automate the creation and initialization of the
 * Google Sheets structure for Gestión de Promociones Bancarias
 *
 * USAGE:
 * 1. Set SPREADSHEET_ID in Config.js
 * 2. Run setupAll() to create all sheets with headers and sample data
 * 3. Or run individual functions for specific setup steps
 */

// ============================================================================
// SHEET HEADERS CONFIGURATION
// ============================================================================

/**
 * Get headers for each sheet
 */
const SHEET_HEADERS = {
  Banks: [
    'bank_id',
    'name',
    'is_bodega',
    'supports_bizum',
    'active'
  ],
  Promotions: [
    'promo_id',
    'bank_id',
    'account_number',
    'type',
    'title',
    'start_date',
    'end_date',
    'benefits',
    'status',
    'period_cycle_json',
    'notes'
  ],
  Conditions: [
    'condition_id',
    'promo_id',
    'type',
    'params_json',
    'is_recurring'
  ],
  Periods: [
    'period_id',
    'promo_id',
    'start_ts',
    'end_ts',
    'index',
    'status'
  ],
  Evaluations: [
    'eval_id',
    'condition_id',
    'period_id',
    'status',
    'user_notes',
    'marked_by',
    'marked_on'
  ],
  Transfers: [
    'transfer_id',
    'from_bank_id',
    'to_bank_id',
    'amount',
    'date_planned',
    'date_done',
    'is_salary_marked',
    'promo_id',
    'status'
  ],
  Documents: [
    'document_id',
    'promo_id',
    'file_id',
    'filename',
    'uploaded_on'
  ],
  'Configuración': [
    'key',
    'value',
    'description',
    'type'
  ]
};

// ============================================================================
// SAMPLE DATA
// ============================================================================

/**
 * Sample data for each sheet (for demonstration purposes)
 */
const SAMPLE_DATA = {
  Banks: [
    ['BBVA001', 'BBVA', true, true, true],
    ['SANTANDER001', 'Santander', false, true, true],
    ['OPENBANK001', 'Openbank', true, true, true]
  ],
  Promotions: [
    [
      'PROMO001',
      'BBVA001',
      'ES1234567890123456789012',
      'Promoción transferencias',
      'Bienvenida 300€',
      '2025-01-01',
      '2025-12-31',
      '300€ si cumples condiciones 6 meses',
      'Activa',
      '{"day_start": 5, "day_end": 4}',
      'Requiere tintos mensuales'
    ]
  ],
  Conditions: [
    [
      'COND001',
      'PROMO001',
      'Transferencias mínimas',
      '{"amount": 700, "is_salary_required": true}',
      true
    ],
    [
      'COND002',
      'PROMO001',
      'Saldo mínimo',
      '{"amount": 1000}',
      true
    ]
  ],
  Periods: [
    ['PERIOD001', 'PROMO001', '2025-01-05', '2025-02-04', 1, 'Pending'],
    ['PERIOD002', 'PROMO001', '2025-02-05', '2025-03-04', 2, 'Pending']
  ],
  Evaluations: [
    ['EVAL001', 'COND001', 'PERIOD001', 'Pending', '', '', '']
  ],
  Transfers: [
    [
      'TRANS001',
      'OPENBANK001',
      'BBVA001',
      700,
      '2025-01-10',
      '',
      true,
      'PROMO001',
      'Planificada'
    ]
  ],
  Documents: [],
  'Configuración': [
    [
      'email_address',
      'your.email@example.com',
      'Email address for notifications',
      'email'
    ],
    [
      'notify_transfers_days',
      '3',
      'Days before transfer to send reminder',
      'number'
    ],
    [
      'notify_period_days',
      '2',
      'Days before period end to send reminder',
      'number'
    ],
    [
      'notify_promotion_days',
      '7',
      'Days before promotion expiration to send reminder',
      'number'
    ]
  ]
};

// ============================================================================
// SHEET CREATION FUNCTIONS
// ============================================================================

/**
 * Create a single sheet with headers
 * @param {string} sheetName - Name of the sheet to create
 * @param {boolean} skipIfExists - If true, skip if sheet already exists
 * @returns {Sheet} The created or existing sheet
 */
function createSheetWithHeaders(sheetName, skipIfExists = true) {
  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);

    // Check if sheet already exists
    if (sheet) {
      if (skipIfExists) {
        Logger.log('  ⚠ Sheet "' + sheetName + '" already exists, skipping...');
        return sheet;
      } else {
        Logger.log('  ⚠ Sheet "' + sheetName + '" already exists, will update headers...');
      }
    } else {
      // Create new sheet
      sheet = ss.insertSheet(sheetName);
      Logger.log('  ✓ Created sheet: ' + sheetName);
    }

    // Set headers
    const headers = SHEET_HEADERS[sheetName];
    if (headers && headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      Logger.log('    → Added ' + headers.length + ' column headers');
    }

    return sheet;

  } catch (error) {
    Logger.log('  ✗ Error creating sheet "' + sheetName + '": ' + error.message);
    throw error;
  }
}

/**
 * Create all required sheets with headers
 * @param {boolean} skipIfExists - If true, skip sheets that already exist
 * @returns {Object} Result with created/skipped counts
 */
function createAllSheets(skipIfExists = true) {
  Logger.log('Creating all sheets...\n');

  const results = {
    created: 0,
    skipped: 0,
    errors: []
  };

  const sheetNames = Object.keys(SHEET_HEADERS);

  sheetNames.forEach(sheetName => {
    try {
      const ss = getSpreadsheet();
      const exists = ss.getSheetByName(sheetName) !== null;

      createSheetWithHeaders(sheetName, skipIfExists);

      if (exists && skipIfExists) {
        results.skipped++;
      } else {
        results.created++;
      }

    } catch (error) {
      results.errors.push(sheetName + ': ' + error.message);
    }
  });

  Logger.log('\n✓ Sheet creation complete:');
  Logger.log('  Created: ' + results.created);
  Logger.log('  Skipped: ' + results.skipped);
  if (results.errors.length > 0) {
    Logger.log('  Errors: ' + results.errors.length);
    results.errors.forEach(err => Logger.log('    - ' + err));
  }

  return results;
}

// ============================================================================
// DATA INSERTION FUNCTIONS
// ============================================================================

/**
 * Add sample data to a sheet
 * @param {string} sheetName - Name of the sheet
 * @param {boolean} clearFirst - If true, clear existing data first
 * @returns {number} Number of rows added
 */
function addSampleData(sheetName, clearFirst = false) {
  try {
    const sheet = getSheet(sheetName);
    const sampleData = SAMPLE_DATA[sheetName];

    if (!sampleData || sampleData.length === 0) {
      Logger.log('  ⚠ No sample data defined for "' + sheetName + '", skipping...');
      return 0;
    }

    // Clear existing data if requested
    if (clearFirst) {
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
        Logger.log('  → Cleared existing data');
      }
    }

    // Check if data already exists
    const existingRowCount = sheet.getLastRow() - 1; // Subtract header
    if (existingRowCount > 0 && !clearFirst) {
      Logger.log('  ⚠ Sheet "' + sheetName + '" already has data (' + existingRowCount + ' rows), skipping sample data...');
      return 0;
    }

    // Add sample data
    const startRow = sheet.getLastRow() + 1;
    const numRows = sampleData.length;
    const numCols = sampleData[0].length;

    sheet.getRange(startRow, 1, numRows, numCols).setValues(sampleData);
    Logger.log('  ✓ Added ' + numRows + ' sample row(s) to "' + sheetName + '"');

    return numRows;

  } catch (error) {
    Logger.log('  ✗ Error adding sample data to "' + sheetName + '": ' + error.message);
    throw error;
  }
}

/**
 * Add sample data to all sheets
 * @param {boolean} clearFirst - If true, clear existing data first
 * @returns {Object} Result with counts
 */
function addAllSampleData(clearFirst = false) {
  Logger.log('\nAdding sample data to all sheets...\n');

  const results = {
    added: 0,
    skipped: 0,
    errors: []
  };

  const sheetNames = Object.keys(SAMPLE_DATA);

  sheetNames.forEach(sheetName => {
    try {
      const rowsAdded = addSampleData(sheetName, clearFirst);
      if (rowsAdded > 0) {
        results.added += rowsAdded;
      } else {
        results.skipped++;
      }
    } catch (error) {
      results.errors.push(sheetName + ': ' + error.message);
    }
  });

  Logger.log('\n✓ Sample data insertion complete:');
  Logger.log('  Rows added: ' + results.added);
  Logger.log('  Sheets skipped: ' + results.skipped);
  if (results.errors.length > 0) {
    Logger.log('  Errors: ' + results.errors.length);
    results.errors.forEach(err => Logger.log('    - ' + err));
  }

  return results;
}

// ============================================================================
// FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format a single sheet (freeze header, bold, add filter)
 * @param {string} sheetName - Name of the sheet to format
 */
function formatSheet(sheetName) {
  try {
    const sheet = getSheet(sheetName);

    // Freeze header row
    sheet.setFrozenRows(1);

    // Bold header row
    const lastColumn = sheet.getLastColumn();
    if (lastColumn > 0) {
      const headerRange = sheet.getRange(1, 1, 1, lastColumn);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#f3f3f3'); // Light gray background
    }

    // Add filter to header row
    const lastRow = sheet.getLastRow();
    if (lastRow >= 1 && lastColumn > 0) {
      const dataRange = sheet.getRange(1, 1, Math.max(lastRow, 1), lastColumn);
      dataRange.createFilter();
    }

    // Auto-resize columns to fit content
    for (let col = 1; col <= lastColumn; col++) {
      sheet.autoResizeColumn(col);
    }

    Logger.log('  ✓ Formatted sheet: ' + sheetName);

  } catch (error) {
    Logger.log('  ✗ Error formatting sheet "' + sheetName + '": ' + error.message);
    throw error;
  }
}

/**
 * Format all sheets
 * @returns {Object} Result with counts
 */
function formatAllSheets() {
  Logger.log('\nFormatting all sheets...\n');

  const results = {
    formatted: 0,
    errors: []
  };

  const sheetNames = Object.keys(SHEET_HEADERS);

  sheetNames.forEach(sheetName => {
    try {
      formatSheet(sheetName);
      results.formatted++;
    } catch (error) {
      results.errors.push(sheetName + ': ' + error.message);
    }
  });

  Logger.log('\n✓ Sheet formatting complete:');
  Logger.log('  Formatted: ' + results.formatted);
  if (results.errors.length > 0) {
    Logger.log('  Errors: ' + results.errors.length);
    results.errors.forEach(err => Logger.log('    - ' + err));
  }

  return results;
}

/**
 * Color code sheet tabs for better navigation
 */
function colorCodeSheetTabs() {
  Logger.log('\nColoring sheet tabs...\n');

  const ss = getSpreadsheet();

  const colors = {
    'Banks': '#e06666',           // Red
    'Promotions': '#f6b26b',      // Orange
    'Conditions': '#ffd966',      // Yellow
    'Periods': '#93c47d',         // Green
    'Evaluations': '#76a5af',     // Cyan
    'Transfers': '#6fa8dc',       // Blue
    'Documents': '#8e7cc3',       // Purple
    'Configuración': '#c27ba0'    // Pink
  };

  let coloredCount = 0;

  Object.keys(colors).forEach(sheetName => {
    try {
      const sheet = ss.getSheetByName(sheetName);
      if (sheet) {
        sheet.setTabColor(colors[sheetName]);
        coloredCount++;
      }
    } catch (error) {
      Logger.log('  ⚠ Could not color tab for "' + sheetName + '": ' + error.message);
    }
  });

  Logger.log('✓ Colored ' + coloredCount + ' sheet tabs');
}

// ============================================================================
// MASTER SETUP FUNCTION
// ============================================================================

/**
 * Run complete setup: create sheets, add headers, add sample data, format
 * This is the main function to run for initial setup
 *
 * @param {Object} options - Setup options
 * @param {boolean} options.skipExistingSheets - Skip sheets that already exist (default: true)
 * @param {boolean} options.addSampleData - Add sample data (default: true)
 * @param {boolean} options.clearExistingData - Clear existing data before adding sample data (default: false)
 * @param {boolean} options.formatSheets - Apply formatting (default: true)
 * @param {boolean} options.colorTabs - Color code sheet tabs (default: true)
 * @returns {Object} Complete setup results
 */
function setupAll(options) {
  // Default options
  const opts = Object.assign({
    skipExistingSheets: true,
    addSampleData: true,
    clearExistingData: false,
    formatSheets: true,
    colorTabs: true
  }, options || {});

  Logger.log('╔════════════════════════════════════════════════════════════╗');
  Logger.log('║   SETUP: Gestión de Promociones Bancarias                 ║');
  Logger.log('╚════════════════════════════════════════════════════════════╝\n');

  const results = {
    success: false,
    sheets: null,
    sampleData: null,
    formatting: null,
    errors: []
  };

  try {
    // Step 1: Create sheets with headers
    Logger.log('STEP 1: Creating sheets with headers');
    Logger.log('─────────────────────────────────────');
    results.sheets = createAllSheets(opts.skipExistingSheets);

    // Step 2: Add sample data
    if (opts.addSampleData) {
      Logger.log('\nSTEP 2: Adding sample data');
      Logger.log('─────────────────────────────────────');
      results.sampleData = addAllSampleData(opts.clearExistingData);
    }

    // Step 3: Format sheets
    if (opts.formatSheets) {
      Logger.log('\nSTEP 3: Formatting sheets');
      Logger.log('─────────────────────────────────────');
      results.formatting = formatAllSheets();
    }

    // Step 4: Color code tabs
    if (opts.colorTabs) {
      Logger.log('\nSTEP 4: Color coding sheet tabs');
      Logger.log('─────────────────────────────────────');
      colorCodeSheetTabs();
    }

    results.success = true;

    // Final summary
    Logger.log('\n╔════════════════════════════════════════════════════════════╗');
    Logger.log('║   SETUP COMPLETE! ✓                                        ║');
    Logger.log('╚════════════════════════════════════════════════════════════╝\n');

    Logger.log('Summary:');
    Logger.log('  Sheets created: ' + results.sheets.created);
    Logger.log('  Sheets skipped: ' + results.sheets.skipped);
    if (opts.addSampleData) {
      Logger.log('  Sample rows added: ' + results.sampleData.added);
    }
    if (opts.formatSheets) {
      Logger.log('  Sheets formatted: ' + results.formatting.formatted);
    }

    Logger.log('\nNext steps:');
    Logger.log('  1. Review the sample data in each sheet');
    Logger.log('  2. Update the email address in the Configuración sheet');
    Logger.log('  3. Run testConfig() to verify everything works');
    Logger.log('  4. Start adding your own promotions!\n');

  } catch (error) {
    results.success = false;
    results.errors.push(error.message);
    Logger.log('\n✗ SETUP FAILED: ' + error.message);
    Logger.log('\nPlease check:');
    Logger.log('  1. SPREADSHEET_ID is set correctly in Config.js');
    Logger.log('  2. You have edit permissions for the spreadsheet');
    Logger.log('  3. The spreadsheet is accessible\n');
  }

  return results;
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick setup with default options (recommended for first-time setup)
 */
function quickSetup() {
  return setupAll({
    skipExistingSheets: true,
    addSampleData: true,
    clearExistingData: false,
    formatSheets: true,
    colorTabs: true
  });
}

/**
 * Reset all data (WARNING: This will delete all sheets and recreate them)
 */
function resetAll() {
  const ss = getSpreadsheet();

  // Ask for confirmation
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Reset All Data',
    'This will DELETE all sheets and recreate them with sample data. This action CANNOT be undone!\n\nAre you sure?',
    ui.ButtonSet.YES_NO
  );

  if (response === ui.Button.NO) {
    Logger.log('Reset cancelled by user');
    return { success: false, cancelled: true };
  }

  Logger.log('Resetting all sheets...\n');

  // Delete all existing sheets except the first one
  const sheets = ss.getSheets();
  sheets.forEach(sheet => {
    try {
      ss.deleteSheet(sheet);
    } catch (error) {
      // Can't delete the last sheet, so we'll just clear it
      sheet.clear();
    }
  });

  Logger.log('✓ Deleted existing sheets\n');

  // Run full setup with fresh data
  return setupAll({
    skipExistingSheets: false,
    addSampleData: true,
    clearExistingData: true,
    formatSheets: true,
    colorTabs: true
  });
}

/**
 * Verify the setup is complete and correct
 * @returns {Object} Validation results
 */
function verifySetup() {
  Logger.log('Verifying setup...\n');

  const results = {
    success: true,
    checks: [],
    errors: [],
    warnings: []
  };

  try {
    // Check 1: Spreadsheet accessible
    const ss = getSpreadsheet();
    results.checks.push('✓ Spreadsheet accessible: ' + ss.getName());

    // Check 2: All sheets exist
    const validation = validateSheetsExist();
    if (validation.success) {
      results.checks.push('✓ All required sheets exist (' + validation.existing.length + ')');
    } else {
      results.success = false;
      results.errors.push('✗ Missing sheets: ' + validation.missing.join(', '));
    }

    // Check 3: Headers are correct
    Object.keys(SHEET_HEADERS).forEach(sheetName => {
      try {
        const sheet = ss.getSheetByName(sheetName);
        if (sheet) {
          const actualHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
          const expectedHeaders = SHEET_HEADERS[sheetName];

          if (actualHeaders.length === expectedHeaders.length) {
            let allMatch = true;
            for (let i = 0; i < expectedHeaders.length; i++) {
              if (actualHeaders[i] !== expectedHeaders[i]) {
                allMatch = false;
                break;
              }
            }
            if (allMatch) {
              results.checks.push('✓ Headers correct for: ' + sheetName);
            } else {
              results.warnings.push('⚠ Header mismatch in: ' + sheetName);
            }
          } else {
            results.warnings.push('⚠ Wrong number of columns in: ' + sheetName);
          }
        }
      } catch (error) {
        results.errors.push('✗ Could not verify headers for: ' + sheetName);
      }
    });

    // Check 4: Sample data exists
    Object.keys(SAMPLE_DATA).forEach(sheetName => {
      const sheet = ss.getSheetByName(sheetName);
      if (sheet) {
        const rowCount = sheet.getLastRow() - 1; // Exclude header
        if (rowCount > 0) {
          results.checks.push('✓ Data exists in: ' + sheetName + ' (' + rowCount + ' rows)');
        } else if (SAMPLE_DATA[sheetName].length > 0) {
          results.warnings.push('⚠ No data in: ' + sheetName);
        }
      }
    });

    // Summary
    Logger.log('Verification Results:');
    Logger.log('═══════════════════════\n');

    results.checks.forEach(check => Logger.log(check));

    if (results.warnings.length > 0) {
      Logger.log('\nWarnings:');
      results.warnings.forEach(warn => Logger.log(warn));
    }

    if (results.errors.length > 0) {
      Logger.log('\nErrors:');
      results.errors.forEach(error => Logger.log(error));
      results.success = false;
    }

    Logger.log('\n' + (results.success ? '✓ Verification PASSED' : '✗ Verification FAILED'));

  } catch (error) {
    results.success = false;
    results.errors.push('Verification failed: ' + error.message);
    Logger.log('\n✗ Verification failed: ' + error.message);
  }

  return results;
}

// ============================================================================
// MENU INTEGRATION
// ============================================================================

/**
 * Add setup menu to the spreadsheet UI
 */
function addSetupMenu() {
  const ui = SpreadsheetApp.getUi();

  ui.createMenu('🔧 Setup')
    .addItem('🚀 Quick Setup (Recommended)', 'quickSetup')
    .addSeparator()
    .addSubMenu(
      ui.createMenu('Advanced')
        .addItem('Create Sheets Only', 'createAllSheets')
        .addItem('Add Sample Data', 'addAllSampleData')
        .addItem('Format Sheets', 'formatAllSheets')
        .addItem('Color Code Tabs', 'colorCodeSheetTabs')
    )
    .addSeparator()
    .addItem('✓ Verify Setup', 'verifySetup')
    .addItem('🧪 Test Configuration', 'testConfig')
    .addSeparator()
    .addItem('⚠️ Reset All (Delete Everything)', 'resetAll')
    .addToUi();

  Logger.log('✓ Setup menu added to UI');
}
