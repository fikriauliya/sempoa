import { useCallback, useState } from 'react';

export const useExpandedSections = () => {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const isSectionExpanded = useCallback(
    (section: string) => !!expandedSections[section],
    [expandedSections],
  );

  return {
    toggleSection,
    isSectionExpanded,
    expandedSections,
  };
};
