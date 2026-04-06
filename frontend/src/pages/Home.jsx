import { Link } from 'react-router-dom'
import { FaUpload, FaCube, FaDollarSign, FaWhatsapp, FaCheckCircle } from 'react-icons/fa'
import LiquidEther from '../components/LiquidEther'

export default function Home() {
  return (
    <div className="relative">
      {/* Continuous Background Animation */}
      <div className="fixed inset-0 z-0">
        <LiquidEther
          mouseForce={18}
          cursorSize={100}
          isViscous={false}
          viscous={45}
          colors={["#FF9FFC", "#B19EEF", "#27adb0"]}
          autoDemo
          autoSpeed={0.5}
          autoIntensity={2.2}
          isBounce={false}
          resolution={0.4}
        />
        <div className="absolute inset-0 bg-dark-bg/40"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 via-transparent to-accent-secondary/10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-accent-primary via-blue-400 to-accent-secondary bg-clip-text text-transparent">
                3D Printing Farm
              </h1>
              <p className="text-xl lg:text-2xl text-gray-300 mb-8">
                Upload your 3D files, get instant quotes, and bring your ideas to life
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/upload" className="btn-primary text-lg inline-flex items-center justify-center space-x-2">
                  <FaUpload />
                  <span>Upload 3D Model</span>
                </Link>
                <Link to="/orders" className="btn-secondary text-lg inline-flex items-center justify-center space-x-2">
                  <span>View Orders</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-dark-secondary/10 backdrop-blur-sm border-y border-white/5">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
              How It Works
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<FaUpload className="text-4xl text-accent-primary" />}
                title="Upload Model"
                description="Upload your 3D model in STL, OBJ, STEP or 3MF format"
                step="1"
              />
              <FeatureCard
                icon={<FaCube className="text-4xl text-accent-primary" />}
                title="Preview & Analyze"
                description="View your model in 3D and get instant analysis"
                step="2"
              />
              <FeatureCard
                icon={<FaDollarSign className="text-4xl text-accent-primary" />}
                title="Get Quote"
                description="Receive automatic price calculation based on volume"
                step="3"
              />
              <FeatureCard
                icon={<FaCheckCircle className="text-4xl text-accent-primary" />}
                title="Pay or Chat"
                description="Pay via Razorpay or send order via WhatsApp"
                step="4"
              />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
              Why Choose Tesseract Labs?
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <BenefitCard
                title="Instant Quotes"
                description="Get automatic price calculations based on material volume and print time"
              />
              <BenefitCard
                title="3D Preview"
                description="View your model in the browser with our interactive Three.js viewer"
              />
              <BenefitCard
                title="Flexible Payment"
                description="Pay online via Razorpay or coordinate via WhatsApp"
              />
              <BenefitCard
                title="Fast Turnaround"
                description="Quick processing and efficient printing for your projects"
              />
              <BenefitCard
                title="Quality Prints"
                description="High-quality FDM printing with PLA and other materials"
              />
              <BenefitCard
                title="Transparent Pricing"
                description="Clear breakdown of material, machine time, and handling costs"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}


function FeatureCard({ icon, title, description, step }) {
  return (
    <div className="card relative hover:border-accent-primary transition-all">
      <div className="absolute -top-4 -left-4 w-12 h-12 bg-accent-primary rounded-full flex items-center justify-center text-xl font-bold">
        {step}
      </div>
      <div className="flex flex-col items-center text-center space-y-4">
        {icon}
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  )
}

function BenefitCard({ title, description }) {
  return (
    <div className="card hover:border-accent-primary transition-all">
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}
