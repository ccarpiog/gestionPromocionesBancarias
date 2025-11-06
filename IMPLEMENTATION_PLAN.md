# Implementation Plan - Gestión de Promociones Bancarias

## Overview
This plan breaks down the PRD implementation into 8 testable phases, each achievable in 1-3 days.

---

## Phase 1: Foundation & Data Model Setup (2 days)

### Objectives
- Set up Google Sheets structure with all required tables
- Create basic backend utilities and configuration
- Establish project structure and testing framework

### Tasks
1. **Create Google Sheets structure**
   - Create spreadsheet with 7 sheets: `Banks`, `Promotions`, `Conditions`, `Periods`, `Evaluations`, `Transfers`, `Documents`
   - Add header rows with column names as per PRD section 4
   - Add sample data for testing (2-3 rows per sheet)

2. **Set up Google Apps Script project**
   - Create main `Code.gs` file
   - Set up folder structure:
     - `/models` - Data access layer
     - `/services` - Business logic
     - `/ui` - Frontend HTML/JS
     - `/utils` - Helper functions
   - Create `Config.gs` with spreadsheet ID and constants

3. **Create basic utilities**
   - `Utils.gs`: ID generator (UUID), date helpers, validation functions
   - `SheetService.gs`: Generic read/write functions for sheets
   - Error handling framework

### Testing Criteria
- [ ] All 7 sheets exist with correct headers
- [ ] Can read/write sample data from each sheet
- [ ] ID generation works uniquely
- [ ] Basic webapp deploys successfully (blank page is OK)

### Deliverables
- Configured Google Sheets with structure
- Basic GAS project with utilities
- Documentation of sheet structure

---

## Phase 2: Banks & Basic Backend (2 days)

### Objectives
- Implement full CRUD for Banks
- Create basic UI for bank management
- Establish patterns for other entities

### Tasks
1. **Backend: Banks Service**
   - `models/BankModel.gs`: CRUD operations
     - `createBank(data)`
     - `getBankById(id)`
     - `getAllBanks(includeInactive)`
     - `updateBank(id, data)`
     - `deleteBank(id)` (soft delete: set active=false)

2. **Frontend: Banks UI**
   - `ui/banks.html`: Banks management page
     - List all banks in a table
     - Add/Edit form with fields: name, is_bodega, supports_bizum, active
     - Delete/deactivate functionality
   - Basic styling with Google Material Design

3. **API Endpoints**
   - `api/BanksAPI.gs`: Expose backend functions to frontend
   - Handle GET/POST/PUT/DELETE operations

### Testing Criteria
- [ ] Can create a new bank via UI
- [ ] Bank list displays correctly with all fields
- [ ] Can edit existing bank
- [ ] Can toggle active/inactive status
- [ ] Is_bodega and supports_bizum checkboxes work
- [ ] Data persists in Google Sheets correctly

### Deliverables
- Working Banks management UI
- Reusable patterns for CRUD operations
- Test with 5+ sample banks

---

## Phase 3: Promotions Management (2-3 days)

### Objectives
- Implement promotions CRUD
- Create comprehensive promotions UI
- Handle promotion lifecycle states

### Tasks
1. **Backend: Promotions Service**
   - `models/PromotionModel.gs`: Full CRUD
     - Include all fields from PRD: bank_id, account_number, type, dates, benefits, status, period_cycle_json, notes
     - Status enum: `Activa`, `En pausa`, `Completada`, `Fallida`, `Expirada`
     - Type enum: `Plazo fijo`, `Promoción transferencias`, `Otro`

2. **Frontend: Promotions UI**
   - `ui/promotions.html`: Main promotions page
     - List view with filters (status, bank, show/hide expired)
     - Create/Edit modal with form
     - Bank dropdown (from Banks table)
     - Date pickers for start/end dates
     - Status dropdown
     - Rich text area for benefits and notes
   - Detail view showing all promotion info

3. **Business Logic**
   - Auto-calculate status based on dates (e.g., auto-mark as Expirada if end_date passed)
   - Validation: end_date must be after start_date

### Testing Criteria
- [ ] Can create promotion with all fields
- [ ] Bank dropdown shows only active banks
- [ ] Date validation works
- [ ] Status filtering works
- [ ] Can toggle show/hide expired promotions
- [ ] Edit and delete work correctly
- [ ] Account number field stores properly

### Deliverables
- Full promotions management interface
- 5+ test promotions with different statuses
- Validation working correctly

---

## Phase 4: Conditions System (2 days)

### Objectives
- Implement conditions CRUD
- Link conditions to promotions
- Support all condition types from PRD

### Tasks
1. **Backend: Conditions Service**
   - `models/ConditionModel.gs`: CRUD operations
   - Condition types enum:
     - `Saldo mínimo`
     - `Bizum activo`
     - `Transferencias mínimas`
     - `Recibos domiciliados`
     - `Compras tarjeta`
     - `Condición puntual`
   - params_json structure varies by type

