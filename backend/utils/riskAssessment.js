const calculateRiskScore = (loan) => {
  let score = 0;
  const maxScore = 100;

  // Payment history (40% weight)
  const totalPayments = loan.repaymentHistory.length;
  const onTimePayments = loan.repaymentHistory.filter(p => p.status === 'PAID').length;
  const paymentScore = (onTimePayments / totalPayments) * 0.4 * maxScore;
  score += paymentScore;

  // Document status (20% weight)
  const totalDocs = loan.documents.length;
  const approvedDocs = loan.documents.filter(d => d.status === 'APPROVED').length;
  const docScore = (approvedDocs / totalDocs) * 0.2 * maxScore;
  score += docScore;

  // Collateral status (20% weight)
  const totalCollateral = loan.collateral.length;
  const approvedCollateral = loan.collateral.filter(c => c.status === 'APPROVED').length;
  const collateralScore = (approvedCollateral / totalCollateral) * 0.2 * maxScore;
  score += collateralScore;

  // Guarantor status (10% weight)
  const totalGuarantors = loan.guarantors.length;
  const approvedGuarantors = loan.guarantors.filter(g => g.documents.every(d => d.status === 'APPROVED')).length;
  const guarantorScore = (approvedGuarantors / totalGuarantors) * 0.1 * maxScore;
  score += guarantorScore;

  // Days late (10% weight)
  const daysLateScore = (1 - (loan.daysLate / 30)) * 0.1 * maxScore;
  score += daysLateScore;

  return Math.round(score);
};

const getRiskRating = (score) => {
  if (score >= 80) return 'LOW';
  if (score >= 60) return 'MEDIUM';
  return 'HIGH';
};

const updateRiskRating = async (loan) => {
  const score = calculateRiskScore(loan);
  const rating = getRiskRating(score);
  
  // Update risk factors
  const riskFactors = [
    {
      type: 'PAYMENT_HISTORY',
      value: score * 0.4,
      weight: 0.4,
      date: new Date()
    },
    {
      type: 'DOCUMENT_STATUS',
      value: score * 0.2,
      weight: 0.2,
      date: new Date()
    },
    {
      type: 'COLLATERAL_VALUE',
      value: score * 0.2,
      weight: 0.2,
      date: new Date()
    },
    {
      type: 'GUARANTOR_STATUS',
      value: score * 0.1,
      weight: 0.1,
      date: new Date()
    }
  ];

  // Add risk factors to loan
  loan.riskFactors = [...loan.riskFactors, ...riskFactors];
  loan.riskRating = rating;
  await loan.save();

  // Create risk assessment alert if rating changes
  if (loan.riskRating !== rating) {
    loan.alerts.push({
      type: 'DEFAULT_RISK',
      message: `Risk rating changed from ${loan.riskRating} to ${rating}`,
      date: new Date(),
      isActive: true
    });
    await loan.save();
  }

  return rating;
};

module.exports = {
  calculateRiskScore,
  getRiskRating,
  updateRiskRating
};
