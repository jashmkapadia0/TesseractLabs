import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Orders from './pages/Orders'
import About from './pages/About'
import Contact from './pages/Contact'

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <footer className="bg-dark-secondary border-t border-dark-border py-6 mt-auto">
          <div className="container mx-auto px-4 text-center text-gray-400">
            <p>&copy; 2026 Tesseract Labs. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
