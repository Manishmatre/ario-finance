import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { FiHome, FiBook, FiCreditCard, FiUsers, FiFileText, FiTrendingUp, FiChevronDown, FiSettings, FiUser, FiLayers, FiList, FiDollarSign, FiBriefcase, FiLogOut, FiPlusCircle, FiCheckCircle, FiShoppingCart, FiDatabase, FiPieChart } from "react-icons/fi";
// import navLinks from '../../routes/financeNavLinks';

const payablesMenu = [
  { to: "/finance/bills", label: "Purchase Bills", icon: <FiFileText /> },
  { to: "/finance/vendors", label: "Vendors", icon: <FiUsers /> },
  { to: "/finance/vendor-ledger", label: "Vendor Ledger", icon: <FiLayers /> },
  { to: "/finance/advance-vendor", label: "Advance To Vendor", icon: <FiTrendingUp /> },
  { to: "/finance/vendor-payments", label: "Vendor Payments", icon: <FiCreditCard /> },
];

const transactionsMenu = [
  { to: "/finance/add-transaction", label: "Add Transaction", icon: <FiPlusCircle /> },
  { to: "/finance/transaction-approval", label: "Transaction Approval", icon: <FiCheckCircle /> },
  { to: "/finance/journal", label: "Journal Entries", icon: <FiFileText /> },
  { to: "/finance/ledger", label: "Ledger View", icon: <FiLayers /> },
];

const accountsMenu = [
  { to: "/finance/accounts", label: "Chart of Accounts", icon: <FiBook /> },
  { to: "/finance/bankbook", label: "Bankbook", icon: <FiCreditCard /> },
  { to: "/finance/cashbook", label: "Cashbook", icon: <FiDollarSign /> },
  { to: "/finance/petty-cash", label: "Petty Cash Register", icon: <FiBriefcase /> },
  { to: "/finance/add-bank-account", label: "Add Bank Account", icon: <FiPlusCircle /> },
];

const navLinks = [
  { to: "/finance", label: "Dashboard", icon: <FiHome /> },
  { to: "/finance/cash-advance", label: "Cash Advance To Employee", icon: <FiDollarSign /> },
  { to: "/finance/cash-reimburse", label: "Cash Reimbursement", icon: <FiDollarSign /> },
  { to: "/finance/grn-matching", label: "GRN Matching", icon: <FiList /> },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { token } = useAuth();
  const [payablesOpen, setPayablesOpen] = useState(false);
  const [transactionsOpen, setTransactionsOpen] = useState(false);
  const [accountsOpen, setAccountsOpen] = useState(false);

  // Helper to close all dropdowns except the one being opened
  const handleDropdown = (dropdown) => {
    setAccountsOpen(dropdown === 'accounts');
    setTransactionsOpen(dropdown === 'transactions');
    setPayablesOpen(dropdown === 'payables');
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
                onClick={() => setSidebarOpen(false)}
              >
                {link.icon}
                {link.label}
              </NavLink>
            ))}
            {/* Payables Dropdown */}
            <div>
              <button
                className={`flex items-center w-full rounded px-3 py-2 text-sm font-medium gap-2 transition-all duration-200 ease-in-out
                  ${payablesOpen ? 'bg-blue-700 text-white' : 'text-gray-200 hover:bg-gray-800 hover:text-white'}`}
                onClick={() => handleDropdown(payablesOpen ? '' : 'payables')}
              >
                <FiShoppingCart />
                <span>Payables</span>
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
                    className={({ isActive }) =>
                      `flex items-center w-full rounded px-3 py-2 text-sm font-medium gap-2 transition-all duration-200 ease-in-out
                      ${isActive ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-blue-800 hover:text-white'}`
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
                    className={({ isActive }) =>
                      `flex items-center w-full rounded px-3 py-2 text-sm font-medium gap-2 transition-all duration-200 ease-in-out
                      ${isActive ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-blue-800 hover:text-white'}`
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
                onClick={() => handleDropdown(accountsOpen ? '' : 'accounts')}
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
                {accountsMenu.map(sub => (
                  <NavLink
                    key={sub.to}
                    to={sub.to}
                    className={({ isActive }) =>
                      `flex items-center w-full rounded px-3 py-2 text-sm font-medium gap-2 transition-all duration-200 ease-in-out
                      ${isActive ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-blue-800 hover:text-white'}`
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
