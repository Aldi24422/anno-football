import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchMatches, SUPPORTED_LEAGUES } from '../api/football';
import { FaFutbol, FaCalendarAlt } from 'react-icons/fa';

export default function Matches() {
  const [selectedLeague, setSelectedLeague] = useState(SUPPORTED_LEAGUES[0]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMatches(selectedLeague.code);
        setMatches(data);
      } catch (err) {
        console.error('Gagal memuat jadwal:', err);
        setError('Gagal memuat data pertandingan. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [selectedLeague]);

  const handleLeagueChange = (e) => {
    const newLeague = SUPPORTED_LEAGUES.find(l => l.code === e.target.value);
    setSelectedLeague(newLeague);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FaCalendarAlt className="text-blue-400" />
          Jadwal & Hasil
        </h1>
        <select
          value={selectedLeague.code}
          onChange={handleLeagueChange}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 outline-none w-full sm:w-auto"
        >
          {SUPPORTED_LEAGUES.map(league => (
            <option key={league.code} value={league.code}>{league.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <FaFutbol className="animate-spin text-4xl text-blue-400 mx-auto mb-4" />
            <p className="text-gray-300">Memuat jadwal {selectedLeague.name}...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center text-red-400 py-10">
          <p>{error}</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center text-gray-400 py-10">
          <p>Belum ada data pertandingan untuk {selectedLeague.name}.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg text-gray-400 font-semibold mb-4">
             20 Pertandingan Terdekat (Selesai & Akan Datang)
          </h2>
          {matches.map((match) => (
            <motion.div 
              key={match.id} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className={`backdrop-blur-md p-5 rounded-2xl border flex flex-wrap items-center justify-between ${
                match.status === 'FINISHED' 
                  ? 'bg-gray-800/40 border-gray-700/50' 
                  : 'bg-blue-900/20 border-blue-800/40'
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-6 w-full sm:w-auto justify-between sm:justify-start mb-4 sm:mb-0">
                <div className="text-right sm:w-32 flex-1">
                  <p className="font-semibold text-sm sm:text-base">{match.home}</p>
                </div>
                
                <div className="flex flex-col items-center justify-center px-4">
                  <div className={`text-xl sm:text-2xl font-bold ${match.status === 'FINISHED' ? 'text-blue-400' : 'text-gray-300'}`}>
                    {match.score}
                  </div>
                  {match.status === 'IN_PLAY' || match.status === 'PAUSED' ? (
                     <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full mt-1 animate-pulse">LIVE</span>
                  ) : match.status !== 'FINISHED' ? (
                     <span className="text-[10px] text-gray-500 mt-1 uppercase">{match.status}</span>
                  ) : null}
                </div>

                <div className="text-left sm:w-32 flex-1">
                  <p className="font-semibold text-sm sm:text-base">{match.away}</p>
                </div>
              </div>
              
              <div className="text-gray-400 text-xs sm:text-sm text-center sm:text-right w-full sm:w-auto">
                <div className="flex items-center justify-center sm:justify-end gap-1">
                  <FaCalendarAlt className="inline opacity-60" /> {match.date}
                </div>
                <div className="mt-1">{match.time} WIB</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}