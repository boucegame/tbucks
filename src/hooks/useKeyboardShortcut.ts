import { useEffect } from 'react';

const useKeyboardShortcut = (targetString: string, callback: () => void) => {
  useEffect(() => {
    let buffer = '';
    let timeout: NodeJS.Timeout;

    const handleKeyPress = (event: KeyboardEvent) => {
      buffer += event.key.toLowerCase();
      
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        buffer = '';
      }, 1000);

      if (buffer.includes(targetString.toLowerCase())) {
        buffer = '';
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      clearTimeout(timeout);
    };
  }, [targetString, callback]);
};

export default useKeyboardShortcut;
