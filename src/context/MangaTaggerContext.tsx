import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { SearchResult, MangaDetail, MangaFolder, CBZFile } from '../types';
import { searchManga as searchJikan, getMangaById as getMangaByIdJikan } from '../services/jikanApi';
import { login, searchManga as searchMangaDex, getMangaById as getMangaByIdMangaDex } from '../services/mangadexApi';
import { renameFile, renameFolder } from '../services/fileService'; // Import du service pour renommer les fichiers et dossiers
import { fetchFolders } from '../services/fileService';
import { extractVolumeNumber } from '../utils/fileUtils';

// https://api.mangadex.org/manga?title=Witch%20Hat%20Atelier

const generateComicInfoXML = (
  manga: MangaDetail, 
  volume: string, 
  apiSource: 'jikan' | 'mangadex',
  language: 'fr' | 'en' | 'ja',
  editableSynopsis: string
): string => {
  const webUrl = apiSource === 'jikan' 
    ? `https://myanimelist.net/manga/${manga.id}`
    : `https://mangadex.org/title/${manga.id}`; 

  const genres = manga.genres || [];
  const tags = [
    ...(manga.themes || []),
    ...(manga.demographics || [])
  ].filter(Boolean);

  const formattedTitle = volume 
    ? `${manga.title} - T${volume.padStart(2, '0')}` 
    : manga.title;

  return `
<ComicInfo>
  <Series>${manga.title}</Series>  
  <Title>${formattedTitle}</Title>
  <AlternateSeries>${manga.japaneseTitle || ''}</AlternateSeries>
  <Volume>${volume}</Volume>
  <Summary>${editableSynopsis}</Summary>
  <Writer>${manga.authors.join(', ')}</Writer>
  <Year>${manga.published?.split(' ')[0] || ''}</Year>
  <Genres>${genres.join(', ')}</Genres>
  <Tags>${tags.join(', ')}</Tags>
  <Web>${webUrl}</Web>
  <LanguageISO>${language}</LanguageISO>
</ComicInfo>
  `.trim();
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

interface MangaTaggerContextType {
  searchTerm: string;
  searchResults: SearchResult[];
  selectedManga: MangaDetail | null;
  loadingSearch: boolean;
  loadingDetail: boolean;
  error: string | null;
  mangaFolders: MangaFolder[];
  selectedFolder: string | null;
  setSearchTerm: (term: string) => void;
  handleSearch: () => Promise<void>;
  selectManga: (id: number) => Promise<void>;
  selectFolder: (folderId: string) => void;
  applyMetadataToFolder: (titleOverride?: string) => Promise<void>;
  clearSelection: () => void;
  clearError: () => void;
  clearSelectedManga: () => void;
  editableSynopsis: string;
  selectedLanguage: 'fr' | 'en' | 'ja';
  setEditableSynopsis: (synopsis: string) => void;
  setSelectedLanguage: (lang: 'fr' | 'en' | 'ja') => void;
  selectedSynopsisLanguage: 'fr' | 'en' | 'ja';
  setSelectedSynopsisLanguage: (lang: 'fr' | 'en' | 'ja') => void;
  editableTitle: string;
  setEditableTitle: (title: string) => void;
  setAllMangaFolders: (folders: MangaFolder[]) => void;
}

const MangaTaggerContext = createContext<MangaTaggerContextType | undefined>(undefined);

export const useMangaTagger = () => {
  const context = useContext(MangaTaggerContext);
  if (!context) {
    throw new Error('useMangaTagger must be used within a MangaTaggerProvider');
  }
  return context;
};

interface MangaTaggerProviderProps {
  children: ReactNode;
}

export const MangaTaggerProvider: React.FC<MangaTaggerProviderProps> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedManga, setSelectedManga] = useState<MangaDetail | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mangaFolders, setMangaFolders] = useState<MangaFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0); // État pour la progression
  const [folderProgress, setFolderProgress] = useState<Record<string, number>>({}); // Progression par dossier
  const [processedFolders, setProcessedFolders] = useState<Record<string, boolean>>({});
  const [selectedApi, setSelectedApi] = useState<'jikan' | 'mangadex'>('mangadex'); // Par défaut, mangadex
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [hideSearchResults, setHideSearchResults] = useState(false);
  const [editableSynopsis, setEditableSynopsis] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'fr' | 'en' | 'ja'>('fr');
  const [selectedSynopsisLanguage, setSelectedSynopsisLanguage] = useState<'fr' | 'en' | 'ja'>('fr');
  const [editableTitle, setEditableTitle] = useState('');

  const updateFolderProgress = (folderId: string, progress: number) => {
    setFolderProgress((prev) => ({
      ...prev,
      [folderId]: progress,
    }));
  };

  const markFolderAsProcessed = (folderId: string) => {
    setProcessedFolders((prev) => ({
      ...prev,
      [folderId]: true,
    }));
  };

  const handleSearch = async () => {
    setLoadingSearch(true);
    setError(null);
    setSelectedManga(null);

    try {
      let results = [];
      
      if (selectedApi === 'jikan') {
        results = await searchJikan(searchTerm);
      } else if (selectedApi === 'mangadex') {
        results = await searchMangaDex(searchTerm);
      }

      setSearchResults(results);
    } catch (err) {
      setError('Failed to search manga. Please try again.');
      console.error(err);
    } finally {
      setLoadingSearch(false);
    }
  };

  const selectManga = async (id: number) => {
    setLoadingDetail(true);
    setError(null);

    try {
      let mangaDetail: MangaDetail;

      if (selectedApi === 'jikan') {
        mangaDetail = await getMangaByIdJikan(id);
      } else if (selectedApi === 'mangadex') {
        mangaDetail = await getMangaByIdMangaDex(id);
      }

      setSelectedManga(mangaDetail);
    } catch (err) {
      console.error('Failed to load manga details:', err);
      setError('Failed to load manga details. Please try again.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const selectFolder = (folderId: string | null) => {
    setSelectedFolder(folderId);
  };

  // Ajouter cette fonction utilitaire
  const getLanguageFromTitle = (manga: MangaDetail, title: string): 'fr' | 'en' | 'ja' => {
    if (manga.frenchTitle === title) return 'fr';
    if (manga.englishTitle === title) return 'en';
    if (manga.japaneseTitle === title) return 'ja';
    return 'en'; // par défaut
  };

  const applyMetadataToFolder = async (titleOverride?: string) => {
    if (!selectedManga || !selectedFolder) {
      setError('Veuillez sélectionner un manga et un dossier pour appliquer les métadonnées.');
      return;
    }
  
    const finalTitle = (titleOverride || editableTitle || selectedManga.title).trim();
  
    try {
      const folder = mangaFolders.find(folder => folder.id === selectedFolder);
      if (!folder) {
        setError('Dossier sélectionné introuvable.');
        return;
      }
  
      for (let i = 0; i < folder.files.length; i++) {
        const file = folder.files[i];
        const oldPath = `${folder.path}/${file.name}`;
        const volume = extractVolumeNumber(file.name); // Utilisation de la fonction pour extraire le numéro de volume
  
        // Extraire l'extension du fichier
        const fileExtension = file.name.split('.').pop(); // Exemple : "cbr" ou "cbz"
  
        // Construire le nouveau nom avec l'extension d'origine
        const newName = `${finalTitle} - T${volume}.${fileExtension}`;
  
        // Renommer le fichier
        const newPath = `${folder.path}/${newName}`;
        await renameFile(oldPath, newPath);
  
        // Générer ComicInfo.xml
        const comicInfoXML = generateComicInfoXML(
          selectedManga,
          volume,
          selectedApi,
          selectedLanguage,
          editableSynopsis
        );
  
        // Ajouter ComicInfo.xml au fichier (si nécessaire)
        await updateCBZMetadata(newPath, comicInfoXML, `${finalTitle} - T${volume}`);
      }
    } catch (err) {
      console.error('Erreur lors de l’application des métadonnées au dossier :', err);
      setError('Échec de l’application des métadonnées. Veuillez réessayer.');
    }
  };

  const refreshFolders = async () => {
    try {
      const updatedFolders = await fetchFolders(); // Fonction pour récupérer les dossiers
      setMangaFolders(updatedFolders);
    } catch (err) {
      console.error('Failed to refresh folders:', err);
    }
  };

  const clearSelection = () => {
    setSelectedFolder(null);
  };

  const clearError = () => {
    setError(null);
  };

  const clearSelectedManga = () => {
    setSelectedManga(null);
  };

  // Ajouter un effet pour gérer l'URL initiale
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/manga\/(\d+)$/);
    if (match) {
      const mangaId = parseInt(match[1], 10);
      selectManga(mangaId);
    }
  }, []);

  // Mettre à jour le synopsis éditable quand un manga est sélectionné
  useEffect(() => {
    if (selectedManga) {
      setEditableSynopsis(selectedManga.synopsis || '');
    }
  }, [selectedManga]);

  // Mettre à jour le synopsis quand la langue est changée
  useEffect(() => {
    if (selectedManga) {
      const synopsis = selectedSynopsisLanguage === 'fr' ? selectedManga.synopsisFr :
                      selectedSynopsisLanguage === 'en' ? selectedManga.synopsisEn :
                      selectedManga.synopsisJa;
      setEditableSynopsis(synopsis || selectedManga.synopsis || '');
    }
  }, [selectedManga, selectedSynopsisLanguage]);

  // Ajouter un useEffect pour initialiser le titre éditable
  useEffect(() => {
    if (selectedManga) {
      setEditableTitle(selectedManga.title || '');
    }
  }, [selectedManga]);

  const setAllMangaFolders = (folders: MangaFolder[]) => {
    setMangaFolders(folders);
  };

  const generateMetadataPreview = (): { fileName: string; diffs: Record<string, { before: any; after: any }> }[] => {
    if (!selectedManga || !selectedFolder) return [];
  
    const folder = mangaFolders.find((folder) => folder.id === selectedFolder);
    if (!folder) return [];
  
    return folder.files.map((file) => {
      const diffs: Record<string, { before: any; after: any }> = {};
      const volume = extractVolumeNumber(file.name); // Utilisation de la fonction pour extraire le numéro de volume
  
      // Extraire l'extension du fichier
      const fileExtension = file.name.split('.').pop(); // Exemple : "cbr" ou "cbz"
  
      // Construire le nouveau nom avec l'extension d'origine
      const newFileName = `${selectedManga.title} - T${volume}.${fileExtension}`;
  
      // Générer ComicInfo.xml
      const comicInfoXML = generateComicInfoXML(
        selectedManga,
        volume,
        selectedApi,
        selectedLanguage,
        editableSynopsis
      );
  
      diffs['parentFolder'] = {
        before: folder.name,
        after: selectedManga.title,
      };
  
      diffs['fileName'] = {
        before: file.name,
        after: newFileName,
      };
  
      diffs['ComicInfo.xml'] = {
        before: null, // Pas de contenu avant
        after: comicInfoXML, // Contenu généré
      };
  
      return { fileName: file.name, diffs };
    });
  };

  return (
    <MangaTaggerContext.Provider
      value={{
        searchTerm,
        searchResults,
        selectedManga,
        loadingSearch,
        loadingDetail,
        error,
        mangaFolders,
        selectedFolder,
        setSearchTerm,
        folderProgress,
        processedFolders,
        markFolderAsProcessed,
        updateFolderProgress,
        handleSearch,
        selectManga,
        selectFolder,
        applyMetadataToFolder,
        clearSelection,
        clearError,
        clearSelectedManga,
        generateMetadataPreview,
        selectedApi, 
        setSelectedApi, 
        editableSynopsis,
        selectedLanguage,
        setEditableSynopsis,
        setSelectedLanguage,
        selectedSynopsisLanguage,
        setSelectedSynopsisLanguage,
        editableTitle,
        setEditableTitle,
        hideSearchResults,
        setHideSearchResults, // Ajout de la fonction pour modifier l'état
        setAllMangaFolders, // Exposer la nouvelle fonction
      }}
    >
      {children}
    </MangaTaggerContext.Provider>
  );
};