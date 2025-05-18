import React from 'react';
import TextInput from '../inputs/TextInput';
import TextArea from '../inputs/TextArea';
import NumberInput from '../inputs/NumberInput';
import SelectInput from '../inputs/SelectInput';
import TagInput from '../inputs/TagInput';
import { useComicInfo } from '../../context/ComicInfoContext';

const ComicInfoPanel: React.FC = () => {
  const { formData, genres, writers, publishers, handleChange, setGenres, setWriters, setPublishers } = useComicInfo();

  return (
    <div className="p-4 fade-in h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Métadonnées</h2>
      <div className="flex-1 overflow-hidden flex flex-col">        <form className="divide-y divide-gray-700 flex-1 overflow-y-auto pr-2 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar scrollbar-thumb-purple-900 scrollbar-track-black/20 scrollbar-thin">          <div className="grid grid-cols-3 gap-4">
            <TextInput
              label="Série"
              name="series"
              value={formData.series}
              onChange={handleChange}
            />
            <TextInput
              label="Série alternative"
              name="alternate_series"
              value={formData.alternate_series}
              onChange={handleChange}
            />
            <NumberInput
              label="Nombre de volumes"
              name="count"
              value={formData.count}
              onChange={handleChange}
            />
          </div><TextArea
            label="Résumé"
            name="summary"
            value={formData.summary}
            onChange={handleChange}
          />
          <div className="grid grid-cols-3 gap-4">
            <NumberInput
              label="Année"
              name="year"
              value={formData.year}
              onChange={handleChange}
            />
            <NumberInput
              label="Mois"
              name="month"
              value={formData.month}
              onChange={handleChange}
            />
            <NumberInput
              label="Jour"
              name="day"
              value={formData.day}
              onChange={handleChange}
            /></div>
          <div className="grid grid-cols-2 gap-4">
            <TagInput
              label="Auteur(s)"
              name="writers"
              placeholder='Ex : Eiichiro Oda, Masashi Kishimoto'
              value={writers}
              onChange={setWriters}
            />
            <TagInput
              label="Éditeur(s)"
              name="publishers"
              placeholder='Ex : Glénat'
              value={publishers}
              onChange={setPublishers}
            />
          </div>
          <TagInput
            label="Genres"
            name="genres"
            placeholder='Ex : Action, Aventure, Comédie'
            value={genres}
            onChange={setGenres}
          />          <TextInput
            label="Site web"
            name="web"
            value={formData.web}
            onChange={handleChange}
          />          
          <div className="grid grid-cols-4 gap-2">
            <SelectInput
              label="Code langue ISO"
              name="language_iso"
              value={formData.language_iso}
              options={[
                { value: 'fr', label: 'Français (fr)' },
                { value: 'en', label: 'Anglais (en)' },
                { value: 'jp', label: 'Japonais (jp)' },
              ]}
              onChange={handleChange}
            />
            <SelectInput
              label="Format"
              name="format"
              value={formData.format}
              options={[
                { value: 'Tankōbon', label: 'Tankōbon' },
                { value: 'Kanzenban', label: 'Kanzenban' },
                { value: 'Bunkoban', label: 'Bunkoban' },
                { value: 'Digital', label: 'Digital' },
                { value: 'Webcomic', label: 'Webcomic' },
                { value: 'Anthology', label: 'Anthology' },
                { value: 'Magazine', label: 'Magazine' },
                { value: 'Graphic Novel', label: 'Graphic Novel' },
                { value: 'One-shot', label: 'One-shot' },
                { value: 'Doujinshi', label: 'Doujinshi' },
              ]}
              onChange={handleChange}
            />
            <SelectInput
              label="Noir et blanc"
              name="black_white"
              value={formData.black_white}
              options={[
                { value: 'Unknown', label: 'Inconnu' },
                { value: 'Yes', label: 'Oui' },
                { value: 'No', label: 'Non' },
              ]}
              onChange={handleChange}
            />
            <SelectInput
              label="Classification d'âge"
              name="age_rating"
              value={formData.age_rating}
              options={[
                { value: 'Unknown', label: 'Inconnu' },
                { value: 'Early Childhood', label: 'Petite enfance' },
                { value: 'Everyone', label: 'Tous publics' },
                { value: 'Everyone 10+', label: 'Tous publics 10+' },
                { value: 'G', label: 'G - Général' },
                { value: 'PG', label: 'PG - Accord parental souhaitable' },
                { value: 'Teen', label: 'Adolescents' },
                { value: 'Mature 17+', label: '17+' },
                { value: 'M', label: 'M' },
                { value: 'R18+', label: 'R18+' },
                { value: 'Adults Only 18+', label: '18+' },
              ]}
              onChange={handleChange}            />          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextArea
              label="Critique"
              name="review"
              value={formData.review}
              onChange={handleChange}
            />
            <TextArea
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComicInfoPanel;
