import React, { useEffect, useState } from 'react';
import { Folder, Tag, CheckCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useMangaTagger } from '../../context/MangaTaggerContext';
import { MangaFolder } from '../../types';
import { renameFile, renameFolder } from '../../services/fileService';

let isFetching = false;

const FilePanel: React.FC = () => {
  const { 
    mangaFolders = [], 
    selectFolder, 
    selectedFolder, 
    folderProgress, 
    processedFolders,
    setAllMangaFolders  // Utiliser la nouvelle fonction
  } = useMangaTagger();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFolderClick = (folderId: string) => {
    if (selectedFolder === folderId) {
      selectFolder(null); // Décocher si le dossier est déjà sélectionné
    } else {
      selectFolder(folderId); // Sélectionner le dossier
    }
  };

  // Fonction pour récupérer les fichiers du dossier spécifié dans FILES_PATH
  const fetchFilesFromServer = async () => {
    if (isFetching) return; // Empêche un deuxième appel
    isFetching = true;

    console.log('fetchFilesFromServer appelé');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/files`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }

      const folders: MangaFolder[] = await response.json();
      console.log('Données reçues du backend :', folders);

      // Traiter les dossiers et définir les valeurs par défaut
      const processedFolders = folders.map(folder => ({
        ...folder,
        files: folder.files || [],
      }));

      // Mettre à jour tous les dossiers d'un coup
      setAllMangaFolders(processedFolders);
    } catch (err) {
      console.error('Erreur lors de la récupération des fichiers :', err);
      setError('Impossible de récupérer les fichiers.');
    } finally {
      setLoading(false);
      isFetching = false; // Réinitialise le drapeau
    }
  };

  const handleRename = async (file: CBZFile, folderPath: string) => {
    const oldPath = `${folderPath}/${file.name}`;
    const newName = prompt('Enter new name:', file.name);
    if (!newName) return;

    const newPath = `${folderPath}/${newName}`;
    try {
      await renameFile(oldPath, newPath);
      alert('File renamed successfully!');
    } catch (error) {
      console.error('Error renaming file:', error);
      alert('Failed to rename file.');
    }
  };

  // Charger les fichiers au montage du composant
  useEffect(() => {
    fetchFilesFromServer();
  }, []); // Assurez-vous que le tableau de dépendances est vide

  return (
    <div
      className={`p-4 rounded-lg ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } shadow-m fade-in h-full flex flex-col`}
    >
      <h2 className="text-lg font-semibold mb-4">Dossiers</h2>

      {loading ? (
        <p className="text-sm text-gray-500">Chargement des fichiers...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : mangaFolders.length === 0 ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            theme === 'dark'
              ? 'border-gray-700 text-gray-500'
              : 'border-gray-300 text-gray-400'
          } flex-1`}
        >
          <Folder size={36} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucun fichier trouvé dans le dossier spécifié</p>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div
            className={`divide-y ${
              theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
            } flex-1 overflow-y-auto pr-2`}
          >
            {mangaFolders.map((folder) => {
              const cbzCount = folder.files.filter((file) => file.name?.endsWith('.cbz')).length;
              const cbrCount = folder.files.filter((file) => file.name?.endsWith('.cbr')).length;
              const isClickable = cbzCount > 0 || cbrCount > 0;

              return (
                <div key={folder.id}>
                  <div
                    title={folder.name}
                    onClick={isClickable ? () => handleFolderClick(folder.id) : undefined}
                    className={`cbz-file py-1 px-2 my-1 rounded cursor-pointer ${
                      selectedFolder === folder.id ? 'selected' : ''
                    } ${!isClickable ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                          selectedFolder === folder.id
                            ? 'bg-purple-500 text-white'
                            : theme === 'dark'
                            ? 'border border-gray-600'
                            : 'border border-gray-300'
                        }`}
                      >
                        {folderProgress[folder.id] !== undefined && folderProgress[folder.id] < 100 ? (
                          <svg
                            className="animate-spin h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            ></path>
                          </svg>
                        ) : processedFolders[folder.id] ? (
                          <CheckCircle size={14} className="text-green-500" />
                        ) : selectedFolder === folder.id ? (
                          <CheckCircle size={14} />
                        ) : null}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{folder.name}</p>
                      </div>
                    </div>

                    {/* ProgressBar */}
                    {folderProgress[folder.id] !== undefined && folderProgress[folder.id] < 100 && (
                      <div className="progress-bar mt-2">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${folderProgress[folder.id]}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilePanel;