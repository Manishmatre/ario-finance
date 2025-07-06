import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
// import navLinks from '../../routes/financeNavLinks';

const navLinks = [
  { to: "/finance", label: "Dashboard" },
  { to: "/finance/accounts", label: "Chart of Accounts" },
  { to: "/finance/journal", label: "Journal Entries" },
  { to: "/finance/ledger", label: "Ledger View" },
  { to: "/finance/add-transaction", label: "Add Transaction" },
  { to: "/finance/transaction-approval", label: "Transaction Approval" },
  { to: "/finance/bills", label: "Purchase Bills" },
  { to: "/finance/vendors", label: "Vendors" },
  { to: "/finance/vendor-ledger", label: "Vendor Ledger" },
  { to: "/finance/advance-vendor", label: "Advance To Vendor" },
  { to: "/finance/vendor-payments", label: "Vendor Payments" },
  { to: "/finance/cashbook", label: "Cashbook" },
  { to: "/finance/bankbook", label: "Bankbook" },
  { to: "/finance/petty-cash", label: "Petty Cash Register" },
  { to: "/finance/cash-advance", label: "Cash Advance To Employee" },
  { to: "/finance/cash-reimburse", label: "Cash Reimbursement" },
  { to: "/finance/grn-matching", label: "GRN Matching" },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { token } = useAuth();
  return (
    <aside
      className={`fixed md:static z-30 top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-gray-900 shadow-lg p-4 border-r border-gray-800
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      <div className="font-bold text-lg mb-6 text-gray-300 tracking-wide">Finance & Accounts</div>
      <nav className="flex flex-col gap-1">
        {token ? (
          navLinks.map(link => (
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
          ))
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
