import { ThemeProvider } from './context/ThemeContext';
import { MangaTaggerProvider } from './context/MangaTaggerContext';
import AppLayout from './components/layout/AppLayout';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SettingsPage from './components/layout/SettingsPage';
import FilePanel from './components/files/FilePanel';
import SearchPanel from './components/search/SearchPanel';
import ResultsPanel from './components/search/ResultsPanel';
import MangaDetailPanel from './components/manga/MangaDetailPanel';
import FolderDetailPanel from './components/files/FolderDetailPanel';

function App() {
  return (
    <ThemeProvider>
      <MangaTaggerProvider>
        <Router>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                  <div className="lg:col-span-3 overflow-auto h-full">
                    <FilePanel />
                  </div>
                  <div className="lg:col-span-3 overflow-auto h-full">
                    <FolderDetailPanel />
                  </div>
                  <div className="lg:col-span-6 overflow-auto h-full">
                    <div className={`p-4 rounded-lg shadow-md slide-up max-h-full h-full flex flex-col`}>
                      <SearchPanel />
                      <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
                      <ResultsPanel />
                    </div>
                  </div>
                </div>
              } />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Router>
      </MangaTaggerProvider>
    </ThemeProvider>
  );
}

export default App;