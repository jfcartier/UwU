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
    <div
      className={`p-4 rounded-lg ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } shadow-m fade-in h-full flex flex-col`}
    >
      <h2 className="text-lg font-semibold mb-4">Détails du dossier</h2>

      <div className="flex-1 overflow-y-auto">
        {folder.files.map((file) => (
          <div key={file.id} className="mb-4 flex items-start">
            <div className="mt-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 384 512"
                fill="currentColor"
                className={`w-4 h-4 mr-2`}
              >
                <path d="M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 288c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-gray-500">
                {file.hasComicInfo ? '✅ ComicInfo.xml présent' : '❌ ComicInfo.xml absent'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FolderDetailPanel;