'use client';

import { useState, useEffect } from 'react';
import type { WatchlistItem } from '@/types/movie';

const WATCHLIST_KEY = 'cinevault_watchlist';

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Loading watchlist from localStorage');
    const saved = localStorage.getItem(WATCHLIST_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log('Watchlist loaded:', parsed.length, 'items');
        setWatchlist(parsed);
      } catch (error) {
        console.error('Error parsing watchlist:', error);
        setWatchlist([]);
      }
    }
    setIsLoading(false);
  }, []);

  const saveWatchlist = (newWatchlist: WatchlistItem[]) => {
    console.log('Saving watchlist:', newWatchlist.length, 'items');
    setWatchlist(newWatchlist);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(newWatchlist));
  };

  const addToWatchlist = (item: Omit<WatchlistItem, 'added_date' | 'watched'>) => {
    console.log('Adding to watchlist:', item.title);
    
    const watchlistItem: WatchlistItem = {
      ...item,
      added_date: new Date().toISOString(),
      watched: false,
    };

    const newWatchlist = [...watchlist, watchlistItem];
    saveWatchlist(newWatchlist);
  };

  const removeFromWatchlist = (id: number, type: 'movie' | 'tv') => {
    console.log('Removing from watchlist:', id, type);
    const newWatchlist = watchlist.filter(item => !(item.id === id && item.type === type));
    saveWatchlist(newWatchlist);
  };

  const toggleWatched = (id: number, type: 'movie' | 'tv') => {
    console.log('Toggling watched status:', id, type);
    const newWatchlist = watchlist.map(item => 
      item.id === id && item.type === type 
        ? { ...item, watched: !item.watched }
        : item
    );
    saveWatchlist(newWatchlist);
  };

  const isInWatchlist = (id: number, type: 'movie' | 'tv'): boolean => {
    return watchlist.some(item => item.id === id && item.type === type);
  };

  const getWatchlistItem = (id: number, type: 'movie' | 'tv'): WatchlistItem | undefined => {
    return watchlist.find(item => item.id === id && item.type === type);
  };

  const clearWatchlist = () => {
    console.log('Clearing watchlist');
    saveWatchlist([]);
  };

  const getWatchlistStats = () => {
    const total = watchlist.length;
    const watched = watchlist.filter(item => item.watched).length;
    const unwatched = total - watched;
    const movies = watchlist.filter(item => item.type === 'movie').length;
    const tvShows = watchlist.filter(item => item.type === 'tv').length;

    return {
      total,
      watched,
      unwatched,
      movies,
      tvShows,
    };
  };

  return {
    watchlist,
    isLoading,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatched,
    isInWatchlist,
    getWatchlistItem,
    clearWatchlist,
    getWatchlistStats,
  };
};