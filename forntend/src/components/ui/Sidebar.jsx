import React from "react";
import { NavLink } from "react-router-dom";
// import navLinks from '../../routes/financeNavLinks';

const navLinks = [
  { to: "/", label: "Dashboard" },
  { to: "/accounts", label: "Chart of Accounts" },
  { to: "/journal", label: "Journal Entries" },
  { to: "/ledger", label: "Ledger View" },
  { to: "/add-transaction", label: "Add Transaction" },
  { to: "/transaction-approval", label: "Transaction Approval" },
  { to: "/bills", label: "Purchase Bills" },
  { to: "/vendors", label: "Vendors" },
  { to: "/vendor-ledger", label: "Vendor Ledger" },
  { to: "/advance-vendor", label: "Advance To Vendor" },
  { to: "/vendor-payments", label: "Vendor Payments" },
  { to: "/cashbook", label: "Cashbook" },
  { to: "/bankbook", label: "Bankbook" },
  { to: "/petty-cash", label: "Petty Cash Register" },
  { to: "/cash-advance", label: "Cash Advance To Employee" },
  { to: "/cash-reimburse", label: "Cash Reimbursement" },
  { to: "/grn-matching", label: "GRN Matching" },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  return (
    <aside
      className={`fixed md:static z-30 top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 p-4 shadow transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      <div className="font-bold text-lg mb-6 text-blue-600">Finance & Accounts</div>
      <nav className="flex flex-col gap-2">
        {navLinks.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === ""}
            className={({ isActive }) =>
              `block rounded px-3 py-2 text-sm font-medium transition-all duration-150 ${
                isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-200"
              }`
            }
            onClick={() => setSidebarOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
