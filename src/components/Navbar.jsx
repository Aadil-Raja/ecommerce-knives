import { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const categories = [
    { name: 'Chef Knives', path: '/category/chef-knives' },
    { name: 'Butcher Knives', path: '/category/butcher-knives' },
    { name: 'Kitchen Knives', path: '/category/kitchen-knives' },
    { name: 'Hunting Knives', path: '/category/hunting-knives' },
  ];

  return (
    <nav className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="Sharp Lab by Owais" className="h-12 w-auto" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/home" className="text-gray-300 hover:text-white transition-colors text-sm uppercase tracking-wider">
              Home
            </Link>
            
            {/* Category Dropdown */}
            <div className="relative group">
              <button className="text-gray-300 hover:text-white transition-colors text-sm uppercase tracking-wider flex items-center gap-1">
                Category Knives
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className="absolute top-full left-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {categories.map((category) => (
                  <Link
                    key={category.path}
                    to={category.path}
                    className="block px-4 py-3 text-gray-300 hover:bg-zinc-800 hover:text-white transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link to="/about" className="text-gray-300 hover:text-white transition-colors text-sm uppercase tracking-wider">
              About Us
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-300 hover:text-white"
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
              className="block py-2 text-gray-300 hover:text-white transition-colors text-sm uppercase tracking-wider"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full text-left py-2 text-gray-300 hover:text-white transition-colors text-sm uppercase tracking-wider flex items-center justify-between"
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
                    className="block py-2 text-gray-400 hover:text-white transition-colors text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}

            <Link
              to="/about"
              className="block py-2 text-gray-300 hover:text-white transition-colors text-sm uppercase tracking-wider"
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
