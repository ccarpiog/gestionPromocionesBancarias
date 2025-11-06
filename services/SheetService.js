/**
 * Sheet Service - Generic CRUD operations for Google Sheets
 *
 * Provides reusable functions for reading and writing data to sheets
 * All data access should go through this service for consistency
 */

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get all data from a sheet (excluding header row)
 * @param {string} sheetName - Name of the sheet
 * @returns {Array<Array>} 2D array of values
 */
function getAllData(sheetName) {
  try {
    const sheet = getSheet(sheetName);
    const lastRow = sheet.getLastRow();

    if (lastRow <= 1) {
      return []; // No data rows (only header)
    }

    const lastColumn = sheet.getLastColumn();
    const range = sheet.getRange(2, 1, lastRow - 1, lastColumn);
    return range.getValues();

  } catch (error) {
    logError('getAllData(' + sheetName + ')', error);
    throw error;
  }
}

/**
 * Get all data as array of objects (with column names as keys)
 * @param {string} sheetName - Name of the sheet
 * @returns {Array<Object>} Array of row objects
 */
function getAllDataAsObjects(sheetName) {
  try {
    const sheet = getSheet(sheetName);
    const lastRow = sheet.getLastRow();

    if (lastRow <= 1) {
      return []; // No data rows
    }

    const lastColumn = sheet.getLastColumn();

    // Get headers
    const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];

    // Get data rows
    const data = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();

    // Convert to objects
    return data.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

  } catch (error) {
    logError('getAllDataAsObjects(' + sheetName + ')', error);
    throw error;
  }
}

/**
 * Find a row by ID (assumes first column is the ID column)
 * @param {string} sheetName - Name of the sheet
 * @param {string} id - ID to search for
 * @returns {Object|null} Row data as object, or null if not found
 */
function findById(sheetName, id) {
  try {
    const data = getAllDataAsObjects(sheetName);
    const headers = getHeaders(sheetName);
    const idColumn = headers[0]; // First column is ID column

    return data.find(row => row[idColumn] === id) || null;

  } catch (error) {
    logError('findById(' + sheetName + ', ' + id + ')', error);
    throw error;
  }
}

/**
 * Find row number by ID (1-indexed, includes header)
 * @param {string} sheetName - Name of the sheet
 * @param {string} id - ID to search for
 * @returns {number} Row number (0 if not found)
 */
function findRowNumberById(sheetName, id) {
  try {
    const sheet = getSheet(sheetName);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) { // Start at 1 to skip header
      if (data[i][0] === id) { // First column is ID
        return i + 1; // Return 1-indexed row number
      }
    }

    return 0; // Not found

  } catch (error) {
    logError('findRowNumberById(' + sheetName + ', ' + id + ')', error);
    throw error;
  }
}

/**
 * Find rows by column value
 * @param {string} sheetName - Name of the sheet
 * @param {string} columnName - Column to search in
 * @param {any} value - Value to search for
 * @returns {Array<Object>} Array of matching rows
 */
function findByColumn(sheetName, columnName, value) {
  try {
    const data = getAllDataAsObjects(sheetName);
    return data.filter(row => row[columnName] === value);

  } catch (error) {
    logError('findByColumn(' + sheetName + ', ' + columnName + ', ' + value + ')', error);
    throw error;
  }
}

/**
 * Get headers from a sheet
 * @param {string} sheetName - Name of the sheet
 * @returns {Array<string>} Array of header names
 */
