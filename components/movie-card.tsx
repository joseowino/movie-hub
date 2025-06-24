'use client';

import { useState } from 'react';
import { Heart, Play, Star, Calendar, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWatchlist } from '@/hooks/use-watchlist';
import { getImageUrl } from '@/lib/api';
import type { Movie, TVShow } from '@/types/movie';

interface MovieCardProps {
  item: Movie | TVShow;
  type: 'movie' | 'tv';
  onClick?: () => void;
  showWatchlistControls?: boolean;
}

export default function MovieCard({ item, type, onClick, showWatchlistControls = true }: MovieCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addToWatchlist, removeFromWatchlist, toggleWatched, isInWatchlist, getWatchlistItem } = useWatchlist();

  const title = type === 'movie' ? (item as Movie).title : (item as TVShow).name;
  const releaseDate = type === 'movie' ? (item as Movie).release_date : (item as TVShow).first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
  
  const inWatchlist = isInWatchlist(item.id, type);
  const watchlistItem = getWatchlistItem(item.id, type);
  const isWatched = watchlistItem?.watched || false;

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (inWatchlist) {
      console.log('Removing from watchlist:', title);
      removeFromWatchlist(item.id, type);
    } else {
      console.log('Adding to watchlist:', title);
      addToWatchlist({
        id: item.id,
        title,
        type,
        poster_path: item.poster_path,
        release_date: releaseDate,
        vote_average: item.vote_average,
        overview: item.overview,
      });
    }
  };

  const handleWatchedToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Toggling watched status:', title);
    toggleWatched(item.id, type);
  };

  const handleCardClick = () => {
    if (onClick) {
      console.log('Movie card clicked:', title);
      onClick();
    }
  };

  return (
    <Card 
      className={`group relative overflow-hidden bg-gradient-to-b from-cinematic-dark to-cinematic-slate border-gray-700 hover:border-netflix/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer ${
        onClick ? 'hover:shadow-netflix/20' : ''
      }`}
      onClick={handleCardClick}
    >
      <div className="aspect-[2/3] relative overflow-hidden bg-gray-800">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="animate-reel-spin w-8 h-8 border-2 border-netflix border-t-transparent rounded-full"></div>
          </div>
        )}
        
        <img
          src={getImageUrl(item.poster_path, 'w500')}
          alt={title}
          className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-movie.svg';
            setImageError(true);
            setImageLoaded(true);
          }}
        />

        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">🎬</div>
              <div className="text-sm">No Image</div>
            </div>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {onClick && (
              <Button
                size="sm"
                className="w-full bg-netflix hover:bg-netflix/80 text-white mb-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                <Play className="w-4 h-4 mr-2" />
                View Details
              </Button>
            )}
          </div>
        </div>

        {/* Watchlist Controls */}
        {showWatchlistControls && (
          <div className="absolute top-2 right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="sm"
              variant="secondary"
              className={`w-8 h-8 p-0 rounded-full ${
                inWatchlist ? 'bg-netflix text-white' : 'bg-black/50 text-white hover:bg-netflix/80'
              }`}
              onClick={handleWatchlistToggle}
            >
              <Heart className={`w-4 h-4 ${inWatchlist ? 'fill-current' : ''}`} />
            </Button>
            
            {inWatchlist && (
              <Button
                size="sm"
                variant="secondary"
                className={`w-8 h-8 p-0 rounded-full ${
                  isWatched ? 'bg-green-600 text-white' : 'bg-black/50 text-white hover:bg-green-600/80'
                }`}
                onClick={handleWatchedToggle}
              >
                {isWatched ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
            )}
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute top-2 left-2">
          <Badge className="bg-black/70 text-golden border-golden/30">
            <Star className="w-3 h-3 mr-1 fill-current" />
            {item.vote_average.toFixed(1)}
          </Badge>
        </div>

        {/* Watched Indicator */}
        {isWatched && (
          <div className="absolute bottom-2 left-2">
            <Badge className="bg-green-600 text-white">
              <Eye className="w-3 h-3 mr-1" />
              Watched
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-cinematic-light mb-2 line-clamp-2 group-hover:text-netflix transition-colors duration-300">
          {title}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{year}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {type === 'movie' ? 'Movie' : 'TV Show'}
          </Badge>
        </div>

        <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
          {item.overview || 'No description available.'}
        </p>
      </CardContent>
    </Card>
  );
}