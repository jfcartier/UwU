import React, { useRef } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import SearchPanel from '../search/SearchPanel';
import ResultsPanel from '../search/ResultsPanel';
import FilePanel from '../files/FilePanel';
import Toast from '../ui/Toast';
import MangaDetailPanel from '../manga/MangaDetailPanel';
import { useMangaTagger } from '../../context/MangaTaggerContext';
import FolderDetailPanel from '../files/FolderDetailPanel';

const AppLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { error, clearError, selectedManga } = useMangaTagger();
  const audioRef = useRef<HTMLAudioElement>(null);

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'
    }`}>
      <header className={`py-4 px-6 sticky top-0 z-10`}>
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <svg
                className="h-4 cursor-pointer"
                xmlns="http://www.w3.org/2000/svg"
                xmlSpace="preserve"
                style={{
                  fillRule: "evenodd",
                  clipRule: "evenodd",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeMiterlimit: 1.5,
                }}
                viewBox="0 0 916 508"
                onClick={playAudio} // Add click handler
              >
                <path
                  d="M0 0h916v508H0z"
                  style={{ fill: "none" }}
                />
                <path
                  d="M657 55a199 199 0 1 1-199 199A199 199 0 1 1 259 55"
                  style={{
                    fill: "none",
                    stroke: theme === "dark" ? "#9333ea" : "#7e22ce", // Dynamic stroke color
                    strokeWidth: "100px",
                  }}
                />
              </svg>
              <h1 className="text-xl font-bold invisible">Gestionnaire de manga</h1>
            </div>
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full ${
                theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              } transition-colors`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>
      <audio ref={audioRef} src="/src/audio/uwu.mp3" /> {/* Add audio element */}
      {/* Main content avec hauteur maximale */}
      <main className="container mx-auto h-[calc(100vh-100px)]"> {/* Ajusté la hauteur du main */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full"> {/* Changed h-[calc(100vh-180px)] to h-full */}
          {/* Panneau de gauche - FilePanel */}
          <div className="lg:col-span-3 overflow-auto h-full"> {/* Ajouté h-full */}
            <FilePanel />
          </div>

          {/* Colonne centrale - FolderDetailPanel */}
          <div className="lg:col-span-3 overflow-auto h-full">
            <FolderDetailPanel />
          </div>

          {/* Panneau de droite - ResultsPanel ou MangaDetailPanel */}
          <div className="lg:col-span-6 overflow-auto h-full">
            <div className={`p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-md slide-up max-h-full h-full flex flex-col`}>
              <SearchPanel />
              <hr className={"h-px my-4 bg-gray-200 border-0 dark:bg-gray-700"} />
              {selectedManga ? <MangaDetailPanel /> : <ResultsPanel />}
            </div>
          </div>
        </div>
      </main>

      {/* Toast notifications */}
      {error && (
        <Toast 
          message={error} 
          type="error" 
          onClose={clearError} 
        />
      )}
    </div>
  );
};

export default AppLayout;