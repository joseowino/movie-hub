import axios from 'axios';
import type { Movie, TVShow, MovieDetails, TVShowDetails, Credits, Genre, OMDBResponse, APIResponse } from '@/types/movie';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const OMDB_BASE_URL = 'https://www.omdbapi.com';

// Note: In production, these should be stored in environment variables
// For demo purposes, using placeholder values - you'll need to add your actual API keys
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
const OMDB_API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY || '';

// Demo mode when API keys are not available
const DEMO_MODE = !TMDB_API_KEY || TMDB_API_KEY === 'your_tmdb_api_key_here';

console.log('API Configuration:', { 
  tmdb: TMDB_API_KEY ? 'Set' : 'Missing', 
  omdb: OMDB_API_KEY ? 'Set' : 'Missing',
  demoMode: DEMO_MODE
});

// TMDB API instance
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

// OMDB API instance
const omdbApi = axios.create({
  baseURL: OMDB_BASE_URL,
  params: {
    apikey: OMDB_API_KEY,
  },
});

// Rate limiting and caching
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_DELAY = 100; // 100ms between requests

let lastRequestTime = 0;

const rateLimitedRequest = async <T>(requestFn: () => Promise<T>): Promise<T> => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
  return requestFn();
};

const getCachedData = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Cache hit for:', key);
    return cached.data as T;
  }
  return null;
};

const setCachedData = <T>(key: string, data: T): void => {
  console.log('Caching data for:', key);
  cache.set(key, { data, timestamp: Date.now() });
};

// Demo data for when API keys are not available
const DEMO_MOVIES: Movie[] = [
  {
    id: 1,
    title: "The Matrix",
    poster_path: null,
    backdrop_path: null,
    overview: "A computer programmer discovers that reality as he knows it is actually a simulation, and he must join a rebellion to free humanity.",
    release_date: "1999-03-30",
    vote_average: 8.7,
    vote_count: 25000,
    genre_ids: [28, 878],
    adult: false,
    original_language: "en",
    original_title: "The Matrix",
    popularity: 95.5,
    video: false
  },
  {
    id: 2,
    title: "Inception",
    poster_path: null,
    backdrop_path: null,
    overview: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into a CEO's mind.",
    release_date: "2010-07-16",
    vote_average: 8.8,
    vote_count: 32000,
    genre_ids: [28, 878, 53],
    adult: false,
    original_language: "en",
    original_title: "Inception",
    popularity: 88.2,
    video: false
  }
];

const DEMO_TV_SHOWS: TVShow[] = [
  {
    id: 101,
    name: "Breaking Bad",
    poster_path: null,
    backdrop_path: null,
    overview: "A high school chemistry teacher diagnosed with cancer teams up with a former student to cook and sell methamphetamine.",
    first_air_date: "2008-01-20",
    vote_average: 9.5,
    vote_count: 15000,
    genre_ids: [18, 80],
    adult: false,
    original_language: "en",
    original_name: "Breaking Bad",
    popularity: 92.3,
    origin_country: ["US"]
  }
];

// TMDB API functions
export const searchMovies = async (query: string, page = 1): Promise<APIResponse<Movie>> => {
  if (DEMO_MODE) {
    console.log('Demo mode: Returning sample movie data for query:', query);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    return {
      page: 1,
      results: DEMO_MOVIES.filter(movie => 
        movie.title.toLowerCase().includes(query.toLowerCase())
      ),
      total_pages: 1,
      total_results: 2
    };
  }

  const cacheKey = `search_movies_${query}_${page}`;
  const cached = getCachedData<APIResponse<Movie>>(cacheKey);
  if (cached) return cached;

  console.log('Searching movies:', query, 'page:', page);
  
  try {
    const response = await rateLimitedRequest(() => 
      tmdbApi.get<APIResponse<Movie>>('/search/movie', {
        params: { query, page, include_adult: false }
      })
    );
    
    console.log('Movies search results:', response.data.results.length);
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error searching movies:', error);
    throw new Error('Failed to search movies');
  }
};

