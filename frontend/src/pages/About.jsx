import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaUsers, FaGlobe, FaCubes, FaRocket } from 'react-icons/fa'

export default function About() {
  return (
    <div className="bg-dark-primary text-gray-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32 bg-dark-secondary">
        <div className="absolute inset-0">
          <img 
            src="/tesseract_hero.png" 
            alt="Tesseract Abstract" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-primary via-transparent to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl mb-6">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary">Tesseract Labs</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300">
            Redefining manufacturing by making 3D printing simple, fast, and accessible to everyone.
          </p>
        </div>
      </section>

      {/* Intro & Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 text-lg text-gray-300">
              <p>
                We are an automated, on-demand digital fabrication platform that enables users to turn their ideas into physical products with just a few clicks. By combining intelligent software with advanced 3D printing infrastructure, we eliminate the complexity of traditional manufacturing processes.
              </p>
              <p>
                At Tesseract Labs, users can upload their 3D designs, receive instant pricing, and get high-quality printed products delivered directly to their doorstep. Our system is built to handle everything—from file processing and optimization to production and logistics—ensuring a seamless end-to-end experience.
              </p>
              <p>
                We aim to empower students, startups, engineers, and innovators by providing affordable and scalable access to rapid prototyping and small-scale manufacturing. Whether it's a college project, a startup prototype, or a custom product, Tesseract Labs bridges the gap between digital design and real-world creation.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl relative">
              <img 
                src="/farm_hero.png" 
                alt="Automated 3D Printing Farm" 
                className="w-full h-full object-cover border border-dark-border rounded-2xl transition-transform hover:scale-105 duration-700" 
              />
              <div className="absolute inset-0 border border-accent-primary/20 rounded-2xl pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Statistics section */}
      <section className="py-20 bg-dark-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <FaGlobe className="text-5xl text-accent-secondary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-6 text-white">Our Vision</h2>
            <p className="text-lg text-gray-300">
              To build a distributed digital manufacturing network, where production is automated, efficient, and accessible globally—transforming how products are designed, prototyped, and manufactured.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
            <div className="p-8 rounded-2xl bg-dark-tertiary border border-dark-border">
              <FaCubes className="text-4xl text-accent-primary mx-auto mb-4" />
              <div className="text-4xl font-black text-white mb-2">99%</div>
              <p className="text-gray-400">Print Success Rate</p>
            </div>
            <div className="p-8 rounded-2xl bg-dark-tertiary border border-dark-border">
              <FaRocket className="text-4xl text-accent-secondary mx-auto mb-4" />
              <div className="text-4xl font-black text-white mb-2">2-5 Days</div>
              <p className="text-gray-400">Global Turnaround</p>
            </div>
            <div className="p-8 rounded-2xl bg-dark-tertiary border border-dark-border">
              <FaUsers className="text-4xl text-accent-primary mx-auto mb-4" />
              <div className="text-4xl font-black text-white mb-2">24/7</div>
              <p className="text-gray-400">Automated Production</p>
            </div>
          </div>
        </div>
      </section>

      {/* Network Scale / Simple Graph Visualization */}
      <section className="py-20 border-b border-dark-border">
           <div className="container mx-auto px-4 text-center max-w-5xl">
            <h2 className="text-3xl font-bold mb-12 text-white">Production Automation Model</h2>
            
            <div className="bg-dark-tertiary p-8 border border-dark-border rounded-xl">
               <div className="flex flex-col sm:flex-row items-end justify-between space-y-8 sm:space-y-0 sm:space-x-4 h-64 pb-8 border-b-2 border-dark-border relative">
                  <div className="absolute left-0 top-0 h-full w-px bg-dark-border"></div>
                  {/* Bars */}
                  <div className="flex-1 flex flex-col items-center justify-end group h-full">
                      <div className="w-16 sm:w-20 bg-blue-500/80 rounded-t-lg transition-all duration-500 group-hover:bg-blue-400" style={{height: '35%'}}></div>
                      <span className="mt-4 text-sm font-semibold text-gray-400 whitespace-nowrap">File Analysis</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-end group h-full">
                      <div className="w-16 sm:w-20 bg-indigo-500/80 rounded-t-lg transition-all duration-500 group-hover:bg-indigo-400" style={{height: '55%'}}></div>
                      <span className="mt-4 text-sm font-semibold text-gray-400 whitespace-nowrap">Auto-Fix</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-end group h-full">
                      <div className="w-16 sm:w-20 bg-purple-500/80 rounded-t-lg transition-all duration-500 group-hover:bg-purple-400" style={{height: '95%'}}></div>
                      <span className="mt-4 text-sm font-semibold text-gray-400 whitespace-nowrap">Production</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-end group h-full">
                      <div className="w-16 sm:w-20 bg-pink-500/80 rounded-t-lg transition-all duration-500 group-hover:bg-pink-400" style={{height: '70%'}}></div>
                      <span className="mt-4 text-sm font-semibold text-gray-400 whitespace-nowrap">Logistics</span>
                  </div>
               </div>
               <p className="mt-6 text-gray-400 italic font-medium">Seamless scaling and end-to-end efficiency managed by intelligent software.</p>
            </div>
           </div>
      </section>

      {/* Founders Section */}
      <section className="py-24 bg-dark-primary">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-dark-secondary p-12 rounded-3xl border border-dark-border text-center">
             <h2 className="text-3xl lg:text-4xl font-bold mb-12 text-white">Founders & Developers</h2>
             <div className="grid md:grid-cols-2 gap-12">
               <div className="group space-y-2">
                  <div className="w-24 h-24 bg-accent-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent-primary/20 group-hover:border-accent-primary transition-all">
                    <FaUsers className="text-3xl text-accent-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-accent-primary transition-colors">Jash Kapadia</h3>
                  <p className="text-gray-400 font-medium">Co-Founder & Lead Engineer</p>
               </div>
               <div className="group space-y-2">
                  <div className="w-24 h-24 bg-accent-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent-secondary/20 group-hover:border-accent-secondary transition-all">
                    <FaUsers className="text-3xl text-accent-secondary" />
                  </div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-accent-secondary transition-colors">Devansh Khatri</h3>
                  <p className="text-gray-400 font-medium">Co-Founder & Lead Developer</p>
               </div>
             </div>
             <p className="mt-16 text-gray-500 text-lg leading-relaxed border-t border-dark-border pt-12 max-w-2xl mx-auto">
               Driven by the need to simplify modern manufacturing, the team is dedicated to breaking down barriers between powerful engineering tools and accessible production hardware.
             </p>
          </div>
        </div>
      </section>
    </div>
  )
}
