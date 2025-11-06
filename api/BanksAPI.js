/**
 * Banks API - Expose bank operations to frontend
 *
 * These functions are called from the web interface
 * and return JSON-serializable objects
 */

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * API: Get all banks
 * @param {boolean} includeInactive - Whether to include inactive banks
 * @returns {Object} Response object with banks array
 */
function apiGetAllBanks(includeInactive) {
  try {
    const banks = getAllBanks(includeInactive);

    return {
      success: true,
      data: banks,
      count: banks.length
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * API: Get bank by ID
 * @param {string} bankId - Bank ID
 * @returns {Object} Response object with bank data
 */
function apiGetBankById(bankId) {
  try {
    const bank = getBankById(bankId);

    if (!bank) {
      return {
        success: false,
        error: 'Bank not found'
      };
    }

    return {
      success: true,
      data: bank
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * API: Create new bank
 * @param {Object} data - Bank data
 * @returns {Object} Response object with created bank
 */
function apiCreateBank(data) {
  try {
    // Validate data
    const validation = validateBankData(data);
    if (!validation.valid) {
      return {
        success: false,
        error: 'Validation failed',
        errors: validation.errors
      };
    }

    // Create bank
    const bank = createBank(data);

    return {
      success: true,
      data: bank,
      message: 'Banco creado correctamente'
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * API: Update bank
 * @param {string} bankId - Bank ID
 * @param {Object} updates - Fields to update
 * @returns {Object} Response object with updated bank
 */
function apiUpdateBank(bankId, updates) {
  try {
    // Validate updates
    const validation = validateBankData(updates);
    if (!validation.valid) {
      return {
        success: false,
        error: 'Validation failed',
        errors: validation.errors
      };
    }

    // Update bank
    const bank = updateBank(bankId, updates);

    return {
      success: true,
      data: bank,
      message: 'Banco actualizado correctamente'
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * API: Delete bank (soft delete)
 * @param {string} bankId - Bank ID
 * @returns {Object} Response object
 */
function apiDeleteBank(bankId) {
  try {
    const result = deleteBank(bankId);

    if (result.success) {
      return {
        success: true,
        message: 'Banco desactivado correctamente'
      };
    } else {
      return {
        success: false,
        error: result.message
      };
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * API: Activate bank
 * @param {string} bankId - Bank ID
 * @returns {Object} Response object
 */
function apiActivateBank(bankId) {
  try {
    const bank = activateBank(bankId);

    return {
      success: true,
      data: bank,
      message: 'Banco activado correctamente'
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * API: Permanently delete bank
 * WARNING: This cannot be undone!
 * @param {string} bankId - Bank ID
 * @returns {Object} Response object
 */
function apiPermanentlyDeleteBank(bankId) {
  try {
    const result = permanentlyDeleteBank(bankId);

    if (result.success) {
      return {
        success: true,
        message: 'Banco eliminado permanentemente'
      };
    } else {
      return {
        success: false,
        error: result.message
      };
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * API: Get banks by bodega status
 * @param {boolean} isBodega - Whether to get bodega accounts
 * @param {boolean} includeInactive - Whether to include inactive banks
 * @returns {Object} Response object with banks array
 */
function apiGetBanksByBodega(isBodega, includeInactive) {
  try {
    const banks = getBanksByBodega(isBodega, includeInactive);

    return {
      success: true,
      data: banks,
      count: banks.length
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * API: Get banks that support Bizum
 * @param {boolean} includeInactive - Whether to include inactive banks
 * @returns {Object} Response object with banks array
 */
function apiGetBanksSupportingBizum(includeInactive) {
  try {
    const banks = getBanksSupportingBizum(includeInactive);

    return {
      success: true,
      data: banks,
      count: banks.length
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * API: Batch create banks
 * @param {Array<Object>} banksData - Array of bank data objects
 * @returns {Object} Response object with results
 */
function apiBatchCreateBanks(banksData) {
  try {
    const results = {
      success: true,
      created: [],
      failed: [],
      successCount: 0,
      failCount: 0
    };

    banksData.forEach((bankData, index) => {
      try {
        const bank = createBank(bankData);
        results.created.push(bank);
        results.successCount++;
      } catch (error) {
        results.failed.push({
          index: index,
          data: bankData,
          error: error.message
        });
        results.failCount++;
      }
    });

    return results;

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * API: Batch update banks
 * @param {Array<Object>} updates - Array of {bankId, updates} objects
 * @returns {Object} Response object with results
 */
function apiBatchUpdateBanks(updates) {
  try {
    const results = {
      success: true,
      updated: [],
      failed: [],
      successCount: 0,
      failCount: 0
    };

    updates.forEach((update) => {
      try {
        const bank = updateBank(update.bankId, update.updates);
        results.updated.push(bank);
        results.successCount++;
      } catch (error) {
        results.failed.push({
          bankId: update.bankId,
          error: error.message
        });
        results.failCount++;
      }
    });

    return results;

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// TESTING FUNCTIONS
// ============================================================================

/**
 * Test Banks API
 */
function testBanksAPI() {
  Logger.log('Testing BanksAPI...\n');

  try {
    // Test getting all banks
    Logger.log('1. Testing apiGetAllBanks...');
    const response1 = apiGetAllBanks(false);
    Logger.log('✓ Response: ' + JSON.stringify(response1));

    // Test creating a bank
    Logger.log('\n2. Testing apiCreateBank...');
    const testData = {
      name: 'Test Bank API',
      is_bodega: true,
      supports_bizum: true,
      active: true
    };
    const response2 = apiCreateBank(testData);
    Logger.log('✓ Response: ' + JSON.stringify(response2));

    if (response2.success) {
      const testBankId = response2.data.bank_id;

      // Test getting by ID
      Logger.log('\n3. Testing apiGetBankById...');
      const response3 = apiGetBankById(testBankId);
      Logger.log('✓ Response: ' + JSON.stringify(response3));

      // Test updating
      Logger.log('\n4. Testing apiUpdateBank...');
      const response4 = apiUpdateBank(testBankId, { name: 'Updated Test Bank' });
      Logger.log('✓ Response: ' + JSON.stringify(response4));

      // Test deleting
      Logger.log('\n5. Testing apiDeleteBank...');
      const response5 = apiDeleteBank(testBankId);
      Logger.log('✓ Response: ' + JSON.stringify(response5));
    }

    Logger.log('\n✓ BanksAPI tests passed!');

  } catch (error) {
    Logger.log('✗ BanksAPI test failed: ' + error.message);
  }
}
