import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
// import navLinks from '../../routes/financeNavLinks';

const payablesMenu = [
  { to: "/finance/bills", label: "Purchase Bills" },
  { to: "/finance/vendors", label: "Vendors" },
  { to: "/finance/vendor-ledger", label: "Vendor Ledger" },
  { to: "/finance/advance-vendor", label: "Advance To Vendor" },
  { to: "/finance/vendor-payments", label: "Vendor Payments" },
];

const transactionsMenu = [
  { to: "/finance/add-transaction", label: "Add Transaction" },
  { to: "/finance/transaction-approval", label: "Transaction Approval" },
  { to: "/finance/journal", label: "Journal Entries" },
  { to: "/finance/ledger", label: "Ledger View" },
];

const accountsMenu = [
  { to: "/finance/accounts", label: "Chart of Accounts" },
  { to: "/finance/bankbook", label: "Bankbook" },
  { to: "/finance/cashbook", label: "Cashbook" },
  { to: "/finance/petty-cash", label: "Petty Cash Register" },
  { to: "/finance/add-bank-account", label: "Add Bank Account" },
];

const navLinks = [
  { to: "/finance", label: "Dashboard" },
  { to: "/finance/cash-advance", label: "Cash Advance To Employee" },
  { to: "/finance/cash-reimburse", label: "Cash Reimbursement" },
  { to: "/finance/grn-matching", label: "GRN Matching" },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { token } = useAuth();
  const [payablesOpen, setPayablesOpen] = useState(false);
  const [transactionsOpen, setTransactionsOpen] = useState(false);
  const [accountsOpen, setAccountsOpen] = useState(false);
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
                  `block rounded px-3 py-2 text-sm font-medium flex items-center gap-2
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
                {link.label}
              </NavLink>
            ))}
            {/* Payables Dropdown */}
            <div>
              <button
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm font-medium transition-all duration-200 ease-in-out
                  ${payablesOpen ? 'bg-blue-700 text-white' : 'text-gray-200 hover:bg-gray-800 hover:text-white'}`}
                onClick={() => setPayablesOpen(v => !v)}
              >
                <span>Payables</span>
                <svg className={`w-4 h-4 ml-2 transition-transform ${payablesOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
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
                    className={({ isActive }) =>
                      `block rounded px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out
                      ${isActive ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-blue-800 hover:text-white'}`
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    {sub.label}
                  </NavLink>
                ))}
              </div>
            </div>
            {/* Transactions Dropdown */}
            <div>
              <button
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm font-medium transition-all duration-200 ease-in-out
                  ${transactionsOpen ? 'bg-blue-700 text-white' : 'text-gray-200 hover:bg-gray-800 hover:text-white'}`}
                onClick={() => setTransactionsOpen(v => !v)}
              >
                <span>Transactions</span>
                <svg className={`w-4 h-4 ml-2 transition-transform ${transactionsOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
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
                    className={({ isActive }) =>
                      `block rounded px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out
                      ${isActive ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-blue-800 hover:text-white'}`
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    {sub.label}
                  </NavLink>
                ))}
              </div>
            </div>
            {/* Accounts Dropdown */}
            <div>
              <button
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm font-medium transition-all duration-200 ease-in-out
                  ${accountsOpen ? 'bg-blue-700 text-white' : 'text-gray-200 hover:bg-gray-800 hover:text-white'}`}
                onClick={() => setAccountsOpen(v => !v)}
              >
                <span>Accounts</span>
                <svg className={`w-4 h-4 ml-2 transition-transform ${accountsOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
              </button>
              <div
                className={`ml-4 mt-1 flex flex-col gap-1 rounded-lg shadow-lg bg-gray-800/90 transition-all duration-300 ease-in-out overflow-hidden
                  ${accountsOpen ? 'max-h-96 opacity-100 py-2' : 'max-h-0 opacity-0 py-0 pointer-events-none'}`}
                style={{ transitionProperty: 'max-height, opacity, padding' }}
              >
                {accountsMenu.map(sub => (
                  <NavLink
                    key={sub.to}
                    to={sub.to}
                    className={({ isActive }) =>
                      `block rounded px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out
                      ${isActive ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-blue-800 hover:text-white'}`
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    {sub.label}
                  </NavLink>
                ))}
              </div>
            </div>
            {/* Profile Link */}
            <NavLink
              to="/finance/profile"
              className={({ isActive }) =>
                `block rounded px-3 py-2 text-sm font-medium flex items-center gap-2
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
              Profile
            </NavLink>
            {/* Settings Link */}
            <NavLink
              to="/finance/settings"
              className={({ isActive }) =>
                `block rounded px-3 py-2 text-sm font-medium flex items-center gap-2
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
              Settings
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/auth/login" className="block rounded px-3 py-2 text-sm font-medium text-blue-300 hover:bg-gray-800 hover:text-white">Login</NavLink>
            <NavLink to="/auth/register" className="block rounded px-3 py-2 text-sm font-medium text-blue-300 hover:bg-gray-800 hover:text-white">Register</NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}
