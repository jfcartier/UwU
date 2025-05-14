// Types for manga search results
export interface SearchResult {
  id: string | number;
  title: string;
  imageUrl: string;
  synopsis: string | null;
  type: string | null;
  score: number;
  year: number | null;
}

// Types for detailed manga information
export interface MangaDetail {
  id: number;
  title: string;
  japaneseTitle: string | null;
  englishTitle: string | null;
  frenchTitle: string | null;
  imageUrl: string;
  synopsis: string | null;
  synopsisEn: string | null;
  synopsisFr: string | null;
  synopsisJa: string | null;
  type: string | null;
  chapters: number | null;
  volumes: number | null;
  status: string | null;
  published: string | null;
  score: number;
  genres: string[];
  themes: string[]; // Ajout des thèmes
  demographics: string[]; // Ajout des démographies
  authors: string[];
  language?: string; // Ajout de la propriété language pour indiquer la langue du manga
}

// Types for CBZ files and folders
export interface MangaFolder {
  id: string;
  name: string;
  path: string;
  files: CBZFile[];
  tagged: boolean;
  mangaId?: number;
}

export interface CBZFile {
  id: string;
  name: string;
  size: string;
  path: string;
  volume?: number;
  tagged: boolean;
  mangaId?: number;
}