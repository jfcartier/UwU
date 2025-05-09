import React, { useRef, useState } from 'react';
import { Settings, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useMangaTagger } from '../../context/MangaTaggerContext';
import { Link, Outlet } from 'react-router-dom';

const AppLayout: React.FC = () => {
  const { theme } = useTheme();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev: boolean) => !prev);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div
        className={`transition-width duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-16'
        } bg-gray-800 text-white flex flex-col justify-between`}
      >
        <div className={`${isSidebarOpen ? 'p-4' : 'p-3 mt-5'}`}>
          <div className="flex justify-center mb-4">
            <svg
              className={`h-5 cursor-pointer`}
              xmlns="http://www.w3.org/2000/svg"
              xmlSpace="preserve"
              style={{
                fillRule: 'evenodd',
                clipRule: 'evenodd',
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeMiterlimit: 1.5,
              }}
              viewBox="0 0 916 508"
              onClick={playAudio}
            >
              <path d="M0 0h916v508H0z" style={{ fill: 'none' }} />
              <path
                d="M657 55a199 199 0 1 1-199 199A199 199 0 1 1 259 55"
                style={{
                  fill: 'none',
                  stroke: theme === 'dark' ? '#9333ea' : '#7e22ce',
                  strokeWidth: '100px',
                }}
              />
            </svg>
          </div>
          <audio ref={audioRef} src="src/audio/uwu.mp3" preload="auto" />
          <nav className="mt-8">
            <ul className="space-y-4">
              <li>
                <Link to="/" className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded">
                  <Home size={20} />
                  {isSidebarOpen && <span>Accueil</span>}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className={`flex flex-col items-center space-y-4 ${isSidebarOpen ? 'p-4' : 'p-3 my-2'}`}>
          <Link to="/settings" className="w-full">
            <button
              className="flex items-center space-x-2 w-full p-2 rounded transition-colors"
              aria-label="Settings"
            >
              <Settings size={20} />
              {isSidebarOpen && <span>Configurations</span>}
            </button>
          </Link>
          <button
            onClick={toggleSidebar}
            className="flex items-center space-x-2 w-full p-2 rounded transition-colors"
            aria-label="Expand/Collapse Sidebar"
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            {isSidebarOpen && <span>{isSidebarOpen ? 'Refermer' : 'Ouvrir'}</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;