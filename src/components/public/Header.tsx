import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Server, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const { user } = useAuth();

  const handleProductsMouseEnter = () => {
    setProductsOpen(true);
  };

  const handleProductsMouseLeave = () => {
    setProductsOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Server className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">BIDUA Hosting</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition">
              Home
            </Link>

            <div
              className="relative group"
              onMouseEnter={handleProductsMouseEnter}
              onMouseLeave={handleProductsMouseLeave}
            >
              <button
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
                onClick={() => setProductsOpen(!productsOpen)}
              >
                <span>Products</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${productsOpen ? 'rotate-180' : ''}`} />
              </button>
              {productsOpen && (
                <div className="absolute top-full left-0 pt-2 -mt-2 w-56">
                  <div className="bg-white rounded-lg shadow-lg py-2 border border-gray-100">
                    <Link
                      to="/pricing"
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                      onClick={() => setProductsOpen(false)}
                    >
                      Cloud Servers
                    </Link>
                    <Link
                      to="/dedicated-servers"
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                      onClick={() => setProductsOpen(false)}
                    >
                      Dedicated Servers
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link to="/pricing" className="text-gray-700 hover:text-blue-600 transition">
              Pricing
            </Link>
            <Link to="/solutions" className="text-gray-700 hover:text-blue-600 transition">
              Solutions
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition">
              Contact
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600">
                Home
              </Link>
              <Link to="/pricing" className="text-gray-700 hover:text-blue-600">
                Pricing
              </Link>
              <Link to="/dedicated-servers" className="text-gray-700 hover:text-blue-600">
                Dedicated Servers
              </Link>
              <Link to="/solutions" className="text-gray-700 hover:text-blue-600">
                Solutions
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600">
                Contact
              </Link>
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-blue-600">
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
