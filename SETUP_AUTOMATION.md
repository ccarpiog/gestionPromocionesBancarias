# Setup Automation Guide

This document explains the **automated setup functions** that make it easy to set up your Gestión de Promociones Bancarias spreadsheet with just one click.

## Quick Start

### Method 1: Using the Menu (Recommended)

1. **Set your Spreadsheet ID** in `Config.js`:
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
   ```

2. **Open your Google Sheets spreadsheet**

3. **Reload the page** to see the "Promociones App" menu

4. **Click**: `Promociones App` → `🚀 Quick Setup`

5. **Wait** for the setup to complete (check the execution log)

6. **Done!** All sheets will be created with headers, sample data, and formatting applied

### Method 2: Using Apps Script Editor

1. Open the Apps Script editor
2. Run the `quickSetup()` function
3. Check the logs to see the progress

## What Does Quick Setup Do?

The `quickSetup()` function automatically performs all these tasks:

### ✅ Step 1: Create Sheets with Headers
Creates 8 sheets with proper column headers:
- **Banks**: bank_id, name, is_bodega, supports_bizum, active
- **Promotions**: promo_id, bank_id, account_number, type, title, start_date, end_date, benefits, status, period_cycle_json, notes
- **Conditions**: condition_id, promo_id, type, params_json, is_recurring
- **Periods**: period_id, promo_id, start_ts, end_ts, index, status
- **Evaluations**: eval_id, condition_id, period_id, status, user_notes, marked_by, marked_on
- **Transfers**: transfer_id, from_bank_id, to_bank_id, amount, date_planned, date_done, is_salary_marked, promo_id, status
- **Documents**: document_id, promo_id, file_id, filename, uploaded_on
- **Configuración**: key, value, description, type

### ✅ Step 2: Add Sample Data
Adds realistic sample data to demonstrate the system:
- 3 sample banks (BBVA, Santander, Openbank)
- 1 sample promotion with conditions
- 2 periods for tracking
- 1 sample transfer
- Configuration settings

### ✅ Step 3: Format Sheets
Applies professional formatting:
- Freezes header row
- Bolds header text with gray background
- Adds filter to header row
- Auto-resizes columns to fit content

### ✅ Step 4: Color Code Sheet Tabs
Adds colors to sheet tabs for easy navigation:
- Banks: Red
- Promotions: Orange
- Conditions: Yellow
- Periods: Green
- Evaluations: Cyan
- Transfers: Blue
- Documents: Purple
- Configuración: Pink

## Available Functions

### Main Functions

#### `quickSetup()`
**Recommended for first-time setup**
- Creates all sheets with headers
- Adds sample data (won't overwrite existing data)
- Applies formatting
- Color codes tabs

```javascript
// Run this from Apps Script editor or menu
quickSetup();
```

#### `setupAll(options)`
**Advanced setup with customization**
```javascript
setupAll({
  skipExistingSheets: true,    // Skip sheets that already exist
  addSampleData: true,          // Add sample data
  clearExistingData: false,     // Clear data before adding sample
  formatSheets: true,           // Apply formatting
  colorTabs: true               // Color code sheet tabs
});
```

#### `verifySetup()`
**Verify that setup is complete and correct**
- Checks if all required sheets exist
- Validates headers are correct
- Checks if sample data is present
- Reports any issues

```javascript
verifySetup();
```

#### `resetAll()`
**⚠️ WARNING: Deletes everything and starts fresh**
- Deletes all existing sheets
- Recreates all sheets with fresh sample data
- **Cannot be undone!**
- Asks for confirmation before proceeding

```javascript
// Use with caution!
resetAll();
```

### Individual Setup Functions

You can also run individual setup steps:

#### `createAllSheets(skipIfExists)`
Creates all 8 sheets with headers
```javascript
createAllSheets(true);  // Skip sheets that already exist
```

#### `addAllSampleData(clearFirst)`
Adds sample data to all sheets
```javascript
addAllSampleData(false);  // Don't clear existing data
```

#### `formatAllSheets()`
Applies formatting to all sheets
```javascript
formatAllSheets();
```

#### `colorCodeSheetTabs()`
Colors the sheet tabs for easy navigation
```javascript
colorCodeSheetTabs();
```

## Menu Options

### Promociones App Menu Structure

```
Promociones App
├── 🚀 Quick Setup              ← Recommended for first-time setup
├── ✓ Verify Setup              ← Check if everything is set up correctly
├────────────────────────────────
├── 📋 Setup Functions
│   ├── Create All Sheets       ← Create sheets with headers only
│   ├── Add Sample Data         ← Add sample data to sheets
│   ├── Format All Sheets       ← Apply formatting (freeze, bold, filter)
│   ├── Color Code Tabs         ← Color code sheet tabs
│   ├────────────────────────────
│   └── ⚠️ Reset Everything     ← Delete and recreate everything (use with caution!)
├────────────────────────────────
├── 🧪 Testing
│   ├── Test Configuration      ← Test basic configuration
│   ├── Test Utils              ← Test utility functions
│   ├── Test SheetService       ← Test sheet service functions
│   └── Initialize System       ← Initialize the system
├────────────────────────────────
└── 🌐 Open Web App             ← Open the web application
```

## Common Scenarios

### Scenario 1: Brand New Spreadsheet
**Goal**: Set up everything from scratch

**Steps**:
1. Set `SPREADSHEET_ID` in Config.js
2. Run `quickSetup()` or use menu: `🚀 Quick Setup`
3. Verify with `verifySetup()` or use menu: `✓ Verify Setup`

### Scenario 2: Sheets Already Exist
**Goal**: Add sample data and formatting to existing sheets

**Steps**:
1. Run `addAllSampleData()` - Won't overwrite existing data
2. Run `formatAllSheets()` - Applies formatting
3. Run `colorCodeSheetTabs()` - Adds colors

### Scenario 3: Partial Setup
**Goal**: Only create sheets, no sample data

**Steps**:
```javascript
setupAll({
  skipExistingSheets: true,
  addSampleData: false,        // Skip sample data
  formatSheets: true,
  colorTabs: true
});
```

### Scenario 4: Start Over Completely
**Goal**: Delete everything and start fresh

**Steps**:
1. Run `resetAll()` or use menu: `⚠️ Reset Everything`
2. Confirm the action (will ask for confirmation)
3. Everything will be deleted and recreated

### Scenario 5: Verify Existing Setup
**Goal**: Check if setup is correct

**Steps**:
1. Run `verifySetup()` or use menu: `✓ Verify Setup`
2. Check the logs for results
3. Fix any reported issues

## Understanding the Output

When you run setup functions, you'll see output in the Apps Script logs:

### Successful Setup Output
```
╔════════════════════════════════════════════════════════════╗
║   SETUP: Gestión de Promociones Bancarias                 ║
╚════════════════════════════════════════════════════════════╝

