# Setup Guide - Gestión de Promociones Bancarias

> **💡 NEW: Automated Setup Available!**
> You can now automate most of these setup steps with one click!
> See [SETUP_AUTOMATION.md](./SETUP_AUTOMATION.md) for details on using the `quickSetup()` function.
> This guide remains useful for understanding the structure and for manual setup if needed.

## Phase 1: Foundation & Data Model Setup

### Step 1: Create Google Sheets Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it: **"Gestión Promociones Bancarias"**
4. Note the Spreadsheet ID from the URL (between `/d/` and `/edit`):
   ```
   https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
   ```
5. You'll need this ID for the Config.js file

### Step 2: Create 8 Sheets with Headers

Create the following sheets in your spreadsheet:

---

#### Sheet 1: `Banks`
**Columns (in this exact order):**
```
bank_id | name | is_bodega | supports_bizum | active
```

**Sample Data (copy to row 2):**
```
BBVA001 | BBVA | TRUE | TRUE | TRUE
SANTANDER001 | Santander | FALSE | TRUE | TRUE
OPENBANK001 | Openbank | TRUE | TRUE | TRUE
```

**Column Descriptions:**
- `bank_id`: Unique identifier (text, e.g., "BBVA001")
- `name`: Bank name (text)
- `is_bodega`: Can send salary-marked transfers (TRUE/FALSE)
- `supports_bizum`: Has Bizum support (TRUE/FALSE)
- `active`: Show in UI (TRUE/FALSE)

---

#### Sheet 2: `Promotions`
**Columns (in this exact order):**
```
promo_id | bank_id | account_number | type | title | start_date | end_date | benefits | status | period_cycle_json | notes
```

**Sample Data (copy to row 2):**
```
PROMO001 | BBVA001 | ES1234567890123456789012 | Promoción transferencias | Bienvenida 300€ | 2025-01-01 | 2025-12-31 | 300€ si cumples condiciones 6 meses | Activa | {"day_start": 5, "day_end": 4} | Requiere tintos mensuales
```

**Column Descriptions:**
- `promo_id`: Unique identifier (text)
- `bank_id`: Foreign key to Banks (text)
- `account_number`: Account number (text, e.g., IBAN)
- `type`: Type enum: "Plazo fijo", "Promoción transferencias", "Otro"
- `title`: Promotion title (text)
- `start_date`: Start date (date format: YYYY-MM-DD)
- `end_date`: End date (date format: YYYY-MM-DD)
- `benefits`: Description of benefits (text)
- `status`: Status enum: "Activa", "En pausa", "Completada", "Fallida", "Expirada"
- `period_cycle_json`: Period configuration (JSON string)
- `notes`: Additional notes (text)

---

#### Sheet 3: `Conditions`
**Columns (in this exact order):**
```
condition_id | promo_id | type | params_json | is_recurring
```

**Sample Data (copy to row 2):**
```
COND001 | PROMO001 | Transferencias mínimas | {"amount": 700, "is_salary_required": true} | TRUE
COND002 | PROMO001 | Saldo mínimo | {"amount": 1000} | TRUE
```

**Column Descriptions:**
- `condition_id`: Unique identifier (text)
- `promo_id`: Foreign key to Promotions (text)
- `type`: Type enum: "Saldo mínimo", "Bizum activo", "Transferencias mínimas", "Recibos domiciliados", "Compras tarjeta", "Condición puntual"
- `params_json`: Parameters specific to type (JSON string)
- `is_recurring`: Repeats each period (TRUE) or one-time (FALSE)

**params_json examples by type:**
- Saldo mínimo: `{"amount": 1000}`
- Bizum activo: `{"phone_number": "+34600000000"}`
- Transferencias mínimas: `{"amount": 700, "is_salary_required": true}`
- Recibos domiciliados: `{"count": 2}`
- Compras tarjeta: `{"count": 3}`
- Condición puntual: `{"description": "Traspasar 5000€ desde otro banco"}`

---

#### Sheet 4: `Periods`
**Columns (in this exact order):**
```
period_id | promo_id | start_ts | end_ts | index | status
```

**Sample Data (copy to row 2):**
```
PERIOD001 | PROMO001 | 2025-01-05 | 2025-02-04 | 1 | Pending
PERIOD002 | PROMO001 | 2025-02-05 | 2025-03-04 | 2 | Pending
```

**Column Descriptions:**
- `period_id`: Unique identifier (text)
- `promo_id`: Foreign key to Promotions (text)
- `start_ts`: Period start date (date format: YYYY-MM-DD)
- `end_ts`: Period end date (date format: YYYY-MM-DD)
- `index`: Period number (number, starting from 1)
- `status`: Status: "Pending", "In Progress", "Completed"

