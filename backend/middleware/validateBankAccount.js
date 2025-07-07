const validateBankAccount = (req, res, next) => {
  const { bankName, type, accountHolder, bankAccountNo, ifsc, branchName } = req.body;
  const isPatch = req.method === 'PATCH';

  // For POST/PUT, require all fields
  if (!isPatch) {
    if (!bankName || !type || !accountHolder || !bankAccountNo || !ifsc || !branchName) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['bankName', 'type', 'accountHolder', 'bankAccountNo', 'ifsc', 'branchName']
      });
    }
  }

  // Validate bank name
  if (bankName !== undefined) {
    const validBanks = ['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'Yes Bank', 'PNB', 'Canara', 'Bank of Baroda', 'Union Bank', 'Other'];
    if (!validBanks.includes(bankName)) {
      return res.status(400).json({
        error: 'Invalid bank name',
        validBanks
      });
    }
  }

  // Validate account type
  if (type !== undefined) {
    const validTypes = ['Current', 'Savings', 'Fixed Deposit', 'Recurring Deposit', 'NRE', 'NRO', 'Other'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: 'Invalid account type',
        validTypes
      });
    }
  }

  // Validate account holder name
  if (accountHolder !== undefined && accountHolder.trim().length < 2) {
    return res.status(400).json({
      error: 'Account holder name must be at least 2 characters long'
    });
  }

  // Validate account number
  if (bankAccountNo !== undefined && bankAccountNo.trim().length < 5) {
    return res.status(400).json({
      error: 'Account number must be at least 5 characters long'
    });
  }

  // Validate IFSC code format
  if (ifsc !== undefined) {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifsc.toUpperCase())) {
      return res.status(400).json({
        error: 'Invalid IFSC code format. Must be 11 characters: 4 letters + 0 + 6 alphanumeric'
      });
    }
    // Convert IFSC to uppercase
    req.body.ifsc = ifsc.toUpperCase();
  }

  // Validate branch name
  if (branchName !== undefined && branchName.trim().length < 2) {
    return res.status(400).json({
      error: 'Branch name must be at least 2 characters long'
    });
  }

  // Validate current balance
  if (req.body.currentBalance !== undefined) {
    const balance = parseFloat(req.body.currentBalance);
    if (isNaN(balance) || balance < 0) {
      return res.status(400).json({
        error: 'Current balance must be a non-negative number'
      });
    }
  }

  // Validate interest rate for interest-bearing accounts
  if (req.body.interestRate !== undefined) {
    const interestRate = parseFloat(req.body.interestRate);
    const interestBearingTypes = ['Savings', 'Fixed Deposit', 'Recurring Deposit', 'NRE', 'NRO'];
    if (type !== undefined && interestBearingTypes.includes(type)) {
      if (isNaN(interestRate) || interestRate < 0 || interestRate > 100) {
        return res.status(400).json({
          error: 'Interest rate must be between 0 and 100 for interest-bearing accounts'
        });
      }
    }
  }

  // Validate status if provided
  if (req.body.status !== undefined) {
    const validStatuses = ['active', 'inactive', 'dormant', 'frozen'];
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({
        error: 'Invalid status',
        validStatuses
      });
    }
  }

  // Validate features object if provided
  if (req.body.features !== undefined) {
    const validFeatures = ['internetBanking', 'mobileBanking', 'debitCard', 'chequeBook'];
    const providedFeatures = Object.keys(req.body.features);
    for (const feature of providedFeatures) {
      if (!validFeatures.includes(feature)) {
        return res.status(400).json({
          error: `Invalid feature: ${feature}`,
          validFeatures
        });
      }
      if (typeof req.body.features[feature] !== 'boolean') {
        return res.status(400).json({
          error: `Feature ${feature} must be a boolean value`
        });
      }
    }
  }

  // Validate notes length
  if (req.body.notes !== undefined && req.body.notes.length > 500) {
    return res.status(400).json({
      error: 'Notes must be less than 500 characters'
    });
  }

  next();
};

module.exports = validateBankAccount; 