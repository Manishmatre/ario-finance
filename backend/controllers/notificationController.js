const Loan = require('../models/loan');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const schedule = require('node-schedule');

// Initialize email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Schedule daily loan notifications
const scheduleNotifications = () => {
  schedule.scheduleJob('0 9 * * *', async () => { // Every day at 9 AM
    try {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Find loans with payments due tomorrow
      const loans = await Loan.find({
        status: { $in: ['REPAYING', 'DISBURSED'] },
        nextPaymentDue: { $gte: today, $lt: tomorrow }
      }).populate('applicant');

      for (const loan of loans) {
        // Send email notification
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: loan.applicant.email,
          subject: 'Loan Payment Reminder',
          html: `
            <h2>Loan Payment Reminder</h2>
            <p>Dear ${loan.applicant.name},</p>
            <p>This is a reminder that your loan payment of ₹${loan.monthlyInstallment.toLocaleString()} is due tomorrow.</p>
            <p>Loan Details:</p>
            <ul>
              <li>Loan Number: ${loan.loanNumber}</li>
              <li>Loan Type: ${loan.loanType}</li>
              <li>Remaining Balance: ₹${loan.remainingBalance.toLocaleString()}</li>
              <li>Monthly Installment: ₹${loan.monthlyInstallment.toLocaleString()}</li>
            </ul>
            <p>Please make the payment before the due date to avoid any late payment charges.</p>
            <p>Thank you.</p>
          `
        };

        await transporter.sendMail(mailOptions);

        // Create notification in database
        loan.notifications.push({
          type: 'PAYMENT_REMINDER',
          message: 'Payment reminder sent for tomorrow',
          date: new Date()
        });
        await loan.save();
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  });
};

// Check for overdue payments and send alerts
const checkOverduePayments = () => {
  schedule.scheduleJob('0 0 * * *', async () => { // Every day at midnight
    try {
      const today = new Date();
      const overdueLoans = await Loan.find({
        status: { $in: ['REPAYING', 'DISBURSED'] },
        nextPaymentDue: { $lt: today }
      }).populate('applicant');

      for (const loan of overdueLoans) {
        // Update loan status
        loan.status = 'DEFAULTED';
        loan.daysLate = Math.ceil((today - loan.nextPaymentDue) / (24 * 60 * 60 * 1000));
        
        // Send alert
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: loan.applicant.email,
          subject: 'URGENT: Overdue Loan Payment',
          html: `
            <h2>URGENT: Overdue Loan Payment</h2>
            <p>Dear ${loan.applicant.name},</p>
            <p>This is to inform you that your loan payment of ₹${loan.monthlyInstallment.toLocaleString()} is overdue.</p>
            <p>Loan Details:</p>
            <ul>
              <li>Loan Number: ${loan.loanNumber}</li>
              <li>Loan Type: ${loan.loanType}</li>
              <li>Remaining Balance: ₹${loan.remainingBalance.toLocaleString()}</li>
              <li>Monthly Installment: ₹${loan.monthlyInstallment.toLocaleString()}</li>
              <li>Days Overdue: ${loan.daysLate}</li>
            </ul>
            <p>Please make the payment immediately to avoid further consequences.</p>
            <p>Thank you.</p>
          `
        };

        await transporter.sendMail(mailOptions);

        // Create notification in database
        loan.notifications.push({
          type: 'OVERDUE_PAYMENT',
          message: 'Payment overdue alert sent',
          date: new Date()
        });
        await loan.save();
      }
    } catch (error) {
      console.error('Error checking overdue payments:', error);
    }
  });
};

// Loan approval notifications
exports.sendApprovalNotification = async (loanId) => {
  try {
    const loan = await Loan.findById(loanId).populate('applicant');
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: loan.applicant.email,
      subject: 'Loan Application Approved',
      html: `
        <h2>Loan Application Approved</h2>
        <p>Dear ${loan.applicant.name},</p>
        <p>Good news! Your loan application has been approved.</p>
        <p>Loan Details:</p>
        <ul>
          <li>Loan Number: ${loan.loanNumber}</li>
          <li>Loan Type: ${loan.loanType}</li>
          <li>Amount: ₹${loan.amount.toLocaleString()}</li>
          <li>Interest Rate: ${loan.interestRate}%</li>
          <li>Tenure: ${loan.tenure} months</li>
          <li>Monthly Installment: ₹${loan.monthlyInstallment.toLocaleString()}</li>
        </ul>
        <p>Please proceed with the documentation process.</p>
        <p>Thank you.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    // Create notification in database
    loan.notifications.push({
      type: 'APPROVAL',
      message: 'Loan application approved',
      date: new Date()
    });
    await loan.save();
  } catch (error) {
    console.error('Error sending approval notification:', error);
  }
};

// Loan disbursement notifications
exports.sendDisbursementNotification = async (loanId) => {
  try {
    const loan = await Loan.findById(loanId).populate('applicant');
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: loan.applicant.email,
      subject: 'Loan Disbursed Successfully',
      html: `
        <h2>Loan Disbursed Successfully</h2>
        <p>Dear ${loan.applicant.name},</p>
        <p>Your loan has been successfully disbursed.</p>
        <p>Loan Details:</p>
        <ul>
          <li>Loan Number: ${loan.loanNumber}</li>
          <li>Loan Type: ${loan.loanType}</li>
          <li>Amount: ₹${loan.amount.toLocaleString()}</li>
          <li>Interest Rate: ${loan.interestRate}%</li>
          <li>Tenure: ${loan.tenure} months</li>
          <li>Monthly Installment: ₹${loan.monthlyInstallment.toLocaleString()}</li>
          <li>First Payment Due: ${loan.nextPaymentDue.toLocaleDateString()}</li>
        </ul>
        <p>Please make sure to make your first payment on time.</p>
        <p>Thank you.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    // Create notification in database
    loan.notifications.push({
      type: 'DISBURSEMENT',
      message: 'Loan disbursed successfully',
      date: new Date()
    });
    await loan.save();
  } catch (error) {
    console.error('Error sending disbursement notification:', error);
  }
};

// Initialize scheduled tasks
exports.initializeNotifications = () => {
  scheduleNotifications();
  checkOverduePayments();
};
