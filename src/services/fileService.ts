import { MangaFolder } from '../types';

export const renameFile = async (oldPath: string, newName: string) => {
  console.log(`Renommage demandé : ${oldPath} -> ${newName}`);
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/rename`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ oldPath, newName }),
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP : ${response.status}`);
  }

  return await response.json();
};

export const renameFolder = async (oldPath: string, newName: string) => {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/rename`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ oldPath, newName }),
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP : ${response.status}`);
  }

  return await response.json();
};

export const updateCBZMetadata = async (filePath: string, comicInfoXML: string, folderTitle: string) => {
  console.log('Données envoyées au backend :', { filePath, comicInfoXML, folderTitle });

  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/update-cbz`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filePath,
      comicInfoXML,
      folderTitle, // Renommer le dossier interne
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update CBZ file: ${response.status}`);
  }

  return await response.json();
};

export const fetchFolders = async (): Promise<MangaFolder[]> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/folders`);
    if (!response.ok) {
      throw new Error(`Failed to fetch folders: ${response.status}`);
    }
    const folders = await response.json();
    return folders.map((folder: any) => ({
      ...folder,
      files: folder.files || [], // Assurez-vous que les fichiers sont inclus
    }));
  } catch (err) {
    console.error('Error fetching folders:', err);
    throw err;
  }
};

export const extractMetadata = async (filePath: string): Promise<any> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/extract-metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filePath }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Pas de métadonnées trouvées
      }
      throw new Error(`Failed to extract metadata: ${response.status}`);
    }

    const data = await response.json();
    return data.metadata;
  } catch (err) {
    console.error('Error extracting metadata:', err);
    return null;
  }
};