2. **Frontend: Conditions UI**
   - `ui/conditions.html`: Conditions management within promotion detail
   - Dynamic form based on condition type:
     - Saldo mínimo: amount field
     - Transferencias: amount, is_salary_required
     - Recibos/Compras: count field
     - Bizum: phone number field
   - Checkbox for is_recurring
   - List of conditions per promotion

3. **Integration**
   - Show conditions in promotion detail view
   - Add/remove conditions from promotion
   - Validate condition parameters

### Testing Criteria
- [ ] Can add each type of condition
- [ ] Form adapts to selected condition type
- [ ] Conditions appear in promotion detail
- [ ] Can edit condition parameters
- [ ] Can delete conditions
- [ ] is_recurring flag works correctly
- [ ] params_json stores correctly for each type

### Deliverables
- Working conditions management
- Each promotion has 2-3 test conditions
- Documentation of params_json format per condition type

---

## Phase 5: Periods & Evaluations System (2-3 days)

### Objectives
- Implement automatic period generation
- Create evaluation/checklist UI
- Manual marking system for compliance

### Tasks
1. **Backend: Periods Service**
   - `models/PeriodModel.gs`: CRUD operations
   - `services/PeriodGenerator.gs`: Auto-generate periods
     - Parse period_cycle_json from promotion
     - Generate next N periods (e.g., 12 months ahead)
     - Create period records with start_ts, end_ts
   - Detect current/active period

2. **Backend: Evaluations Service**
   - `models/EvaluationModel.gs`: CRUD operations
   - When period created → auto-create evaluation records for each recurring condition
   - Support status: `Pending`, `Met`, `Failed`
   - Record marked_by, marked_on, user_notes

3. **Frontend: Period Checklist UI**
   - `ui/periods.html`: Period view within promotion
     - Timeline/list of periods
     - Current period highlighted
     - Checklist of conditions per period
     - Buttons: ✅ Cumplido, ⚠️ Pendiente, ❌ No cumple
     - Notes field per evaluation
   - Visual status indicator (traffic light: green/yellow/red)

4. **Business Logic**
   - Calculate period status based on evaluations
   - Handle punctual (non-recurring) conditions separately

### Testing Criteria
- [ ] Periods auto-generate based on promotion cycle
- [ ] Current period is correctly identified
- [ ] Evaluations created for recurring conditions
- [ ] Can mark condition as Met/Pending/Failed
- [ ] Visual status updates immediately
- [ ] Notes save correctly
- [ ] Punctual conditions handled properly
- [ ] Historical periods show past evaluations

### Deliverables
- Working period generation
- Interactive checklist UI
- Test data with multiple periods marked

---

## Phase 6: Transfers (Tintos) Management (2 days)

### Objectives
- Implement transfers CRUD
- Track planned vs completed transfers
- Validate bodega restrictions

### Tasks
1. **Backend: Transfers Service**
   - `models/TransferModel.gs`: CRUD operations
   - Fields: from_bank_id, to_bank_id, amount, date_planned, date_done, is_salary_marked, promo_id, status
   - Status: `Planificada`, `Realizada`, `Atrasada`, `Cancelada`
   - Validation: is_salary_marked only if from_bank is_bodega=true

2. **Frontend: Transfers UI**
   - `ui/transfers.html`: Main transfers page
     - List view with filters (status, date range, bank)
     - Create/Edit form:
       - Origin bank dropdown (bodega indicator)
       - Destination bank dropdown
       - Amount field
       - Planned date picker
       - Checkbox "Marcada como nómina" (disabled if origin not bodega)
       - Link to promotion (optional)
     - Mark as completed functionality (sets date_done)
   - Dashboard widget: upcoming/overdue transfers

3. **Business Logic**
   - Auto-detect overdue: date_planned < today && date_done is null
   - Calculate days until/since planned date

### Testing Criteria
- [ ] Can create transfer between banks
- [ ] Bodega validation works (tintos checkbox)
- [ ] Can mark transfer as completed
- [ ] Overdue transfers highlighted
- [ ] Can filter by status and date
- [ ] Link to promotion works
- [ ] Amount validation (positive number)

### Deliverables
- Working transfers management UI
- 10+ test transfers in various states
- Dashboard showing upcoming transfers

---

## Phase 7: Email Notifications & Triggers (2 days)

### Objectives
- Implement email notification system
- Set up time-based triggers
- Alert users of upcoming actions

### Tasks
1. **Backend: Notification Service**
   - `services/NotificationService.gs`: Email functions
   - Email templates:
     - Transfer reminder (3 days before date_planned)
     - Period ending reminder (2 days before end)
     - Promotion expiring (7 days before end_date)
   - Batch notification function (checks all and sends)

2. **Trigger Setup**
   - `triggers/DailyTrigger.gs`: Run daily check
   - Install trigger via UI or setup script
   - Find and process:
     - Transfers upcoming in 1-3 days
     - Periods ending in 1-2 days with pending evaluations
     - Promotions expiring in 7 days

3. **Email Templates**
   - HTML email templates with:
     - Subject line
     - Body with details
     - Links back to webapp (if applicable)
     - Unsubscribe/settings option

