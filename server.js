const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
require('dotenv').config();
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const cheerio = require('cheerio');
const Unrar = require('node-unrar-js');

// Définir le chemin vers le fichier unrar.wasm directement dans l'objet Unrar
Unrar.WASM_PATH = path.join(__dirname, 'node_modules', 'node-unrar-js', 'dist', 'js', 'unrar.wasm');

const { parseStringPromise } = require('xml2js');
const app = express();
const PORT = 3001;
const router = express.Router();
const mangaNewsRoutes = require('./routes/mangaNews');
const { searchMangaNewsSlug } = require('./utils/mangaNewsUtils');

async function checkComicInfo(filePath) {
  return false; // Suppression de la logique de vérification de ComicInfo.xml
}

const scanFolder = async (folderPath) => {
  const items = fs.readdirSync(folderPath);
  const cbzFiles = [];
  const subFolders = [];

  for (const item of items) {
    const fullPath = path.join(folderPath, item);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      subFolders.push({
        id: item,
        name: item,
        path: fullPath,
        files: await scanFolder(fullPath),
      });
    } else if (stats.isFile() && (item.endsWith('.cbz') || item.endsWith('.cbr'))) {
      cbzFiles.push({
        id: item,
        name: item,
        path: fullPath,
      });
    }
  }

  return { cbzFiles, subFolders };
};

// Activer CORS pour toutes les origines
app.use(cors());

// Middleware pour parser le corps des requêtes JSON
app.use(express.json());

// Middleware pour journaliser les requêtes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Proxy pour MangaDex API
app.use(
  '/proxy/mangadex',
  createProxyMiddleware({
    target: 'https://api.mangadex.org',
    changeOrigin: true,
    pathRewrite: {
      '^/proxy/mangadex': '', // Supprime le préfixe /proxy/mangadex
    },
  })
);

// Proxy pour Jikan API
app.use(
  '/proxy/jikan',
  createProxyMiddleware({
    target: 'https://api.jikan.moe/v4',
    changeOrigin: true,
    pathRewrite: {
      '^/proxy/jikan': '', // Supprime le préfixe /proxy/jikan
    },
    onProxyReq: (proxyReq, req) => {
      console.log(`[Proxy Request] ${req.method} ${req.url}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[Proxy Response] ${req.method} ${req.url} - ${proxyRes.statusCode}`);
    },
  })
);

// Update the /files endpoint to use the async scanFolder
app.get('/files', async (req, res) => {
  const folderPath = process.env.FILES_PATH || './files';
  console.log(`Requête reçue sur /files. Chemin du dossier : ${folderPath}`);

  try {
    const { cbzFiles, subFolders } = await scanFolder(folderPath);

    //console.log('Résultat du scanFolder :', { cbzFiles, subFolders }); // Log the result of scanFolder

    const result = subFolders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      path: folder.path,
      files: folder.files.cbzFiles,
      cbzCount: folder.files.cbzFiles.length,
    }));

    console.log('Résultat final envoyé au client :', result); // Log the final result sent to the client
    res.json(result);
  } catch (err) {
    console.error('Erreur lors du scan des dossiers :', err);
    res.status(500).json({ error: 'Impossible de scanner les dossiers.' });
  }
});

// Endpoint pour lister les dossiers
app.get('/folders', async (req, res) => {
  try {
    const folderPath = process.env.FILES_PATH || './files'; // Chemin des dossiers
    const items = fs.readdirSync(folderPath);

    const folders = items
      .filter((item) => fs.statSync(path.join(folderPath, item)).isDirectory())
      .map((folder) => ({
        id: folder,
        name: folder,
        path: path.join(folderPath, folder),
        files: fs
          .readdirSync(path.join(folderPath, folder))
          .filter((file) => file.endsWith('.cbz')) // Inclure uniquement les fichiers `.cbz`
          .map((file) => ({
            id: file,
            name: file,
            path: path.join(folderPath, folder, file),
          })),
      }));

    res.status(200).json(folders);
  } catch (err) {
    console.error('Error fetching folders:', err);
    res.status(500).json({ error: 'Failed to fetch folders.' });
  }
});

