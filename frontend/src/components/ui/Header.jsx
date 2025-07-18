import React, { useState, useEffect, useRef } from "react";
import ReactDOM from 'react-dom';
import { useAuth } from "../../contexts/useAuth";
import { useNavigate, Link, useLocation, NavLink } from "react-router-dom";
import { FiSearch, FiUser, FiSettings, FiLogOut, FiChevronDown, FiX } from "react-icons/fi";
import NotificationDropdown from "../notifications/NotificationDropdown";
import axiosInstance from '../../utils/axiosInstance';

export default function Header({ sidebarOpen, setSidebarOpen }) {
  const { token, logout, user: authUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null); // FIX: define notificationsRef
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false); // FIX: define isNotificationsOpen
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const searchTimeout = useRef(null);
  const searchInputRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  // Get user and tenant info
  const user = JSON.parse(localStorage.getItem("user")) || { name: authUser?.name || "User", email: authUser?.email || "" };

  // Handle clicks outside profile dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        // Removed: setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  // Universal search handler (debounced)
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults(null);
      setSearchLoading(false);
      setSearchError(null);
      return;
    }
    setSearchLoading(true);
    setSearchError(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await axiosInstance.get('/api/finance/dashboard/search', { params: { query: searchQuery } });
        setSearchResults(res.data);
        setSearchLoading(false);
      } catch (err) {
        setSearchError('Error searching');
        setSearchLoading(false);
      }
    }, 350);
    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery]);

  // Update dropdown position when search bar is focused or query changes
  useEffect(() => {
    if (isSearchFocused && searchInputRef.current) {
      const rect = searchInputRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'absolute',
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        zIndex: 2147483647
      });
    }
  }, [isSearchFocused, searchQuery]);

  // Handle result click
  const handleResultClick = (type, id) => {
    setSearchQuery('');
    setSearchResults(null);
    setIsSearchFocused(false);
    switch (type) {
      case 'client':
        console.log('Navigating to client:', id);
        navigate(`/finance/clients/${id}`);
        break;
      case 'vendor':
        navigate(`/finance/vendors/${id}`); break;
      case 'project':
        navigate(`/finance/projects/${id}`); break;
      case 'product':
        navigate(`/finance/products/${id}`); break;
      case 'expense':
        navigate(`/finance/expenses/${id}`); break;
      case 'transaction':
        navigate(`/finance/transactions/${id}`); break;
      case 'loan':
        navigate(`/loans/${id}`); break;
      case 'grn':
        navigate(`/finance/grns/${id}`); break;
      case 'purchaseOrder':
        navigate(`/finance/purchase-orders/${id}`); break;
      case 'employee':
        navigate(`/finance/employees/${id}`); break;
      case 'bill':
        console.log('Navigating to bill:', id);
        navigate(`/finance/bills/${id}`);
        break;
      case 'bankAccount':
        console.log('Navigating to bank account:', id);
        navigate(`/finance/accounts/${id}`);
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Handle search functionality
      console.log('Searching for:', searchQuery);
      // You can implement search navigation here
    }
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const clearAllNotifications = () => {
    setNotifications(notifications.map(notif => ({
      ...notif,
      read: true
    })));
  };

  const avatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=3b82f6&color=fff&size=32`;

  // Don't show header on auth pages
  if (location.pathname.startsWith('/auth')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-md h-16 px-4 md:px-8">
      <div className="flex items-center h-full w-full justify-between">
        {/* Left: Logo/Menu */}
        <div className="flex items-center flex-shrink-0">
          <button
            className="md:hidden mr-4 text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 rounded p-1 transition"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle Sidebar"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">SSK</span>
              <span className="text-sm font-medium text-gray-600">Finance Management</span>
            </div>
          </Link>
        </div>
        {/* Center: Search Bar */}
        <div className={`flex-1 max-w-2xl mx-4 transition-all duration-200 ${isSearchFocused ? 'md:ml-8' : ''}`}> 
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search transactions, reports, etc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSearchQuery('')}
                >
                  <FiX className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            {/* Universal Search Dropdown (Portal) */}
            {isSearchFocused && searchQuery && ReactDOM.createPortal(
              <div style={dropdownStyle} className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                {searchLoading && (
                  <div className="p-4 text-gray-500 text-center">Searching...</div>
                )}
                {searchError && (
                  <div className="p-4 text-red-500 text-center">{searchError}</div>
                )}
                {searchResults && Object.values(searchResults).every(arr => arr.length === 0) && !searchLoading && !searchError && (
                  <div className="p-4 text-gray-500 text-center">No results found</div>
                )}
                {searchResults && Object.entries(searchResults).map(([group, items]) => (
                  items.length > 0 && (
                    <div key={group}>
                      <div className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase">{group.replace(/([A-Z])/g, ' $1')}</div>
                      {items.map(item => (
                        <button
                          key={item.id}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-100 transition flex items-center gap-2"
                          onClick={() => handleResultClick(item.type, item.id)}
                          tabIndex={0}
                        >
                          <span className="font-medium text-gray-800">{item.label}</span>
                          {item.extra && <span className="ml-2 text-xs text-gray-500">{item.extra}</span>}
                        </button>
                      ))}
                    </div>
                  )
                ))}
              </div>,
              document.body
            )}
          </form>
        </div>
        {/* Right: Profile & Notifications */}
        <div className="flex items-center space-x-3 md:space-x-4 ml-auto">
          {token ? (
            <>
              {/* Real-time Notifications */}
              <NotificationDropdown notificationsRef={notificationsRef} isOpen={isNotificationsOpen} setIsOpen={setIsNotificationsOpen} />
              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex items-center gap-2 focus:outline-none"
                  onClick={() => setDropdownOpen((v) => !v)}
                >
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full border-2 border-blue-200 shadow-sm"
                  />
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div
                  className={`absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50 transition-all duration-200 ease-in-out
                    ${dropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
                >
                  <NavLink
                    to="/finance/profile"
                    className={({ isActive }) =>
                      `block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition rounded-t ${isActive ? 'bg-blue-50 text-blue-700' : ''}`
                    }
                    onClick={() => setDropdownOpen(false)}
                      >
                    <span className="inline-flex items-center gap-2"><FiUser /> Profile</span>
                  </NavLink>
                  <NavLink
                    to="/finance/settings"
                    className={({ isActive }) =>
                      `block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition ${isActive ? 'bg-blue-50 text-blue-700' : ''}`
                    }
                    onClick={() => setDropdownOpen(false)}
                      >
                    <span className="inline-flex items-center gap-2"><FiSettings /> Settings</span>
                  </NavLink>
                      <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 transition rounded-b"
                        onClick={() => {
                      setDropdownOpen(false);
                          handleLogout();
                        }}
                      >
                    <span className="inline-flex items-center gap-2"><FiLogOut /> Logout</span>
                      </button>
                    </div>
              </div>
            </>
          ) : (
            <div className="flex space-x-4">
              <Link
                to="/auth/login"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Login
              </Link>
              <Link
                to="/auth/register"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
