/**
 * Bank Model - CRUD operations for Banks
 *
 * Manages bank data including creation, retrieval, updates, and soft deletes
 */

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create a new bank
 * @param {Object} data - Bank data
 * @param {string} data.name - Bank name (required)
 * @param {boolean} data.is_bodega - Whether this is a bodega account (default: false)
 * @param {boolean} data.supports_bizum - Whether bank supports Bizum (default: false)
 * @param {boolean} data.active - Whether bank is active (default: true)
 * @returns {Object} Created bank object with bank_id
 */
function createBank(data) {
  try {
    // Validate required fields
    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      throw new Error('Bank name is required');
    }

    // Generate unique ID
    const bankId = generateID('BANK');

    // Prepare bank object with defaults
    const bank = {
      bank_id: bankId,
      name: data.name.trim(),
      is_bodega: data.is_bodega === true,
      supports_bizum: data.supports_bizum === true,
      active: data.active !== false // Default to true
    };

    // Append to sheet
    appendRowFromObject(SHEET_NAMES.BANKS, bank);

    logInfo('Bank created: ' + bankId + ' - ' + bank.name);
    return bank;

  } catch (error) {
    logError('createBank', error);
    throw error;
  }
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get bank by ID
 * @param {string} bankId - Bank ID
 * @returns {Object|null} Bank object or null if not found
 */
function getBankById(bankId) {
  try {
    if (!bankId) {
      throw new Error('Bank ID is required');
    }

    return findById(SHEET_NAMES.BANKS, bankId);

  } catch (error) {
    logError('getBankById(' + bankId + ')', error);
    throw error;
  }
}

/**
 * Get all banks
 * @param {boolean} includeInactive - Whether to include inactive banks (default: false)
 * @returns {Array<Object>} Array of bank objects
 */
function getAllBanks(includeInactive) {
  try {
    const allBanks = getAllDataAsObjects(SHEET_NAMES.BANKS);

    if (includeInactive === true) {
      return allBanks;
    }

    // Filter to active banks only
    return allBanks.filter(bank => bank.active === true);

  } catch (error) {
    logError('getAllBanks', error);
    throw error;
  }
}

/**
 * Get banks by bodega status
 * @param {boolean} isBodega - Whether to get bodega accounts
 * @param {boolean} includeInactive - Whether to include inactive banks
 * @returns {Array<Object>} Array of bank objects
 */
function getBanksByBodega(isBodega, includeInactive) {
  try {
    const banks = getAllBanks(includeInactive);
    return banks.filter(bank => bank.is_bodega === isBodega);

  } catch (error) {
    logError('getBanksByBodega', error);
    throw error;
  }
}

/**
 * Get banks that support Bizum
 * @param {boolean} includeInactive - Whether to include inactive banks
 * @returns {Array<Object>} Array of bank objects
 */
function getBanksSupportingBizum(includeInactive) {
  try {
    const banks = getAllBanks(includeInactive);
    return banks.filter(bank => bank.supports_bizum === true);

  } catch (error) {
    logError('getBanksSupportingBizum', error);
    throw error;
  }
}

/**
 * Check if bank exists
 * @param {string} bankId - Bank ID
 * @returns {boolean} True if bank exists
 */
