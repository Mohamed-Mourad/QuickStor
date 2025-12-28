import React, { createContext, useContext, useState, useCallback } from 'react';
import { defaultContent } from '../../../quickstor-frontend/src/data/defaultContent';

const ContentContext = createContext();

export const ContentProvider = ({ children }) => {
  const [sections, setSections] = useState(defaultContent.sections || []);
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  const updateSection = useCallback((id, newContent) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, content: newContent } : section
      )
    );
  }, []);

  const reorderSections = useCallback((newOrder) => {
    setSections(newOrder);
  }, []);

  // ACTION: Add a new section with SAFE DEFAULTS
  const addSection = useCallback((type, customProps = null) => {
    const newId = `${type.toLowerCase()}-${Date.now()}`;

    // Provide default content structure to prevent crashes in the preview
    let defaultProps = {};

    if (type === 'COMPARISON_GRAPH') {
      defaultProps = {
        title: 'New Comparison Graph',
        description: 'Edit this text to describe your performance metrics.',
        data: [
          { name: 'Competitor A', iops: 50, throughput: 100 },
          { name: 'Competitor B', iops: 80, throughput: 150 },
          { name: 'QuickStor', iops: 200, throughput: 500 }
        ]
      };
    } else if (type === 'FEATURE_GRID') {
      defaultProps = {
        features: [
          { icon: 'Shield', title: 'New Feature 1', description: 'Description here.' },
          { icon: 'Zap', title: 'New Feature 2', description: 'Description here.' },
          { icon: 'Cpu', title: 'New Feature 3', description: 'Description here.' }
        ]
      };
    } else if (type === 'HERO') {
      defaultProps = {
        badge: 'NEW',
        title: { line1: 'Brand New', highlight: 'Section' },
        subtitle: 'This is a new hero section.',
        primaryCta: 'Action',
        secondaryCta: 'Learn More'
      };
    } else if (type === 'CUSTOM_HTML') {
      // For custom HTML sections, use provided props or placeholder
      defaultProps = customProps || {
        html: '<section class="py-20 bg-[#050505] text-center"><p class="text-gray-400">Custom section - edit to add content</p></section>'
      };
    }

    const newSection = {
      id: newId,
      type: type,
      content: customProps || defaultProps
    };

    setSections((prev) => [...prev, newSection]);
    setSelectedSectionId(newId);
  }, []);

  const deleteSection = useCallback((id) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    if (selectedSectionId === id) setSelectedSectionId(null);
  }, [selectedSectionId]);

  return (
    <ContentContext.Provider value={{
      sections,
      selectedSectionId,
      setSelectedSectionId,
      updateSection,
      reorderSections,
      addSection,
      deleteSection
    }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContentStore = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContentStore must be used within a ContentProvider');
  }
  return context;
};