// Endpoint pour renommer un fichier ou un dossier
app.post('/rename', (req, res) => {
  console.log('Corps de la requête :', req.body);

  const { oldPath, newName } = req.body;
  if (!oldPath || !newName) {
    console.error('Les chemins oldPath et newName sont requis.');
    return res.status(400).json({ error: 'Les chemins oldPath et newName sont requis.' });
  }

  try {
    // Si `newName` est un chemin absolu, l'utiliser directement
    const newPath = path.isAbsolute(newName) ? newName : path.join(path.dirname(oldPath), newName);
    console.log(`Renommage : ${oldPath} -> ${newPath}`);

    // Vérifier si c'est un fichier ou un dossier
    const stats = fs.statSync(oldPath);
    if (stats.isDirectory()) {
      console.log(`Renommage du dossier : ${oldPath} -> ${newPath}`);
      fs.renameSync(oldPath, newPath);
    } else {
      console.log(`Renommage du fichier : ${oldPath} -> ${newPath}`);
      fs.renameSync(oldPath, newPath);
    }

    res.status(200).json({ message: 'Renommage effectué avec succès.', newPath });
  } catch (error) {
    console.error('Erreur lors du renommage :', error);
    res.status(500).json({ error: 'Erreur lors du renommage.', details: error.message });
  }
});

// Endpoint pour mettre à jour un fichier CBZ
app.post('/update-cbz', async (req, res) => {
  const { filePath, comicInfoXML, folderTitle } = req.body;

  try {
    if (filePath.endsWith('.cbz')) {
      // Traitement pour les fichiers CBZ (ZIP)
      const zipData = fs.readFileSync(filePath);
      const zip = await JSZip.loadAsync(zipData);

      zip.file('ComicInfo.xml', comicInfoXML);
      const updatedZipData = await zip.generateAsync({ type: 'nodebuffer' });
      fs.writeFileSync(filePath, updatedZipData);
    } else if (filePath.endsWith('.cbr')) {
      // Traitement pour les fichiers CBR (RAR)
      const data = fs.readFileSync(filePath);
      const extractor = Unrar.createExtractorFromData(data);
      const extracted = extractor.extractAll();

      if (extracted[0].state === 'SUCCESS') {
        const files = extracted[1].files;
        const outputDir = path.dirname(filePath);

        // Extraire les fichiers
        files.forEach((file) => {
          const filePath = path.join(outputDir, file.fileHeader.name);
          fs.writeFileSync(filePath, file.extract());
        });

        // Ajouter ComicInfo.xml
        const comicInfoPath = path.join(outputDir, 'ComicInfo.xml');
        fs.writeFileSync(comicInfoPath, comicInfoXML);

        // Recompresser en RAR (nécessite un outil externe comme `rar` CLI)
        // Vous pouvez utiliser une commande système pour recréer le fichier .cbr
      }
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error updating file:', err);
    res.status(500).json({ error: 'Failed to update file.', details: err.message });
  }
});

/* async function scrapeSynopsis(slug) {
  const url = `https://www.manga-news.com/index.php/serie/${slug}`;

  console.log('Scraping URL:', url);

  try {
    const { data: html } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(html);
    const summary = $('div#synopsis span[itemprop="description"]').text().trim();
    return summary || null;
  } catch (error) {
    console.error('Erreur de scraping Manga-News:', error);
    return null;
  }
} */

// Update the endpoint
/* router.get('/manga-news/:title', async (req, res) => {
  try {
    const { title } = req.params;
    const slug = await searchMangaNewsSlug(decodeURIComponent(title));
    
    if (!slug) {
      return res.status(404).json({ error: 'Manga not found on Manga-News' });
    }

    const synopsis = await scrapeSynopsis(slug);
    if (!synopsis) {
      return res.status(404).json({ error: 'No synopsis found' });
    }

    res.json({ summary: synopsis });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch manga details',
      details: error.message 
    });
  }
}); */

app.use(router);

app.use('/manga-news', mangaNewsRoutes); // Utiliser les routes définies dans routes/mangaNews.js

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Serveur Express lancé sur http://localhost:${PORT}`);
});