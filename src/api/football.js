// src/api/football.js
const BASE_URL = '/api/football';

// Cache sederhana (bertahan selama sesi aplikasi berjalan)
const cache = {
  standings: {},  // key: competitionCode
  scorers: {},    // key: competitionCode
  teams: {},      // key: competitionCode
  teamDetails: {}, // key: teamId
  matches: {}     // key: competitionCode
};

async function fetchFromAPI(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`);

  if (!res.ok) {
    if (res.status === 429) throw new Error('Rate limit exceeded. Please wait a minute.');
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

// Daftar liga yang didukung oleh paket gratis
export const SUPPORTED_LEAGUES = [
  { code: 'PL', name: 'Premier League' },
  { code: 'PD', name: 'La Liga' },
  { code: 'SA', name: 'Serie A' },
  { code: 'BL1', name: 'Bundesliga' },
  { code: 'FL1', name: 'Ligue 1' },
  { code: 'BSA', name: 'Brasileirão' },
  { code: 'DED', name: 'Eredivisie' },
  { code: 'PPL', name: 'Primeira Liga' },
  { code: 'CL', name: 'Champions League' },
  { code: 'ELC', name: 'Championship' },
  { code: 'WC', name: 'World Cup' },
  { code: 'EC', name: 'European Championship' },
];

// Ambil klasemen berdasarkan kode kompetisi (dengan cache)
export async function fetchStandings(competitionCode) {
  // Kembalikan dari cache jika tersedia
  if (cache.standings[competitionCode]) {
    console.log(`📦 Menggunakan cache standings untuk ${competitionCode}`);
    return cache.standings[competitionCode];
  }

  try {
    const data = await fetchFromAPI(`/competitions/${competitionCode}/standings`);
    const standings = data.standings[0].table.map(entry => ({
      pos: entry.position,
      team: entry.team.shortName || entry.team.name,
      played: entry.playedGames,
      win: entry.won,
      draw: entry.draw,
      loss: entry.lost,
      gf: entry.goalsFor,
      ga: entry.goalsAgainst,
      pts: entry.points,
      crest: entry.team.crest
    }));
    
    // Simpan ke cache
    cache.standings[competitionCode] = standings;
    return standings;
  } catch (error) {
    console.error(`Gagal fetch klasemen untuk ${competitionCode}:`, error);
    return [];
  }
}

// Ambil top skor berdasarkan kode kompetisi (dengan cache)
export async function fetchScorers(competitionCode) {
  if (cache.scorers[competitionCode]) {
    console.log(`📦 Menggunakan cache scorers untuk ${competitionCode}`);
    return cache.scorers[competitionCode];
  }

  try {
    const data = await fetchFromAPI(`/competitions/${competitionCode}/scorers?limit=10`);
    const scorers = data.scorers.map(item => ({
      name: item.player.name,
      goals: item.goals,
      team: item.team.shortName || item.team.name,
      photo: item.team.crest
    }));
    
    cache.scorers[competitionCode] = scorers;
    return scorers;
  } catch (error) {
    console.error(`Gagal fetch top skor untuk ${competitionCode}:`, error);
    return [];
  }
}

// Ambil daftar tim yang berpartisipasi di suatu kompetisi (dengan cache)
export async function fetchTeams(competitionCode) {
  if (cache.teams[competitionCode]) {
    console.log(`📦 Menggunakan cache teams untuk ${competitionCode}`);
    return cache.teams[competitionCode];
  }

  try {
    const data = await fetchFromAPI(`/competitions/${competitionCode}/teams`);
    const teams = data.teams.map(team => ({
      id: team.id,
      name: team.name,
      shortName: team.shortName || team.name,
      tla: team.tla,
      crest: team.crest,
      venue: team.venue,
      founded: team.founded,
      clubColors: team.clubColors,
      coach: team.coach,
      squad: team.squad || []
    }));
    
    cache.teams[competitionCode] = teams;
    return teams;
  } catch (error) {
    console.error(`Gagal fetch tim untuk ${competitionCode}:`, error);
    return [];
  }
}

// Ambil detail tim beserta skuad (dengan cache)
export async function fetchTeamById(teamId) {
  if (cache.teamDetails[teamId]) {
    console.log(`📦 Menggunakan cache team details untuk ${teamId}`);
    return cache.teamDetails[teamId];
  }

  try {
    const data = await fetchFromAPI(`/teams/${teamId}`);
    const team = {
      id: data.id,
      name: data.name,
      shortName: data.shortName,
      crest: data.crest,
      venue: data.venue,
      founded: data.founded,
      clubColors: data.clubColors,
      coach: data.coach,
      squad: data.squad || []
    };
    
    cache.teamDetails[teamId] = team;
    return team;
  } catch (error) {
    console.error(`Gagal fetch detail tim ${teamId}:`, error);
    return null;
  }
}

// Ambil jadwal pertandingan
export async function fetchMatches(competitionCode) {
  if (cache.matches[competitionCode]) {
    console.log(`📦 Menggunakan cache matches untuk ${competitionCode}`);
    return cache.matches[competitionCode];
  }

  try {
    const data = await fetchFromAPI(`/competitions/${competitionCode}/matches`);
    
    const now = new Date();
    
    const formattedMatches = data.matches.map(m => {
      const gmtDate = new Date(m.utcDate);
      const dateStr = gmtDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      const timeStr = gmtDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
      
      let score = 'VS';
      if (m.status === 'FINISHED' || m.status === 'IN_PLAY' || m.status === 'PAUSED') {
        score = `${m.score.fullTime.home ?? 0} - ${m.score.fullTime.away ?? 0}`;
      }

      return {
        id: m.id,
        home: m.homeTeam.shortName || m.homeTeam.name,
        away: m.awayTeam.shortName || m.awayTeam.name,
        score: score,
        date: dateStr,
        time: timeStr,
        status: m.status,
        rawDate: gmtDate
      };
    });

    const upcoming = formattedMatches.filter(m => m.rawDate >= now).slice(0, 10);
    const past = formattedMatches.filter(m => m.rawDate < now).reverse().slice(0, 10).reverse();
    
    const combined = [...past, ...upcoming];

    cache.matches[competitionCode] = combined;
    return combined;
  } catch (error) {
    console.error(`Gagal fetch matches untuk ${competitionCode}:`, error);
    return [];
  }
}

// Fungsi opsional untuk membersihkan cache
export function clearCache(type = null, key = null) {
  if (type && key) {
    cache[type][key] = null;
  } else if (type) {
    cache[type] = {};
  } else {
    cache.standings = {};
    cache.scorers = {};
    cache.teams = {};
    cache.teamDetails = {};
  }
}