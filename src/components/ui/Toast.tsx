import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow exit animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-500" />;
      case 'info':
        return <AlertCircle size={20} className="text-blue-500" />;
      default:
        return null;
    }
  };

  const getBgColor = () => {
    if (theme === 'dark') {
      switch (type) {
        case 'success': return 'bg-green-900';
        case 'error': return 'bg-red-900';
        case 'info': return 'bg-blue-900';
        default: return 'bg-gray-800';
      }
    } else {
      switch (type) {
        case 'success': return 'bg-green-100';
        case 'error': return 'bg-red-100';
        case 'info': return 'bg-blue-100';
        default: return 'bg-white';
      }
    }
  };

  const getTextColor = () => {
    if (theme === 'dark') {
      switch (type) {
        case 'success': return 'text-green-200';
        case 'error': return 'text-red-200';
        case 'info': return 'text-blue-200';
        default: return 'text-gray-200';
      }
    } else {
      switch (type) {
        case 'success': return 'text-green-800';
        case 'error': return 'text-red-800';
        case 'info': return 'text-blue-800';
        default: return 'text-gray-800';
      }
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${isVisible ? 'toast-enter' : 'toast-exit'}`}>
      <div className={`
        ${getBgColor()} ${getTextColor()}
        shadow-lg rounded-lg p-4 flex items-start max-w-md
      `}>
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1 mr-2">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button 
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className={`p-1 rounded-full hover:bg-black hover:bg-opacity-10`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;