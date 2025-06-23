# Movie Hub

A comprehensive entertainment discovery platform where users can search for movies and TV shows, view detailed information, manage personal watchlists, and discover trending content.

![App Screenshot](./screenshots/homepage.png)

## Features

### Core Features
-  Smart Search**: Real-time search for movies and TV shows with debounced input
-  Responsive Design**: Optimized for both mobile and desktop viewing
-  Personal Watchlist**: Add, remove, and mark titles as watched
-  Trending Content**: Discover popular movies and shows
-  Genre Filtering**: Browse content by categories and genres
-  Multi-Source Ratings**: IMDB, Rotten Tomatoes, and TMDB ratings
- Smart Recommendations**: Personalized suggestions based on watchlist
-  Theme Toggle**: Dark and light mode support

### Bonus Features
-  Trailer Integration**: Watch trailers directly in the app
-  Watch Providers**: See where content is available to stream
-  Export Watchlist**: Download your list as PDF or CSV
-  Social Sharing**: Share your favorite movies and shows

## Screenshots

### Homepage - Light Theme
![Homepage Light](./screenshots/homepage-light.png)

### Search Results
![Search Results](./screenshots/search-results.png)

### Movie Details
![Movie Details](./screenshots/movie-details.png)

### Watchlist Management
![Watchlist](./screenshots/watchlist.png)

### Mobile View
<img src="./screenshots/mobile-view.png" alt="Mobile View" width="300">

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- API keys for TMDB and OMDB

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/movie-discovery-app.git
   cd movie-discovery-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your API keys:
   ```env
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   VITE_OMDB_API_KEY=your_omdb_api_key_here
   VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## API Setup Guide

### TMDB API (The Movie Database)
1. Visit [TMDB](https://www.themoviedb.org/settings/api)
2. Create an account and request an API key
3. Copy your API key to `VITE_TMDB_API_KEY` in `.env`

### OMDB API (Open Movie Database)
1. Visit [OMDB API](http://www.omdbapi.com/apikey.aspx)
2. Request a free API key
3. Copy your API key to `VITE_OMDB_API_KEY` in `.env`

### YouTube API (Optional - for trailers)
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Enable YouTube Data API v3
3. Create credentials and copy to `VITE_YOUTUBE_API_KEY`

## Project Structure

```
movie-discovery-app/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   ├── search/
│   │   │   ├── SearchBar.jsx
│   │   │   ├── SearchResults.jsx
│   │   │   └── SearchFilters.jsx
│   │   ├── movie/
│   │   │   ├── MovieCard.jsx
│   │   │   ├── MovieDetails.jsx
│   │   │   └── MovieGrid.jsx
│   │   └── watchlist/
│   │       ├── WatchlistItem.jsx
│   │       └── WatchlistManager.jsx
│   ├── services/
│   │   ├── tmdbApi.js
│   │   ├── omdbApi.js
│   │   ├── youtubeApi.js
│   │   └── apiCache.js
│   ├── hooks/
│   │   ├── useDebounce.js
│   │   ├── useLocalStorage.js
│   │   └── useWatchlist.js
│   ├── utils/
│   │   ├── helpers.js
│   │   ├── constants.js
│   │   └── validators.js
│   ├── styles/
│   │   ├── globals.css
│   │   └── components/
│   ├── App.jsx
│   └── main.jsx
├── screenshots/
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

## API Documentation

### TMDB API Integration

#### Search Movies and TV Shows
```javascript
// services/tmdbApi.js
export const searchMulti = async (query, page = 1) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      results: data.results || [],
      totalPages: data.total_pages || 0,
      totalResults: data.total_results || 0
    };
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};
```

