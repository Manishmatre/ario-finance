import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
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
  { to: "/finance/vendor-payments", label: "Vendor Payments", icon: <FiCreditCard /> },
  { to: "/finance/vendor-payments/add", label: "Add Payment", icon: <FiPlusCircle /> },
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
  { to: "/finance/accounts", label: "All Bank Accounts", icon: <FiBook /> },
  { to: "/finance/add-bank-account", label: "Add Bank Account", icon: <FiPlusCircle /> },
  { to: "/finance/bankbook", label: "Bankbook", icon: <FiCreditCard /> },
  { to: "/finance/cashbook", label: "Cashbook", icon: <FiDollarSign /> },
  { to: "/finance/petty-cash", label: "Petty Cash Register", icon: <FiBriefcase /> },
  { to: "/finance/ledger", label: "Ledger View", icon: <FiLayers /> },
];



const expensesMenu = [
  { to: "/finance/expenses/new", label: "Add Expense", icon: <FiPlusCircle /> },
  { to: "/finance/expenses", label: "All Expenses", icon: <FiDollarSignAlt /> },
  { to: "/finance/expenses/categories", label: "Expense Categories", icon: <FiTag /> },
  { to: "/finance/expenses/reports", label: "Expense Reports", icon: <FiClipboard /> },
];

const employeesMenu = [
  { to: '/finance/employees', label: 'All Employees', icon: <FiUsers /> },
  { to: '/finance/employees/add', label: 'Add Employee', icon: <FiPlusCircle /> },
  { to: '/finance/employee-transactions', label: 'Employee Transactions', icon: <FiList /> },
  { to: '/finance/employee-transactions/add', label: 'Add Employee Transaction', icon: <FiPlusCircle /> },
];

const clientsMenu = [
  { to: "/finance/clients", label: "All Clients", icon: <FiUsers /> },
  { to: "/finance/clients/add", label: "Add Client", icon: <FiPlusCircle /> },
];

const navLinks = [
  { to: "/finance", label: "Dashboard", icon: <FiHome /> },
  { to: "/finance/cash-reimburse", label: "Cash Reimbursement", icon: <FiDollarSign /> },
];