export const searchTVShows = async (query: string, page = 1): Promise<APIResponse<TVShow>> => {
  if (DEMO_MODE) {
    console.log('Demo mode: Returning sample TV show data for query:', query);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    return {
      page: 1,
      results: DEMO_TV_SHOWS.filter(show => 
        show.name.toLowerCase().includes(query.toLowerCase())
      ),
      total_pages: 1,
      total_results: 1
    };
  }

  const cacheKey = `search_tv_${query}_${page}`;
  const cached = getCachedData<APIResponse<TVShow>>(cacheKey);
  if (cached) return cached;

  console.log('Searching TV shows:', query, 'page:', page);
  
  try {
    const response = await rateLimitedRequest(() =>
      tmdbApi.get<APIResponse<TVShow>>('/search/tv', {
        params: { query, page, include_adult: false }
      })
    );
    
    console.log('TV shows search results:', response.data.results.length);
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error searching TV shows:', error);
    throw new Error('Failed to search TV shows');
  }
};

export const getTrendingMovies = async (timeWindow: 'day' | 'week' = 'week'): Promise<APIResponse<Movie>> => {
  if (DEMO_MODE) {
    console.log('Demo mode: Returning sample trending movies');
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
    return {
      page: 1,
      results: DEMO_MOVIES,
      total_pages: 1,
      total_results: DEMO_MOVIES.length
    };
  }

  const cacheKey = `trending_movies_${timeWindow}`;
  const cached = getCachedData<APIResponse<Movie>>(cacheKey);
  if (cached) return cached;

  console.log('Fetching trending movies:', timeWindow);
  
  try {
    const response = await rateLimitedRequest(() =>
      tmdbApi.get<APIResponse<Movie>>(`/trending/movie/${timeWindow}`)
    );
    
    console.log('Trending movies fetched:', response.data.results.length);
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    throw new Error('Failed to fetch trending movies');
  }
};

export const getTrendingTVShows = async (timeWindow: 'day' | 'week' = 'week'): Promise<APIResponse<TVShow>> => {
  if (DEMO_MODE) {
    console.log('Demo mode: Returning sample trending TV shows');
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
    return {
      page: 1,
      results: DEMO_TV_SHOWS,
      total_pages: 1,
      total_results: DEMO_TV_SHOWS.length
    };
  }

  const cacheKey = `trending_tv_${timeWindow}`;
  const cached = getCachedData<APIResponse<TVShow>>(cacheKey);
  if (cached) return cached;

  console.log('Fetching trending TV shows:', timeWindow);
  
  try {
    const response = await rateLimitedRequest(() =>
      tmdbApi.get<APIResponse<TVShow>>(`/trending/tv/${timeWindow}`)
    );
    
    console.log('Trending TV shows fetched:', response.data.results.length);
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching trending TV shows:', error);
    throw new Error('Failed to fetch trending TV shows');
  }
};

export const getMovieDetails = async (id: number): Promise<MovieDetails> => {
  const cacheKey = `movie_details_${id}`;
  const cached = getCachedData<MovieDetails>(cacheKey);
  if (cached) return cached;

  console.log('Fetching movie details:', id);
  
  try {
    const response = await rateLimitedRequest(() =>
      tmdbApi.get<MovieDetails>(`/movie/${id}`)
    );
    
    console.log('Movie details fetched:', response.data.title);
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw new Error('Failed to fetch movie details');
  }
};

export const getTVShowDetails = async (id: number): Promise<TVShowDetails> => {
  const cacheKey = `tv_details_${id}`;
  const cached = getCachedData<TVShowDetails>(cacheKey);
  if (cached) return cached;

  console.log('Fetching TV show details:', id);
  
  try {
    const response = await rateLimitedRequest(() =>
      tmdbApi.get<TVShowDetails>(`/tv/${id}`)
    );
    
    console.log('TV show details fetched:', response.data.name);
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching TV show details:', error);
    throw new Error('Failed to fetch TV show details');
  }
};

