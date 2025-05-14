import { ThemeProvider } from './context/ThemeContext';
import { MangaTaggerProvider, useMangaTagger } from './context/MangaTaggerContext';
import AppLayout from './components/layout/AppLayout';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SettingsPage from './components/layout/SettingsPage';
import FilePanel from './components/files/FilePanel';
import SearchPanel from './components/search/SearchPanel';
import ResultsPanel from './components/search/ResultsPanel';
import MangaDetailPanel from './components/manga/MangaDetailPanel';
import FolderDetailPanel from './components/files/FolderDetailPanel';
import ComicInfoPanel from './components/metadata/ComicInfoPanel';

function App() {
  return (
    <MangaTaggerProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </MangaTaggerProvider>
  );
}

function Home() {
  const { selectedFolder } = useMangaTagger();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      <div className="lg:col-span-3 overflow-auto h-full">
        <FilePanel />
      </div>
      <div className="lg:col-span-3 overflow-auto h-full">
        <SearchPanel />
        <ResultsPanel />
      </div>
      <div className="lg:col-span-6 h-full grid grid-rows-2 gap-4 overflow-hidden">
        {selectedFolder && (
          <div className="row-span-1 p-4 overflow-hidden">
            <ComicInfoPanel />
          </div>
        )}
        <div className="row-span-1 p-4 overflow-hidden">
          <FolderDetailPanel />
        </div>
      </div>
    </div>
  );
}

export default App;