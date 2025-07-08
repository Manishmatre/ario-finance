const Loan = require('../models/loan');
const { calculateEMI, calculateRiskRating, calculateLoanSchedule, updateRiskRating } = require('../utils/loanCalculations');

// Create new loan application
exports.createLoan = async (req, res) => {
  try {
    const { amount, interestRate, tenure, loanType } = req.body;
    
    // Calculate monthly installment
    const monthlyInstallment = calculateEMI(amount, interestRate, tenure);
    
    // Generate loan number
    const loanNumber = `LN${Date.now()}`;
    
    // Calculate initial risk rating
    const riskRating = calculateRiskRating(amount, interestRate, tenure);
    
    const loan = new Loan({
      ...req.body,
      loanNumber,
      monthlyInstallment,
      remainingBalance: amount,
      riskRating,
      schedule: calculateLoanSchedule(amount, interestRate, tenure),
      nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // First payment due in 30 days
    });

    const savedLoan = await loan.save();
    res.status(201).json(savedLoan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all loans
exports.getAllLoans = async (req, res) => {
  try {
    const { status, loanType, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (loanType) query.loanType = loanType;
    if (search) {
      query.$or = [
        { 'applicant.name': { $regex: search, $options: 'i' } },
        { loanNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const loans = await Loan.find(query)
      .populate('applicant')
      .sort({ applicationDate: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get loan by ID
exports.getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('applicant');
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    res.json(loan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update loan status
exports.updateLoanStatus = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    loan.status = req.body.status;
    if (req.body.status === 'DISBURSED') {
      loan.disbursementDate = new Date();
    }
    if (req.body.status === 'APPROVED') {
      loan.approvalDate = new Date();
    }

    await loan.save();
    res.json(loan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Record loan payment
exports.recordPayment = async (req, res) => {
  try {
    const { loanId, amount } = req.body;
    const loan = await Loan.findById(loanId);
    
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    // Check if payment is late
    const now = new Date();
    const isLate = now > loan.nextPaymentDue;
    
    const payment = {
      date: now,
      amount,
      status: isLate ? 'DELAYED' : 'PAID',
      remarks: isLate ? `Payment was ${Math.ceil((now - loan.nextPaymentDue) / (24 * 60 * 60 * 1000))} days late` : ''
    };

    loan.payments.push(payment);
    loan.remainingBalance -= amount;

    // Update payment status in schedule
    loan.schedule = loan.schedule.map((paymentSchedule) => {
      if (paymentSchedule.remainingBalance >= loan.remainingBalance) {
        paymentSchedule.status = 'PAID';
      }
      return paymentSchedule;
    });

    // Update repayment history
    loan.repaymentHistory.push({
      date: now,
      amount,
      status: isLate ? 'DELAYED' : 'PAID'
    });

    if (isLate) {
      loan.latePayments = (loan.latePayments || 0) + 1;
      loan.daysLate = (loan.daysLate || 0) + Math.ceil((now - loan.nextPaymentDue) / (24 * 60 * 60 * 1000));
    }

    // Calculate next payment due date
    loan.nextPaymentDue = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Next payment due in 30 days

    // Update risk rating based on payment history
    loan.riskRating = updateRiskRating(loan);

    if (loan.remainingBalance <= 0) {
      loan.status = 'CLOSED';
    }

    await loan.save();
    res.json(loan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate loan report
exports.generateLoanReport = async (req, res) => {
  try {
    const { startDate, endDate, status, loanType, riskRating } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.applicationDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (status) query.status = status;
    if (loanType) query.loanType = loanType;
    if (riskRating) query.riskRating = riskRating;

    const loans = await Loan.find(query)
      .populate('applicant')
      .sort({ applicationDate: -1 });

    // Calculate summary statistics
    const summary = {
      totalLoans: loans.length,
      totalAmount: loans.reduce((sum, loan) => sum + loan.amount, 0),
      totalDisbursed: loans.filter(l => l.status === 'DISBURSED').length,
      totalRepaying: loans.filter(l => l.status === 'REPAYING').length,
      totalClosed: loans.filter(l => l.status === 'CLOSED').length,
      totalDefaulted: loans.filter(l => l.status === 'DEFAULTED').length,
      totalLatePayments: loans.reduce((sum, loan) => sum + (loan.latePayments || 0), 0),
      totalDaysLate: loans.reduce((sum, loan) => sum + (loan.daysLate || 0), 0),
      riskDistribution: {
        LOW: loans.filter(l => l.riskRating === 'LOW').length,
        MEDIUM: loans.filter(l => l.riskRating === 'MEDIUM').length,
        HIGH: loans.filter(l => l.riskRating === 'HIGH').length
      }
    };

    res.json({ loans, summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
