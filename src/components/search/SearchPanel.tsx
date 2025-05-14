import React, { useEffect, useRef, KeyboardEvent, useState } from 'react';
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
    selectedLanguage,
    setSelectedLanguage,
    selectedFolder,
  } = useMangaTagger();
  const { theme } = useTheme();

  const [showApiInfo, setShowApiInfo] = useState(false);

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

  // Add event listener for ESC key
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowApiInfo(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (selectedFolder) {
      const folderName = selectedFolder.split('/').pop()?.split('\\').pop() || selectedFolder; // Extraire le nom du dossier en gérant les séparateurs
      setSearchTerm(folderName); // Mettre à jour le champ de recherche avec le nom du dossier
    }
  }, [selectedFolder, setSearchTerm]);

  return (
    <div className="">
      <div className="">
        {/* Label stylisé pour le champ de recherche */}
        <label 
          htmlFor="search-input" 
          className={`block text-sm font-medium ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          Manga
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
          } flex items-center`}
        >
          API
          <button
            type="button"
            onClick={() => setShowApiInfo(true)}
            className={`ml-2 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
            title="Informations sur les APIs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4" fill="currentColor">
              <path d="M504 256c0 137-111 248-248 248S8 393 8 256C8 119.1 119 8 256 8s248 111.1 248 248zM262.7 90c-54.5 0-89.3 23-116.5 63.8-3.5 5.3-2.4 12.4 2.7 16.3l34.7 26.3c5.2 3.9 12.6 3 16.7-2.1 17.9-22.7 30.1-35.8 57.3-35.8 20.4 0 45.7 13.1 45.7 33 0 15-12.4 22.7-32.5 34C247.1 238.5 216 254.9 216 296v4c0 6.6 5.4 12 12 12h56c6.6 0 12-5.4 12-12v-1.3c0-28.5 83.2-29.6 83.2-106.7 0-58-60.2-102-116.5-102zM256 338c-25.4 0-46 20.6-46 46 0 25.4 20.6 46 46 46s46-20.6 46-46c0-25.4-20.6-46-46-46z"/>
            </svg>
          </button>
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

        {/* Modal for API information */}
        {showApiInfo && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowApiInfo(false);
              }
            }}
          >
            <div className={`bg-${theme === 'dark' ? 'gray-800' : 'white'} p-6 rounded-lg shadow-lg max-w-lg w-full relative`}>
              <h3 className="text-lg font-semibold mb-4">Informations sur les APIs</h3>
              <table className="table-auto w-full text-sm">
                <thead>
                  <tr className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}> 
                    <th className="px-4 py-2 text-left align-top">Nom</th>
                    <th className="px-4 py-2 text-left align-top">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2">MangaDex</td>
                    <td className="px-4 py-2">API pour rechercher et récupérer des informations sur les mangas depuis MangaDex.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">Jikan</td>
                    <td className="px-4 py-2">API non officielle pour accéder aux données de MyAnimeList.</td>
                  </tr>
                </tbody>
              </table>
              <button
                onClick={() => setShowApiInfo(false)}
                className="absolute top-2 right-2 opacity-80 hover:opacity-100"
                title="Fermer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={theme === 'dark' ? 'white' : 'black'}
                  className="w-5 h-5"
                >
                  <path d="M6 18L18 6M6 6l12 12" stroke={theme === 'dark' ? 'white' : 'black'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        {/* Label for preferred language */}
        <label 
          htmlFor="language-select" 
          className={`block text-sm font-medium ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          Langue espérée
        </label>
        <select
          id="language-select"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value as 'fr' | 'en' | 'ja')}
          className={`w-32 mt-1 py-2 px-3 rounded-lg ${
            theme === 'dark' 
              ? 'bg-gray-700 border-gray-600 focus:border-purple-500' 
              : 'bg-gray-100 border-gray-300 focus:border-purple-500'
          } border focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all`}
        >
          <option value="fr">Français</option>
          <option value="en">Anglais</option>
          <option value="ja">Japonais</option>
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