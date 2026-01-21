import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function TermsOfService() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-orange-600 mb-16 text-center">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none">
          <div className="mb-16">
            <p className="text-gray-300 mb-12 text-lg leading-relaxed text-center">
              By using our website and placing an order, you agree to the following terms:
            </p>
          </div>
          
          <div className="space-y-8">
            <ul className="space-y-8 text-gray-300">
              <li className="flex items-start p-6 bg-zinc-700 rounded-lg">
                <span className="text-orange-600 mr-4 text-2xl">•</span>
                <span className="text-lg">All prices are listed in PKR and are subject to change without prior notice.</span>
              </li>
              <li className="flex items-start p-6 bg-zinc-700 rounded-lg">
                <span className="text-orange-600 mr-4 text-2xl">•</span>
                <span className="text-lg">We reserve the right to cancel or refuse any order due to unavailability, pricing errors, or suspicious activity.</span>
              </li>
              <li className="flex items-start p-6 bg-zinc-700 rounded-lg">
                <span className="text-orange-600 mr-4 text-2xl">•</span>
                <span className="text-lg">Product colors may slightly vary due to lighting or screen resolution.</span>
              </li>
              <li className="flex items-start p-6 bg-zinc-700 rounded-lg">
                <span className="text-orange-600 mr-4 text-2xl">•</span>
                <span className="text-lg">Misuse of the website or fraudulent activities may result in account suspension.</span>
              </li>
              <li className="flex items-start p-6 bg-zinc-700 rounded-lg">
                <span className="text-orange-600 mr-4 text-2xl">•</span>
                <span className="text-lg">These terms are governed by the laws of Pakistan.</span>
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

export default TermsOfService;