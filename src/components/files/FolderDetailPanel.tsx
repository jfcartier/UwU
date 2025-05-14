import React from 'react';
import { useMangaTagger } from '../../context/MangaTaggerContext';
import { useTheme } from '../../context/ThemeContext';

const FolderDetailPanel: React.FC = () => {
  const { selectedFolder, mangaFolders } = useMangaTagger();
  const { theme } = useTheme();

  const folder = mangaFolders.find((f) => f.id === selectedFolder);

  if (!folder) {
    return (
      <div
        className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-m fade-in h-full flex flex-col`}
      >
        <p className="text-sm text-gray-500">Aucun dossier sélectionné</p>
      </div>
    );
  }

  return (
    <div className="p-4 fade-in h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Détails du dossier</h2>
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="divide-y divide-gray-700 flex-1 overflow-y-auto pr-2 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar scrollbar-thumb-purple-900 scrollbar-track-black/20 scrollbar-thin">
        {folder.files.map((file, index: number) => (
          <div key={file.id} className="flex items-start">
            <div
              className={`mt-4 mr-2 font-bold text-sm ${
                file.name.split('.').pop()?.toLowerCase() === 'cbz'
                  ? 'text-lime-400'
                  : file.name.split('.').pop()?.toLowerCase() === 'cbr'
                  ? 'text-amber-400'
                  : 'text-gray-400'
              }`}
            >
              {file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN'}
            </div>
            <div className="flex-grow">
              <input
                type="text"
                name={`file-${index}`}
                defaultValue={file.name}
                className="pb-1 pt-3 font-medium bg-transparent border-b border-gray-400 focus:outline-none focus:border-purple-500 w-full"
              />
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};

export default FolderDetailPanel;