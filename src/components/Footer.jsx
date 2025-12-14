import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/config';

function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand */}
          <div>
            <img src={getImageUrl('logo.png')} alt="Sharp Lab by Owais" className="h-16 w-auto mb-4" />
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
              <li>Email: info@sharplabbyowais.com</li>
              <li>Phone: +92-312-1078541</li>
            </ul>
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
