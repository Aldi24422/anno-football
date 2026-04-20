// src/pages/Players.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaFutbol, FaMapMarkerAlt, FaCalendarAlt, FaUserTie } from 'react-icons/fa';
import { SUPPORTED_LEAGUES, fetchTeams, fetchTeamById } from '../api/football';

export default function Players() {
  const [selectedLeague, setSelectedLeague] = useState(SUPPORTED_LEAGUES[0]);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTeams() {
      try {
        setLoading(true);
        const data = await fetchTeams(selectedLeague.code);
        setTeams(data);
        setError(null);
      } catch (err) {
        console.error('Gagal memuat tim:', err);
        setError('Gagal memuat data tim. Silakan refresh.');
      } finally {
        setLoading(false);
      }
    }
    loadTeams();
  }, [selectedLeague]);

  const handleTeamClick = async (team) => {
    try {
      const detailedTeam = await fetchTeamById(team.id);
      setSelectedTeam(detailedTeam || team);
    } catch (err) {
      console.error('Gagal memuat detail tim:', err);
      setSelectedTeam(team);
    }
  };

  const handleLeagueChange = (e) => {
    const newLeague = SUPPORTED_LEAGUES.find(l => l.code === e.target.value);
    setSelectedLeague(newLeague);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FaFutbol className="animate-bounce text-4xl text-blue-400 mx-auto mb-4" />
          <p className="text-gray-300">Memuat data tim {selectedLeague.name}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 py-12">
        <p className="text-xl mb-2">⚠️ {error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FaFutbol className="text-blue-400" /> Klub {selectedLeague.name}
        </h1>
        <select
          value={selectedLeague.code}
          onChange={handleLeagueChange}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
        >
          {SUPPORTED_LEAGUES.map(league => (
            <option key={league.code} value={league.code}>{league.name}</option>
          ))}
        </select>
      </div>

      {/* Grid Tim */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {teams.length === 0 ? (
          <p className="text-gray-400 col-span-full text-center py-8">Tidak ada tim tersedia.</p>
        ) : (
          teams.map((team) => (
            <motion.div
              key={team.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gray-800/40 backdrop-blur-md p-4 rounded-2xl border border-gray-700/50 cursor-pointer hover:bg-gray-700/50 transition-all"
              onClick={() => handleTeamClick(team)}
            >
              <div className="flex flex-col items-center text-center">
                <img 
                  src={team.crest} 
                  alt={team.name} 
                  className="w-20 h-20 object-contain mb-3"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/80?text=⚽'}
                />
                <h3 className="font-semibold text-sm">{team.shortName}</h3>
                <p className="text-xs text-gray-400 mt-1">{team.tla}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal Detail Tim + Skuad */}
      <AnimatePresence>
        {selectedTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTeam(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 shadow-2xl border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <img src={selectedTeam.crest} alt={selectedTeam.name} className="w-16 h-16 object-contain" />
                  <div>
                    <h2 className="text-2xl font-bold">{selectedTeam.name}</h2>
                    <p className="text-gray-400">{selectedTeam.venue}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTeam(null)} 
                  className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Info Singkat */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 text-sm">
                <div className="bg-gray-800/50 p-3 rounded-xl flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-xs">Didirikan</p>
                    <p className="font-medium">{selectedTeam.founded || '—'}</p>
                  </div>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-xl flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-400" />
                  <div>
                    <p className="text-gray-400 text-xs">Stadion</p>
                    <p className="font-medium truncate">{selectedTeam.venue || '—'}</p>
                  </div>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-xl flex items-center gap-2">
                  <FaUserTie className="text-green-400" />
                  <div>
                    <p className="text-gray-400 text-xs">Pelatih</p>
                    <p className="font-medium">{selectedTeam.coach?.name || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Daftar Pemain (Skuad) */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FaFutbol className="text-blue-400" /> Skuad {selectedTeam.shortName}
                </h3>
                {selectedTeam.squad && selectedTeam.squad.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedTeam.squad.map((player, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="w-6 text-center text-xs font-mono text-gray-500">{player.shirtNumber || '—'}</span>
                          <span className="font-medium text-sm">{player.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">{player.position}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Data skuad tidak tersedia untuk tim ini.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}