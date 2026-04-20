import { Link, useLocation } from 'react-router-dom';
import { FaFutbol, FaChartBar, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/', label: 'Dashboard', icon: <FaChartBar /> },
  { path: '/players', label: 'Pemain', icon: <FaUsers /> },
  { path: '/matches', label: 'Pertandingan', icon: <FaCalendarAlt /> },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white">
      {/* Header Glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-gray-900/50 border-b border-gray-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-2xl font-bold">
            <FaFutbol className="text-blue-400 text-3xl" />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              ANNO FOOTBALL
            </span>
          </Link>
          
          {/* Navigasi */}
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  location.pathname === item.path
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'hover:bg-gray-800 text-gray-300'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Konten Utama dengan animasi masuk */}
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-8"
      >
        {children}
      </motion.main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-6 text-center text-gray-500 text-sm">
        © 2026 Anno Football — Data Ilustrasi Portofolio UI
      </footer>
    </div>
  );
}