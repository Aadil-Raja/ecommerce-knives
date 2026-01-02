import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function About() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-8">About Sharp Lab</h1>
          
          <div className="space-y-6 text-gray-300">
            <p className="text-lg leading-relaxed">
              Sharp Lab by Owais is a premium knife manufacturer dedicated to creating exceptional cutting tools 
              for professional chefs, butchers, and culinary enthusiasts. Our journey began with a simple mission: 
              to craft knives that combine traditional craftsmanship with modern precision.
            </p>

            <h2 className="text-3xl font-semibold text-white mt-12 mb-4">Our Story</h2>
            <p className="text-lg leading-relaxed">
              Founded by master craftsman Owais, Sharp Lab represents decades of experience in blade making. 
              Each knife is a testament to our commitment to quality, precision, and the art of knife making. 
              We believe that a great knife is more than just a tool—it's an extension of the chef's hand.
            </p>

            <h2 className="text-3xl font-semibold text-white mt-12 mb-4">Our Process</h2>
            <p className="text-lg leading-relaxed">
              Every Sharp Lab knife undergoes a meticulous manufacturing process. From selecting the finest 
              steel to hand-finishing each blade, we ensure that every knife meets our exacting standards. 
              Our blades are heat-treated for optimal hardness and edge retention, then carefully sharpened 
              to razor-sharp perfection.
            </p>

            <h2 className="text-3xl font-semibold text-white mt-12 mb-4">Why Choose Us</h2>
            <p className="text-lg leading-relaxed">
              When you choose Sharp Lab, you're choosing knives that will last a lifetime. We use only 
              premium materials, employ traditional techniques combined with modern technology. Our knives are trusted by professional chefs and 
              home cooks alike for their exceptional performance and durability.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default About;
