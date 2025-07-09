import React, { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { FiHome, FiBook, FiCreditCard, FiUsers, FiFileText, FiTrendingUp, FiChevronDown, FiSettings, FiUser, FiLayers, FiList, FiDollarSign, FiBriefcase, FiLogOut, FiPlusCircle, FiCheckCircle, FiShoppingCart, FiDatabase, FiPieChart, FiDollarSign as FiDollarSignAlt, FiClipboard, FiTag } from "react-icons/fi";
// import navLinks from '../../routes/financeNavLinks';

const payablesMenu = [
  { to: "/finance/bills", label: "Purchase Bills", icon: <FiFileText /> },
  { to: "/finance/bills/add", label: "Add Purchase Bill", icon: <FiPlusCircle /> },
  { to: "/finance/grns", label: "GRNs", icon: <FiList /> },
  { to: "/finance/grns/new", label: "Create GRN", icon: <FiPlusCircle /> },
  { to: "/finance/vendors", label: "Vendors", icon: <FiUsers /> },
  { to: "/finance/vendors/add", label: "Add Vendor", icon: <FiPlusCircle /> },
  { to: "/finance/vendor-ledger", label: "Vendor Ledger", icon: <FiLayers /> },
  { to: "/finance/advance-vendor", label: "Advance To Vendor", icon: <FiTrendingUp /> },
  { to: "/finance/advance-vendor/add", label: "Add Advance To Vendor", icon: <FiPlusCircle /> },
  { to: "/finance/vendor-payments", label: "Vendor Payments", icon: <FiCreditCard /> },
];

const loansMenu = [
  { to: "/finance/loans", label: "All Loans", icon: <FiDatabase /> },
  { to: "/finance/loans/apply", label: "Add Loan", icon: <FiPlusCircle /> },
  { to: "/finance/lenders", label: "Lenders", icon: <FiUsers /> },
  { to: "/finance/lenders/add", label: "Add Lender", icon: <FiPlusCircle /> },
  { to: "/finance/loans/:id/documents", label: "Loan Documents", icon: <FiFileText /> },
  { to: "/finance/loans/:id/analysis", label: "Loan Analysis", icon: <FiPieChart /> },
];

const transactionsMenu = [
  { to: "/finance/add-transaction", label: "Add Transaction", icon: <FiPlusCircle /> },
  { to: "/finance/transaction-approval", label: "Transaction Approval", icon: <FiCheckCircle /> },
  { to: "/finance/journal", label: "Journal Entries", icon: <FiFileText /> },
  { to: "/finance/ledger", label: "Ledger View", icon: <FiLayers /> },
];

const accountsMenu = [
  { to: '/finance/bank-accounts', icon: <FiDatabase />, label: 'Bank Accounts' },
  { to: '/finance/bank-accounts/new', icon: <FiPlusCircle />, label: 'Add Bank Account' },
];

const accountsSubMenu = [
  { to: "/finance/accounts", label: "Chart of Accounts", icon: <FiBook /> },
  { to: "/finance/add-bank-account", label: "Add Bank Account", icon: <FiPlusCircle /> },
  { to: "/finance/bankbook", label: "Bankbook", icon: <FiCreditCard /> },
  { to: "/finance/cashbook", label: "Cashbook", icon: <FiDollarSign /> },
  { to: "/finance/petty-cash", label: "Petty Cash Register", icon: <FiBriefcase /> },
];



const expensesMenu = [
  { to: "/finance/expenses/new", label: "Add Expense", icon: <FiPlusCircle /> },
  { to: "/finance/expenses", label: "All Expenses", icon: <FiDollarSignAlt /> },
  { to: "/finance/expenses/categories", label: "Expense Categories", icon: <FiTag /> },
  { to: "/finance/expenses/reports", label: "Expense Reports", icon: <FiClipboard /> },
];

const navLinks = [
  { to: "/finance", label: "Dashboard", icon: <FiHome /> },
  { to: "/finance/cash-advance", label: "Cash Advance To Employee", icon: <FiDollarSign /> },
  { to: "/finance/cash-reimburse", label: "Cash Reimbursement", icon: <FiDollarSign /> },
];

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { token } = useAuth();
  const location = useLocation();
  // Determine if any sub-link is active for each dropdown
  const isPayablesActive = payablesMenu.some(link => location.pathname.startsWith(link.to));
  const isExpensesActive = expensesMenu.some(link => location.pathname.startsWith(link.to));
  const isTransactionsActive = transactionsMenu.some(link => location.pathname.startsWith(link.to));
  const isAccountsActive = accountsMenu.some(link => location.pathname.startsWith(link.to));
  const isLoansActive = loansMenu.some(link => location.pathname.startsWith(link.to)) || location.pathname.startsWith('/finance/lenders');
  const isVendorActive = isPayablesActive;
  const isPurchaseActive = isPayablesActive;

  // Dropdown open state: always open if active, else controlled by click
  const [payablesOpen, setPayablesOpen] = useState(isPayablesActive);
  const [loansOpen, setLoansOpen] = useState(isLoansActive);
  const [expensesOpen, setExpensesOpen] = useState(false);
  const [transactionsOpen, setTransactionsOpen] = useState(isTransactionsActive);
  const [accountsOpen, setAccountsOpen] = useState(isAccountsActive);

  useEffect(() => { setPayablesOpen(isPayablesActive); }, [isPayablesActive]);
  useEffect(() => { setExpensesOpen(isExpensesActive); }, [isExpensesActive]);
  useEffect(() => { setTransactionsOpen(isTransactionsActive); }, [isTransactionsActive]);
  useEffect(() => { setAccountsOpen(isAccountsActive); }, [isAccountsActive]);
  useEffect(() => { setLoansOpen(isLoansActive); }, [isLoansActive]);

  // Helper to close all dropdowns except the one being opened
  const handleDropdown = (menu) => {
    switch (menu) {
      case 'loans':
        setLoansOpen(!loansOpen);
        setExpensesOpen(false);
        setTransactionsOpen(false);
        setAccountsOpen(false);
        setPayablesOpen(false);
        break;
      case 'expenses':
        setExpensesOpen(!expensesOpen);
        setLoansOpen(false);
        setTransactionsOpen(false);
        setAccountsOpen(false);
        setPayablesOpen(false);
        break;
      case 'transactions':
        setTransactionsOpen(!transactionsOpen);
        setLoansOpen(false);
        setExpensesOpen(false);
        setAccountsOpen(false);
        setPayablesOpen(false);
        break;
      case 'accounts':
        setAccountsOpen(!accountsOpen);
        setLoansOpen(false);
        setExpensesOpen(false);
        setTransactionsOpen(false);
        setPayablesOpen(false);
        break;
      case 'payables':
        setPayablesOpen(!payablesOpen);
        setLoansOpen(false);
        setExpensesOpen(false);
        setTransactionsOpen(false);
        setAccountsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <aside
      className={`fixed md:static z-30 top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-gray-900 shadow-lg p-4 border-r border-gray-800
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      <div className="font-bold text-lg mb-6 text-gray-300 tracking-wide">Finance & Accounts</div>
      <nav className="flex flex-col gap-1">
        {token ? (
          <>
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/finance"}
                className={({ isActive }) =>
                    `flex items-center w-full rounded px-3 py-2 text-sm font-medium gap-2
                      transition-all duration-200 ease-in-out transform
                      relative group
                      ${
                        isActive
                          ? "bg-blue-700 text-white shadow scale-105 border-l-4 border-blue-400"
                          : "text-gray-200 hover:bg-gray-800 hover:text-white hover:scale-105"
                      }
                    `
                  }
                >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}

            {/* Loans Menu */}
            <div>
              <button
                className={`flex items-center w-full rounded px-3 py-2 text-sm font-medium gap-2 transition-all duration-200 ease-in-out
                  ${loansOpen ? 'bg-blue-700 text-white' : 'text-gray-200 hover:bg-gray-800 hover:text-white'}`}
                onClick={() => handleDropdown('loans')}
              >
                <FiDatabase />
                <span>Loans</span>
                <FiChevronDown className={`w-4 h-4 ml-auto transition-transform ${loansOpen ? 'rotate-180' : ''}`} />
              </button>
              <div
                className={`ml-4 mt-1 flex flex-col gap-1 rounded-lg shadow-lg bg-gray-800/90 transition-all duration-300 ease-in-out overflow-hidden
                  ${loansOpen ? 'max-h-96 opacity-100 py-2' : 'max-h-0 opacity-0 py-0 pointer-events-none'}`}
                style={{ transitionProperty: 'max-height, opacity, padding' }}
              >
                {loansMenu.map(link => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={() =>
                      location.pathname === link.to
                        ? 'flex items-center w-full rounded px-3 py-2 text-sm font-medium gap-2 transition-all duration-200 ease-in-out bg-blue-600 text-white'
                        : 'flex items-center w-full rounded px-3 py-2 text-sm font-medium gap-2 transition-all duration-200 ease-in-out text-gray-200 hover:bg-blue-800 hover:text-white'
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    {link.icon}
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Expenses Dropdown */}
            <div>
              <button
                className={`flex items-center w-full rounded px-3 py-2 text-sm font-medium gap-2 transition-all duration-200 ease-in-out
                  ${expensesOpen ? 'bg-blue-700 text-white' : 'text-gray-200 hover:bg-gray-800 hover:text-white'}`}
                onClick={() => handleDropdown('expenses')}
              >
                <FiDollarSignAlt />
                <span>Expenses</span>
                <FiChevronDown className={`w-4 h-4 ml-auto transition-transform ${expensesOpen ? 'rotate-180' : ''}`} />
              </button>
              <div
                className={`ml-4 mt-1 flex flex-col gap-1 rounded-lg shadow-lg bg-gray-800/90 transition-all duration-300 ease-in-out overflow-hidden
                  ${expensesOpen ? 'max-h-96 opacity-100 py-2' : 'max-h-0 opacity-0 py-0 pointer-events-none'}`}
                style={{ transitionProperty: 'max-height, opacity, padding' }}
              >
                {expensesMenu.map(sub => (
                  <NavLink
                    key={sub.to}
                    to={sub.to}
                    className={() =>
                      location.pathname === sub.to
                        ? 'flex items-center w-full rounded px-3 py-2 text-sm font-medium gap-2 transition-all duration-200 ease-in-out bg-blue-600 text-white'
                        : 'flex items-center w-full rounded px-3 py-2 text-sm font-medium gap-2 transition-all duration-200 ease-in-out text-gray-200 hover:bg-blue-800 hover:text-white'
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    {sub.icon}
                    {sub.label}
                  </NavLink>
                ))}
              </div>
            </div>
            
            {/* Payables Dropdown */}
            <div>
              <button
                className={`flex items-center w-full rounded px-3 py-2 text-sm font-medium gap-2 transition-all duration-200 ease-in-out
                  ${payablesOpen ? 'bg-blue-700 text-white' : 'text-gray-200 hover:bg-gray-800 hover:text-white'}`}
                onClick={() => handleDropdown(payablesOpen ? '' : 'payables')}
              >
                <FiShoppingCart />
                <span>Vendor and Purchase</span>
                <FiChevronDown className={`w-4 h-4 ml-auto transition-transform ${payablesOpen ? 'rotate-180' : ''}`} />
              </button>
              <div
                className={`ml-4 mt-1 flex flex-col gap-1 rounded-lg shadow-lg bg-gray-800/90 transition-all duration-300 ease-in-out overflow-hidden
                  ${payablesOpen ? 'max-h-96 opacity-100 py-2' : 'max-h-0 opacity-0 py-0 pointer-events-none'}`}
                style={{ transitionProperty: 'max-height, opacity, padding' }}
              >
                {payablesMenu.map(sub => (
                  <NavLink
                    key={sub.to}
                    to={sub.to}
                    className={() =>
                      location.pathname === sub.to
                        ? 'flex items-center w-full rounded px-3 py-2 text-sm font-medium gap-2 transition-all duration-200 ease-in-out bg-blue-600 text-white'
                        : 'flex items-center w-full rounded px-3 py-2 text-sm font-medium gap-2 transition-all duration-200 ease-in-out text-gray-200 hover:bg-blue-800 hover:text-white'
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    {sub.icon}
                    {sub.label}
                  </NavLink>
                ))}
              </div>
            </div>
            {/* Transactions Dropdown */}
            <div>
              <button
                className={`flex items-center w-full rounded px-3 py-2 text-sm font-medium gap-2 transition-all duration-200 ease-in-out
                  ${transactionsOpen ? 'bg-blue-700 text-white' : 'text-gray-200 hover:bg-gray-800 hover:text-white'}`}
                onClick={() => handleDropdown(transactionsOpen ? '' : 'transactions')}
              >
                <FiDatabase />
                <span>Transactions</span>
                <FiChevronDown className={`w-4 h-4 ml-auto transition-transform ${transactionsOpen ? 'rotate-180' : ''}`} />
              </button>
              <div
                className={`ml-4 mt-1 flex flex-col gap-1 rounded-lg shadow-lg bg-gray-800/90 transition-all duration-300 ease-in-out overflow-hidden
                  ${transactionsOpen ? 'max-h-96 opacity-100 py-2' : 'max-h-0 opacity-0 py-0 pointer-events-none'}`}
                style={{ transitionProperty: 'max-height, opacity, padding' }}
              >
                {transactionsMenu.map(sub => (
                  <NavLink
                    key={sub.to}
                    to={sub.to}
                    className={() =>
                      location.pathname === sub.to
                        ? 'flex items-center w-full rounded px-3 py-2 text-sm font-medium gap-2 transition-all duration-200 ease-in-out bg-blue-600 text-white'
                        : 'flex items-center w-full rounded px-3 py-2 text-sm font-medium gap-2 transition-all duration-200 ease-in-out text-gray-200 hover:bg-blue-800 hover:text-white'
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    {sub.icon}
                    {sub.label}
                  </NavLink>
                ))}
              </div>
            </div>
            {/* Accounts Dropdown */}
            <div>
              <button
                className={`flex items-center w-full rounded px-3 py-2 text-sm font-medium gap-2 transition-all duration-200 ease-in-out
                  ${accountsOpen ? 'bg-blue-700 text-white' : 'text-gray-200 hover:bg-gray-800 hover:text-white'}`}
                onClick={() => handleDropdown('accounts')}
              >
                <FiPieChart />
                <span>Accounts</span>
                <FiChevronDown className={`w-4 h-4 ml-auto transition-transform ${accountsOpen ? 'rotate-180' : ''}`} />
              </button>
              <div
                className={`ml-4 mt-1 flex flex-col gap-1 rounded-lg shadow-lg bg-gray-800/90 transition-all duration-300 ease-in-out overflow-hidden
                  ${accountsOpen ? 'max-h-96 opacity-100 py-2' : 'max-h-0 opacity-0 py-0 pointer-events-none'}`}
                style={{ transitionProperty: 'max-height, opacity, padding' }}
              >
                  {accountsSubMenu.map(sub => (
                    <NavLink
                      key={sub.to}
                      to={sub.to}
                      className={() =>
                        location.pathname === sub.to
                          ? 'flex items-center w-full rounded px-3 py-2 text-sm font-medium gap-2 transition-all duration-200 ease-in-out bg-blue-600 text-white'
                          : 'flex items-center w-full rounded px-3 py-2 text-sm font-medium gap-2 transition-all duration-200 ease-in-out text-gray-200 hover:bg-blue-800 hover:text-white'
                      }
                      onClick={() => setSidebarOpen(false)}
                    >
                      {sub.icon}
                      {sub.label}
                    </NavLink>
                  ))}
              </div>
            </div>
            {/* Profile Link */}
            <NavLink
              to="/finance/profile"
              className={({ isActive }) =>
                `flex items-center w-full rounded px-3 py-2 text-sm font-medium gap-2
                  transition-all duration-200 ease-in-out transform
                  relative group
                  ${
                    isActive
                      ? "bg-blue-700 text-white shadow scale-105 border-l-4 border-blue-400"
                      : "text-gray-200 hover:bg-gray-800 hover:text-white hover:scale-105"
                  }
                `
              }
              onClick={() => setSidebarOpen(false)}
            >
              <FiUser />
              Profile
            </NavLink>
            {/* Settings Link */}
            <NavLink
              to="/finance/settings"
              className={({ isActive }) =>
                `flex items-center w-full rounded px-3 py-2 text-sm font-medium gap-2
                  transition-all duration-200 ease-in-out transform
                  relative group
                  ${
                    isActive
                      ? "bg-blue-700 text-white shadow scale-105 border-l-4 border-blue-400"
                      : "text-gray-200 hover:bg-gray-800 hover:text-white hover:scale-105"
                  }
                `
              }
              onClick={() => setSidebarOpen(false)}
            >
              <FiSettings />
              Settings
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/auth/login" className="flex items-center w-full rounded px-3 py-2 text-sm font-medium text-blue-300 hover:bg-gray-800 hover:text-white">Login</NavLink>
            <NavLink to="/auth/register" className="flex items-center w-full rounded px-3 py-2 text-sm font-medium text-blue-300 hover:bg-gray-800 hover:text-white">Register</NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;
