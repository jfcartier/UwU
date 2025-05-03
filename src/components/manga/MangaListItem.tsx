import React from 'react';
import { SearchResult } from '../../types';
import { useMangaTagger } from '../../context/MangaTaggerContext';
import { useTheme } from '../../context/ThemeContext';

interface MangaListItemProps {
  manga: SearchResult;
}

const MangaListItem: React.FC<MangaListItemProps> = ({ manga }) => {
  const { selectManga } = useMangaTagger();
  const { theme } = useTheme();

  return (
    <div
      className={`flex items-center p-2 rounded-lg ${
        theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'
      } cursor-pointer transition-all duration-200`}
      onClick={() => selectManga(manga.id)}
    >
      <img
        src={manga.imageUrl}
        alt={manga.title}
        className="w-16 h-24 object-cover rounded mr-4"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x150?text=No+Image';
        }}
      />
      <div className="flex-1 overflow-hidden">
        <h3 className="font-medium text-sm truncate" title={manga.title}>
          {manga.title}
        </h3>
        <p className="text-xs text-gray-500">
          {manga.type || 'Unknown'} {manga.volumes && `- ${manga.volumes} vols`} {manga.year && `- ${manga.year}`}
        </p>
        {manga.synopsis && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{manga.synopsis}</p>
        )}
      </div>
    </div>
  );
};

export default MangaListItem;