import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [envConfig, setEnvConfig] = useState({ key: '', value: '' });
  const [envVariables, setEnvVariables] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const handleEnvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEnvConfig((prev) => ({ ...prev, [name]: value }));
  };

  const addEnvVariable = () => {
    setEnvVariables((prev) => ({ ...prev, [envConfig.key]: envConfig.value }));
    setEnvConfig({ key: '', value: '' });
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      <button onClick={goBack} className="mb-4 p-2 bg-gray-500 text-white rounded">Retour</button>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      {/* Theme Toggle */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Theme</h2>
        <button 
          onClick={toggleTheme}
          className={`p-2 rounded-full ${
            theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
          } transition-colors`}
        >
          Toggle Theme
        </button>
      </div>

      {/* Environment Variables */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            name="key"
            value={envConfig.key}
            onChange={handleEnvChange}
            placeholder="Key"
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="value"
            value={envConfig.value}
            onChange={handleEnvChange}
            placeholder="Value"
            className="p-2 border rounded"
          />
          <button onClick={addEnvVariable} className="p-2 bg-blue-500 text-white rounded">Add</button>
        </div>
        <ul>
          {Object.entries(envVariables).map(([key, value]) => (
            <li key={key} className="mb-1">
              <strong>{key}:</strong> {value}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SettingsPage;