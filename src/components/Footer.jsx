import { Link } from 'react-router-dom';
import { useState } from 'react';
import { newsletterAPI } from '../services/newsletterAPI';

function Footer() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage('Please enter your email address');
      setMessageType('error');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const result = await newsletterAPI.subscribe(email);
      setMessage(result.message);
      setMessageType('success');
      setEmail(''); // Clear the form on success
    } catch (error) {
      setMessage(error.message || 'Failed to subscribe. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div>
            <img src="/footer-logo.png" alt="Sharp Lab by Owais" className="h-16 w-auto mb-4" />
            <p className="text-gray-400 text-sm">
              Premium knives crafted for precision. Excellence in every blade.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/home" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Contact</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Email: sharplabbyowais@gmail.com</li>
              <li>Phone: 03311339541</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-gray-400 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 text-sm"
                  disabled={isLoading}
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded transition-colors text-sm uppercase tracking-wider"
              >
                {isLoading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>

            {/* Message Display */}
            {message && (
              <div className={`mt-3 text-sm ${
                messageType === 'success' 
                  ? 'text-green-400' 
                  : 'text-red-400'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Sharp Lab by <span className="text-orange-600">OWAIS</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
