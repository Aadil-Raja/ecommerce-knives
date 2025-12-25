import { getImageUrl } from '../utils/config';

function ComingSoon() {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-zinc-950 via-neutral-900 to-zinc-950 flex flex-col">
      
      {/* Logo at Top Center */}
      <div className="w-full flex justify-center pt-8 md:pt-12 mb-auto">
        <img 
          src="/logo.png" 
          alt="Sharp Lab by Owais" 
          className="h-20 md:h-28 w-auto"
        />
      </div>

      {/* Main Content - Left Text, Right Image */}
      <div className="flex-1 flex items-center justify-center px-6 md:px-12 lg:px-20 py-12">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Side - Text Content */}
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-tight">
              Coming<br/>
              <span className="text-orange-600">Soon</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-400 leading-relaxed">
              Excellence in craftsmanship. Premium butcher and chef knives that redefine precision.
            </p>
            <div className="flex items-center gap-4 justify-center lg:justify-start pt-4">
              <div className="h-px w-12 bg-orange-600"></div>
              <p className="text-sm md:text-base text-gray-500 uppercase tracking-wider">
                Launching Soon
              </p>
              <div className="h-px w-12 bg-orange-600"></div>
            </div>
          </div>

          {/* Right Side - Knife Image */}
          <div className="relative">
            <div className="relative bg-black/40 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-zinc-800">
              <img 
                src={getImageUrl('knives-bg.jpg')} 
                alt="Premium Knife" 
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Brand Name */}
      <div className="w-full text-center pb-8 md:pb-12 mt-auto">
        <p className="text-base md:text-lg text-gray-500">
          Sharp Lab by <span className="text-orange-600 font-semibold">OWAIS</span>
        </p>
      </div>

    </div>
  );
}

export default ComingSoon;
