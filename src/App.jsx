function App() {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-zinc-950 via-black to-zinc-900">
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
      
      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
        
        {/* Hero Section */}
        <div className="w-full max-w-6xl mx-auto text-center mb-12">
          <h1 className="text-8xl md:text-9xl lg:text-[12rem] font-black tracking-tight text-white mb-8 leading-none drop-shadow-2xl">
            COMING<br/>SOON
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-8"></div>
          <p className="text-2xl md:text-3xl font-light tracking-widest text-gray-300 mb-3">
            PREMIUM KNIVES
          </p>
          <p className="text-lg md:text-xl text-gray-500 tracking-wide">
            Crafted for Precision. Built for Excellence.
          </p>
        </div>

        {/* Small Knife Image */}
        <div className="w-full max-w-md mx-auto">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-zinc-900/50 backdrop-blur-sm rounded-lg p-6 border border-zinc-800">
              <img 
                src="/knives-bg.jpg" 
                alt="Premium Knife" 
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
