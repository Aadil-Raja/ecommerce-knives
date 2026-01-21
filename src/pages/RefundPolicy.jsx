import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function RefundPolicy() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-orange-600 mb-16 text-center">Refund & Exchange Policy</h1>
        
        <div className="prose prose-invert max-w-none">
          <div className="mb-16">
            <p className="text-gray-300 mb-12 text-lg leading-relaxed text-center">
              We aim to ensure complete customer satisfaction. If you are not satisfied with your purchase, 
              you may request a refund or exchange under the following conditions:
            </p>
          </div>
          
          <div className="space-y-8">
            <ul className="space-y-8 text-gray-300">
              <li className="flex items-start p-6 bg-zinc-700 rounded-lg">
                <span className="text-orange-600 mr-4 text-2xl">•</span>
                <span className="text-lg">Refunds or exchanges are accepted within 7 days of delivery.</span>
              </li>
              <li className="flex items-start p-6 bg-zinc-700 rounded-lg">
                <span className="text-orange-600 mr-4 text-2xl">•</span>
                <span className="text-lg">Items must be unused, unwashed, and in original condition with tags and packaging intact.</span>
              </li>
              <li className="flex items-start p-6 bg-zinc-700 rounded-lg">
                <span className="text-orange-600 mr-4 text-2xl">•</span>
                <span className="text-lg">Sale or discounted items are non-refundable unless received damaged or incorrect.</span>
              </li>
              <li className="flex items-start p-6 bg-zinc-700 rounded-lg">
                <span className="text-orange-600 mr-4 text-2xl">•</span>
                <span className="text-lg">To request a refund or exchange, please contact us with your order number and reason.</span>
              </li>
              <li className="flex items-start p-6 bg-zinc-700 rounded-lg">
                <span className="text-orange-600 mr-4 text-2xl">•</span>
                <span className="text-lg">Refunds (if approved) will be processed to the original payment method within 7–10 working days.</span>
              </li>
              <li className="flex items-start p-6 bg-zinc-700 rounded-lg">
                <span className="text-orange-600 mr-4 text-2xl">•</span>
                <span className="text-lg">Shipping charges are non-refundable.</span>
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

export default RefundPolicy;