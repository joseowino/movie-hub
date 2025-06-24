'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, Film, Tv, Heart, Filter, Calendar, Star } from 'lucide-react';
import SearchBar from './search-bar';
import MovieCard from './movie-card';
import WatchlistPanel from './watchlist-panel';
import { getTrendingMovies, getTrendingTVShows, discoverMovies, discoverTVShows, getGenres } from '@/lib/api';
import type { Movie, TVShow, Genre } from '@/types/movie';

interface SearchResult {
  type: 'movie' | 'tv';
  data: Movie | TVShow;
}

export default function Dashboard() {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingTVShows, setTrendingTVShows] = useState<TVShow[]>([]);
  const [discoveredMovies, setDiscoveredMovies] = useState<Movie[]>([]);
  const [discoveredTVShows, setDiscoveredTVShows] = useState<TVShow[]>([]);
  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [tvGenres, setTVGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMovieGenre, setSelectedMovieGenre] = useState<string>('all');
  const [selectedTVGenre, setSelectedTVGenre] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popularity.desc');
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ item: Movie | TVShow; type: 'movie' | 'tv' } | null>(null);

  console.log('Dashboard component rendered');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedMovieGenre !== 'all' || selectedYear !== 'all' || sortBy !== 'popularity.desc') {
      loadDiscoveredMovies();
    }
  }, [selectedMovieGenre, selectedYear, sortBy]);

  useEffect(() => {
    if (selectedTVGenre !== 'all' || selectedYear !== 'all' || sortBy !== 'popularity.desc') {
      loadDiscoveredTVShows();
    }
  }, [selectedTVGenre, selectedYear, sortBy]);

  const loadInitialData = async () => {
    console.log('Loading initial dashboard data');
    setIsLoading(true);
    
    try {
      const [trending_movies, trending_tv, movie_genres, tv_genres] = await Promise.all([
        getTrendingMovies('week'),
        getTrendingTVShows('week'),
        getGenres('movie'),
        getGenres('tv'),
      ]);

      console.log('Initial data loaded:', {
        trending_movies: trending_movies.results.length,
        trending_tv: trending_tv.results.length,
        movie_genres: movie_genres.length,
        tv_genres: tv_genres.length,
      });

      setTrendingMovies(trending_movies.results.slice(0, 12));
      setTrendingTVShows(trending_tv.results.slice(0, 12));
      setMovieGenres(movie_genres);
      setTVGenres(tv_genres);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDiscoveredMovies = async () => {
    console.log('Loading discovered movies with filters:', { selectedMovieGenre, selectedYear, sortBy });
    
    try {
      const response = await discoverMovies({
        page: 1,
        genre: selectedMovieGenre !== 'all' ? parseInt(selectedMovieGenre) : undefined,
        year: selectedYear !== 'all' ? parseInt(selectedYear) : undefined,
        sortBy,
      });

      console.log('Discovered movies loaded:', response.results.length);
      setDiscoveredMovies(response.results.slice(0, 12));
    } catch (error) {
      console.error('Error loading discovered movies:', error);
    }
  };

  const loadDiscoveredTVShows = async () => {
    console.log('Loading discovered TV shows with filters:', { selectedTVGenre, selectedYear, sortBy });
    
    try {
      const response = await discoverTVShows({
        page: 1,
        genre: selectedTVGenre !== 'all' ? parseInt(selectedTVGenre) : undefined,
        year: selectedYear !== 'all' ? parseInt(selectedYear) : undefined,
        sortBy,
      });

      console.log('Discovered TV shows loaded:', response.results.length);
      setDiscoveredTVShows(response.results.slice(0, 12));
    } catch (error) {
      console.error('Error loading discovered TV shows:', error);
    }
  };

  const handleSearchSelect = (result: SearchResult) => {
    console.log('Search result selected:', result);
    setSelectedItem({ item: result.data, type: result.type });
  };

  const handleMovieClick = (movie: Movie) => {
    console.log('Movie clicked:', movie.title);
    setSelectedItem({ item: movie, type: 'movie' });
  };

  const handleTVShowClick = (show: TVShow) => {
    console.log('TV show clicked:', show.name);
    setSelectedItem({ item: show, type: 'tv' });
  };

  const clearFilters = () => {
    console.log('Clearing filters');
    setSelectedMovieGenre('all');
    setSelectedTVGenre('all');
    setSelectedYear('all');
    setSortBy('popularity.desc');
  };

  const generateYearOptions = (): number[] => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let year = currentYear; year >= 1900; year--) {
      years.push(year);
    }
    return years;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cinematic-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-reel-spin w-12 h-12 border-4 border-netflix border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-cinematic-light text-lg">Loading CineVault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cinematic-black text-cinematic-light">
      {/* Header */}
      <header className="bg-gradient-to-r from-cinematic-black via-cinematic-dark to-cinematic-black border-b border-gray-800 sticky top-0 z-40 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-netflix to-golden bg-clip-text text-transparent">
                CineVault
              </h1>
              <Badge variant="outline" className="text-xs text-golden border-golden/30">
                Discover • Watch • Enjoy
              </Badge>
            </div>
            
            <Button
              onClick={() => setShowWatchlist(!showWatchlist)}
              variant="outline"
              className="border-netflix/50 text-netflix hover:bg-netflix hover:text-white"
            >
              <Heart className="w-4 h-4 mr-2" />
              Watchlist
            </Button>
          </div>

          <SearchBar onSelectItem={handleSearchSelect} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="trending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-cinematic-dark border border-gray-700">
            <TabsTrigger value="trending" className="data-[state=active]:bg-netflix data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="movies" className="data-[state=active]:bg-netflix data-[state=active]:text-white">
              <Film className="w-4 h-4 mr-2" />
              Movies
            </TabsTrigger>
            <TabsTrigger value="tv" className="data-[state=active]:bg-netflix data-[state=active]:text-white">
              <Tv className="w-4 h-4 mr-2" />
              TV Shows
            </TabsTrigger>
          </TabsList>

          {/* Trending Tab */}
          <TabsContent value="trending" className="space-y-8 mt-8">
            <section>
              <div className="flex items-center space-x-2 mb-6">
                <Film className="w-6 h-6 text-netflix" />
                <h2 className="text-2xl font-bold">Trending Movies</h2>
                <Badge className="bg-netflix text-white">This Week</Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {trendingMovies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    item={movie}
                    type="movie"
                    onClick={() => handleMovieClick(movie)}
                  />
                ))}
              </div>
            </section>

            <Separator className="bg-gray-800" />

            <section>
              <div className="flex items-center space-x-2 mb-6">
                <Tv className="w-6 h-6 text-netflix" />
                <h2 className="text-2xl font-bold">Trending TV Shows</h2>
                <Badge className="bg-netflix text-white">This Week</Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {trendingTVShows.map((show) => (
                  <MovieCard
                    key={show.id}
                    item={show}
                    type="tv"
                    onClick={() => handleTVShowClick(show)}
                  />
                ))}
              </div>
            </section>
          </TabsContent>

          {/* Movies Tab */}
          <TabsContent value="movies" className="space-y-6 mt-8">
            <Card className="bg-cinematic-dark border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>Filter Movies</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-4">
                <Select value={selectedMovieGenre} onValueChange={setSelectedMovieGenre}>
                  <SelectTrigger className="w-48 bg-cinematic-slate border-gray-600">
                    <SelectValue placeholder="Select Genre" />
                  </SelectTrigger>
                  <SelectContent className="bg-cinematic-dark border-gray-600">
                    <SelectItem value="all">All Genres</SelectItem>
                    {movieGenres.map((genre) => (
                      <SelectItem key={genre.id} value={genre.id.toString()}>
                        {genre.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-32 bg-cinematic-slate border-gray-600">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="bg-cinematic-dark border-gray-600 max-h-64">
                    <SelectItem value="all">All Years</SelectItem>
                    {generateYearOptions().map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 bg-cinematic-slate border-gray-600">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent className="bg-cinematic-dark border-gray-600">
                    <SelectItem value="popularity.desc">Popularity ↓</SelectItem>
                    <SelectItem value="popularity.asc">Popularity ↑</SelectItem>
                    <SelectItem value="vote_average.desc">Rating ↓</SelectItem>
                    <SelectItem value="vote_average.asc">Rating ↑</SelectItem>
                    <SelectItem value="release_date.desc">Newest</SelectItem>
                    <SelectItem value="release_date.asc">Oldest</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={clearFilters} variant="outline" size="sm">
                  Clear Filters
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {(discoveredMovies.length > 0 ? discoveredMovies : trendingMovies).map((movie) => (
                <MovieCard
                  key={movie.id}
                  item={movie}
                  type="movie"
                  onClick={() => handleMovieClick(movie)}
                />
              ))}
            </div>
          </TabsContent>

          {/* TV Shows Tab */}
          <TabsContent value="tv" className="space-y-6 mt-8">
            <Card className="bg-cinematic-dark border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>Filter TV Shows</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-4">
                <Select value={selectedTVGenre} onValueChange={setSelectedTVGenre}>
                  <SelectTrigger className="w-48 bg-cinematic-slate border-gray-600">
                    <SelectValue placeholder="Select Genre" />
                  </SelectTrigger>
                  <SelectContent className="bg-cinematic-dark border-gray-600">
                    <SelectItem value="all">All Genres</SelectItem>
                    {tvGenres.map((genre) => (
                      <SelectItem key={genre.id} value={genre.id.toString()}>
                        {genre.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-32 bg-cinematic-slate border-gray-600">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="bg-cinematic-dark border-gray-600 max-h-64">
                    <SelectItem value="all">All Years</SelectItem>
                    {generateYearOptions().map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 bg-cinematic-slate border-gray-600">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent className="bg-cinematic-dark border-gray-600">
                    <SelectItem value="popularity.desc">Popularity ↓</SelectItem>
                    <SelectItem value="popularity.asc">Popularity ↑</SelectItem>
                    <SelectItem value="vote_average.desc">Rating ↓</SelectItem>
                    <SelectItem value="vote_average.asc">Rating ↑</SelectItem>
                    <SelectItem value="first_air_date.desc">Latest</SelectItem>
                    <SelectItem value="first_air_date.asc">Earliest</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={clearFilters} variant="outline" size="sm">
                  Clear Filters
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {(discoveredTVShows.length > 0 ? discoveredTVShows : trendingTVShows).map((show) => (
                <MovieCard
                  key={show.id}
                  item={show}
                  type="tv"
                  onClick={() => handleTVShowClick(show)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Watchlist Panel */}
      <WatchlistPanel isOpen={showWatchlist} onClose={() => setShowWatchlist(false)} />
    </div>
  );
}