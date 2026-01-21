import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function ContactUs() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-orange-600 mb-16 text-center">Contact Us</h1>
        
        <div className="prose prose-invert max-w-none">
          <div className="mb-16">
            <p className="text-gray-300 mb-12 text-lg leading-relaxed text-center">
              If you have any questions or concerns regarding our policies or your order, feel free to contact us:
            </p>
          </div>
          
          <div className="space-y-12">
            <div className="bg-zinc-700 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold text-orange-600 mb-8 text-center">Get in Touch</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <span className="text-orange-600 font-semibold mr-4 text-lg">Email:</span>
                  <a href="mailto:sharplabbyowais@gmail.com" className="text-gray-300 hover:text-white transition-colors text-lg">
                    sharplabbyowais@gmail.com
                  </a>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-orange-600 font-semibold mr-4 text-lg">WhatsApp/Phone:</span>
                  <a href="tel:+923311339541" className="text-gray-300 hover:text-white transition-colors text-lg">
                    92-331-1339541
                  </a>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-orange-600 font-semibold mr-4 text-lg">Working Hours:</span>
                  <span className="text-gray-300 text-lg">Monday to Saturday, 10:00 AM – 7:00 PM</span>
                </div>
              </div>
            </div>
            
            <div className="text-center py-12">
              <p className="text-gray-300 text-xl">
                We are always happy to assist you.
              </p>
            </div>
          </div>
        </div>
        
        <div className="h-32"></div>
      </main>
      
      <Footer />
    </div>
  );
}

export default ContactUs;