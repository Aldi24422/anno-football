import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { FaFutbol, FaChartBar, FaTrophy } from 'react-icons/fa';
import { fetchStandings, fetchScorers, SUPPORTED_LEAGUES } from '../api/football';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [selectedLeague, setSelectedLeague] = useState(SUPPORTED_LEAGUES[0]);
  const [standings, setStandings] = useState([]);
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cache, setCache] = useState({});

  // Metrik yang dipilih untuk grafik
  const [selectedMetric, setSelectedMetric] = useState('pts');

  const metrics = [
    { value: 'pts', label: 'Poin' },
    { value: 'goalDifference', label: 'Selisih Gol' },
    { value: 'gf', label: 'Gol Memasukkan' },
    { value: 'ga', label: 'Gol Kemasukan' },
    { value: 'win', label: 'Menang' },
    { value: 'loss', label: 'Kalah' },
    { value: 'played', label: 'Pertandingan' },
  ];

  useEffect(() => {
    const loadData = async () => {
      if (cache[selectedLeague.code]) {
        const cached = cache[selectedLeague.code];
        setStandings(cached.standings);
        setScorers(cached.scorers);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [standingsData, scorersData] = await Promise.all([
          fetchStandings(selectedLeague.code),
          fetchScorers(selectedLeague.code)
        ]);
        setStandings(standingsData);
        setScorers(scorersData);
        setCache(prev => ({
          ...prev,
          [selectedLeague.code]: { standings: standingsData, scorers: scorersData }
        }));
      } catch (err) {
        console.error('Gagal memuat data:', err);
        setError('Gagal memuat data. Silakan coba lagi.');
        setStandings([]);
        setScorers([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedLeague, cache]);

  const handleLeagueChange = (e) => {
    const newLeague = SUPPORTED_LEAGUES.find(l => l.code === e.target.value);
    setSelectedLeague(newLeague);
  };

  // Statistik ringkasan
  const totalGoals = standings.reduce((sum, t) => sum + t.gf, 0);
  const totalMatches = standings.reduce((sum, t) => sum + t.played, 0) / 2;
  const avgGoalsPerMatch = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(2) : '0.00';
  const topTeam = standings.length > 0 ? standings[0] : null;

  // Data grafik berdasarkan metrik yang dipilih (10 tim teratas)
  const chartLabels = standings.slice(0, 10).map(t => t.team);
  const chartDataValues = standings.slice(0, 10).map(t => {
    switch (selectedMetric) {
      case 'pts': return t.pts;
      case 'goalDifference': return t.goalDifference || (t.gf - t.ga);
      case 'gf': return t.gf;
      case 'ga': return t.ga;
      case 'win': return t.win;
      case 'loss': return t.loss;
      case 'played': return t.played;
      default: return 0;
    }
  });

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: metrics.find(m => m.value === selectedMetric)?.label,
        data: chartDataValues,
        backgroundColor: 'rgba(56, 189, 248, 0.7)',
        borderColor: '#38bdf8',
        borderWidth: 1,
        borderRadius: 6,
      }
    ]
  };

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        grid: { color: '#334155' },
        ticks: { color: '#9ca3af' }
      },
      y: {
        grid: { display: false },
        ticks: { color: '#e5e7eb' }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <FaFutbol className="animate-bounce text-4xl text-blue-400 mx-auto mb-4" />
          <p className="text-gray-300">Memuat data {selectedLeague.name}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center text-red-400">
          <p className="text-xl mb-2">⚠️ {error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Pemilih Liga */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FaChartBar className="text-blue-400" />
          Dashboard Klasemen
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

      {/* Statistik Ringkasan */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <StatCard
          icon={<FaTrophy />}
          label="Pemuncak Klasemen"
          value={topTeam ? topTeam.team : '-'}
          sub={`${topTeam ? topTeam.pts + ' poin' : ''}`}
        />
        <StatCard
          icon={<FaFutbol />}
          label="Total Gol"
          value={totalGoals}
          sub={`${standings.length} tim`}
        />
        <StatCard
          icon={<FaChartBar />}
          label="Rata-rata Gol/Laga"
          value={avgGoalsPerMatch}
          sub={selectedLeague.name}
        />
      </motion.div>

      {/* Grid untuk Top Skor dan Tabel Klasemen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daftar Top Skor */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-gray-800/40 backdrop-blur-md p-5 rounded-3xl border border-gray-700/50 shadow-xl h-full">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-yellow-400">⚽</span> Top Skor {selectedLeague.name}
            </h2>
            {scorers.length > 0 ? (
              <div className="space-y-3">
                {scorers.slice(0, 10).map((player, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-2xl hover:bg-gray-700/50 transition-all">
                    <div className="flex items-center gap-3">
                      <img
                        src={player.photo || `https://via.placeholder.com/40?text=${player.name.charAt(0)}`}
                        alt={player.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-600 bg-gray-800"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/40?text=⚽'}
                      />
                      <div>
                        <p className="font-semibold text-sm">{player.name}</p>
                        <p className="text-xs text-gray-400">{player.team}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-blue-400">{player.goals}</span>
                      <span className="text-xs text-gray-500 block">Gol</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">Data top skor tidak tersedia.</p>
            )}
            <p className="text-xs text-gray-500 mt-4 text-center">
              Data dari football-data.org
            </p>
          </div>
        </motion.div>

        {/* Tabel Klasemen Lengkap */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <div className="bg-gray-800/40 backdrop-blur-md p-5 rounded-3xl border border-gray-700/50 shadow-xl h-full">
            <h2 className="text-xl font-bold mb-4">🏆 Klasemen {selectedLeague.name}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-gray-400 border-b border-gray-700">
                  <tr>
                    <th className="pb-3 pl-2">Pos</th>
                    <th className="pb-3">Tim</th>
                    <th className="pb-3">M</th>
                    <th className="pb-3">M</th>
                    <th className="pb-3">S</th>
                    <th className="pb-3">K</th>
                    <th className="pb-3">GM</th>
                    <th className="pb-3">GA</th>
                    <th className="pb-3 text-right pr-2">Poin</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row) => (
                    <tr key={row.pos} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                      <td className="py-3 pl-2 font-mono">{row.pos}</td>
                      <td className="py-3 font-medium flex items-center gap-2">
                        {row.crest && <img src={row.crest} alt="" className="w-5 h-5 object-contain" />}
                        {row.team}
                      </td>
                      <td className="py-3">{row.played}</td>
                      <td className="py-3">{row.win}</td>
                      <td className="py-3">{row.draw}</td>
                      <td className="py-3">{row.loss}</td>
                      <td className="py-3">{row.gf}</td>
                      <td className="py-3">{row.ga}</td>
                      <td className="py-3 text-right pr-2 font-bold text-green-400">{row.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Grafik Analitik di Bawah */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/40 backdrop-blur-md p-5 rounded-3xl border border-gray-700/50 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaChartBar className="text-blue-400" />
            Analisis Tim (10 Teratas)
          </h2>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 outline-none w-full sm:w-auto"
          >
            {metrics.map(metric => (
              <option key={metric.value} value={metric.value}>{metric.label}</option>
            ))}
          </select>
        </div>
        <div className="h-[400px] w-full">
          <Bar data={chartData} options={chartOptions} />
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          Data klasemen {selectedLeague.name} · Diperbarui berkala
        </p>
      </motion.div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gray-800/40 backdrop-blur-md p-5 rounded-2xl border border-gray-700/50 flex items-center gap-4"
    >
      <div className="p-3 bg-blue-600/20 rounded-xl text-blue-400 text-2xl">{icon}</div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-2xl font-bold truncate">{value}</p>
        <p className="text-xs text-gray-500">{sub}</p>
      </div>
    </motion.div>
  );
}