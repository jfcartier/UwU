import React, { useState, useEffect } from 'react';
import { useMangaTagger } from '../../context/MangaTaggerContext';
import { useTheme } from '../../context/ThemeContext';
import { extractMetadata } from '../../services/fileService';
import { useComicInfo, defaultFormData } from '../../context/ComicInfoContext';

const FolderDetailPanel: React.FC = () => {  const { selectedFolder, mangaFolders } = useMangaTagger();
  const { theme } = useTheme();
  const { setFormData, setGenres, setWriters, setPublishers } = useComicInfo();
  const [extractionStatus, setExtractionStatus] = useState<{ success: boolean; message: string } | null>(null);

  const folder = mangaFolders.find((f) => f.id === selectedFolder);
  // Fonction pour extraire et charger les métadonnées d'un fichier CBZ/CBR
  const loadMetadata = async (file: any) => {
    try {
      setExtractionStatus(null);
      
      const metadata = await extractMetadata(file.path);
      if (metadata) {
        // Remplir les données du formulaire avec les métadonnées extraites
        setFormData({
          series: metadata.Series || '',
          count: metadata.Volume || '',
          alternate_series: metadata.AlternateSeries || '',
          summary: metadata.Summary || '',
          year: metadata.Year || '',
          month: metadata.Month || '',
          day: metadata.Day || '',
          writer: metadata.Writer || '',
          publisher: metadata.Publisher || '',
          genre: metadata.Genre || '',
          web: metadata.Web || '',
          language_iso: metadata.LanguageISO || '',
          format: metadata.Format || '',
          black_white: metadata.BlackAndWhite || 'Unknown',
          age_rating: metadata.AgeRating || 'Unknown',
          review: metadata.Review || '',
          notes: metadata.Notes || '',
        });

        // Traiter les champs spécifiques pour les transformations array/string
        if (metadata.Writer) {
          setWriters(metadata.Writer.split(',').map((writer: string) => writer.trim()));
        }
        if (metadata.Publisher) {
          setPublishers(metadata.Publisher.split(',').map((publisher: string) => publisher.trim()));
        }
        if (metadata.Genre) {
          setGenres(metadata.Genre.split(',').map((genre: string) => genre.trim()));
        }
        
        setExtractionStatus({ success: true, message: 'Métadonnées extraites avec succès' });
      } else {
        console.log('Aucune métadonnée trouvée dans le fichier');
        setExtractionStatus({ success: false, message: 'Aucune métadonnée trouvée dans ce fichier' });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des métadonnées:', error);
      setExtractionStatus({ success: false, message: 'Erreur lors de l\'extraction des métadonnées' });
    }
  };  // Charger automatiquement les métadonnées du premier fichier CBZ/CBR quand un dossier est sélectionné
  useEffect(() => {
    // Réinitialiser les métadonnées à chaque changement de dossier
    setFormData(defaultFormData);
    setGenres([]);
    setWriters([]);
    setPublishers([]);
    setExtractionStatus(null);
    
    if (folder && folder.files.length > 0) {
      // Recherche d'un fichier CBZ ou CBR
      const cbzFile = folder.files.find(file => 
        file.name.toLowerCase().endsWith('.cbz') || file.name.toLowerCase().endsWith('.cbr')
      );
      
      if (cbzFile) {
        loadMetadata(cbzFile);
      } else {
        setExtractionStatus({ success: false, message: 'Aucun fichier CBZ/CBR trouvé dans ce dossier' });
      }
    }
  }, [selectedFolder]); // Déclencher uniquement quand le dossier sélectionné change

  if (!folder) {
    return (
      <div
        className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-m fade-in h-full flex flex-col`}
      >
        <p className="text-sm text-gray-500">Aucun dossier sélectionné</p>
      </div>
    );
  }

  return (
    <div className="p-4 fade-in h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Détails du dossier</h2>
      
      {/* Afficher le message d'état de l'extraction si disponible */}
      {extractionStatus && (
        <div className={`p-2 mb-4 text-sm rounded ${
          extractionStatus.success 
            ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400' 
            : 'bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-400'
        }`}>
          {extractionStatus.message}
        </div>
      )}
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="divide-y divide-gray-700 flex-1 overflow-y-auto pr-2 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar scrollbar-thumb-purple-900 scrollbar-track-black/20 scrollbar-thin">        {folder.files.map((file, index: number) => (
          <div 
            key={file.id} 
            className="flex items-start py-2"
          >
            <div
              className={`mt-4 mr-2 font-bold text-sm ${
                file.name.split('.').pop()?.toLowerCase() === 'cbz'
                  ? 'text-lime-400'
                  : file.name.split('.').pop()?.toLowerCase() === 'cbr'
                  ? 'text-amber-400'
                  : 'text-gray-400'
              }`}
            >
              {file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN'}
            </div>            <div className="flex-grow">
              <input
                type="text"
                name={`file-${index}`}
                defaultValue={file.name}
                className="pb-1 pt-3 font-medium bg-transparent border-b border-gray-400 focus:outline-none focus:border-purple-500 w-full"
              />
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};

export default FolderDetailPanel;