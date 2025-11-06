/**
 * Main entry point for Gestión de Promociones Bancarias Web App
 *
 * This file handles the webapp routing and main functions
 */

// ============================================================================
// WEB APP ENTRY POINTS
// ============================================================================

/**
 * Serve the web app (GET requests)
 * @param {Object} e - Event object with query parameters
 * @returns {HtmlOutput} HTML page to display
 */
function doGet(e) {
  try {
    // Validate configuration before serving
    const validation = validateSheetsExist();
    if (!validation.success) {
      return HtmlService.createHtmlOutput(
        '<h1>Setup Required</h1>' +
        '<p>Missing sheets: ' + validation.missing.join(', ') + '</p>' +
        '<p>Please follow the <a href="https://github.com/ccarpiog/gestionPromocionesBancarias/blob/main/SETUP_GUIDE.md">Setup Guide</a></p>'
      );
    }

    // Get page parameter (default to 'home')
    const page = e.parameter.page || 'home';

    // Route to appropriate page
    switch (page) {
      case 'home':
      case 'dashboard':
        return serveDashboard();

      case 'banks':
        return serveBanks();

      case 'promotions':
        return servePromotions();

      case 'transfers':
        return serveTransfers();

      case 'settings':
        return serveSettings();

      default:
        return serveDashboard();
    }

  } catch (error) {
    logError('doGet', error);
    return HtmlService.createHtmlOutput(
      '<h1>Error</h1>' +
      '<p>' + error.message + '</p>' +
      '<p>Please check your configuration in Config.js</p>'
    );
  }
}

/**
 * Handle POST requests (API endpoints)
 * @param {Object} e - Event object with POST data
 * @returns {ContentService.TextOutput} JSON response
 */
function doPost(e) {
  try {
    const action = e.parameter.action;
    const data = JSON.parse(e.postData.contents);

    // Route to appropriate handler
    // Will be implemented in later phases
    return ContentService.createTextOutput(
      JSON.stringify(createErrorResponse('Not implemented yet'))
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    logError('doPost', error);
    return ContentService.createTextOutput(
      JSON.stringify(createErrorResponse(error.message))
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================================
// PAGE SERVING FUNCTIONS
// ============================================================================

/**
 * Serve the dashboard/home page
 * @returns {HtmlOutput} Dashboard page
 */
function serveDashboard() {
  const template = HtmlService.createTemplateFromFile('ui/Dashboard');
  template.appName = 'Gestión de Promociones Bancarias';
  template.userName = getCurrentUserEmail();

  return template.evaluate()
    .setTitle('Dashboard - Gestión Promociones')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Serve the banks management page
 * @returns {HtmlOutput} Banks page
 */
function serveBanks() {
  const template = HtmlService.createTemplateFromFile('ui/Banks');
  return template.evaluate()
    .setTitle('Banks - Gestión Promociones')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Serve the promotions page
 * @returns {HtmlOutput} Promotions page
 */
function servePromotions() {
  const template = HtmlService.createTemplateFromFile('ui/Promotions');
  return template.evaluate()
    .setTitle('Promotions - Gestión Promociones')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Serve the transfers page
 * @returns {HtmlOutput} Transfers page
 */
function serveTransfers() {
  const template = HtmlService.createTemplateFromFile('ui/Transfers');
  return template.evaluate()
    .setTitle('Transfers - Gestión Promociones')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Serve the settings page
 * @returns {HtmlOutput} Settings page
 */
function serveSettings() {
  const template = HtmlService.createTemplateFromFile('ui/Settings');
  return template.evaluate()
    .setTitle('Settings - Gestión Promociones')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ============================================================================
// TEMPLATE INCLUDE HELPER
// ============================================================================

/**
 * Include HTML files (for use in templates with <?!= include('filename') ?>)
 * @param {string} filename - Name of file to include
 * @returns {string} File contents
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ============================================================================
// INITIALIZATION AND SETUP
// ============================================================================

/**
 * Run this function once after deployment to initialize the system
 */
function initializeSystem() {
  Logger.log('Initializing system...');

  try {
    // Validate sheets
    const validation = validateSheetsExist();
    if (!validation.success) {
      Logger.log('✗ Missing sheets: ' + validation.missing.join(', '));
      Logger.log('Please create missing sheets following SETUP_GUIDE.md');
      return false;
    }
    Logger.log('✓ All sheets exist');

    // Check if Configuración sheet has required settings
    const configSheet = getSheet(SHEET_NAMES.CONFIG);
    const configData = getAllDataAsObjects(SHEET_NAMES.CONFIG);

    const requiredKeys = [
      'email_address',
      'notify_transfers_days',
      'notify_period_days',
      'notify_promotion_days'
    ];

    const existingKeys = configData.map(row => row.key);
    const missingKeys = requiredKeys.filter(key => !existingKeys.includes(key));

    if (missingKeys.length > 0) {
      Logger.log('⚠ Missing configuration keys: ' + missingKeys.join(', '));
      Logger.log('Please add these to the Configuración sheet');
    } else {
      Logger.log('✓ All required configuration keys present');
    }

    // Test webapp URL
    const webappUrl = getWebAppUrl();
    Logger.log('✓ Webapp URL: ' + webappUrl);

    Logger.log('\n✓ System initialized successfully!');
    Logger.log('Deploy as web app to start using the application.');

    return true;

  } catch (error) {
    Logger.log('✗ Initialization failed: ' + error.message);
    return false;
  }
}

/**
 * Menu item to run system tests
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Promociones App')
    .addItem('Initialize System', 'initializeSystem')
    .addItem('Test Configuration', 'testConfig')
    .addItem('Test Utils', 'testUtils')
    .addItem('Test SheetService', 'testSheetService')
    .addSeparator()
    .addItem('Open Web App', 'openWebApp')
    .addToUi();
}

/**
 * Open the web app in a new window
 */
function openWebApp() {
  const url = getWebAppUrl();
  const html = '<script>window.open("' + url + '");google.script.host.close();</script>';
  const ui = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showModalDialog(ui, 'Opening Web App...');
}