4. **Settings UI**
   - `ui/settings.html`: Notification preferences
     - Email address (default: current user)
     - Enable/disable each notification type
     - Days before reminder

### Testing Criteria
- [ ] Can manually trigger notification batch
- [ ] Receives email for upcoming transfer
- [ ] Receives email for ending period
- [ ] Receives email for expiring promotion
- [ ] Daily trigger installs correctly
- [ ] Can modify notification settings
- [ ] No duplicate emails sent

### Deliverables
- Working notification system
- Installed daily trigger
- Test emails received

---

## Phase 8: Dashboard, Documents & Polish (2-3 days)

### Objectives
- Create main dashboard view
- Implement document management
- Final UI/UX polish and testing

### Tasks
1. **Dashboard UI**
   - `ui/dashboard.html`: Main landing page
     - Summary cards:
       - Active promotions count
       - Upcoming transfers (next 7 days)
       - Pending evaluations count
       - Expiring promotions (next 30 days)
     - Recent activity feed
     - Quick actions menu
     - Navigation to all sections

2. **Document Management**
   - `services/DocumentService.gs`: Drive integration
     - Create folder in Drive (one-time setup)
     - Upload file to Drive
     - Link file to promotion
     - List documents per promotion
   - `models/DocumentModel.gs`: CRUD for Documents table
   - `ui/documents.html`: Document upload/list widget
     - File upload button
     - Display linked documents with download links
     - Delete document functionality

3. **Visual Polish**
   - Consistent styling across all pages
   - Traffic light indicators (🟢🟡🔴) for status
   - Responsive design basics
   - Loading states and error messages
   - Confirmation dialogs for delete actions

4. **Navigation & Routing**
   - Main menu/sidebar with links to all sections
   - Breadcrumb navigation
   - Back buttons

5. **Final Testing**
   - End-to-end workflow test
   - Performance optimization
   - Error handling review
   - Cross-browser testing (Chrome, Firefox, Safari)

### Testing Criteria
- [ ] Dashboard loads and shows accurate counts
- [ ] Can upload document to promotion
- [ ] Document stored in Drive with correct permissions
- [ ] Can download document from UI
- [ ] All navigation works smoothly
- [ ] Status indicators display correctly
- [ ] UI is consistent across all pages
- [ ] No console errors
- [ ] Complete user workflow works end-to-end

### Deliverables
- Polished, production-ready dashboard
- Working document management
- Complete navigation system
- User documentation (brief guide)

---

## Testing Strategy (Across All Phases)

### Unit Testing
- Test each model function independently
- Test validation logic
- Test date calculations

### Integration Testing
- Test UI → Backend → Sheets flow
- Test trigger execution
- Test email sending

### User Acceptance Testing
- Complete workflow: Create promotion → Add conditions → Generate periods → Mark evaluations → Plan transfers → Receive notifications
- Test with real-world scenarios from PRD

---

## Success Metrics (Reference PRD Section 8)

- ✅ No promotions missed due to forgotten conditions
- ✅ Monthly review time reduced
- ✅ Clear visibility of actions needed today and upcoming
- ✅ All data accurately tracked in Google Sheets
- ✅ Email reminders received on time

---

## Technical Notes

### Google Apps Script Limitations
- Execution time limit: 6 minutes per run
- Daily trigger quota: varies by account type
- Sheets API rate limits apply

### Best Practices
- Use batch operations for Sheets access (reduce API calls)
- Cache frequently accessed data (e.g., banks list)
- Implement proper error handling and logging
- Use ScriptProperties for configuration
- Version control: push code to GitHub (use clasp if needed)

---

## Dependencies & Prerequisites

- Google Account with Drive and Sheets access
- Basic familiarity with Google Apps Script
- Understanding of JavaScript/HTML/CSS
- Access to create triggers and send emails

---

## Estimated Total Time

- **Phase 1**: 2 days
- **Phase 2**: 2 days
- **Phase 3**: 2-3 days
- **Phase 4**: 2 days
- **Phase 5**: 2-3 days
- **Phase 6**: 2 days
- **Phase 7**: 2 days
- **Phase 8**: 2-3 days

**Total: 16-20 days** (approximately 3-4 weeks for one developer)

---

## Next Steps

1. Review and approve this plan
2. Set up Google Sheets and Apps Script project (Phase 1)
3. Begin implementation following the phases sequentially
4. Test each phase before moving to the next
5. Gather feedback and iterate

---

## Optional Future Extensions (Post-MVP)

- Export calendar as .ics file
- Smart recommendations for optimal transfer dates
- Mobile-responsive dashboard improvements
- Multi-user support with permissions
- Automated condition detection (OCR on bank statements)
- Integration with calendar apps (Google Calendar)
- Charts and analytics on promotion success rates

---

*Document Version: 1.0*
*Date: 2025-11-06*
*Branch: claude/prd-implementation-plan-011CUrfTJFN1GdbLS7ZcrBZe*
