import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-orange-600 mb-16 text-center">Shipping Policy</h1>
        
        <div className="prose prose-invert max-w-none">
          <div className="space-y-8">
            <ul className="space-y-8 text-gray-300">
              <li className="flex items-start p-6 bg-zinc-700 rounded-lg">
                <span className="text-orange-600 mr-4 text-2xl">•</span>
                <span className="text-lg">We currently ship across Pakistan through reliable courier partners.</span>
              </li>
              <li className="flex items-start p-6 bg-zinc-700 rounded-lg">
                <span className="text-orange-600 mr-4 text-2xl">•</span>
                <span className="text-lg">Orders are processed within 1–2 working days after confirmation.</span>
              </li>
              <li className="flex items-start p-6 bg-zinc-700 rounded-lg">
                <span className="text-orange-600 mr-4 text-2xl">•</span>
                <span className="text-lg">Standard delivery time is 3–5 working days, depending on location.</span>
              </li>
              <li className="flex items-start p-6 bg-zinc-700 rounded-lg">
                <span className="text-orange-600 mr-4 text-2xl">•</span>
                <span className="text-lg">Shipping charges (if any) are calculated at checkout.</span>
              </li>
              <li className="flex items-start p-6 bg-zinc-700 rounded-lg">
                <span className="text-orange-600 mr-4 text-2xl">•</span>
                <span className="text-lg">Cash on Delivery (COD) is available in selected areas.</span>
              </li>
              <li className="flex items-start p-6 bg-zinc-700 rounded-lg">
                <span className="text-orange-600 mr-4 text-2xl">•</span>
                <span className="text-lg">We are not responsible for delays caused by courier services, weather, or unforeseen circumstances.</span>
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

export default ShippingPolicy;