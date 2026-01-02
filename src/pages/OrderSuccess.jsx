import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function OrderSuccess() {
  const { orderId } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white border border-gray-200 rounded-lg p-12">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your order. We'll contact you shortly to confirm your delivery details.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded p-6 mb-8">
              <p className="text-sm text-gray-600 mb-2">Your Order ID</p>
              <p className="text-2xl font-bold text-orange-600">#{orderId}</p>
            </div>

            <div className="space-y-4 text-left mb-8">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-orange-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900">Order Confirmation</p>
                  <p className="text-sm text-gray-600">We'll call you to confirm your order details</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-orange-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900">Packaging</p>
                  <p className="text-sm text-gray-600">Your order will be carefully packaged</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-orange-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900">Delivery</p>
                  <p className="text-sm text-gray-600">Delivered to your doorstep within 3-5 business days</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-orange-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900">Pay via EasyPaisa</p>
                  <p className="text-sm text-gray-600">Muhammad Awais Raza: 03311339541</p>
                  <p className="text-sm text-gray-600">Send payment and share screenshot for confirmation</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/home"
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded font-semibold transition-colors"
              >
                Continue Shopping
              </Link>
              <Link
                to="/home"
                className="flex-1 border-2 border-orange-600 text-orange-600 hover:bg-orange-50 py-3 rounded font-semibold transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default OrderSuccess;
