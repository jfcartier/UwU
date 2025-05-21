import React from 'react';
import InlineTextInput from '../inputs/InlineTextInput';
import InlineTextArea from '../inputs/InlineTextArea';
import InlineNumberInput from '../inputs/InlineNumberInput';
import InlineSelectInput from '../inputs/InlineSelectInput';
import InlineTagInput from '../inputs/InlineTagInput';
import { useComicInfo } from '../../context/ComicInfoContext';

const ComicInfoPanel: React.FC = () => {
  const { formData, genres, writers, publishers, handleChange, setGenres, setWriters, setPublishers } = useComicInfo();  return (    
    <fieldset className="fade-in h-full max-h-full grid grid-rows-[auto_1fr]">
      <legend className="text-lg font-semibold mb-4">Métadonnées</legend>      
      <div className="h-full overflow-auto">          
        <form className={[
          "flex",
          "flex-col",
          "gap-2",
          "h-full",
          "scrollbar-thumb-rounded-full",
          "scrollbar-track-rounded-full",
          "scrollbar",
          "scrollbar-thumb-purple-900",
          "scrollbar-track-black/20",
          "scrollbar-thin"        ].join(" ")}>
           
            <InlineTextInput
              label="Titre"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
            
            <InlineTextInput
              label="Série"
              name="series"
              value={formData.series}
              onChange={handleChange}
            />

            <InlineTextInput
              label="Série alternative"
              name="alternate_series"
              value={formData.alternate_series}
              onChange={handleChange}
            />

            <InlineNumberInput
              label="Nombre de volumes"
              name="count"
              value={formData.count}
              onChange={handleChange}
            />
       
            <InlineTextArea
              label="Résumé"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
            />
     
          
         
            <InlineNumberInput
              label="Année"
              name="year"
              value={formData.year}
              onChange={handleChange}
            />

       

          
        
            <InlineTagInput
              label="Auteur(s)"
              name="writers"
              placeholder='Ex : Eiichiro Oda, Masashi Kishimoto'
              value={writers}
              onChange={setWriters}
            />
            <InlineTagInput
              label="Éditeur(s)"
              name="publishers"
              placeholder='Ex : Glénat'
              value={publishers}
              onChange={setPublishers}
            />
        

    
            <InlineTagInput
              label="Genres"
              name="genres"
              placeholder='Ex : Action, Aventure, Comédie'
              value={genres}
              onChange={setGenres}
            />
      
          
    
            <InlineTextInput
              label="Site web"
              name="web"
              value={formData.web}
              onChange={handleChange}
            />
               
            <InlineSelectInput
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
            <InlineSelectInput
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
              ]}              onChange={handleChange}
            />
            <InlineSelectInput
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
            <InlineSelectInput
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
                { value: 'R18+', label: 'R18+' },                { value: 'Adults Only 18+', label: '18+' },
              ]}              onChange={handleChange}            />
               

   
            

        </form>
      </div>
    </fieldset>
  );
};

export default ComicInfoPanel;

/*
     <InlineNumberInput
              label="Mois"
              name="month"
              value={formData.month}
              onChange={handleChange}
            />
            <InlineNumberInput
              label="Jour"
              name="day"
              value={formData.day}
              onChange={handleChange}
            />
*/