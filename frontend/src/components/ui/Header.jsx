import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/useAuth";
import { useNavigate, Link, useLocation, NavLink } from "react-router-dom";
import { FiSearch, FiBell, FiUser, FiSettings, FiLogOut, FiChevronDown, FiX } from "react-icons/fi";

export default function Header({ sidebarOpen, setSidebarOpen }) {
  const { token, logout, user: authUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New invoice received', time: '2 min ago', read: false },
    { id: 2, text: 'Payment received from Client X', time: '1 hour ago', read: true },
    { id: 3, text: 'System update available', time: '1 day ago', read: true },
  ]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  // Update unread count when notifications change
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

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
          <div className="flex items-center">
            <img 
              src="/logo.svg" 
              alt="SSK Finance Logo" 
              className="h-8 w-auto mr-2 hidden md:block" 
              onError={e => { 
                e.target.style.display='none'; 
                e.target.parentNode.querySelector('.logo-text').style.display='block'; 
              }} 
            />
            <span className="logo-text hidden md:block font-bold text-xl text-blue-700 mr-3 tracking-tight" style={{display:'none'}}>
              SSK <span className="text-gray-900">Finance</span>
            </span>
          </div>
        </div>
        {/* Center: Search Bar */}
        <div className={`flex-1 max-w-2xl mx-4 transition-all duration-200 ${isSearchFocused ? 'md:ml-8' : ''}`}> 
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search transactions, reports, etc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
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
          </form>
        </div>
        {/* Right: Profile & Notifications */}
        <div className="flex items-center space-x-3 md:space-x-4 ml-auto">
          {token ? (
            <>
              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button 
                  className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                >
                  <FiBell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                  )}
                </button>
                {/* Notifications Dropdown */}
                {isNotificationsOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <div className="flex justify-between items-center px-4 py-2 border-b">
                        <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                        <button 
                          onClick={clearAllNotifications}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Mark all as read
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div 
                              key={notification.id} 
                              className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                              onClick={() => markAsRead(notification.id)}
                            >
                              <p className="text-sm text-gray-900">{notification.text}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-center text-sm text-gray-500">
                            No new notifications
                          </div>
                        )}
                      </div>
                      <div className="border-t px-4 py-2 text-center">
                        <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                          View all notifications
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
