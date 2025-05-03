import React, { useEffect, useRef, KeyboardEvent } from 'react';
import { Search } from 'lucide-react';
import { useMangaTagger } from '../../context/MangaTaggerContext';
import { useTheme } from '../../context/ThemeContext';

const SearchPanel: React.FC = () => {
  const { 
    searchTerm, 
    setSearchTerm, 
    handleSearch, 
    loadingSearch,
    selectedApi,
    setSelectedApi,
    setHideSearchResults,
  } = useMangaTagger();
  const { theme } = useTheme();

  const searchInputRef = useRef<HTMLInputElement>(null); // Référence pour le champ de recherche

  useEffect(() => {
    // Mettre le focus sur le champ de recherche au chargement
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchWithReset();
    }
  };

  const handleSearchWithReset = async () => {
    setHideSearchResults(false); // Réafficher les résultats de recherche
    await handleSearch(); // Effectuer la recherche
  };

  return (
    <div className="flex items-start space-x-4">
      <div className="relative flex-1">
        {/* Label stylisé pour le champ de recherche */}
        <label 
          htmlFor="search-input" 
          className={`block text-sm font-medium ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          Titre du manga
        </label>
        <input
          id="search-input"
          ref={searchInputRef} // Associe la référence au champ de recherche
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ex : Dorohedoro"
          className={`w-full mt-1 py-2 px-4 pr-10 rounded-lg ${
            theme === 'dark' 
              ? 'bg-gray-700 border-gray-600 focus:border-purple-500' 
              : 'bg-gray-100 border-gray-300 focus:border-purple-500'
          } border focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all`}
        />
        {loadingSearch && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <div className="relative">
        {/* Label stylisé pour le champ select */}
        <label 
          htmlFor="api-select" 
          className={`block text-sm font-medium ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          API
        </label>
        <select
          id="api-select"
          value={selectedApi}
          onChange={(e) => setSelectedApi(e.target.value as 'jikan' | 'mangadex')}
          className={`w-32 mt-1 py-2 px-3 rounded-lg ${
            theme === 'dark' 
              ? 'bg-gray-700 border-gray-600 focus:border-purple-500' 
              : 'bg-gray-100 border-gray-300 focus:border-purple-500'
          } border focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all`}
        >
          <option value="mangadex">MangaDex</option>
          <option value="jikan">Jikan (MyAnimeList)</option>
        </select>
      </div>

      <button
        onClick={handleSearchWithReset}
        disabled={loadingSearch}
        className={`h-[42px] px-6 rounded-lg whitespace-nowrap ${
          theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'
        } text-white font-medium flex items-center self-end transition-colors ${
          loadingSearch ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {!loadingSearch && <Search size={18} className="mr-2" />}
        {loadingSearch ? 'Recherche en cours' : 'Rechercher'}
      </button>
    </div>
  );
};

export default SearchPanel;