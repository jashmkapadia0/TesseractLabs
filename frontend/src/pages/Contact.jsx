import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa'

export default function Contact() {
  return (
    <div className="bg-dark-primary min-h-screen text-gray-200 py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-white">Contact Us</h1>
            <p className="text-xl text-gray-400">Have questions or need a custom quote? We're here to help.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="card border-accent-primary/20 hover:border-accent-primary transition-all">
                <div className="flex items-start space-x-4">
                  <div className="p-4 bg-accent-primary/10 rounded-xl">
                    <FaEnvelope className="text-2xl text-accent-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Email</h3>
                    <a href="mailto:tesseractlabs0@gmail.com" className="text-gray-400 hover:text-accent-primary transition-colors text-lg">
                      tesseractlabs0@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="card border-accent-secondary/20 hover:border-accent-secondary transition-all">
                <div className="flex items-start space-x-4">
                  <div className="p-4 bg-accent-secondary/10 rounded-xl">
                    <FaPhone className="text-2xl text-accent-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Phone</h3>
                    <a href="tel:+917069315037" className="text-gray-400 hover:text-accent-secondary transition-colors text-lg">
                      +91 7069315037
                    </a>
                  </div>
                </div>
              </div>

              <div className="card border-accent-primary/20 hover:border-accent-primary transition-all">
                <div className="flex items-start space-x-4">
                  <div className="p-4 bg-accent-primary/10 rounded-xl">
                    <FaMapMarkerAlt className="text-2xl text-accent-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Location</h3>
                    <p className="text-gray-400 text-lg leading-relaxed">
                      Opposite pith no sutharwado,<br />
                      Near lions club, pith bajar,<br />
                      Khambhat - 388620,<br />
                      Gujarat, India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="card bg-dark-secondary flex flex-col items-center justify-center text-center p-12 border-accent-success/20 hover:border-accent-success transition-all">
              <div className="p-6 bg-accent-success/10 rounded-full mb-8">
                <FaWhatsapp className="text-6xl text-accent-success" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Instant Chat</h2>
              <p className="text-gray-400 mb-8 text-lg">
                The fastest way to get in touch with us is via WhatsApp.
              </p>
              <a
                href={`https://wa.me/917069315037`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-success w-full py-4 text-xl flex items-center justify-center space-x-2 shadow-lg shadow-accent-success/20"
              >
                <FaWhatsapp className="text-2xl" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
