import React from 'react';

// Import Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ComparisonGraph from './components/ComparisonGraph';
import FeatureGrid from './components/FeatureGrid';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />
      <Hero />
      <ComparisonGraph />
      <FeatureGrid />
      <Footer />
    </div>
  );
}