---

#### Sheet 5: `Evaluations`
**Columns (in this exact order):**
```
eval_id | condition_id | period_id | status | user_notes | marked_by | marked_on
```

**Sample Data (copy to row 2):**
```
EVAL001 | COND001 | PERIOD001 | Pending | | |
```

**Column Descriptions:**
- `eval_id`: Unique identifier (text)
- `condition_id`: Foreign key to Conditions (text)
- `period_id`: Foreign key to Periods (text)
- `status`: Status: "Pending", "Met", "Failed"
- `user_notes`: User comments (text)
- `marked_by`: User email who marked it (text)
- `marked_on`: Date marked (date format: YYYY-MM-DD HH:MM:SS)

---

#### Sheet 6: `Transfers`
**Columns (in this exact order):**
```
transfer_id | from_bank_id | to_bank_id | amount | date_planned | date_done | is_salary_marked | promo_id | status
```

**Sample Data (copy to row 2):**
```
TRANS001 | OPENBANK001 | BBVA001 | 700 | 2025-01-10 | | TRUE | PROMO001 | Planificada
```

**Column Descriptions:**
- `transfer_id`: Unique identifier (text)
- `from_bank_id`: Foreign key to Banks - origin (text)
- `to_bank_id`: Foreign key to Banks - destination (text)
- `amount`: Transfer amount (number)
- `date_planned`: Planned date (date format: YYYY-MM-DD)
- `date_done`: Actual completion date (date format: YYYY-MM-DD, leave empty if not done)
- `is_salary_marked`: Marked as salary/nomina (TRUE/FALSE)
- `promo_id`: Optional link to promotion (text, can be empty)
- `status`: Status: "Planificada", "Realizada", "Atrasada", "Cancelada"

---

#### Sheet 7: `Documents`
**Columns (in this exact order):**
```
document_id | promo_id | file_id | filename | uploaded_on
```

**Sample Data:**
Leave empty for now (will be populated when users upload documents)

**Column Descriptions:**
- `document_id`: Unique identifier (text)
- `promo_id`: Foreign key to Promotions (text)
- `file_id`: Google Drive file ID (text)
- `filename`: Original filename (text)
- `uploaded_on`: Upload timestamp (date format: YYYY-MM-DD HH:MM:SS)

---

#### Sheet 8: `Configuración`
**Columns (in this exact order):**
```
key | value | description | type
```

**Sample Data (copy to rows 2-5):**
```
email_address | your.email@example.com | Email address for notifications | email
notify_transfers_days | 3 | Days before transfer to send reminder | number
notify_period_days | 2 | Days before period end to send reminder | number
notify_promotion_days | 7 | Days before promotion expiration to send reminder | number
```

**Column Descriptions:**
- `key`: Setting identifier (text)
- `value`: Setting value (text)
- `description`: Human-readable description (text)
- `type`: Data type: "email", "number", "boolean", "text"

---

### Step 3: Important Setup Notes

1. **Header Row**: Each sheet must have headers in **row 1**
2. **Data Starts**: Data starts in **row 2**
3. **Case Sensitive**: Column names are case-sensitive
4. **Order Matters**: Keep columns in the exact order shown
5. **Date Format**: Use YYYY-MM-DD for dates (e.g., 2025-01-15)
6. **Boolean Values**: Use TRUE or FALSE (all caps)
7. **Empty Cells**: Leave cells empty if no value (don't use "null" or "N/A")

### Step 4: Sheet Formatting (Optional but Recommended)

For better readability:
1. **Freeze header rows**: View → Freeze → 1 row
2. **Bold headers**: Select row 1 and click Bold
3. **Add filters**: Select headers → Data → Create a filter
4. **Color code**: Give each sheet tab a different color for easy navigation

---

## Next Steps

After creating the Google Sheets:
1. Copy the Spreadsheet ID
2. Continue with the Apps Script setup (Config.js will be created next)
3. Deploy the web app

---

## Troubleshooting

### Common Issues:
- **Column not found**: Check spelling and case of column names
- **Date format errors**: Ensure dates are in YYYY-MM-DD format
- **Boolean errors**: Use TRUE/FALSE, not true/false or 1/0
- **Foreign key errors**: Ensure referenced IDs exist (e.g., bank_id in Banks sheet)

---

*Last Updated: 2025-11-06*
*Phase: 1 - Foundation & Data Model Setup*