export const getMovieCredits = async (id: number): Promise<Credits> => {
  const cacheKey = `movie_credits_${id}`;
  const cached = getCachedData<Credits>(cacheKey);
  if (cached) return cached;

  console.log('Fetching movie credits:', id);
  
  try {
    const response = await rateLimitedRequest(() =>
      tmdbApi.get<Credits>(`/movie/${id}/credits`)
    );
    
    console.log('Movie credits fetched, cast:', response.data.cast.length);
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching movie credits:', error);
    throw new Error('Failed to fetch movie credits');
  }
};

export const getTVShowCredits = async (id: number): Promise<Credits> => {
  const cacheKey = `tv_credits_${id}`;
  const cached = getCachedData<Credits>(cacheKey);
  if (cached) return cached;

  console.log('Fetching TV show credits:', id);
  
  try {
    const response = await rateLimitedRequest(() =>
      tmdbApi.get<Credits>(`/tv/${id}/credits`)
    );
    
    console.log('TV show credits fetched, cast:', response.data.cast.length);
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching TV show credits:', error);
    throw new Error('Failed to fetch TV show credits');
  }
};

export const getGenres = async (type: 'movie' | 'tv'): Promise<Genre[]> => {
  if (DEMO_MODE) {
    console.log('Demo mode: Returning sample genres for', type);
    const demoGenres = [
      { id: 28, name: 'Action' },
      { id: 18, name: 'Drama' },
      { id: 878, name: 'Science Fiction' },
      { id: 53, name: 'Thriller' },
      { id: 80, name: 'Crime' }
    ];
    await new Promise(resolve => setTimeout(resolve, 300));
    return demoGenres;
  }

  const cacheKey = `genres_${type}`;
  const cached = getCachedData<Genre[]>(cacheKey);
  if (cached) return cached;

  console.log('Fetching genres for:', type);
  
  try {
    const response = await rateLimitedRequest(() =>
      tmdbApi.get<{ genres: Genre[] }>(`/genre/${type}/list`)
    );
    
    console.log('Genres fetched:', response.data.genres.length);
    setCachedData(cacheKey, response.data.genres);
    return response.data.genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    throw new Error('Failed to fetch genres');
  }
};

export const discoverMovies = async (params: {
  page?: number;
  genre?: number;
  year?: number;
  sortBy?: string;
}): Promise<APIResponse<Movie>> => {
  if (DEMO_MODE) {
    console.log('Demo mode: Filtering demo movies with params:', params);
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay
    
    let filteredMovies = [...DEMO_MOVIES];
    
    // Apply genre filter
    if (params.genre) {
      filteredMovies = filteredMovies.filter(movie => 
        movie.genre_ids.includes(params.genre!)
      );
    }
    
    // Apply year filter
    if (params.year) {
      filteredMovies = filteredMovies.filter(movie => 
        new Date(movie.release_date).getFullYear() === params.year
      );
    }
    
    // Apply sorting
    if (params.sortBy) {
      switch (params.sortBy) {
        case 'vote_average.desc':
          filteredMovies.sort((a, b) => b.vote_average - a.vote_average);
          break;
        case 'vote_average.asc':
          filteredMovies.sort((a, b) => a.vote_average - b.vote_average);
          break;
        case 'release_date.desc':
          filteredMovies.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime());
          break;
        case 'release_date.asc':
          filteredMovies.sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime());
          break;
        case 'popularity.asc':
          filteredMovies.sort((a, b) => a.popularity - b.popularity);
          break;
        default: // popularity.desc
          filteredMovies.sort((a, b) => b.popularity - a.popularity);
      }
    }
    
    return {
      page: 1,
      results: filteredMovies,
      total_pages: 1,
      total_results: filteredMovies.length
    };
  }

  const cacheKey = `discover_movies_${JSON.stringify(params)}`;
  const cached = getCachedData<APIResponse<Movie>>(cacheKey);
  if (cached) return cached;

  console.log('Discovering movies with params:', params);
  
  try {
    const response = await rateLimitedRequest(() =>
      tmdbApi.get<APIResponse<Movie>>('/discover/movie', {
        params: {
          page: params.page || 1,
          with_genres: params.genre,
          year: params.year,
          sort_by: params.sortBy || 'popularity.desc',
          include_adult: false,
        }
      })
    );
    
    console.log('Movies discovered:', response.data.results.length);
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error discovering movies:', error);
    throw new Error('Failed to discover movies');
  }
};

