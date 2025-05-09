import React, { useEffect, useState } from 'react';
import { ArrowLeft, Tag, RefreshCcw } from 'lucide-react';
import { useMangaTagger } from '../../context/MangaTaggerContext';
import { useTheme } from '../../context/ThemeContext';
import { getMangaNewsSynopsis } from '../../services/mangaNewsApi';
import MetadataPreviewModal from '../metadata/MetadataPreviewModal';

const MangaDetailPanel: React.FC = () => {
  const { 
    selectedManga, 
    loadingDetail, 
    clearSelectedManga, 
    applyMetadataToFolder, 
    selectedFolder,
    editableSynopsis,
    setEditableSynopsis,
    selectedLanguage,
    setSelectedLanguage,
    editableTitle,
    setEditableTitle,
    setHideSearchResults,
  } = useMangaTagger();
  const { theme } = useTheme();

  const [isLoadingMangaNews, setIsLoadingMangaNews] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const fetchMangaNewsSynopsis = async () => {
    if (!editableTitle) return;
    
    setIsLoadingMangaNews(true);
    try {
      const synopsis = await getMangaNewsSynopsis(editableTitle);
      if (synopsis) {
        setEditableSynopsis(synopsis);
      }
    } catch (error) {
      console.error('Échec de la récupération du synopsis Manga-News :', error);
    } finally {
      setIsLoadingMangaNews(false);
    }
  };

  useEffect(() => {
    if (selectedManga) {
      // Removed URL update logic
    }
    
    const handlePopState = () => {
      clearSelectedManga();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedManga, clearSelectedManga]);

  const handleBack = () => {
    clearSelectedManga(); // Effacer directement la sélection
    window.history.pushState(null, '', '/'); // Mettre à jour l'URL
  };

  const handleApplyMetadata = () => {
    setShowPreview(false);
    applyMetadataToFolder(); // Appliquer les métadonnées
    clearSelectedManga(); // Réinitialiser la sélection
    setHideSearchResults(true); // Masquer les résultats de recherche
    window.history.pushState(null, '', '/'); // Revenir à l'URL de recherche
  };

  if (loadingDetail) {
    return (
      <div className={`p-6 rounded-lg ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } shadow-md flex flex-col items-center justify-center h-60`}>
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-center text-gray-500">Chargement des détails du manga...</p>
      </div>
    );
  }

  if (!selectedManga) {
    return null; // Ne rien afficher si aucun manga n'est sélectionné
  }

  const {
    title,
    japaneseTitle,
    imageUrl,
    synopsis,
    type,
    chapters,
    volumes,
    status,
    published,
    score,
    genres,
    themes,
    demographics,
    authors,
  } = selectedManga;

  return (
    <>
      <div className="flex-1 overflow-y-auto pr-2">
        <div className={`p-4 ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
        } flex justify-between items-center`}>
          <button 
            onClick={handleBack}
            className={`p-2 rounded-lg flex items-center ${
              theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
            } transition-colors`}
            aria-label="Retour aux résultats"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span className="text-sm">Retour</span>
          </button>
          
          <div className="w-[76px]"></div>
        </div>

        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Section Image */}
            <div className="md:w-1/3">
              <img 
                src={imageUrl} 
                alt={title} 
                className="rounded-lg shadow-md w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/350x500?text=No+Image';
                }}
              />
              {/* Section pour les informations sous l'image */}
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <h3 className="font-medium text-gray-500">Type</h3>
                    <p>{type || 'Inconnu'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Chapitres</h3>
                    <p>{chapters || 'Inconnu'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Volumes</h3>
                    <p>{volumes || 'Inconnu'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Statut</h3>
                    <p>{status || 'Inconnu'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Publié</h3>
                    <p>{published || 'Inconnu'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Score</h3>
                    <p>{score > 0 ? score.toFixed(2) : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Détails */}
            <div className="md:w-2/3">
              {/* Synopsis */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500">Titre</h3>
                <input
                  type="text"
                  value={editableTitle}
                  onChange={(e) => setEditableTitle(e.target.value)}
                  className={`text-lg font-semibold text-center flex-1 w-full px-2 py-1 rounded ${
                    theme === 'dark' 
                      ? 'bg-gray-700 text-white focus:bg-gray-600' 
                      : 'bg-gray-100 text-gray-900 focus:bg-white'
                  } border border-transparent focus:border-purple-500 focus:outline-none`}
                />

                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Synopsis</h3>
                  <button
                    onClick={fetchMangaNewsSynopsis}
                    disabled={isLoadingMangaNews}
                    className={`p-2 rounded-lg flex items-center ${
                      theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                    } transition-colors`}
                    title="Récupérer le synopsis depuis Manga-News"
                  >
                    <RefreshCcw 
                      size={16} 
                      className={`${isLoadingMangaNews ? 'animate-spin' : ''}`}
                    />
                  </button>
                </div>
                <textarea
                  value={editableSynopsis}
                  onChange={(e) => setEditableSynopsis(e.target.value)}
                  className={`w-full h-40 p-2 text-sm rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-gray-300' 
                      : 'bg-white border-gray-300 text-gray-700'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                />
              </div>

              {/* Genres */}
              {genres.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre, index) => (
                      <span 
                        key={index} 
                        className={`text-xs px-2 py-1 rounded-full ${
                          theme === 'dark' 
                            ? 'bg-gray-700 text-purple-300' 
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Thèmes */}
              {themes.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Thèmes</h3>
                  <div className="flex flex-wrap gap-2">
                    {themes.map((theme, index) => (
                      <span 
                        key={index} 
                        className={`text-xs px-2 py-1 rounded-full ${
                          theme === 'dark' 
                            ? 'bg-gray-700 text-blue-300' 
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Démographie */}
              {demographics.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Démographie</h3>
                  <div className="flex flex-wrap gap-2">
                    {demographics.map((demo, index) => (
                      <span 
                        key={index} 
                        className={`text-xs px-2 py-1 rounded-full ${
                          theme === 'dark' 
                            ? 'bg-gray-700 text-green-300' 
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {demo}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Auteurs */}
              {authors.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Auteurs</h3>
                  <div className="flex flex-wrap gap-2">
                    {authors.map((author, index) => (
                      <span 
                        key={index} 
                        className={`text-xs px-2 py-1 rounded-full ${
                          theme === 'dark' 
                            ? 'bg-gray-700 text-yellow-300' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {author}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Boutons pour appliquer les métadonnées */}
              <div className="mt-6 space-y-4">
                {/* Sélecteur de langue */}
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-500">Langue du manga : </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as 'fr' | 'en' | 'ja')}
                    className={`px-3 py-2 rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    } border focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                  >
                    <option value="fr">Français</option>
                    <option value="en">Anglais</option>
                    <option value="ja">Japonais</option>
                  </select>
                </div>

                {/* Bouton pour prévisualiser */}
                <button
                  onClick={() => setShowPreview(true)}
                  disabled={!selectedFolder} // Désactiver si aucun dossier n'est sélectionné
                  className={`w-full px-4 py-3 rounded-lg ${
                    !selectedFolder
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' // Style désactivé
                      : 'bg-blue-500 text-white hover:bg-blue-600' // Style actif
                  }`}
                >
                  Prévisualiser les modifications
                </button>

                {showPreview && (
                  <MetadataPreviewModal
                    onClose={() => setShowPreview(false)}
                    onApply={handleApplyMetadata}
                  />
                )}

                {/* Bouton pour appliquer 
                <button
                  onClick={handleApplyMetadata}
                  disabled={!selectedFolder}
                  className={`w-full px-4 py-3 rounded-lg ${
                    theme === 'dark' 
                      ? 'bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700' 
                      : 'bg-purple-500 hover:bg-purple-600 disabled:bg-gray-200'
                  } text-white font-medium flex items-center justify-center transition-colors ${
                    !selectedFolder ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  <Tag size={18} className="mr-2" />
                  Appliquer les métadonnées
                </button>
*/}

                <p className="text-xs text-gray-500">
                  {!selectedFolder 
                    ? "Sélectionnez d'abord un dossier"
                    : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MangaDetailPanel;