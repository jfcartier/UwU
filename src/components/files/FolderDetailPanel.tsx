import React from 'react';
import { useMangaTagger } from '../../context/MangaTaggerContext';
import { useTheme } from '../../context/ThemeContext';

const FolderDetailPanel: React.FC = () => {
  const { selectedFolder, mangaFolders } = useMangaTagger();
  const { theme } = useTheme();

  if (!selectedFolder) {
    return (
      <div
        className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-md flex items-center justify-center h-full`}
      >
        <p className="text-gray-500">Sélectionnez un dossier pour afficher son contenu.</p>
      </div>
    );
  }

  const folder = mangaFolders.find((folder) => folder.id === selectedFolder);

  if (!folder) {
    return (
      <div
        className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-md flex items-center justify-center h-full`}
      >
        <p className="text-gray-500">Dossier introuvable.</p>
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-lg ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } shadow-md h-full`}
    >
      <h2 className="text-lg font-semibold mb-4">{folder.name}</h2>
      <ul className="space-y-2">
        {folder.files.map((file) => {
          const isModifiable = file.name.endsWith('.cbz') || file.name.endsWith('.cbr');
          return (
            <li
              key={file.id}
              className={`p-2 rounded ${
                isModifiable
                  ? theme === 'dark'
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-100 text-gray-900'
                  : theme === 'dark'
                  ? 'bg-gray-900 text-gray-500'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {file.name}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default FolderDetailPanel;