export const discoverTVShows = async (params: {
  page?: number;
  genre?: number;
  year?: number;
  sortBy?: string;
}): Promise<APIResponse<TVShow>> => {
  if (DEMO_MODE) {
    console.log('Demo mode: Filtering demo TV shows with params:', params);
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay
    
    let filteredShows = [...DEMO_TV_SHOWS];
    
    // Apply genre filter
    if (params.genre) {
      filteredShows = filteredShows.filter(show => 
        show.genre_ids.includes(params.genre!)
      );
    }
    
    // Apply year filter
    if (params.year) {
      filteredShows = filteredShows.filter(show => 
        new Date(show.first_air_date).getFullYear() === params.year
      );
    }
    
    // Apply sorting
    if (params.sortBy) {
      switch (params.sortBy) {
        case 'vote_average.desc':
          filteredShows.sort((a, b) => b.vote_average - a.vote_average);
          break;
        case 'vote_average.asc':
          filteredShows.sort((a, b) => a.vote_average - b.vote_average);
          break;
        case 'first_air_date.desc':
          filteredShows.sort((a, b) => new Date(b.first_air_date).getTime() - new Date(a.first_air_date).getTime());
          break;
        case 'first_air_date.asc':
          filteredShows.sort((a, b) => new Date(a.first_air_date).getTime() - new Date(b.first_air_date).getTime());
          break;
        case 'popularity.asc':
          filteredShows.sort((a, b) => a.popularity - b.popularity);
          break;
        default: // popularity.desc
          filteredShows.sort((a, b) => b.popularity - a.popularity);
      }
    }
    
    return {
      page: 1,
      results: filteredShows,
      total_pages: 1,
      total_results: filteredShows.length
    };
  }

  const cacheKey = `discover_tv_${JSON.stringify(params)}`;
  const cached = getCachedData<APIResponse<TVShow>>(cacheKey);
  if (cached) return cached;

  console.log('Discovering TV shows with params:', params);
  
  try {
    const response = await rateLimitedRequest(() =>
      tmdbApi.get<APIResponse<TVShow>>('/discover/tv', {
        params: {
          page: params.page || 1,
          with_genres: params.genre,
          first_air_date_year: params.year,
          sort_by: params.sortBy || 'popularity.desc',
          include_adult: false,
        }
      })
    );
    
    console.log('TV shows discovered:', response.data.results.length);
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error discovering TV shows:', error);
    throw new Error('Failed to discover TV shows');
  }
};

// OMDB API functions
export const getOMDBData = async (imdbId: string): Promise<OMDBResponse | null> => {
  const cacheKey = `omdb_${imdbId}`;
  const cached = getCachedData<OMDBResponse>(cacheKey);
  if (cached) return cached;

  console.log('Fetching OMDB data for:', imdbId);
  
  try {
    const response = await rateLimitedRequest(() =>
      omdbApi.get<OMDBResponse>('', {
        params: { i: imdbId }
      })
    );
    
    if (response.data.Response === 'True') {
      console.log('OMDB data fetched:', response.data.Title);
      setCachedData(cacheKey, response.data);
      return response.data;
    } else {
      console.log('OMDB data not found for:', imdbId);
      return null;
    }
  } catch (error) {
    console.error('Error fetching OMDB data:', error);
    return null;
  }
};

// Utility functions
export const getImageUrl = (path: string | null, size: 'w200' | 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string => {
  if (!path) return '/placeholder-movie.svg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const formatRuntime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};