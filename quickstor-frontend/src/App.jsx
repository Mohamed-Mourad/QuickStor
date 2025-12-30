import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';

// Import Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Import Section Renderer
import { SectionRenderer } from './components/SectionRenderer';

// Import Data
import { defaultContent } from './data/defaultContent';

// Page Component - Renders dynamic sections based on current route
function PageContent({ pages, navbar, footer }) {
  const location = useLocation();
  const currentPath = location.pathname;

  // Normalize path for comparison (remove leading/trailing slashes)
  const normalizedPath = currentPath.replace(/^\/|\/$/g, '') || '/';

  console.log("Current path:", currentPath, "Normalized:", normalizedPath);
  console.log("Available pages:", pages.map(p => ({ id: p.id, slug: p.slug })));

  // Find the page that matches the current path
  const currentPage = pages.find(p => {
    const pageSlug = (p.slug || '').replace(/^\/|\/$/g, '') || '/';

    // Handle home page
    if ((normalizedPath === '/' || normalizedPath === '') && (pageSlug === '/' || pageSlug === '' || p.id === 'home')) {
      return true;
    }

    // Handle other pages - compare normalized slugs
    return pageSlug === normalizedPath;
  });

  console.log("Matched page:", currentPage?.id || "NONE - showing fallback");

  // Fallback to home page if no match
  const pageToRender = currentPage || pages.find(p => p.id === 'home') || pages[0];

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-blue-600 selection:text-white">
      {/* Fixed Header */}
      <Navbar {...navbar} />

      {/* Dynamic Sections Loop - Show 404 message if no page found and no fallback */}
      {pageToRender ? (
        <SectionRenderer sections={pageToRender.sections || []} />
      ) : (
        <div className="flex items-center justify-center min-h-[50vh] text-gray-400">
          <p>Page not found</p>
        </div>
      )}

      {/* Fixed Footer */}
      <Footer {...footer} />
    </div>
  );
}

export default function App() {
  const [siteData, setSiteData] = useState({
    pages: defaultContent.sections ? [{ id: 'home', slug: '/', sections: defaultContent.sections }] : [],
    navbar: defaultContent.navbar || {},
    footer: defaultContent.footer || {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("App mounted. Connecting to Firestore...");

    // Listen for real-time updates from Firestore
    const unsub = onSnapshot(doc(db, 'sites', 'quickstor-live'), (docSnap) => {
      console.log("Firestore update received. Exists:", docSnap.exists());

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Data Payload:", data);

        // Ensure we have valid data before updating
        if (data.pages && data.navbar && data.footer) {
          setSiteData({
            pages: data.pages,
            navbar: data.navbar,
            footer: data.footer
          });
        }
      } else {
        console.warn("Document 'sites/quickstor-live' does not exist yet.");
      }
      setLoading(false);
    }, (error) => {
      console.error("Failed to fetch live content:", error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#050505] min-h-screen flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={
          <PageContent
            pages={siteData.pages}
            navbar={siteData.navbar}
            footer={siteData.footer}
          />
        } />
      </Routes>
    </BrowserRouter>
  );
}