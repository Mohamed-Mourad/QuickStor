import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { defaultContent } from '../../../quickstor-frontend/src/data/defaultContent';
import { defaultTheme } from '../config/defaultTheme';

import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const ContentContext = createContext();

export const ContentProvider = ({ children }) => {
  // Global State - Initialize from LocalStorage or Default
  const [navbar, setNavbar] = useState(() => {
    const saved = localStorage.getItem('quickstor_navbar');
    return saved ? JSON.parse(saved) : (defaultContent.navbar || {});
  });

  const [footer, setFooter] = useState(() => {
    const saved = localStorage.getItem('quickstor_footer');
    return saved ? JSON.parse(saved) : (defaultContent.footer || {});
  });

  // Page State - Initialize from LocalStorage or Default
  const [pages, setPages] = useState(() => {
    const saved = localStorage.getItem('quickstor_pages');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'home',
        slug: '/',
        title: 'Home',
        sections: defaultContent.sections || []
      }
    ];
  });

  const [activePageId, setActivePageId] = useState('home');
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  // Theme State - Initialize from LocalStorage or Default
  const [activeTheme, setActiveTheme] = useState(() => {
    const saved = localStorage.getItem('quickstor_activeTheme');
    return saved ? JSON.parse(saved) : defaultTheme;
  });

  const [savedThemes, setSavedThemes] = useState(() => {
    const saved = localStorage.getItem('quickstor_savedThemes');
    return saved ? JSON.parse(saved) : [defaultTheme];
  });

  // Custom Sections Library - Start empty, Firestore is source of truth
  const [customSections, setCustomSections] = useState([]);

  // Load ALL content from Firestore on startup (sync across browsers)
  useEffect(() => {
    const loadFromFirestore = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'sites', 'quickstor-live'));
        if (docSnap.exists()) {
          const data = docSnap.data();

          // Sync pages from Firestore
          if (data.pages && Array.isArray(data.pages)) {
            setPages(data.pages);
            localStorage.setItem('quickstor_pages', JSON.stringify(data.pages));
          }

          // Sync navbar from Firestore
          if (data.navbar) {
            setNavbar(data.navbar);
            localStorage.setItem('quickstor_navbar', JSON.stringify(data.navbar));
          }

          // Sync footer from Firestore
          if (data.footer) {
            setFooter(data.footer);
            localStorage.setItem('quickstor_footer', JSON.stringify(data.footer));
          }

          // Sync savedThemes from Firestore
          if (data.savedThemes && Array.isArray(data.savedThemes)) {
            setSavedThemes(data.savedThemes);
            localStorage.setItem('quickstor_savedThemes', JSON.stringify(data.savedThemes));
          }

          // Sync active theme
          if (data.theme) {
            setActiveTheme(data.theme);
            localStorage.setItem('quickstor_activeTheme', JSON.stringify(data.theme));
          }

          // Sync custom sections library (Firestore is source of truth)
          // Default to empty array if not present in Firestore
          const firestoreSections = data.customSections && Array.isArray(data.customSections)
            ? data.customSections
            : [];
          setCustomSections(firestoreSections);
          localStorage.setItem('quickstor_custom_sections', JSON.stringify(firestoreSections));
        }
      } catch (error) {
        console.error('Error loading from Firestore:', error);
      }
    };

    loadFromFirestore();
  }, []);

  // Helper to get active page
  const activePage = pages.find(p => p.id === activePageId) || pages[0];
  const sections = activePage?.sections || [];

  // --- Persistence Actions ---
  const saveContent = useCallback(async () => {
    // 1. Save locally as backup
    localStorage.setItem('quickstor_navbar', JSON.stringify(navbar));
    localStorage.setItem('quickstor_footer', JSON.stringify(footer));
    localStorage.setItem('quickstor_pages', JSON.stringify(pages));
    localStorage.setItem('quickstor_activeTheme', JSON.stringify(activeTheme));
    localStorage.setItem('quickstor_savedThemes', JSON.stringify(savedThemes));
    localStorage.setItem('quickstor_custom_sections', JSON.stringify(customSections));

    // 2. Publish to Firestore (includes all data for cross-browser sync)
    try {
      const liveContentRef = doc(db, 'sites', 'quickstor-live');
      await setDoc(liveContentRef, {
        navbar,
        footer,
        pages,
        theme: activeTheme,
        savedThemes: savedThemes,
        customSections: customSections,
        lastUpdated: new Date()
      });
      console.log('Content published to Firestore');
      return true;
    } catch (error) {
      console.error('Error publishing to Firestore:', error);
      alert('Failed to publish: ' + error.message);
      return false;
    }
  }, [navbar, footer, pages, activeTheme, savedThemes, customSections]);

  const discardChanges = useCallback(() => {
    if (!confirm('Are you sure you want to discard all unsaved changes? This will revert to the last valid save.')) return;

    const savedNavbar = localStorage.getItem('quickstor_navbar');
    setNavbar(savedNavbar ? JSON.parse(savedNavbar) : (defaultContent.navbar || {}));

    const savedFooter = localStorage.getItem('quickstor_footer');
    setFooter(savedFooter ? JSON.parse(savedFooter) : (defaultContent.footer || {}));

    const savedPages = localStorage.getItem('quickstor_pages');
    if (savedPages) {
      setPages(JSON.parse(savedPages));
    } else {
      setPages([{
        id: 'home',
        slug: '/',
        title: 'Home',
        sections: defaultContent.sections || []
      }]);
    }
    setActivePageId('home');
  }, []);

  // --- Page Actions ---

  const addPage = useCallback((title, slug) => {
    const newPage = {
      id: `page-${Date.now()}`,
      title,
      slug: slug.startsWith('/') ? slug : `/${slug}`,
      sections: []
    };
    setPages(prev => [...prev, newPage]);
    setActivePageId(newPage.id);
    setSelectedSectionId(null);
  }, []);

  const deletePage = useCallback((id) => {
    if (id === 'home') return; // Cannot delete home
    setPages(prev => {
      const newPages = prev.filter(p => p.id !== id);
      return newPages;
    });
    if (activePageId === id) setActivePageId('home');
  }, [activePageId]);

  const updatePage = useCallback((id, updates) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  // --- Global Actions (Navbar/Footer) ---

  const updateNavbar = useCallback((newConfig) => {
    setNavbar(prev => ({ ...prev, ...newConfig }));
  }, []);

  const updateFooter = useCallback((newConfig) => {
    setFooter(prev => ({ ...prev, ...newConfig }));
  }, []);

  // --- Theme Actions ---

  const updateTheme = useCallback((updates) => {
    setActiveTheme(prev => ({
      ...prev,
      ...updates,
      colors: { ...prev.colors, ...(updates.colors || {}) },
      fonts: { ...prev.fonts, ...(updates.fonts || {}) },
      hero: { ...prev.hero, ...(updates.hero || {}) }
    }));
  }, []);

  const saveThemeToLibrary = useCallback((name) => {
    const newTheme = {
      ...activeTheme,
      id: `theme-${Date.now()}`,
      name: name || `Theme ${savedThemes.length + 1}`
    };
    const updatedThemes = [...savedThemes, newTheme];
    setSavedThemes(updatedThemes);
    // Persist immediately
    localStorage.setItem('quickstor_savedThemes', JSON.stringify(updatedThemes));
    return newTheme;
  }, [activeTheme, savedThemes]);

  const deleteThemeFromLibrary = useCallback((themeId) => {
    if (themeId === 'default') return; // Cannot delete default theme
    const updatedThemes = savedThemes.filter(t => t.id !== themeId);
    setSavedThemes(updatedThemes);
    // Persist immediately
    localStorage.setItem('quickstor_savedThemes', JSON.stringify(updatedThemes));
    // If deleted theme was active, revert to default
    if (activeTheme.id === themeId) {
      setActiveTheme(defaultTheme);
      localStorage.setItem('quickstor_activeTheme', JSON.stringify(defaultTheme));
    }
  }, [activeTheme.id, savedThemes]);

  const applyTheme = useCallback((theme) => {
    setActiveTheme(theme);
    // Persist immediately
    localStorage.setItem('quickstor_activeTheme', JSON.stringify(theme));
  }, []);

  const updateSection = useCallback((id, newContent) => {
    setPages(prev => prev.map(page => {
      if (page.id !== activePageId) return page;
      return {
        ...page,
        sections: page.sections.map(section =>
          section.id === id ? { ...section, content: newContent } : section
        )
      };
    }));
  }, [activePageId]);

  const reorderSections = useCallback((newOrder) => {
    setPages(prev => prev.map(page => {
      if (page.id !== activePageId) return page;
      return { ...page, sections: newOrder };
    }));
  }, [activePageId]);

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

    setPages(prev => prev.map(page => {
      if (page.id !== activePageId) return page;
      return { ...page, sections: [...page.sections, newSection] };
    }));

    setSelectedSectionId(newId);
  }, [activePageId]);

  const deleteSection = useCallback((id) => {
    setPages(prev => prev.map(page => {
      if (page.id !== activePageId) return page;
      return { ...page, sections: page.sections.filter(s => s.id !== id) };
    }));
    if (selectedSectionId === id) setSelectedSectionId(null);
  }, [activePageId, selectedSectionId]);

  return (
    <ContentContext.Provider value={{
      // Page State
      pages,
      activePageId,
      activePage,
      setActivePageId,
      addPage,
      deletePage,
      updatePage,

      // Global State
      navbar,
      footer,
      updateNavbar,
      updateFooter,

      // Section State (Derived from Active Page)
      sections,
      selectedSectionId,
      setSelectedSectionId,
      updateSection,
      reorderSections,
      addSection,
      deleteSection,

      // Theme State
      activeTheme,
      savedThemes,
      updateTheme,
      saveThemeToLibrary,
      deleteThemeFromLibrary,
      applyTheme,

      // Custom Sections Library
      customSections,
      setCustomSections,

      // Persistence
      saveContent,
      discardChanges
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