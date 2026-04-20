import { matches } from '../data/mockData';
import { motion } from 'framer-motion';

export default function Matches() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">📅 Jadwal & Hasil</h1>
      <div className="space-y-4">
        {matches.map((match) => (
          <motion.div key={match.id} initial={{ opacity:0 }} animate={{ opacity:1 }} className="bg-gray-800/40 backdrop-blur-md p-5 rounded-2xl border border-gray-700/50 flex flex-wrap items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-right w-28">
                <p className="font-semibold">{match.home}</p>
              </div>
              <div className="text-2xl font-bold text-blue-400">{match.score}</div>
              <div className="text-left w-28">
                <p className="font-semibold">{match.away}</p>
              </div>
            </div>
            <div className="text-gray-400 text-sm">
              {match.date} • {match.time} WIB
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}