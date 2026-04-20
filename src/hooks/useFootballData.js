// src/hooks/useFootballData.js
import { useState, useEffect, useRef } from 'react';
import { fetchStandings, fetchScorers } from '../api/football';

// Cache sederhana di luar komponen
const cache = {};

export function useFootballData(leagueCode) {
  const [standings, setStandings] = useState([]);
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    const loadData = async () => {
      // Jika data ada di cache, pakai
      if (cache[leagueCode]) {
        setStandings(cache[leagueCode].standings);
        setScorers(cache[leagueCode].scorers);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [standingsData, scorersData] = await Promise.all([
          fetchStandings(leagueCode),
          fetchScorers(leagueCode)
        ]);
        
        // Simpan ke cache
        cache[leagueCode] = {
          standings: standingsData,
          scorers: scorersData
        };

        if (isMounted.current) {
          setStandings(standingsData);
          setScorers(scorersData);
        }
      } catch (err) {
        if (isMounted.current) {
          setError(err.message);
          setStandings([]);
          setScorers([]);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted.current = false;
    };
  }, [leagueCode]);

  return { standings, scorers, loading, error };
}