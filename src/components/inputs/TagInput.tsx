import React, { useState } from 'react';

interface TagInputProps {
  label: string;
  name: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string; // Ajout de la prop placeholder
}

const TagInput: React.FC<TagInputProps> = ({ label, name, value, onChange, placeholder = "" }) => {
  const [tags, setTags] = useState<string[]>(value);

  const updateTags = (newTags: string[]) => {
    setTags(newTags);
    onChange(newTags);
  };

  const addTag = (text: string) => {
    if (text && !tags.includes(text)) {
      updateTags([...tags, text]);
    }
  };

  const removeTag = (text: string) => {
    updateTags(tags.filter((t) => t !== text));
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        id="tags-container"
        className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-md min-h-[44px]"
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center bg-purple-100 text-purple-800 text-sm rounded-full px-2 py-1"
          >
            {tag}
            <button
              type="button"
              className="ml-2 text-purple-500 hover:text-purple-700 font-bold"
              onClick={() => removeTag(tag)}
            >
              ×
            </button>
          </span>
        ))}        <input
          type="text"
          placeholder={placeholder} // Utilisation de la prop placeholder
          className="flex-1 min-w-[120px] border-none outline-none bg-transparent focus:ring-0"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
              e.preventDefault();
              addTag(e.currentTarget.value.trim());
              e.currentTarget.value = '';
            }
          }}
          onBlur={(e) => {
            if (e.target.value.trim() !== '') {
              addTag(e.target.value.trim());
              e.target.value = '';
            }
          }}
        />
      </div>
      <input type="hidden" name={name} value={tags.join(', ')} />
    </div>
  );
};

export default TagInput;
