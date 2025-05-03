import axios from 'axios';

export const getMangaNewsSynopsis = async (editableTitle: string): Promise<string | null> => {
  try {
    // Nettoyer le titre pour la recherche
    const searchTitle = editableTitle
      .replace(/\(.*?\)/g, '') // Remove text in parentheses
      .trim();
      
    console.log('Searching with cleaned title:', searchTitle);
    
    const response = await fetch( 
      `${import.meta.env.VITE_BACKEND_URL}/manga-news/${encodeURIComponent(searchTitle)}`,
      {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );
    
    if (response.status === 404) {
      console.log('No synopsis found for:', searchTitle);
      return null;
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || error.error || 'Failed to fetch manga details');
    }

    const data = await response.json();
    return data.summary || null;
  } catch (error) {
    console.error('Error fetching Manga-News synopsis:', error);
    throw error;
  }
};