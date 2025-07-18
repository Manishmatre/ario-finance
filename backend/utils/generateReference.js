const { v4: uuidv4 } = require('uuid');

/**
 * Generate a unique reference string for a transaction.
 * @returns {string}
 */
function generateReference() {
  return 'TXN-' + uuidv4();
}

module.exports = { generateReference };
