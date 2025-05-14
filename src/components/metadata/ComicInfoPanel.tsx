import React, { useState } from 'react';
import TextInput from '../inputs/TextInput';
import TextArea from '../inputs/TextArea';
import NumberInput from '../inputs/NumberInput';
import SelectInput from '../inputs/SelectInput';

const ComicInfoPanel: React.FC = () => {
  const [formData, setFormData] = useState({
    Series: '',
    Count: -1,
    AlternateSeries: '',
    Summary: '',
    Year: -1,
    Month: -1,
    Day: -1,
    Writer: '',
    Publisher: '',
    Genre: '',
    Web: '',
    LanguageISO: '',
    Format: '',
    BlackAndWhite: 'Unknown',
    Manga: 'Unknown',
    AgeRating: 'Unknown',
    Review: '',
    Notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="p-4 fade-in h-full flex flex-col">
      <h2 class="text-lg font-semibold mb-4">Métadonnées</h2>
      <div className="flex-1 overflow-hidden flex flex-col">
        <form className="divide-y divide-gray-700 flex-1 overflow-y-auto pr-2 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar scrollbar-thumb-purple-900 scrollbar-track-black/20 scrollbar-thin">
          <TextInput
            label="Series"
            name="Series"
            value={formData.Series}
            onChange={handleChange}
          />
          <NumberInput
            label="Count"
            name="Count"
            value={formData.Count}
            onChange={handleChange}
          />
          <TextInput
            label="Alternate Series"
            name="AlternateSeries"
            value={formData.AlternateSeries}
            onChange={handleChange}
          />
          <TextArea
            label="Summary"
            name="Summary"
            value={formData.Summary}
            onChange={handleChange}
          />
          <NumberInput
            label="Year"
            name="Year"
            value={formData.Year}
            onChange={handleChange}
          />
          <NumberInput
            label="Month"
            name="Month"
            value={formData.Month}
            onChange={handleChange}
          />
          <NumberInput
            label="Day"
            name="Day"
            value={formData.Day}
            onChange={handleChange}
          />
          <TextInput
            label="Writer"
            name="Writer"
            value={formData.Writer}
            onChange={handleChange}
          />
          <TextInput
            label="Publisher"
            name="Publisher"
            value={formData.Publisher}
            onChange={handleChange}
          />
          <TextInput
            label="Genre"
            name="Genre"
            value={formData.Genre}
            onChange={handleChange}
          />
          <TextInput
            label="Web"
            name="Web"
            value={formData.Web}
            onChange={handleChange}
          />
          <TextInput
            label="Language ISO"
            name="LanguageISO"
            value={formData.LanguageISO}
            onChange={handleChange}
          />
          <TextInput
            label="Format"
            name="Format"
            value={formData.Format}
            onChange={handleChange}
          />
          <SelectInput
            label="Black and White"
            name="BlackAndWhite"
            value={formData.BlackAndWhite}
            options={[
              { value: 'Unknown', label: 'Unknown' },
              { value: 'Yes', label: 'Yes' },
              { value: 'No', label: 'No' },
            ]}
            onChange={handleChange}
          />
          <SelectInput
            label="Manga"
            name="Manga"
            value={formData.Manga}
            options={[
              { value: 'Unknown', label: 'Unknown' },
              { value: 'Yes', label: 'Yes' },
              { value: 'No', label: 'No' },
            ]}
            onChange={handleChange}
          />
          <SelectInput
            label="Age Rating"
            name="AgeRating"
            value={formData.AgeRating}
            options={[
              { value: 'Unknown', label: 'Unknown' },
              { value: 'All Ages', label: 'All Ages' },
              { value: 'Teen', label: 'Teen' },
              { value: 'Mature', label: 'Mature' },
            ]}
            onChange={handleChange}
          />
          <TextArea
            label="Review"
            name="Review"
            value={formData.Review}
            onChange={handleChange}
          />
          <TextArea
            label="Notes"
            name="Notes"
            value={formData.Notes}
            onChange={handleChange}
          />
        </form>
      </div>
    </div>
  );
};

export default ComicInfoPanel;