#### Get Movie Details
```javascript
export const getMovieDetails = async (movieId) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,videos,recommendations`
    );
    
    if (!response.ok) {
      throw new Error(`Movie not found: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Movie details error:', error);
    throw error;
  }
};
```

#### Get Trending Content
```javascript
export const getTrending = async (mediaType = 'all', timeWindow = 'week') => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/${mediaType}/${timeWindow}?api_key=${API_KEY}`
    );
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Trending content error:', error);
    return [];
  }
};
```

### OMDB API Integration

#### Get Additional Movie Data
```javascript
// services/omdbApi.js
export const getOMDBData = async (imdbId) => {
  try {
    const response = await fetch(
      `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&i=${imdbId}&plot=full`
    );
    
    if (!response.ok) {
      throw new Error(`OMDB API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.Response === 'False') {
      throw new Error(data.Error || 'Movie not found');
    }
    
    return {
      plot: data.Plot,
      imdbRating: data.imdbRating,
      rottenTomatoesRating: data.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value,
      awards: data.Awards,
      boxOffice: data.BoxOffice
    };
  } catch (error) {
    console.error('OMDB error:', error);
    return null;
  }
};
```

##  Usage Examples

### Search Implementation with Debouncing
```javascript
// hooks/useDebounce.js
import { useState, useEffect } from 'react';

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// components/search/SearchBar.jsx
import { useDebounce } from '../../hooks/useDebounce';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search movies and TV shows..."
      className="search-input"
    />
  );
};
```

### Watchlist Management
```javascript
// hooks/useWatchlist.js
import { useLocalStorage } from './useLocalStorage';

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useLocalStorage('movieWatchlist', []);

  const addToWatchlist = (item) => {
    setWatchlist(prev => {
      if (prev.find(movie => movie.id === item.id)) {
        return prev;
      }
      return [...prev, { ...item, addedAt: new Date().toISOString() }];
    });
  };

  const removeFromWatchlist = (id) => {
    setWatchlist(prev => prev.filter(movie => movie.id !== id));
  };

  const toggleWatched = (id) => {
    setWatchlist(prev =>
      prev.map(movie =>
        movie.id === id
          ? { ...movie, watched: !movie.watched, watchedAt: new Date().toISOString() }
          : movie
      )
    );
  };

  const isInWatchlist = (id) => {
    return watchlist.some(movie => movie.id === id);
  };

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatched,
    isInWatchlist
  };
};
```

### Error Handling and Loading States
```javascript
// components/common/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage in components
const MovieDetails = ({ movieId }) => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        setError(null);
        const movieData = await getMovieDetails(movieId);
        setMovie(movieData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [movieId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!movie) return <NotFound />;

  return <MovieDetailsView movie={movie} />;
};
```

## API Caching Implementation

```javascript
// services/apiCache.js
class APICache {
  constructor(maxSize = 100, ttl = 5 * 60 * 1000) { // 5 minutes TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key, data) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear() {
    this.cache.clear();
  }
}

export const apiCache = new APICache();

// Usage in API calls
export const searchMovies = async (query, page = 1) => {
  const cacheKey = `search_${query}_${page}`;
  const cached = apiCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const data = await fetchFromAPI(query, page);
  apiCache.set(cacheKey, data);
  
  return data;
};
```

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Example Test Cases
```javascript
// __tests__/services/tmdbApi.test.js
import { searchMulti, getMovieDetails } from '../services/tmdbApi';

describe('TMDB API', () => {
  test('should search for movies successfully', async () => {
    const results = await searchMulti('Inception');
    
    expect(results).toHaveProperty('results');
    expect(results.results).toBeInstanceOf(Array);
    expect(results.results.length).toBeGreaterThan(0);
  });

  test('should handle API errors gracefully', async () => {
    // Mock failed API response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
      })
    );

    await expect(searchMulti('nonexistent')).rejects.toThrow('TMDB API Error: 404');
  });
});
```

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Write/update tests
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Review Guidelines
- Focus on code quality and maintainability
- Check for proper error handling
- Verify API integration best practices
- Ensure responsive design compliance
- Test functionality across different devices

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- [TMDB](https://www.themoviedb.org/) for providing comprehensive movie and TV data
- [OMDB](http://www.omdbapi.com/) for additional rating information
- [React](https://reactjs.org/) for the awesome framework
- [Vite](https://vitejs.dev/) for fast development and building

## 📞 Support

If you have any questions or run into issues:

1. Check the [Issues](https://github.com/yourusername/movie-discovery-app/issues) page
2. Create a new issue with detailed information
3. Reach out to the maintainers

## Roadmap

- [ ] User authentication and profiles
- [ ] Social features and reviews
- [ ] Advanced recommendation algorithms
- [ ] Offline support with PWA
- [ ] Multi-language support
- [ ] Integration with more streaming services
- [ ] Mobile app development

---
If this project helped you, please give it a star!