const projectsMenu = [
  { to: "/finance/projects", label: "All Projects", icon: <FiBriefcase /> },
  { to: "/finance/projects/add", label: "Add Project", icon: <FiPlusCircle /> },
  { to: "/finance/clients", label: "All Clients", icon: <FiUsers /> },
  { to: "/finance/clients/add", label: "Add Client", icon: <FiPlusCircle /> },
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
  const isEmployeesActive = employeesMenu.some(link => location.pathname.startsWith(link.to));
  const isProjectsActive = projectsMenu.some(link => location.pathname.startsWith(link.to));
  const isClientsActive = clientsMenu.some(link => location.pathname.startsWith(link.to));

  // Dropdown open state: always open if active, else controlled by click
  const [payablesOpen, setPayablesOpen] = useState(isPayablesActive);
  const [loansOpen, setLoansOpen] = useState(isLoansActive);
  const [expensesOpen, setExpensesOpen] = useState(false);
  const [transactionsOpen, setTransactionsOpen] = useState(isTransactionsActive);
  const [accountsOpen, setAccountsOpen] = useState(isAccountsActive);
  const [employeesOpen, setEmployeesOpen] = useState(isEmployeesActive);
  const [projectsOpen, setProjectsOpen] = useState(isProjectsActive);
  const [clientsOpen, setClientsOpen] = useState(isClientsActive);

  useEffect(() => { setPayablesOpen(isPayablesActive); }, [isPayablesActive]);
  useEffect(() => { setExpensesOpen(isExpensesActive); }, [isExpensesActive]);
  useEffect(() => { setTransactionsOpen(isTransactionsActive); }, [isTransactionsActive]);
  useEffect(() => { setAccountsOpen(isAccountsActive); }, [isAccountsActive]);
  useEffect(() => { setLoansOpen(isLoansActive); }, [isLoansActive]);
  useEffect(() => { setEmployeesOpen(isEmployeesActive); }, [isEmployeesActive]);
  useEffect(() => { setProjectsOpen(isProjectsActive); }, [isProjectsActive]);
  useEffect(() => { setClientsOpen(isClientsActive); }, [isClientsActive]);

  // Helper to close all dropdowns except the one being opened
  const handleDropdown = (menu) => {
    switch (menu) {
      case 'loans':
        setLoansOpen(!loansOpen);
        setExpensesOpen(false);
        setTransactionsOpen(false);
        setAccountsOpen(false);
        setPayablesOpen(false);
        setEmployeesOpen(false);
        setProjectsOpen(false);
        setClientsOpen(false);
        break;
      case 'expenses':
        setExpensesOpen(!expensesOpen);
        setLoansOpen(false);
        setTransactionsOpen(false);
        setAccountsOpen(false);
        setPayablesOpen(false);
        setEmployeesOpen(false);
        setProjectsOpen(false);
        setClientsOpen(false);
        break;
      case 'transactions':
        setTransactionsOpen(!transactionsOpen);
        setLoansOpen(false);
        setExpensesOpen(false);
        setAccountsOpen(false);
        setPayablesOpen(false);
        setEmployeesOpen(false);
        setProjectsOpen(false);
        setClientsOpen(false);
        break;
      case 'accounts':
        setAccountsOpen(!accountsOpen);
        setLoansOpen(false);
        setExpensesOpen(false);
        setTransactionsOpen(false);
        setPayablesOpen(false);
        setEmployeesOpen(false);
        setProjectsOpen(false);
        setClientsOpen(false);
        break;
      case 'payables':
        setPayablesOpen(!payablesOpen);
        setLoansOpen(false);
        setExpensesOpen(false);
        setTransactionsOpen(false);
        setAccountsOpen(false);
        setEmployeesOpen(false);
        setProjectsOpen(false);
        setClientsOpen(false);
        break;
      case 'employees':
        setEmployeesOpen(!employeesOpen);
        setLoansOpen(false);
        setExpensesOpen(false);
        setTransactionsOpen(false);
        setAccountsOpen(false);
        setPayablesOpen(false);
        setProjectsOpen(false);
        setClientsOpen(false);
        break;
      case 'projects':
        setProjectsOpen(!projectsOpen);
        setLoansOpen(false);
        setExpensesOpen(false);
        setTransactionsOpen(false);
        setAccountsOpen(false);
        setPayablesOpen(false);
        setEmployeesOpen(false);
        setClientsOpen(false);
        break;
      case 'clients':
        setClientsOpen(!clientsOpen);
        setProjectsOpen(false);
        setLoansOpen(false);
        setExpensesOpen(false);
        setTransactionsOpen(false);
        setAccountsOpen(false);
        setPayablesOpen(false);
        setEmployeesOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <aside
      className={`fixed md:static z-50 top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-gray-900 shadow-lg p-4 border-r border-gray-800
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

            {/* Employees Menu (Dropdown) */}
            <div>
              <button
                className={`flex items-center w-full rounded px-3 py-2 text-sm font-medium gap-2 transition-all duration-200 ease-in-out
                  ${employeesOpen ? 'bg-blue-700 text-white' : 'text-gray-200 hover:bg-gray-800 hover:text-white'}`}
                onClick={() => handleDropdown('employees')}
              >
                <FiUsers />
                <span>Employees</span>
                <FiChevronDown className={`w-4 h-4 ml-auto transition-transform ${employeesOpen ? 'rotate-180' : ''}`} />
              </button>
              <div
                className={`ml-4 mt-1 flex flex-col gap-1 rounded-lg shadow-lg bg-gray-800/90 transition-all duration-300 ease-in-out overflow-hidden
                  ${employeesOpen ? 'max-h-96 opacity-100 py-2' : 'max-h-0 opacity-0 py-0 pointer-events-none'}`}
                style={{ transitionProperty: 'max-height, opacity, padding' }}
              >
                {employeesMenu.map(link => (
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

            {/* Projects Menu */}
            <div>
              <button
                className={`flex items-center w-full rounded px-3 py-2 text-sm font-medium gap-2 transition-all duration-200 ease-in-out
                  ${projectsOpen ? 'bg-blue-700 text-white' : 'text-gray-200 hover:bg-gray-800 hover:text-white'}`}
                onClick={() => handleDropdown('projects')}
              >
                <FiBriefcase />
                <span>Projects</span>
                <FiChevronDown className={`w-4 h-4 ml-auto transition-transform ${projectsOpen ? 'rotate-180' : ''}`} />
              </button>
              <div
                className={`ml-4 mt-1 flex flex-col gap-1 rounded-lg shadow-lg bg-gray-800/90 transition-all duration-300 ease-in-out overflow-hidden
                  ${projectsOpen ? 'max-h-96 opacity-100 py-2' : 'max-h-0 opacity-0 py-0 pointer-events-none'}`}
                style={{ transitionProperty: 'max-height, opacity, padding' }}
              >
                {projectsMenu.map(link => (
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
            {/* Pricing Link */}
            <NavLink
              to="/finance/pricing"
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
              <FiCreditCard />
              Pricing
            </NavLink>
            {/* Subscription Link */}
            <NavLink
              to="/finance/subscription"
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
              <FiTrendingUp />
              Subscription
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
