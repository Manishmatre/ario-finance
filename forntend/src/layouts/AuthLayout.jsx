import { Link } from 'react-router-dom';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600">Ario</span>
              <span className="text-2xl font-bold text-gray-800">Finance</span>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link to="/auth/login" className="text-gray-600 hover:text-blue-600 transition-colors">Sign In</Link>
              <Link to="/auth/register" className="text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md transition-colors">Create Account</Link>
            </nav>
          </div>
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
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Ario Finance. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
