# Gestión de Promociones Bancarias

A Google Apps Script application for managing and tracking bank promotions, bonuses, and their requirements.

## Overview

This application helps you track:
- 🏦 **Bank promotions** and their requirements
- 💰 **Conditions** to meet (transfers, minimum balance, Bizum usage, etc.)
- 📅 **Periods** and deadlines for each promotion
- 💸 **Transfers** between banks to meet requirements
- 📊 **Progress tracking** for each condition per period
- 📄 **Documents** related to promotions

## Features

- ✅ Automated period generation for recurring promotions
- ✅ Track multiple conditions per promotion
- ✅ Plan and track transfers between banks
- ✅ Mark conditions as met/failed per period
- ✅ Store promotion-related documents in Google Drive
- ✅ **One-click automated setup** with sample data
- ✅ Web interface (coming in Phase 2)
- ✅ Email notifications (coming in Phase 2)

## Quick Start

### 1. Create a Google Sheets Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it: **"Gestión Promociones Bancarias"**
4. Copy the Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
   ```

### 2. Set Up Apps Script Project

1. In your spreadsheet, go to: **Extensions → Apps Script**
2. Copy all the `.js` files from this repository to your Apps Script project
3. Update `Config.js` with your Spreadsheet ID:
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
   ```

### 3. Run Automated Setup (Recommended) 🚀

**Option A: Using the Menu**
1. Save and reload your Google Sheets spreadsheet
2. You'll see a new menu: **"Promociones App"**
3. Click: **Promociones App → 🚀 Quick Setup**
4. Wait for the setup to complete
5. Done! All sheets, headers, sample data, and formatting are ready

**Option B: Using Apps Script**
1. In the Apps Script editor, run the `quickSetup()` function
2. Check the execution logs to see the progress

That's it! Your spreadsheet is now ready to use with:
- ✅ 8 sheets with proper headers
- ✅ Sample data for demonstration
- ✅ Professional formatting
- ✅ Color-coded tabs

See [SETUP_AUTOMATION.md](./SETUP_AUTOMATION.md) for detailed automation documentation.

### 4. Manual Setup (Alternative)

If you prefer to set up manually or want to understand the structure better, follow the detailed step-by-step guide in [SETUP_GUIDE.md](./SETUP_GUIDE.md).

## Project Structure

```
/
├── Config.js              # Configuration and constants
├── Code.js                # Main entry point, web app routing, menu
├── SetupFunctions.js      # Automated setup functions ⭐ NEW
├── services/
│   └── SheetService.js    # Generic CRUD operations for sheets
├── utils/
│   └── Utils.js           # Utility functions (dates, logging, etc.)
├── SETUP_GUIDE.md         # Detailed manual setup instructions
├── SETUP_AUTOMATION.md    # Automated setup documentation ⭐ NEW
├── README.md              # This file
└── implementation-plan.md # Development roadmap
```

## Sheets Structure

The application uses 8 Google Sheets:

| Sheet | Purpose | Key Columns |
|-------|---------|-------------|
| **Banks** | Bank information | bank_id, name, is_bodega, supports_bizum |
| **Promotions** | Active promotions | promo_id, bank_id, title, start_date, end_date, status |
| **Conditions** | Promotion requirements | condition_id, promo_id, type, params_json, is_recurring |
| **Periods** | Promotion periods | period_id, promo_id, start_ts, end_ts, status |
| **Evaluations** | Condition tracking | eval_id, condition_id, period_id, status |
| **Transfers** | Planned/completed transfers | transfer_id, from_bank_id, to_bank_id, amount, date_planned |
| **Documents** | Related documents | document_id, promo_id, file_id, filename |
| **Configuración** | App settings | key, value, description |

## Available Functions

### Setup & Initialization

| Function | Description |
|----------|-------------|
| `quickSetup()` | 🚀 One-click setup (recommended) |
| `createAllSheets()` | Create all 8 sheets with headers |
| `addAllSampleData()` | Add sample data to all sheets |
| `formatAllSheets()` | Apply formatting (freeze, bold, filters) |
| `verifySetup()` | Verify setup is complete and correct |
| `resetAll()` | ⚠️ Delete everything and start fresh |

### Testing & Validation

| Function | Description |
|----------|-------------|
| `testConfig()` | Test basic configuration |
| `testSheetService()` | Test sheet service functions |
| `testUtils()` | Test utility functions |
| `initializeSystem()` | Initialize the system after deployment |

### Sheet Operations (SheetService.js)

| Function | Description |
|----------|-------------|
| `getAllData(sheetName)` | Get all data from a sheet |
| `getAllDataAsObjects(sheetName)` | Get data as array of objects |
| `findById(sheetName, id)` | Find a row by ID |
| `appendRow(sheetName, rowData)` | Append a new row |
| `updateById(sheetName, id, updates)` | Update a row by ID |
| `deleteById(sheetName, id)` | Delete a row by ID |
| `batchAppend(sheetName, rows)` | Batch append multiple rows |
| `batchUpdate(sheetName, updates)` | Batch update multiple rows |

## Condition Types

The system supports 6 types of promotion conditions:

| Type | Description | Example Parameters |
|------|-------------|-------------------|
| **Saldo mínimo** | Minimum balance requirement | `{"amount": 1000}` |
| **Bizum activo** | Active Bizum account | `{"phone_number": "+34600000000"}` |
| **Transferencias mínimas** | Minimum transfer amount | `{"amount": 700, "is_salary_required": true}` |
| **Recibos domiciliados** | Direct debits | `{"count": 2}` |
| **Compras tarjeta** | Card purchases | `{"count": 3}` |
| **Condición puntual** | One-time condition | `{"description": "Transfer 5000€ from another bank"}` |

