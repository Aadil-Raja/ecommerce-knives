import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { cart } = useCart();

  const categories = [
    { name: 'Chef Knives', path: '/category/chef-knives' },
    { name: 'Butcher Knives', path: '/category/butcher-knives' },
    { name: 'Kitchen Knives', path: '/category/kitchen-knives' },
    { name: 'Hunting Knives', path: '/category/hunting-knives' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="Sharp Lab by Owais" className="h-12 w-auto brightness-0" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/home" className="text-gray-700 hover:text-gray-900 transition-colors text-sm uppercase tracking-wider">
              Home
            </Link>
            
            {/* Category Dropdown */}
            <div className="relative group">
              <button className="text-gray-700 hover:text-gray-900 transition-colors text-sm uppercase tracking-wider flex items-center gap-1">
                Category Knives
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {categories.map((category) => (
                  <Link
                    key={category.path}
                    to={category.path}
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors first:rounded-t last:rounded-b"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link to="/about" className="text-gray-700 hover:text-gray-900 transition-colors text-sm uppercase tracking-wider">
              About Us
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" className="relative text-gray-700 hover:text-gray-900 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cart.totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <Link
              to="/home"
              className="block py-2 text-gray-700 hover:text-gray-900 transition-colors text-sm uppercase tracking-wider"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full text-left py-2 text-gray-700 hover:text-gray-900 transition-colors text-sm uppercase tracking-wider flex items-center justify-between"
            >
              Category Knives
              <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isDropdownOpen && (
              <div className="pl-4 space-y-2 mt-2">
                {categories.map((category) => (
                  <Link
                    key={category.path}
                    to={category.path}
                    className="block py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}

            <Link
              to="/about"
              className="block py-2 text-gray-700 hover:text-gray-900 transition-colors text-sm uppercase tracking-wider"
              onClick={() => setIsOpen(false)}
            >
              About Us
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
