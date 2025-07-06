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
      className={`fixed md:static z-30 top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 p-4 shadow transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      <div className="font-bold text-lg mb-6 text-blue-600">Finance & Accounts</div>
      <nav className="flex flex-col gap-2">
        {token ? (
          navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/finance"}
              className={({ isActive }) =>
                `block rounded px-3 py-2 text-sm font-medium transition-all duration-150 ${
                  isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-200"
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              {link.label}
            </NavLink>
          ))
        ) : (
          <>
            <NavLink to="/auth/login" className="block rounded px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">Login</NavLink>
            <NavLink to="/auth/register" className="block rounded px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">Register</NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}