## Usage Examples

### Example 1: Adding a New Bank
```javascript
appendRowFromObject(SHEET_NAMES.BANKS, {
  bank_id: 'ING001',
  name: 'ING',
  is_bodega: true,
  supports_bizum: true,
  active: true
});
```

### Example 2: Getting Active Promotions
```javascript
const promotions = getAllDataAsObjects(SHEET_NAMES.PROMOTIONS);
const activePromotions = promotions.filter(p => p.status === 'Activa');
```

### Example 3: Updating Promotion Status
```javascript
updateById(SHEET_NAMES.PROMOTIONS, 'PROMO001', {
  status: 'Completada'
});
```

### Example 4: Finding Conditions for a Promotion
```javascript
const conditions = findByColumn(SHEET_NAMES.CONDITIONS, 'promo_id', 'PROMO001');
```

## Menu Reference

After setup, you'll see this menu in your spreadsheet:

```
Promociones App
├── 🚀 Quick Setup              ← One-click setup for new spreadsheets
├── ✓ Verify Setup              ← Check if everything is set up correctly
├────────────────────────────────
├── 📋 Setup Functions
│   ├── Create All Sheets       ← Create sheets with headers only
│   ├── Add Sample Data         ← Add sample data to sheets
│   ├── Format All Sheets       ← Apply formatting
│   ├── Color Code Tabs         ← Color code sheet tabs
│   └── ⚠️ Reset Everything     ← Delete and recreate (use with caution!)
├────────────────────────────────
├── 🧪 Testing
│   ├── Test Configuration      ← Test basic configuration
│   ├── Test Utils              ← Test utility functions
│   ├── Test SheetService       ← Test sheet operations
│   └── Initialize System       ← Initialize after deployment
├────────────────────────────────
└── 🌐 Open Web App             ← Open the web interface (Phase 2)
```

## Development Status

### ✅ Phase 1: Foundation & Data Model Setup (COMPLETED)
- Core data model with 8 sheets
- Sheet service with CRUD operations
- Utility functions (dates, logging, IDs)
- Configuration management
- **Automated setup functions** ⭐ NEW

### 🚧 Phase 2: Business Logic & Services (IN PROGRESS)
- Period generation engine
- Condition evaluation system
- Notification system
- Document management

### 📋 Phase 3: User Interface (PLANNED)
- Web app interface
- Dashboard with promotion overview
- Promotion management screens
- Transfer planning interface

## Tips & Best Practices

### For New Users
1. Use `quickSetup()` for initial setup
2. Review the sample data to understand the structure
3. Update the email in Configuración sheet
4. Run `testConfig()` to verify everything works
5. Start by adding one real promotion to learn the system

### For Development
1. Always test in a copy of your spreadsheet
2. Use `verifySetup()` after making changes
3. Check Apps Script logs for errors (View → Logs)
4. Never run `resetAll()` on production data

### For Data Management
1. Use unique IDs for all records (e.g., BANK001, PROMO001)
2. Use YYYY-MM-DD format for dates
3. Use TRUE/FALSE (all caps) for boolean values
4. Leave cells empty if no value (don't use "null" or "N/A")
5. Always use JSON format for period_cycle_json and params_json

## Troubleshooting

### Common Issues

**"Could not open spreadsheet"**
- Check that SPREADSHEET_ID in Config.js is correct
- Verify you have edit permissions for the spreadsheet

**"Sheet not found"**
- Run `quickSetup()` or `createAllSheets()` to create missing sheets
- Check that sheet names match exactly (case-sensitive)

**"Missing sheets"**
- Run `verifySetup()` to see which sheets are missing
- Use `quickSetup()` to create all required sheets

**"Header mismatch"**
- Delete the problematic sheet
- Run `createAllSheets()` to recreate it with correct headers
- Or run `resetAll()` to start completely fresh (⚠️ deletes all data)

**Sample data not added**
- Sheet already has data (this is intentional to avoid overwriting)
- Use `addAllSampleData(true)` to force adding data (will clear existing)

### Getting Help

1. Check the [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions
2. Check the [SETUP_AUTOMATION.md](./SETUP_AUTOMATION.md) for automation details
3. Review Apps Script logs (View → Logs in Apps Script editor)
4. Run `verifySetup()` to diagnose setup issues
5. Check that all required files are uploaded to Apps Script

## Security & Privacy

- All data is stored in your own Google Sheets spreadsheet
- You control access permissions through Google Sheets sharing
- No data is sent to external servers
- Document files are stored in your Google Drive
- Email notifications use your Google account

## Contributing

This project is in active development. Current implementation follows the roadmap in `implementation-plan.md`.

### Development Phases
- ✅ Phase 1: Data Model & Foundation
- 🚧 Phase 2: Business Logic & Services
- 📋 Phase 3: User Interface
- 📋 Phase 4: Testing & Polish

## License

This project is open source and available for personal and educational use.

## Credits

Developed using Google Apps Script for managing bank promotion tracking.

---

**Version**: 1.1.0 (Phase 1 Complete + Setup Automation)
**Last Updated**: 2025-11-06

---

## What's New in v1.1.0 🎉

- ✨ **Automated Setup Functions**: One-click setup with `quickSetup()`
- ✨ **Setup Menu Integration**: Easy access through spreadsheet menu
- ✨ **Verification Tools**: Automated setup verification
- ✨ **Comprehensive Documentation**: New SETUP_AUTOMATION.md guide
- ✨ **Sample Data**: Realistic sample data for demonstration
- ✨ **Professional Formatting**: Automated sheet formatting and color coding

No more manual sheet creation! Get started in seconds instead of hours! 🚀
