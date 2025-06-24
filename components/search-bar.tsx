'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Film, Tv } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { searchMovies, searchTVShows, getImageUrl } from '@/lib/api';
import type { Movie, TVShow } from '@/types/movie';
import debounce from 'lodash.debounce';

interface SearchResult {
  type: 'movie' | 'tv';
  data: Movie | TVShow;
}

interface SearchBarProps {
  onSelectItem: (item: SearchResult) => void;
}

export default function SearchBar({ onSelectItem }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    console.log('Performing search for:', searchQuery);

    try {
      const [movieResults, tvResults] = await Promise.all([
        searchMovies(searchQuery, 1),
        searchTVShows(searchQuery, 1),
      ]);

      const combinedResults: SearchResult[] = [
        ...movieResults.results.slice(0, 5).map(movie => ({ type: 'movie' as const, data: movie })),
        ...tvResults.results.slice(0, 5).map(show => ({ type: 'tv' as const, data: show })),
      ];

      // Sort by popularity
      combinedResults.sort((a, b) => b.data.popularity - a.data.popularity);

      console.log('Search results:', combinedResults.length);
      setResults(combinedResults.slice(0, 8)); // Show top 8 results
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      performSearch(searchQuery);
    }, 300),
    [performSearch]
  );

  useEffect(() => {
    debouncedSearch(query);
    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (!value.trim()) {
      setShowResults(false);
      setResults([]);
    }
  };

  const handleSelectItem = (item: SearchResult) => {
    console.log('Selected item:', item.data);
    onSelectItem(item);
    setQuery('');
    setShowResults(false);
    setResults([]);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const getTitle = (item: SearchResult) => {
    return item.type === 'movie' ? (item.data as Movie).title : (item.data as TVShow).name;
  };

  const getReleaseDate = (item: SearchResult) => {
    return item.type === 'movie' ? (item.data as Movie).release_date : (item.data as TVShow).first_air_date;
  };

  const getYear = (dateString: string) => {
    return dateString ? new Date(dateString).getFullYear() : 'N/A';
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search movies and TV shows..."
          value={query}
          onChange={handleInputChange}
          className="pl-10 pr-10 h-12 bg-cinematic-dark/50 border-gray-600 text-cinematic-light placeholder-gray-400 focus:border-netflix focus:ring-netflix"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-2 bg-cinematic-dark/95 backdrop-blur-sm border-gray-600 shadow-2xl z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              <div className="animate-reel-spin inline-block w-6 h-6 border-2 border-netflix border-t-transparent rounded-full"></div>
              <span className="ml-2">Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((item, index) => (
                <button
                  key={`${item.type}-${item.data.id}`}
                  onClick={() => handleSelectItem(item)}
                  className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-700/50 transition-colors duration-200 text-left"
                >
                  <div className="flex-shrink-0 w-12 h-16 bg-gray-800 rounded overflow-hidden">
                    <img
                      src={getImageUrl(item.data.poster_path, 'w200')}
                      alt={getTitle(item)}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-movie.svg';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-cinematic-light truncate">
                        {getTitle(item)}
                      </h3>
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {item.type === 'movie' ? <Film className="w-3 h-3 mr-1" /> : <Tv className="w-3 h-3 mr-1" />}
                        {item.type === 'movie' ? 'Movie' : 'TV'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <span>{getYear(getReleaseDate(item))}</span>
                      <span>•</span>
                      <div className="flex items-center">
                        <span className="text-golden">★</span>
                        <span className="ml-1">{item.data.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="p-4 text-center text-gray-400">
              No results found for "{query}"
            </div>
          ) : null}
        </Card>
      )}
    </div>
  );
}