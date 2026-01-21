import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-orange-600 mb-16 text-center">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none">
          <div className="mb-16">
            <p className="text-gray-300 mb-12 text-lg leading-relaxed text-center">
              Your privacy is important to us. We are committed to protecting your personal information.
            </p>
          </div>
          
          <div className="space-y-8">
            <ul className="space-y-8 text-gray-300">
              <li className="flex items-start p-6 bg-zinc-700 rounded-lg">
                <span className="text-orange-600 mr-4 text-2xl">•</span>
                <span className="text-lg">We collect information such as name, contact number, address, and email for order processing.</span>
              </li>
              <li className="flex items-start p-6 bg-zinc-700 rounded-lg">
                <span className="text-orange-600 mr-4 text-2xl">•</span>
                <span className="text-lg">Your data is used only to fulfill orders, provide customer support, and improve our services.</span>
              </li>
              <li className="flex items-start p-6 bg-zinc-700 rounded-lg">
                <span className="text-orange-600 mr-4 text-2xl">•</span>
                <span className="text-lg">We do not sell or share your personal information with third parties, except delivery partners when required.</span>
              </li>
              <li className="flex items-start p-6 bg-zinc-700 rounded-lg">
                <span className="text-orange-600 mr-4 text-2xl">•</span>
                <span className="text-lg">Secure measures are in place to protect your data.</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="h-32"></div>
      </main>
      
      <Footer />
    </div>
  );
}

export default PrivacyPolicy;