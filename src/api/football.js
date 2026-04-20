// src/api/football.js
const BASE_URL = import.meta.env.DEV ? '/api/football' : 'https://api.football-data.org/v4';

// Cache sederhana (bertahan selama sesi aplikasi berjalan)
const cache = {
  standings: {},  // key: competitionCode
  scorers: {},    // key: competitionCode
  teams: {},      // key: competitionCode
  teamDetails: {} // key: teamId
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