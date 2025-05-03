import { SearchResult, MangaDetail } from '../types';

// Add delay to avoid rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to choose localized title
const getLocalizedTitle = (item: any): string => {
  const englishTitle = item.titles?.find((t: any) => t.type === 'English')?.title;
  return englishTitle || item.title;
};

const getPreferredTitle = (item: any): string => {
  // Tente d’abord le titre anglais explicite
  if (item.title_english) return item.title_english;

  // Sinon cherche un titre "English" dans le tableau "titles"
  const englishFromArray = item.titles?.find((t: any) => t.type === "English")?.title;
  if (englishFromArray) return englishFromArray;

  // (optionnel) Un jour, tu pourrais chercher du FR ici
  const frenchFromArray = item.titles?.find((t: any) => t.type === "French")?.title;
  if (frenchFromArray) return frenchFromArray;

  // Sinon on revient à la valeur par défaut
  return item.title;
};


// Search for manga by title
export const searchManga = async (query: string): Promise<SearchResult[]> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/proxy/jikan/manga?q=${encodeURIComponent(query)}&sfw=true`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();

    return data.data.map((item: any) => ({
      id: item.mal_id,
      title: getPreferredTitle(item),
      imageUrl: item.images.jpg.image_url,
      synopsis: item.synopsis,
      type: item.type,
      volumes: item.volumes || null,
      score: item.score || 0,
      year: item.published?.prop?.from?.year || null,
    }));
  } catch (error) {
    console.error('Error searching manga:', error);
    throw error;
  }
};

// Get detailed information about a specific manga by ID
export const getMangaById = async (id: number): Promise<MangaDetail> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/proxy/jikan/manga/${id}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    const manga = data.data;

    // Extraire correctement les titres localisés
    const englishTitle = manga.titles.find((t: any) => t.type === 'English')?.title || manga.title_english;
    const japaneseTitle = manga.titles.find((t: any) => t.type === 'Japanese')?.title || manga.title_japanese;
    // Le titre français n'est pas disponible dans l'API Jikan
    const frenchTitle = null;

    console.log(manga);

    return {
      id: manga.mal_id,
      title: manga.title,
      englishTitle,
      japaneseTitle,
      frenchTitle,
      imageUrl: manga.images.jpg.image_url,
      synopsis: manga.synopsis || null,
      type: manga.type || null,
      chapters: manga.chapters || null,
      volumes: manga.volumes || null,
      status: manga.status || null,
      published: manga.published?.string || null,
      score: manga.score || 0,
      genres: manga.genres.map((genre: any) => genre.name),
      themes: manga.themes?.map((theme: any) => theme.name) || [],
      demographics: manga.demographics?.map((demo: any) => demo.name) || [],
      authors: manga.authors.map((author: any) => author.name),
    };
  } catch (error) {
    console.error('Failed to fetch manga details from JikanAPI:', error);
    throw error;
  }
};
