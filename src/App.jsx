// src/App.jsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Players from './pages/Players';
// import Matches from './pages/Matches'; // Matches dinonaktifkan sementara

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/players" element={<Layout><Players /></Layout>} />
        {/* <Route path="/matches" element={<Layout><Matches /></Layout>} /> */}
      </Routes>
    </AnimatePresence>
  );
}

export default App;