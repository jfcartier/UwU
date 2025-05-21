import React, { useRef } from 'react';
import { Settings, Home } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Link, Outlet } from 'react-router-dom';

const AppLayout: React.FC = () => {
  const { theme } = useTheme();
  const audioRef = useRef<HTMLAudioElement>(null);

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;

/*
<div className="w-30 bg-black/10 text-white flex flex-col justify-between">
  <div className="p-3 mt-5">
    <div className="flex justify-center mb-4">
      <svg
        className="h-5 cursor-pointer"
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
          <Link to="/" className="flex flex-col items-center space-y-2">
            <Home size={20} />
            <span>Accueil</span>
          </Link>
        </li>
      </ul>
    </nav>
  </div>

  <div className="flex flex-col items-center space-y-4 p-3 my-5">
    <Link to="/settings" title="Configurations" className="flex flex-col items-center space-y-2">
      <Settings size={20} />
    </Link>
  </div>
</div>
*/