import React from 'react';
import { useMangaTagger } from '../../context/MangaTaggerContext';
import { useComicInfo } from '../../context/ComicInfoContext';

const TitleField: React.FC = () => {
  const { selectedFolder, mangaFolders } = useMangaTagger();
  const { formData, handleChange } = useComicInfo();
  
  const folder = mangaFolders.find((f) => f.id === selectedFolder);    return (
    <div className="mt-8">
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Titre"
        className={[
          "w-full",
          "text-5xl",
          "bg-transparent",
          "border-b-2",
          "border-gray-400",
          "py-1",
          "focus:outline-none",
          "focus:border-purple-500",
          "transition-colors",
          "duration-200"
        ].join(" ")}
      />
    </div>
  );
};

export default TitleField;
