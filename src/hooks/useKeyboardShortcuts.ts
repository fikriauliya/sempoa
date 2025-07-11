import { useEffect } from 'react';
import { KEYBOARD_SHORTCUTS } from '../components/LearningJourney/constants';

interface UseKeyboardShortcutsOptions {
  onShortcut: () => void;
  keys?: readonly string[];
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({
  onShortcut,
  keys = KEYBOARD_SHORTCUTS,
  enabled = true,
}: UseKeyboardShortcutsOptions) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      if (keys.includes(event.key)) {
        event.preventDefault();
        onShortcut();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [onShortcut, keys, enabled]);
};
