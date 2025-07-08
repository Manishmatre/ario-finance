const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const auth = require('../middleware/auth');

// Loan routes
router.post('/', auth, loanController.createLoan);
router.get('/', auth, loanController.getAllLoans);
router.get('/:id', auth, loanController.getLoanById);
router.put('/:id/status', auth, loanController.updateLoanStatus);
router.post('/payment', auth, loanController.recordPayment);
router.get('/report', auth, loanController.generateLoanReport);
router.get('/:id/schedule', auth, loanController.exportSchedule);
router.post('/:id/documents', auth, loanController.uploadDocument);
router.get('/:id/documents', auth, loanController.getDocuments);
router.delete('/:id/documents/:docId', auth, loanController.deleteDocument);
router.put('/:id/documents/:docId/status', auth, loanController.updateDocumentStatus);
router.post('/:id/guarantors', auth, loanController.addGuarantor);
router.get('/:id/guarantors', auth, loanController.getGuarantors);
router.delete('/:id/guarantors/:guarantorId', auth, loanController.deleteGuarantor);
router.post('/:id/collateral', auth, loanController.addCollateral);
router.get('/:id/collateral', auth, loanController.getCollateral);
router.delete('/:id/collateral/:collateralId', auth, loanController.deleteCollateral);
router.put('/:id/collateral/:collateralId/status', auth, loanController.updateCollateralStatus);
router.get('/:id/repayment', auth, loanController.getRepaymentHistory);
router.get('/:id/repayment/export', auth, loanController.exportRepaymentHistory);
router.get('/:id/analysis', auth, loanController.getLoanAnalysis);

module.exports = router;
