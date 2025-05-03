const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { searchMangaNewsSlug } = require('../utils/mangaNewsUtils');

const router = express.Router();

// Fonction pour scraper le synopsis
async function scrapeSynopsis(slug) {
  const url = `https://www.manga-news.com/index.php/serie/${slug}`;

  console.log('Scraping URL:', url);

  try {
    const { data: html } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(html);

    // 🔥 Nouvelle stratégie : prendre tout ce qu'il y a dans la première div.bigsize sous #summary
    let summary = $('div#summary .bigsize').first().text().trim();

    if (!summary) {
      console.log('Primary selector failed, trying fallback...');
      summary = $('div#synopsis span[itemprop="description"]').text().trim();
    }

    if (!summary) {
      console.log('All selectors failed.');
    }

    return summary || null;
  } catch (error) {
    console.error('Erreur de scraping Manga-News:', error);
    return null;
  }
}

// Route pour chercher et retourner le synopsis
router.get('/:title', async (req, res) => {
  const { title } = req.params;

  try {
    const slug = await searchMangaNewsSlug(decodeURIComponent(title));
    if (!slug) return res.status(404).json({ error: 'Manga non trouvé' });

    const synopsis = await scrapeSynopsis(slug);
    if (!synopsis) return res.status(404).json({ error: 'Synopsis introuvable' });

    res.json({ summary: synopsis });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

module.exports = router;
