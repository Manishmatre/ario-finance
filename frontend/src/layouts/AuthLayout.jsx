import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FiMenu, FiX, FiUser, FiLogIn, FiUserPlus } from 'react-icons/fi';

export default function AuthLayout({ children, title, subtitle }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900">Ario</span>
                <span className="text-sm font-medium text-gray-600">Finance Management</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                to="/auth/login" 
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-blue-50"
              >
                <FiLogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <Link 
                to="/auth/register" 
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
              >
                <FiUserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </Link>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-blue-600 transition-colors p-2 rounded-md hover:bg-blue-50"
              >
                {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
              <div className="flex flex-col space-y-3 pt-4">
                <Link 
                  to="/auth/login" 
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-blue-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiLogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link 
                  to="/auth/register" 
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiUserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            {title && <h1 className="text-3xl font-extrabold text-gray-900">{title}</h1>}
            {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              &copy; {new Date().getFullYear()} Ario Finance Management. All rights reserved.
            </p>
            <div className="flex justify-center space-x-6 text-xs text-gray-400">
              <Link to="/auth/login" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
              <Link to="/auth/login" className="hover:text-gray-600 transition-colors">Terms of Service</Link>
              <Link to="/auth/login" className="hover:text-gray-600 transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
