import { Link, useLocation } from 'react-router-dom'
import { FaCube, FaUpload, FaList } from 'react-icons/fa'

export default function Navbar() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-dark-secondary/80 border-b border-dark-border/50 sticky top-0 z-50 backdrop-blur-xl shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
            <FaCube className="text-accent-primary text-2xl" />
            <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
              Tesseract Labs
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg transition-all ${
                isActive('/')
                  ? 'bg-accent-primary text-white'
                  : 'hover:bg-dark-tertiary text-gray-300'
              }`}
            >
              Home
            </Link>
            <Link
              to="/upload"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/upload')
                  ? 'bg-accent-primary text-white'
                  : 'hover:bg-dark-tertiary text-gray-300'
              }`}
            >
              <FaUpload />
              <span>Upload</span>
            </Link>
            <Link
              to="/orders"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/orders')
                  ? 'bg-accent-primary text-white'
                  : 'hover:bg-dark-tertiary text-gray-300'
              }`}
            >
              <FaList />
              <span>Orders</span>
            </Link>
            <Link
              to="/about"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/about')
                  ? 'bg-accent-primary text-white'
                  : 'hover:bg-dark-tertiary text-gray-300'
              }`}
            >
              <span>About</span>
            </Link>
            <Link
              to="/contact"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/contact')
                  ? 'bg-accent-primary text-white'
                  : 'hover:bg-dark-tertiary text-gray-300'
              }`}
            >
              <span>Contact Us</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