STEP 1: Creating sheets with headers
─────────────────────────────────────
  ✓ Created sheet: Banks
    → Added 5 column headers
  ✓ Created sheet: Promotions
    → Added 11 column headers
  ...

STEP 2: Adding sample data
─────────────────────────────────────
  ✓ Added 3 sample row(s) to "Banks"
  ✓ Added 1 sample row(s) to "Promotions"
  ...

STEP 3: Formatting sheets
─────────────────────────────────────
  ✓ Formatted sheet: Banks
  ✓ Formatted sheet: Promotions
  ...

STEP 4: Color coding sheet tabs
─────────────────────────────────────
✓ Colored 8 sheet tabs

╔════════════════════════════════════════════════════════════╗
║   SETUP COMPLETE! ✓                                        ║
╚════════════════════════════════════════════════════════════╝

Summary:
  Sheets created: 8
  Sheets skipped: 0
  Sample rows added: 10
  Sheets formatted: 8

Next steps:
  1. Review the sample data in each sheet
  2. Update the email address in the Configuración sheet
  3. Run testConfig() to verify everything works
  4. Start adding your own promotions!
```

### Verification Output
```
Verification Results:
═══════════════════════

✓ Spreadsheet accessible: Gestión Promociones Bancarias
✓ All required sheets exist (8)
✓ Headers correct for: Banks
✓ Headers correct for: Promotions
✓ Headers correct for: Conditions
...
✓ Data exists in: Banks (3 rows)
✓ Data exists in: Promotions (1 rows)
...

✓ Verification PASSED
```

## Troubleshooting

### Error: "Could not open spreadsheet"
**Solution**: Check that `SPREADSHEET_ID` in Config.js is set correctly

### Error: "Sheet already exists"
**Solution**: This is normal. The function skips existing sheets by default

### Error: "Missing sheets"
**Solution**: Run `quickSetup()` to create all required sheets

### Error: "Header mismatch"
**Solution**: The sheet has wrong headers. You can either:
- Manually fix the headers in the sheet
- Delete the sheet and run `createAllSheets()` again
- Run `resetAll()` to start completely fresh (⚠️ deletes all data)

### Sample Data Not Added
**Cause**: Sheet already has data
**Solution**: This is intentional to avoid overwriting your data. To add sample data anyway:
```javascript
addAllSampleData(true);  // true = clear existing data first
```

## What Can't Be Automated?

The setup functions automate **almost everything** from SETUP_GUIDE.md, but you still need to do manually:

1. **Create the Google Sheets spreadsheet itself**
   - You need to create a new spreadsheet at sheets.google.com
   - Get the Spreadsheet ID from the URL

2. **Set the SPREADSHEET_ID in Config.js**
   - Copy your Spreadsheet ID
   - Paste it into Config.js

3. **Deploy the Apps Script project**
   - Deploy as web app when ready

4. **Update configuration settings**
   - Update email address in Configuración sheet
   - Adjust notification settings as needed

Everything else is automated!

## Best Practices

### First Time Setup
1. Create a new Google Sheets spreadsheet
2. Set the SPREADSHEET_ID in Config.js
3. Run `quickSetup()`
4. Verify with `verifySetup()`
5. Update email in Configuración sheet
6. Test with `testConfig()`

### Making Changes
1. Always test in a copy of your spreadsheet first
2. Use `verifySetup()` after making changes
3. Never run `resetAll()` on production data

### Backup
1. Make a copy of your spreadsheet before running `resetAll()`
2. Export important data regularly
3. Keep a backup of your Config.js settings

## Technical Details

### How It Works

The setup automation uses:
- **SHEET_HEADERS**: Defines all column headers for each sheet
- **SAMPLE_DATA**: Contains realistic sample data for demonstration
- **Apps Script APIs**: Uses SpreadsheetApp to create and modify sheets

### Files Involved
- `SetupFunctions.js`: All setup automation functions
- `Config.js`: Configuration and sheet definitions
- `Code.js`: Menu integration and onOpen trigger

### Safety Features
- Skips existing sheets by default (won't overwrite)
- Skips sheets with data (won't overwrite your work)
- Asks for confirmation before destructive operations
- Provides detailed logging for troubleshooting

## Support

If you encounter issues:

1. Check the Apps Script logs (View → Logs)
2. Run `verifySetup()` to see what's wrong
3. Read the SETUP_GUIDE.md for manual setup steps
4. Check that SPREADSHEET_ID is correct in Config.js

---

**Happy automating!** 🚀

This automation saves you from manually creating 8 sheets with 50+ column headers, adding sample data, and formatting everything. Enjoy!
