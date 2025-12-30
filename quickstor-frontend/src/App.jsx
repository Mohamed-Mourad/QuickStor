import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';

// Import Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Import Section Renderer
import { SectionRenderer } from './components/SectionRenderer';

// Import Data
import { defaultContent } from './data/defaultContent';

export default function App() {
  const [content, setContent] = useState(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for real-time updates from Firestore
    const unsub = onSnapshot(doc(db, 'sites', 'quickstor-live'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        // Ensure we have valid data before updating
        if (data.pages && data.navbar && data.footer) {
          // Find the home page sections for the default view (MVP limited to home for now, or use Router later)
          const homePage = data.pages.find(p => p.id === 'home') || data.pages[0];

          setContent({
            navbar: data.navbar,
            footer: data.footer,
            sections: homePage?.sections || []
          });
        }
      }
      setLoading(false);
    }, (error) => {
      console.error("Failed to fetch live content:", error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-blue-600 selection:text-white">
      {/* Fixed Header */}
      <Navbar {...content.navbar} />

      {/* Dynamic Sections Loop */}
      <SectionRenderer sections={content.sections} />

      {/* Fixed Footer */}
      <Footer {...content.footer} />
    </div>
  );
}