import React, { useContext } from 'react';
import { Star } from 'lucide-react';
import { SearchResult } from '../../types';
import { useMangaTagger } from '../../context/MangaTaggerContext';
import { useTheme } from '../../context/ThemeContext';

interface MangaCardProps {
  manga: SearchResult;
}

const MangaCard: React.FC<MangaCardProps> = ({ manga }) => {
  const { selectManga } = useMangaTagger();
  const { theme } = useTheme();

  return (
    <div 
      className={`manga-card rounded-lg overflow-hidden shadow-md ${
        theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'
      } cursor-pointer transition-all duration-200`}
      onClick={() => selectManga(manga.id)}
    > 
      <div className="pb-[150%] relative"> 
        <img 
          src={manga.imageUrl} 
          alt={manga.title} 
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x300?text=No+Image';
          }}
        />
        {manga.score > 0 && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-sm px-2 py-1 rounded-full flex items-center">
            <Star size={14} className="text-yellow-400 mr-1" fill="#FBBF24" />
            <span>{manga.score.toFixed(1)}</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-2 h-10" title={manga.title}>
          {manga.title}
        </h3>
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>{manga.type || 'Unknown'}</span>
          {manga.volumes && <span>{manga.volumes} vols</span>}
          {manga.year && <span>{manga.year}</span>}
        </div>
      </div>
    </div>
  );
};

export default MangaCard;