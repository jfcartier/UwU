import { SearchResult, MangaDetail } from '../types';

// Authentification
export const login = async (username: string, password: string): Promise<string> => {
  const response = await fetch('https://api.mangadex.org/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  if (data.result === 'ok') {
    return data.token.session; // Retourne le token de session
  } else {
    throw new Error('Échec de la connexion');
  }
};

// Ajoutez cette fonction d'aide
const getTitleByLanguage = (manga: any, language: string): string | null => {
  // Vérifier d'abord dans le titre principal
  if (manga.attributes.title[language]) {
    return manga.attributes.title[language];
  }

  // Chercher dans les titres alternatifs
  const altTitle = manga.attributes.altTitles?.find((title: any) => 
    title[language] !== undefined
  );
  return altTitle ? altTitle[language] : null;
};

// Recherche de mangas
export const searchManga = async (query: string): Promise<SearchResult[]> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/proxy/mangadex/manga?title=${encodeURIComponent(query)}&includes[]=cover_art&limit=20`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();

    return data.data.map((manga: any) => {
      const coverArt = manga.relationships.find((rel: any) => rel.type === 'cover_art');
      const coverFileName = coverArt?.attributes?.fileName;
      const imageUrl = coverFileName 
        ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFileName}`
        : null;

      // Obtenir les titres dans différentes langues
      const englishTitle = getTitleByLanguage(manga, 'en');
      const frenchTitle = getTitleByLanguage(manga, 'fr');
      const japaneseTitle = getTitleByLanguage(manga, 'ja');

      // Choisir le meilleur titre disponible
      const displayTitle = frenchTitle || englishTitle || japaneseTitle || 'Unknown';

      return {
        id: manga.id, // Garder l'ID comme string
        title: displayTitle,
        originalTitle: englishTitle || japaneseTitle,
        frenchTitle: frenchTitle,
        imageUrl,
        synopsis: manga.attributes.description?.en || null,
        type: manga.attributes.publicationDemographic || null,
        score: manga.attributes.rating?.average || 0,
        year: manga.attributes.year || null,
      };
    });
  } catch (error) {
    console.error('Error searching manga:', error);
    throw error;
  }
};

// Détails d'un manga
export const getMangaById = async (id: string, sessionToken: string): Promise<MangaDetail> => {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/proxy/mangadex/manga/${id}?includes[]=author&includes[]=artist&includes[]=cover_art`, {
    headers: {
      'Authorization': `Bearer ${sessionToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  const manga = data.data;

  // Trouver la couverture
  const coverArt = manga.relationships.find((rel: any) => rel.type === 'cover_art');
  const coverFileName = coverArt?.attributes?.fileName;
  const imageUrl = coverFileName 
    ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFileName}`
    : null;

  // Trouver les auteurs et artistes
  const authors = manga.relationships
    .filter((rel: any) => rel.type === 'author' || rel.type === 'artist')
    .map((author: any) => author.attributes?.name)
    .filter(Boolean);

  // Extraire les genres des tags
  const tags = manga.attributes.tags || [];
  const genres = tags
    .filter((tag: any) => tag.attributes.group === 'genre')
    .map((tag: any) => tag.attributes.name.en);

  // Extraire les thèmes des tags
  const themes = tags
    .filter((tag: any) => tag.attributes.group === 'theme')
    .map((tag: any) => tag.attributes.name.en);

  console.log(manga);

  const englishTitle = getTitleByLanguage(manga, 'en');
  const frenchTitle = getTitleByLanguage(manga, 'fr');
  const japaneseTitle = getTitleByLanguage(manga, 'ja');

  const descriptions = {
    en: manga.attributes.description.en || null,
    fr: manga.attributes.description.fr || null,
    ja: manga.attributes.description.ja || null
  };

  return {
    id: manga.id,
    title: frenchTitle || englishTitle || manga.attributes.title.en || 'Unknown',
    japaneseTitle: japaneseTitle || null,
    englishTitle: englishTitle || null,
    frenchTitle: frenchTitle || null,
    imageUrl,
    synopsis: descriptions.fr || descriptions.en || descriptions.ja || null, // Préférer le français
    synopsisEn: descriptions.en || null,
    synopsisFr: descriptions.fr || null,
    synopsisJa: descriptions.ja || null,
    type: manga.attributes.publicationDemographic || null,
    chapters: manga.attributes.lastChapter ? parseInt(manga.attributes.lastChapter) : null,
    volumes: manga.attributes.lastVolume ? parseInt(manga.attributes.lastVolume) : null,
    status: manga.attributes.status || null,
    published: manga.attributes.year ? `${manga.attributes.year}` : null,
    score: manga.attributes.rating?.average || 0,
    genres,
    themes,
    demographics: [], // MangaDex n'a pas cette information directement
    authors
  };
};