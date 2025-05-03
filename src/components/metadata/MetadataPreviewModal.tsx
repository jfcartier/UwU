import React, { useState } from 'react';
import { useMangaTagger } from '../../context/MangaTaggerContext';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Thème pour la coloration

interface MetadataPreviewModalProps {
  onClose: () => void;
  onApply: () => void;
}

const MetadataPreviewModal: React.FC<MetadataPreviewModalProps> = ({ onClose, onApply }) => {
  const { generateMetadataPreview } = useMangaTagger();
  const preview = generateMetadataPreview();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // Récupérer le contenu de ComicInfo.xml pour le fichier sélectionné
  const getComicInfoContent = (fileName: string): string => {
    const file = preview.find((item) => item.fileName === fileName);
    return file?.diffs['ComicInfo.xml']?.after || 'Aucun contenu';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl w-full">
        <h2 className="text-lg font-semibold mb-4">Aperçu des modifications</h2>
        <div className="overflow-y-auto max-h-96">
          <table className="table-auto w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Avant</th>
                <th className="px-4 py-2 text-left">Après</th>
                <th className="px-4 py-2 text-left">Métadonnées</th>
              </tr>
            </thead>
            <tbody>
              {preview.map(({ fileName, diffs }) => (
                <tr key={fileName} className="border-t">
                  <td className="px-4 py-2">{diffs['fileName'].before}</td>
                  <td className="px-4 py-2">{diffs['fileName'].after}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setSelectedFile(fileName)}
                      className="text-blue-500 underline text-xs"
                    >
                      ComicInfo.xml
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Popup pour afficher ComicInfo.xml */}
        {selectedFile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full">
              <h3 className="text-md font-semibold mb-2">Contenu de ComicInfo.xml</h3>
              <SyntaxHighlighter
                language="xml"
                style={oneDark} // Utilisation du thème
                className="rounded-lg text-xs"
              >
                {getComicInfoContent(selectedFile)}
              </SyntaxHighlighter>
              <button
                onClick={() => setSelectedFile(null)}
                className="mt-4 px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-between space-x-2">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-lg bg-gray-300 dark:bg-gray-600"
          >
            Annuler
          </button>
          <button
            onClick={onApply}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetadataPreviewModal;