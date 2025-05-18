import React, { createContext, ReactNode, useState } from 'react';

interface ComicFormData {
  series: string;
  count: string;
  alternate_series: string;
  summary: string;
  year: string;
  month: string;
  day: string;
  writer: string;
  publisher: string;
  genre: string;
  web: string;
  language_iso: string;
  format: string;
  black_white: string;
  age_rating: string;
  review: string;
  notes: string;
}

interface ComicInfoContextType {
  formData: ComicFormData;
  genres: string[];
  writers: string[];
  publishers: string[];
  setFormData: (data: ComicFormData) => void;
  setGenres: (genres: string[]) => void;
  setWriters: (writers: string[]) => void;
  setPublishers: (publishers: string[]) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const defaultFormData: ComicFormData = {
  series: '',
  count: '',
  alternate_series: '',
  summary: '',
  year: '',
  month: '',
  day: '',
  writer: '',
  publisher: '',
  genre: '',
  web: '',
  language_iso: '',
  format: '',
  black_white: 'Unknown',
  age_rating: 'Unknown',
  review: '',
  notes: '',
};

const ComicInfoContext = createContext<ComicInfoContextType | undefined>(undefined);

interface ComicInfoProviderProps {
  children: ReactNode;
}

export const ComicInfoProvider: React.FC<ComicInfoProviderProps> = ({ children }) => {
  const [formData, setFormData] = useState<ComicFormData>(defaultFormData);
  const [genres, setGenres] = useState<string[]>([]);
  const [writers, setWriters] = useState<string[]>([]);
  const [publishers, setPublishers] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <ComicInfoContext.Provider
      value={{
        formData,
        genres,
        writers,
        publishers,
        setFormData,
        setGenres,
        setWriters,
        setPublishers,
        handleChange,
      }}
    >
      {children}
    </ComicInfoContext.Provider>
  );
};

export function useComicInfo(): ComicInfoContextType {
  const context = React.useContext(ComicInfoContext);
  if (context === undefined) {
    throw new Error('useComicInfo must be used within a ComicInfoProvider');
  }
  return context;
}

export default ComicInfoContext;
