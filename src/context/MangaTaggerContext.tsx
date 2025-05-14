import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { SearchResult, MangaDetail, MangaFolder } from '../types';
import { searchManga as searchJikan, getMangaById as getMangaByIdJikan } from '../services/jikanApi';
import { searchManga as searchMangaDex, getMangaById as getMangaByIdMangaDex } from '../services/mangadexApi';
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
  selectFolder: (folderId: string | null) => void;
  applyMetadataToFolder: (onFillMetadata?: (metadataList: any[]) => void) => Promise<void>;
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
  selectedApi: 'jikan' | 'mangadex';
  setSelectedApi: (api: 'jikan' | 'mangadex') => void;
  hideSearchResults: boolean;
  setHideSearchResults: (hide: boolean) => void;
  folderProgress: Record<string, number>;
  processedFolders: string[];
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
  const [selectedApi, setSelectedApi] = useState<'jikan' | 'mangadex'>('mangadex'); // Par défaut, mangadex
  const [hideSearchResults, setHideSearchResults] = useState(false);
  const [editableSynopsis, setEditableSynopsis] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'fr' | 'en' | 'ja'>('fr');
  const [selectedSynopsisLanguage, setSelectedSynopsisLanguage] = useState<'fr' | 'en' | 'ja'>('fr');
  const [editableTitle, setEditableTitle] = useState('');
  const [sessionToken] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoadingSearch(true);
    setError(null);
    setSelectedManga(null);

    try {
      let results: SearchResult[] = [];
      
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
      let mangaDetail: MangaDetail | null = null;

      if (selectedApi === 'jikan') {
        mangaDetail = await getMangaByIdJikan(id);
      } else if (selectedApi === 'mangadex') {
        if (!sessionToken) {
          console.warn('Session token is missing. Proceeding without authentication.');
          mangaDetail = await getMangaByIdMangaDex(id.toString(), ''); // Fallback to empty token
        } else {
          mangaDetail = await getMangaByIdMangaDex(id.toString(), sessionToken);
        }
      }

      if (mangaDetail) {
        setSelectedManga(mangaDetail);
      } else {
        setError('Failed to retrieve manga details.');
      }
    } catch (err) {
      console.error('Failed to load manga details:', err);
      setError('Failed to load manga details. Please try again.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const selectFolder = (folderId: string | null) => {
    if (folderId === null) {
      setSelectedFolder(null); // Handle deselection
      return;
    }
    setSelectedFolder(folderId); // Handle selection
  };

  const applyMetadataToFolder = async (onFillMetadata?: (metadataList: any[]) => void) => {
    if (!selectedManga || !selectedFolder) {
      setError('Veuillez sélectionner un manga et un dossier pour appliquer les métadonnées.');
      return;
    }
  
    try {
      const folder = mangaFolders.find(folder => folder.id === selectedFolder);
      if (!folder) {
        setError('Dossier sélectionné introuvable.');
        return;
      }
  
      const metadataList = folder.files.map(file => {
        const volume = extractVolumeNumber(file.name); // Extract volume number
        const comicInfoXML = generateComicInfoXML(
          selectedManga,
          volume,
          selectedApi,
          selectedLanguage,
          editableSynopsis
        );
  
        return {
          fileName: file.name,
          volume,
          comicInfoXML,
        };
      });
  
      // Pass metadata to ComicInfoPanel via onFillMetadata
      if (onFillMetadata) {
        onFillMetadata(metadataList);
      }
    } catch (err) {
      console.error('Erreur lors de l’application des métadonnées au dossier :', err);
      setError('Échec de l’application des métadonnées. Veuillez réessayer.');
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
        handleSearch,
        selectManga,
        selectFolder,
        applyMetadataToFolder,
        clearSelection,
        clearError,
        clearSelectedManga,
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
        folderProgress: {}, // Initialiser avec un objet vide
        processedFolders: [], // Initialiser avec un tableau vide
      }}
    >
      {children}
    </MangaTaggerContext.Provider>
  );
};