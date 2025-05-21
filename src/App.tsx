import { ThemeProvider } from './context/ThemeContext';
import { MangaTaggerProvider, useMangaTagger } from './context/MangaTaggerContext';
import { ComicInfoProvider } from './context/ComicInfoContext';
import AppLayout from './components/layout/AppLayout';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SettingsPage from './components/layout/SettingsPage';
import FilePanel from './components/files/FilePanel';
import SearchPanel from './components/search/SearchPanel';
import ResultsPanel from './components/search/ResultsPanel';
import SearchOverlay from './components/search/SearchOverlay';
import MangaDetailPanel from './components/manga/MangaDetailPanel';
import FolderDetailPanel from './components/files/FolderDetailPanel';
import ComicInfoPanel from './components/metadata/ComicInfoPanel';
import TitleField from './components/inputs/TitleField';
import { useState } from 'react';

function App() {
  return (
    <MangaTaggerProvider>
      <ThemeProvider>
        <ComicInfoProvider>
          <Router>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Home />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </Router>
        </ComicInfoProvider>
      </ThemeProvider>
    </MangaTaggerProvider>
  );
}

function Home() {
  const { selectedFolder } = useMangaTagger();
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);

  const handleOpenSearchOverlay = () => {
    setIsSearchOverlayOpen(true);
  };

  const handleCloseSearchOverlay = () => {
    setIsSearchOverlayOpen(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 h-screen">
      {/* Colonne gauche : FilePanel */}
      <div className="p-4 lg:col-span-3 overflow-auto">
        <FilePanel />
      </div>
      {/* Colonne droite */}
      <div className="p-4 lg:col-span-9 grid grid-rows-[auto_1fr] h-screen overflow-hidden">
        {selectedFolder && (
          <>
            {/* Row 1 : Title */}            <div className="flex gap-4">
              <div className="flex-grow">
              <TitleField /></div>
                      <button 
                        title="Scrape"
                        onClick={handleOpenSearchOverlay}
                        className="mt-4 bg-slate-800 text-white py-2 px-4 rounded flex items-center justify-center hover:bg-slate-700 transition-colors"
                      >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>            </div>

            {/* Row 2 : 2 colonnes */}
            <div className="grid grid-cols-2 gap-4 overflow-auto pt-4">
              <div>
                <ComicInfoPanel />
              </div>
              <div>
                <FolderDetailPanel />
              </div>
            </div>
          </>
        )}
        
        {/* Overlay de recherche */}
        <SearchOverlay 
          isOpen={isSearchOverlayOpen} 
          onClose={handleCloseSearchOverlay} 
        />
      </div>
    </div>
  );
}

export default App;

/*
<div className="lg:col-span-3 overflow-auto h-full">
  <SearchPanel />
  <ResultsPanel />
</div>
*/