function getHeaders(sheetName) {
  try {
    const sheet = getSheet(sheetName);
    const lastColumn = sheet.getLastColumn();
    return sheet.getRange(1, 1, 1, lastColumn).getValues()[0];

  } catch (error) {
    logError('getHeaders(' + sheetName + ')', error);
    throw error;
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Append a new row to a sheet
 * @param {string} sheetName - Name of the sheet
 * @param {Array} rowData - Array of values to append
 * @returns {number} Row number of appended row
 */
function appendRow(sheetName, rowData) {
  try {
    const sheet = getSheet(sheetName);
    sheet.appendRow(rowData);
    return sheet.getLastRow();

  } catch (error) {
    logError('appendRow(' + sheetName + ')', error);
    throw error;
  }
}

/**
 * Append a row from an object (keys must match headers)
 * @param {string} sheetName - Name of the sheet
 * @param {Object} rowObject - Object with values
 * @returns {number} Row number of appended row
 */
function appendRowFromObject(sheetName, rowObject) {
  try {
    const headers = getHeaders(sheetName);
    const rowData = headers.map(header => {
      const value = rowObject[header];

      // Handle special types
      if (value instanceof Date) {
        return formatDate(value);
      } else if (typeof value === 'boolean') {
        return value;
      } else if (value === null || value === undefined) {
        return '';
      }

      return value;
    });

    return appendRow(sheetName, rowData);

  } catch (error) {
    logError('appendRowFromObject(' + sheetName + ')', error);
    throw error;
  }
}

/**
 * Update a row by row number
 * @param {string} sheetName - Name of the sheet
 * @param {number} rowNumber - Row number (1-indexed)
 * @param {Array} rowData - New values for the row
 */
function updateRow(sheetName, rowNumber, rowData) {
  try {
    const sheet = getSheet(sheetName);
    const lastColumn = sheet.getLastColumn();
    const range = sheet.getRange(rowNumber, 1, 1, lastColumn);
    range.setValues([rowData]);

  } catch (error) {
    logError('updateRow(' + sheetName + ', ' + rowNumber + ')', error);
    throw error;
  }
}

/**
 * Update a row by ID
 * @param {string} sheetName - Name of the sheet
 * @param {string} id - ID of the row to update
 * @param {Object} updates - Object with columns to update
 * @returns {boolean} True if updated, false if not found
 */
function updateById(sheetName, id, updates) {
  try {
    const rowNumber = findRowNumberById(sheetName, id);

    if (rowNumber === 0) {
      return false; // Not found
    }

    const headers = getHeaders(sheetName);
    const currentRow = findById(sheetName, id);

    // Merge updates with current data
    const updatedRow = headers.map(header => {
      if (updates.hasOwnProperty(header)) {
        const value = updates[header];

        // Handle special types
        if (value instanceof Date) {
          return formatDate(value);
        } else if (typeof value === 'boolean') {
          return value;
        } else if (value === null || value === undefined) {
          return '';
        }

        return value;
      } else {
        return currentRow[header];
      }
    });

    updateRow(sheetName, rowNumber, updatedRow);
    return true;

  } catch (error) {
    logError('updateById(' + sheetName + ', ' + id + ')', error);
    throw error;
  }
}

/**
 * Update a specific cell
 * @param {string} sheetName - Name of the sheet
 * @param {number} rowNumber - Row number (1-indexed)
 * @param {number} columnNumber - Column number (1-indexed)
 * @param {any} value - New value
 */
function updateCell(sheetName, rowNumber, columnNumber, value) {
  try {
    const sheet = getSheet(sheetName);
    sheet.getRange(rowNumber, columnNumber).setValue(value);

  } catch (error) {
    logError('updateCell(' + sheetName + ')', error);
    throw error;
  }
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete a row by row number
 * @param {string} sheetName - Name of the sheet
 * @param {number} rowNumber - Row number to delete (1-indexed)
 */
function deleteRow(sheetName, rowNumber) {
  try {
    const sheet = getSheet(sheetName);
    sheet.deleteRow(rowNumber);

  } catch (error) {
    logError('deleteRow(' + sheetName + ', ' + rowNumber + ')', error);
    throw error;
  }
}

/**
 * Delete a row by ID
 * @param {string} sheetName - Name of the sheet
 * @param {string} id - ID of row to delete
 * @returns {boolean} True if deleted, false if not found
 */
function deleteById(sheetName, id) {
  try {
    const rowNumber = findRowNumberById(sheetName, id);

    if (rowNumber === 0) {
      return false; // Not found
    }

    deleteRow(sheetName, rowNumber);
    return true;

  } catch (error) {
    logError('deleteById(' + sheetName + ', ' + id + ')', error);
    throw error;
  }
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Batch update multiple rows
 * @param {string} sheetName - Name of the sheet
 * @param {Array<Object>} updates - Array of {id, updates} objects
 * @returns {Object} Result with success count
 */
function batchUpdate(sheetName, updates) {
  let successCount = 0;
  let failCount = 0;

  try {
    updates.forEach(update => {
      const success = updateById(sheetName, update.id, update.updates);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    });

    return {
      success: true,
      successCount: successCount,
      failCount: failCount
    };

  } catch (error) {
    logError('batchUpdate(' + sheetName + ')', error);
    return {
      success: false,
      error: error.message,
      successCount: successCount,
      failCount: failCount
    };
  }
}

/**
 * Batch append multiple rows
 * @param {string} sheetName - Name of the sheet
 * @param {Array<Object>} rows - Array of row objects
 * @returns {number} Number of rows appended
 */
function batchAppend(sheetName, rows) {
  try {
    // Handle empty array case
    if (!rows || rows.length === 0) {
      return 0;
    }

    const headers = getHeaders(sheetName);

    const rowsData = rows.map(rowObject => {
      return headers.map(header => {
        const value = rowObject[header];

        if (value instanceof Date) {
          return formatDate(value);
        } else if (typeof value === 'boolean') {
          return value;
        } else if (value === null || value === undefined) {
          return '';
        }

        return value;
      });
    });

    const sheet = getSheet(sheetName);
    const startRow = sheet.getLastRow() + 1;
    const numRows = rowsData.length;
    const numCols = rowsData[0].length;

    sheet.getRange(startRow, 1, numRows, numCols).setValues(rowsData);

    return numRows;

  } catch (error) {
    logError('batchAppend(' + sheetName + ')', error);
    throw error;
  }
}

// ============================================================================
// UTILITY OPERATIONS
// ============================================================================

/**
 * Get row count (excluding header)
 * @param {string} sheetName - Name of the sheet
 * @returns {number} Number of data rows
 */
function getRowCount(sheetName) {
  try {
    const sheet = getSheet(sheetName);
    const lastRow = sheet.getLastRow();
    return Math.max(0, lastRow - 1); // Subtract header row

  } catch (error) {
    logError('getRowCount(' + sheetName + ')', error);
    throw error;
  }
}

/**
 * Clear all data (keep headers)
 * @param {string} sheetName - Name of the sheet
 */
function clearAllData(sheetName) {
  try {
    const sheet = getSheet(sheetName);
    const lastRow = sheet.getLastRow();

    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }

  } catch (error) {
    logError('clearAllData(' + sheetName + ')', error);
    throw error;
  }
}

/**
 * Check if ID exists
 * @param {string} sheetName - Name of the sheet
 * @param {string} id - ID to check
 * @returns {boolean} True if exists
 */
function idExists(sheetName, id) {
  return findRowNumberById(sheetName, id) !== 0;
}

// ============================================================================
// TESTING FUNCTIONS
// ============================================================================

/**
 * Test sheet service functions
 */
function testSheetService() {
  Logger.log('Testing SheetService...\n');

  const testSheetName = SHEET_NAMES.BANKS;

  try {
    // Test read operations
    Logger.log('Testing read operations...');
    const allData = getAllData(testSheetName);
    Logger.log('✓ getAllData: ' + allData.length + ' rows');

    const allObjects = getAllDataAsObjects(testSheetName);
    Logger.log('✓ getAllDataAsObjects: ' + allObjects.length + ' objects');

    if (allObjects.length > 0) {
      const firstId = allObjects[0][getHeaders(testSheetName)[0]];
      const found = findById(testSheetName, firstId);
      Logger.log('✓ findById: ' + (found ? 'Found' : 'Not found'));
    }

    // Test row count
    const count = getRowCount(testSheetName);
    Logger.log('✓ getRowCount: ' + count + ' rows');

    Logger.log('\n✓ SheetService tests passed!');

  } catch (error) {
    Logger.log('✗ SheetService test failed: ' + error.message);
  }
}
