'use client';

import { useState } from 'react';
import { X, Heart, Eye, EyeOff, Trash2, Filter, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useWatchlist } from '@/hooks/use-watchlist';
import { getImageUrl } from '@/lib/api';
import type { WatchlistItem } from '@/types/movie';

interface WatchlistPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WatchlistPanel({ isOpen, onClose }: WatchlistPanelProps) {
  const { watchlist, removeFromWatchlist, toggleWatched, clearWatchlist, getWatchlistStats } = useWatchlist();
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv' | 'watched' | 'unwatched'>('all');
  const [sortBy, setSortBy] = useState<'added_date' | 'title' | 'release_date' | 'rating'>('added_date');
  
  const stats = getWatchlistStats();

  console.log('Watchlist panel rendered:', { isOpen, watchlistCount: watchlist.length });

  const filteredWatchlist = watchlist.filter(item => {
    switch (filter) {
      case 'movie':
        return item.type === 'movie';
      case 'tv':
        return item.type === 'tv';
      case 'watched':
        return item.watched;
      case 'unwatched':
        return !item.watched;
      default:
        return true;
    }
  });

  const sortedWatchlist = [...filteredWatchlist].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'release_date':
        return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
      case 'rating':
        return b.vote_average - a.vote_average;
      case 'added_date':
      default:
        return new Date(b.added_date).getTime() - new Date(a.added_date).getTime();
    }
  });

  const handleToggleWatched = (item: WatchlistItem) => {
    console.log('Toggling watched status:', item.title);
    toggleWatched(item.id, item.type);
  };

  const handleRemoveItem = (item: WatchlistItem) => {
    console.log('Removing item from watchlist:', item.title);
    removeFromWatchlist(item.id, item.type);
  };

  const handleClearAll = () => {
    console.log('Clearing entire watchlist');
    clearWatchlist();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getYear = (dateString: string) => {
    return dateString ? new Date(dateString).getFullYear() : 'N/A';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="fixed right-0 top-0 h-full w-full max-w-md bg-cinematic-dark border-l border-gray-700 shadow-2xl animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-netflix" />
              <h2 className="text-xl font-bold text-cinematic-light">My Watchlist</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="p-4 bg-cinematic-slate/50">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-netflix">{stats.total}</div>
                <div className="text-xs text-gray-400">Total Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{stats.watched}</div>
                <div className="text-xs text-gray-400">Watched</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-400">{stats.movies}</div>
                <div className="text-xs text-gray-400">Movies</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-400">{stats.tvShows}</div>
                <div className="text-xs text-gray-400">TV Shows</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-700 space-y-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Filter & Sort</span>
            </div>
            <div className="flex space-x-2">
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="flex-1 bg-cinematic-slate border-gray-600 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-cinematic-dark border-gray-600">
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="movie">Movies</SelectItem>
                  <SelectItem value="tv">TV Shows</SelectItem>
                  <SelectItem value="watched">Watched</SelectItem>
                  <SelectItem value="unwatched">To Watch</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="flex-1 bg-cinematic-slate border-gray-600 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-cinematic-dark border-gray-600">
                  <SelectItem value="added_date">Recently Added</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="release_date">Release Date</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Watchlist Items */}
          <div className="flex-1 overflow-y-auto">
            {sortedWatchlist.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Heart className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p className="text-lg mb-2">No items in your watchlist</p>
                <p className="text-sm">Start adding movies and TV shows to build your collection!</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {sortedWatchlist.map((item) => (
                  <Card key={`${item.type}-${item.id}`} className="bg-cinematic-slate/50 border-gray-700 hover:border-gray-600 transition-colors">
                    <CardContent className="p-3">
                      <div className="flex space-x-3">
                        <div className="flex-shrink-0 w-16 h-20 bg-gray-800 rounded overflow-hidden">
                          <img
                            src={getImageUrl(item.poster_path, 'w200')}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-movie.svg';
                            }}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-cinematic-light text-sm mb-1 line-clamp-2">
                            {item.title}
                          </h3>
                          
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {item.type === 'movie' ? 'Movie' : 'TV'}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {getYear(item.release_date)}
                            </span>
                            <div className="flex items-center text-xs text-golden">
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              {item.vote_average.toFixed(1)}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              Added {formatDate(item.added_date)}
                            </span>
                            
                            <div className="flex items-center space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className={`h-6 w-6 p-0 ${
                                  item.watched ? 'text-green-500' : 'text-gray-400 hover:text-green-500'
                                }`}
                                onClick={() => handleToggleWatched(item)}
                              >
                                {item.watched ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                onClick={() => handleRemoveItem(item)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {item.watched && (
                            <Badge className="mt-2 text-xs bg-green-600 text-white">
                              <Eye className="w-3 h-3 mr-1" />
                              Watched
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {watchlist.length > 0 && (
            <div className="p-4 border-t border-gray-700">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="w-full text-red-400 border-red-400/30 hover:bg-red-400/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}