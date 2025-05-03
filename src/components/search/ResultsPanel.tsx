import React, { useState } from 'react';
import { useMangaTagger } from '../../context/MangaTaggerContext';
import { useTheme } from '../../context/ThemeContext';
import MangaCard from '../manga/MangaCard';
import MangaListItem from '../manga/MangaListItem';

const ResultsPanel: React.FC = () => {
  const { searchResults, loadingSearch, searchTerm, hideSearchResults } = useMangaTagger();
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list'); // Default to list view

  if (loadingSearch) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-center text-gray-500">Recherche de mangas...</p>
      </div>
    );
  }

  if (hideSearchResults) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-center text-gray-500">Recherchez des mangas</p>
      </div>
    );
  }

  if (searchResults.length === 0 && searchTerm) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-center text-gray-500">Aucun résultat trouvé pour "{searchTerm}"</p>
      </div>
    );
  }

  if (searchResults.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-center text-gray-500">Recherchez des mangas</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Résultats de recherche</h2>
        <div className="flex">
          <button
            className={`px-2 py-1 text-sm rounded-l ${
              viewMode === 'list'
                ? theme === 'dark'
                  ? 'bg-purple-500 text-white'
                  : 'bg-purple-500 text-white'
                : theme === 'dark'
                ? 'bg-gray-700 text-gray-300'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
          <button
            className={`px-2 py-1 text-sm rounded-r ${
              viewMode === 'grid'
                ? theme === 'dark'
                  ? 'bg-purple-500 text-white'
                  : 'bg-purple-500 text-white'
                : theme === 'dark'
                ? 'bg-gray-700 text-gray-300'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pr-2">
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2'
              : 'flex flex-col gap-2'
          }
        >
          {searchResults.map((manga) =>
            viewMode === 'grid' ? (
              <MangaCard key={manga.id} manga={manga} />
            ) : (
              <MangaListItem key={manga.id} manga={manga} />
            )
          )}
        </div>
      </div>
    </>
  );
};

export default ResultsPanel;