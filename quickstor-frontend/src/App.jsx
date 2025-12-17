import React from 'react';

// Import Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Import Section Renderer
import { SectionRenderer } from './components/SectionRenderer';

// Import Data
import { defaultContent } from './data/defaultContent';

export default function App() {
  const content = defaultContent;

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