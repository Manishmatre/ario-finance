import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { FiSearch, FiBell, FiUser, FiSettings, FiLogOut, FiChevronDown, FiX } from "react-icons/fi";

export default function Header({ sidebarOpen, setSidebarOpen }) {
  const { token, logout, user: authUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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

  // Get user and tenant info
  const user = JSON.parse(localStorage.getItem("user")) || { name: authUser?.name || "User", email: authUser?.email || "" };
  const tenant = JSON.parse(localStorage.getItem("tenant")) || { name: "Ario Finance" };

  // Handle clicks outside profile dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
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
              src="/assets/arionextech-logo.png" 
              alt="ArionexTech Logo" 
              className="h-8 w-auto mr-2 hidden md:block" 
              onError={e => { 
                e.target.style.display='none'; 
                e.target.parentNode.querySelector('.logo-text').style.display='block'; 
              }} 
            />
            <span className="logo-text hidden md:block font-bold text-xl text-blue-700 mr-3 tracking-tight" style={{display:'none'}}>
              Arionex<span className="text-gray-900">Tech</span>
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
              <div className="relative" ref={profileRef}>
                <button
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden md:inline-block ml-2 text-sm font-medium text-gray-700">
                    {user.name || 'User'}
                  </span>
                  <FiChevronDown className={`ml-1 h-4 w-4 text-gray-500 transition-transform ${isProfileOpen ? 'transform rotate-180' : ''}`} />
                </button>
                {isProfileOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1" role="none">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm text-gray-900 font-medium truncate">{user.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email || 'user@example.com'}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiUser className="mr-3 h-5 w-5 text-gray-400" />
                        Your Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiSettings className="mr-3 h-5 w-5 text-gray-400" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <FiLogOut className="mr-3 h-5 w-5 text-red-400" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
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
