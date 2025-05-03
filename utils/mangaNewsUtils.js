const axios = require('axios');
const cheerio = require('cheerio');

// 🔥 Helper pour nettoyer/normaliser un texte
function normalize(text) {
  return text
    .normalize('NFD') // Supprime les accents
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

// 🔥 Helper pour calculer la distance de Levenshtein (différence entre deux textes)
function levenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // suppression
        );
      }
    }
  }
  return matrix[a.length][b.length];
}

// 🔥 Vérifie si un slug direct existe
async function checkSlugExists(slug) {
  const url = `https://www.manga-news.com/index.php/serie/${slug}`;
  console.log('Trying slug URL:', url);

  try {
    const response = await axios.get(url, { validateStatus: null });
    return response.status === 200;
  } catch (error) {
    console.error('Error checking slug existence:', error);
    return false;
  }
}

// 🔥 Transforme un titre en slug direct
function titleToSlug(title) {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// 🔥 Recherche via DuckDuckGo avec fuzzy matching + fallback au premier lien
async function searchSlugWithDuckDuckGo(title) {
  const query = encodeURIComponent(`site:manga-news.com ${title}`);
  const searchUrl = `https://html.duckduckgo.com/html/?q=${query}`;

  console.log('Searching DuckDuckGo with query:', searchUrl);

  try {
    const { data: html } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'fr-FR,fr;q=0.9'
      }
    });

    const $ = cheerio.load(html);

    const links = $('.result__url')
      .map((i, el) => $(el).text().trim())
      .get()
      .filter(href => href.includes('www.manga-news.com/index.php/serie/'));

    console.log('Found links in DuckDuckGo:', links);

    if (!links.length) {
      console.log('No links found on DuckDuckGo.');
      return null;
    }

    const normalizedTitle = normalize(title);

    let bestLink = null;
    let bestDistance = Infinity;

    for (const link of links) {
      const slugMatch = link.match(/serie\/([^\/]+)/);
      if (slugMatch) {
        const slug = slugMatch[1];
        const normalizedSlug = normalize(slug);

        const distance = levenshtein(normalizedTitle, normalizedSlug);

        console.log(`Testing link: ${slug} | distance = ${distance}`);

        if (distance < bestDistance) {
          bestDistance = distance;
          bestLink = slug;
        }
      }
    }

    // 🔥 Logique combinée : priorité au fuzzy match, fallback premier lien
    if (bestDistance < 10) {
      console.log('Selected best matching slug:', bestLink, `(distance ${bestDistance})`);
      return bestLink;
    } else {
      console.log('No good fuzzy match, using first available link as fallback.');
      const fallbackMatch = links[0].match(/serie\/([^\/]+)/);
      return fallbackMatch ? fallbackMatch[1] : null;
    }
  } catch (error) {
    console.error('DuckDuckGo search error:', error);
    return null;
  }
}

// 🔥 Fonction principale combinée : slug direct → DuckDuckGo
async function searchMangaNewsSlug(title) {
  const slugFromTitle = titleToSlug(title);
  const exists = await checkSlugExists(slugFromTitle);

  if (exists) {
    console.log('Slug found directly:', slugFromTitle);
    return slugFromTitle;
  }

  console.log('Direct slug failed, trying DuckDuckGo...');
  const slugFromDuckDuckGo = await searchSlugWithDuckDuckGo(title);

  if (slugFromDuckDuckGo) {
    console.log('Slug found via DuckDuckGo:', slugFromDuckDuckGo);
    return slugFromDuckDuckGo;
  }

  console.log('No slug found for title:', title);
  return null;
}

// 📦 Exportation propre
module.exports = {
  searchMangaNewsSlug,
};