function bankExists(bankId) {
  try {
    return idExists(SHEET_NAMES.BANKS, bankId);
  } catch (error) {
    logError('bankExists', error);
    return false;
  }
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update bank
 * @param {string} bankId - Bank ID
 * @param {Object} updates - Fields to update
 * @param {string} [updates.name] - New bank name
 * @param {boolean} [updates.is_bodega] - New bodega status
 * @param {boolean} [updates.supports_bizum] - New Bizum support status
 * @param {boolean} [updates.active] - New active status
 * @returns {Object} Updated bank object
 */
function updateBank(bankId, updates) {
  try {
    if (!bankId) {
      throw new Error('Bank ID is required');
    }

    // Check if bank exists
    const currentBank = getBankById(bankId);
    if (!currentBank) {
      throw new Error('Bank not found: ' + bankId);
    }

    // Validate updates
    const validFields = ['name', 'is_bodega', 'supports_bizum', 'active'];
    const filteredUpdates = {};

    Object.keys(updates).forEach(key => {
      if (validFields.includes(key)) {
        if (key === 'name') {
          if (typeof updates[key] !== 'string' || updates[key].trim() === '') {
            throw new Error('Bank name cannot be empty');
          }
          filteredUpdates[key] = updates[key].trim();
        } else {
          // Boolean fields
          filteredUpdates[key] = updates[key] === true;
        }
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      throw new Error('No valid fields to update');
    }

    // Update in sheet
    const success = updateById(SHEET_NAMES.BANKS, bankId, filteredUpdates);

    if (!success) {
      throw new Error('Failed to update bank: ' + bankId);
    }

    // Return updated bank
    const updatedBank = getBankById(bankId);
    logInfo('Bank updated: ' + bankId + ' - ' + updatedBank.name);
    return updatedBank;

  } catch (error) {
    logError('updateBank(' + bankId + ')', error);
    throw error;
  }
}

/**
 * Activate a bank
 * @param {string} bankId - Bank ID
 * @returns {Object} Updated bank object
 */
function activateBank(bankId) {
  return updateBank(bankId, { active: true });
}

/**
 * Deactivate a bank (soft delete)
 * @param {string} bankId - Bank ID
 * @returns {Object} Updated bank object
 */
function deactivateBank(bankId) {
  return updateBank(bankId, { active: false });
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete bank (soft delete - sets active to false)
 * @param {string} bankId - Bank ID
 * @returns {Object} Result object
 */
function deleteBank(bankId) {
  try {
    if (!bankId) {
      throw new Error('Bank ID is required');
    }

    // Check if bank exists
    const bank = getBankById(bankId);
    if (!bank) {
      throw new Error('Bank not found: ' + bankId);
    }

    // Soft delete: set active to false
    const updatedBank = deactivateBank(bankId);

    logInfo('Bank deleted (soft): ' + bankId + ' - ' + updatedBank.name);

    return {
      success: true,
      message: 'Bank deactivated successfully',
      bank: updatedBank
    };

  } catch (error) {
    logError('deleteBank(' + bankId + ')', error);
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Permanently delete bank (hard delete - removes from sheet)
 * WARNING: This cannot be undone!
 * @param {string} bankId - Bank ID
 * @returns {Object} Result object
 */
function permanentlyDeleteBank(bankId) {
  try {
    if (!bankId) {
      throw new Error('Bank ID is required');
    }

    // Check if bank exists
    const bank = getBankById(bankId);
    if (!bank) {
      throw new Error('Bank not found: ' + bankId);
    }

    // Hard delete from sheet
    const success = deleteById(SHEET_NAMES.BANKS, bankId);

    if (!success) {
      throw new Error('Failed to delete bank: ' + bankId);
    }

    logInfo('Bank permanently deleted: ' + bankId + ' - ' + bank.name);

    return {
      success: true,
      message: 'Bank permanently deleted'
    };

  } catch (error) {
    logError('permanentlyDeleteBank(' + bankId + ')', error);
    return {
      success: false,
      message: error.message
    };
  }
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate bank data
 * @param {Object} data - Bank data to validate
 * @returns {Object} Validation result {valid: boolean, errors: Array}
 */
function validateBankData(data) {
  const errors = [];

  // Check name
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    errors.push('Bank name is required');
  }

  // Check is_bodega type
  if (data.is_bodega !== undefined && typeof data.is_bodega !== 'boolean') {
    errors.push('is_bodega must be a boolean');
  }

  // Check supports_bizum type
  if (data.supports_bizum !== undefined && typeof data.supports_bizum !== 'boolean') {
    errors.push('supports_bizum must be a boolean');
  }

  // Check active type
  if (data.active !== undefined && typeof data.active !== 'boolean') {
    errors.push('active must be a boolean');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

// ============================================================================
// TESTING FUNCTIONS
// ============================================================================

/**
 * Test bank model functions
 */
function testBankModel() {
  Logger.log('Testing BankModel...\n');

  try {
    // Test getAllBanks
    Logger.log('1. Testing getAllBanks...');
    const allBanks = getAllBanks(false);
    Logger.log('✓ Active banks: ' + allBanks.length);

    const allBanksIncludingInactive = getAllBanks(true);
    Logger.log('✓ All banks (including inactive): ' + allBanksIncludingInactive.length);

    // Test getBankById
    if (allBanks.length > 0) {
      Logger.log('\n2. Testing getBankById...');
      const firstBank = allBanks[0];
      const retrievedBank = getBankById(firstBank.bank_id);
      Logger.log('✓ Bank retrieved: ' + retrievedBank.name);
    }

    // Test validation
    Logger.log('\n3. Testing validation...');
    const validData = validateBankData({ name: 'Test Bank', is_bodega: true });
    Logger.log('✓ Valid data: ' + validData.valid);

    const invalidData = validateBankData({ name: '', is_bodega: 'not a boolean' });
    Logger.log('✓ Invalid data detected: ' + invalidData.errors.length + ' errors');

    Logger.log('\n✓ BankModel tests passed!');

  } catch (error) {
    Logger.log('✗ BankModel test failed: ' + error.message);
  }
}
