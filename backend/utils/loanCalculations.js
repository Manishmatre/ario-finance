const calculateEMI = (principal, rate, tenure) => {
  // Convert rate from percentage to decimal
  const monthlyRate = rate / 12 / 100;
  if (monthlyRate === 0) {
    return principal / tenure;
  }
  // EMI formula: [P x R x (1+R)^N]/[(1+R)^N-1]
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
    (Math.pow(1 + monthlyRate, tenure) - 1);
  return Math.round(emi);
};

const calculateInterest = (principal, rate, tenure) => {
  const monthlyRate = rate / 12 / 100;
  const totalInterest = principal * monthlyRate * tenure;
  return Math.round(totalInterest);
};

const calculateTotalRepayment = (principal, rate, tenure) => {
  return principal + calculateInterest(principal, rate, tenure);
};

const calculateLoanSchedule = (principal, annualInterestRate, tenureInMonths) => {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const emi = calculateEMI(principal, annualInterestRate, tenureInMonths);
  const schedule = [];
  let remainingBalance = principal;

  for (let month = 1; month <= tenureInMonths; month++) {
    const interest = remainingBalance * monthlyInterestRate;
    const principalPaid = emi - interest;
    remainingBalance -= principalPaid;
    
    schedule.push({
      month,
      emi,
      interest,
      principal: principalPaid,
      remainingBalance: Math.max(0, remainingBalance),
      status: 'PENDING'
    });
  }

  return schedule;
};

const calculateRiskRating = (amount, interestRate, tenure) => {
  // Calculate risk score based on loan parameters
  const score = (
    (amount / 100000) * 0.4 + // Higher loan amount increases risk
    (interestRate * 0.3) + // Higher interest rate increases risk
    (tenure * 0.3) // Longer tenure increases risk
  );

  // Map score to risk rating
  if (score < 2) return 'LOW';
  if (score < 4) return 'MEDIUM';
  return 'HIGH';
};

const updateRiskRating = (loan) => {
  // Base score based on loan parameters
  let score = (
    (loan.amount / 100000) * 0.4 +
    (loan.interestRate * 0.3) +
    (loan.tenure * 0.3)
  );

  // Adjust score based on payment history
  if (loan.latePayments) {
    score += loan.latePayments * 0.5; // Each late payment adds 0.5 to score
  }

  if (loan.daysLate) {
    score += loan.daysLate / 30; // Each 30 days late adds 1 to score
  }

  // Adjust score based on documents status
  const pendingDocs = loan.documents.filter(doc => doc.status === 'PENDING').length;
  score += pendingDocs * 0.2; // Each pending document adds 0.2 to score

  // Adjust score based on guarantors and collateral
  if (loan.guarantors && loan.guarantors.length > 0) {
    score -= 1; // Having guarantors reduces risk
  }

  if (loan.collateral && loan.collateral.length > 0) {
    score -= 1.5; // Having collateral reduces risk
  }

  // Map final score to risk rating
  if (score < 2) return 'LOW';
  if (score < 4) return 'MEDIUM';
  return 'HIGH';
};

module.exports = {
  calculateEMI,
  calculateInterest,
  calculateTotalRepayment,
  calculateLoanSchedule,
  calculateRiskRating,
  updateRiskRating
};
