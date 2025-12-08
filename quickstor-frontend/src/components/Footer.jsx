import React from 'react';
import { HardDrive } from 'lucide-react';

const Footer = () => (
  <footer className="bg-black py-12 md:py-16 border-t border-gray-900">
    {/* Updated max-w to match Hero */}
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 text-sm text-center sm:text-left">
      <div className="col-span-1 sm:col-span-2 md:col-span-1 flex flex-col items-center sm:items-start">
        <div className="text-white font-bold text-xl mb-6 flex items-center gap-2">
           <HardDrive size={24} className="text-blue-600" />
           QUICKSTOR
        </div>
        <p className="text-gray-500 mb-6 max-w-xs sm:max-w-full">
          High-performance ZFS storage appliances for enterprise, media production, and big data.
        </p>
        <div className="text-gray-600 text-xs">
          Engineered in Giza. Deployed Globally.
        </div>
      </div>
      
      <div>
        <h4 className="text-white font-bold mb-6 tracking-wider text-xs uppercase">Hardware</h4>
        <ul className="space-y-4 text-gray-500">
          <li className="hover:text-blue-500 cursor-pointer transition-colors">Z-Series (Performance)</li>
          <li className="hover:text-blue-500 cursor-pointer transition-colors">C-Series (Capacity)</li>
          <li className="hover:text-blue-500 cursor-pointer transition-colors">All-Flash NVMe</li>
          <li className="hover:text-blue-500 cursor-pointer transition-colors">JBOD Expansion</li>
        </ul>
      </div>

      <div>
        <h4 className="text-white font-bold mb-6 tracking-wider text-xs uppercase">Resources</h4>
        <ul className="space-y-4 text-gray-500">
          <li className="hover:text-blue-500 cursor-pointer transition-colors">ZFS Whitepaper</li>
          <li className="hover:text-blue-500 cursor-pointer transition-colors">Benchmark Results</li>
          <li className="hover:text-blue-500 cursor-pointer transition-colors">Documentation</li>
          <li className="hover:text-blue-500 cursor-pointer transition-colors">Support Portal</li>
        </ul>
      </div>

      <div>
        <h4 className="text-white font-bold mb-6 tracking-wider text-xs uppercase">Contact</h4>
        <ul className="space-y-4 text-gray-500 flex flex-col items-center sm:items-start">
          <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Sales Online</li>
          <li>sales@quickstor.net</li>
          <li>+20 100 000 0000</li>
        </ul>
      </div>
    </div>
    
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 mt-16 pt-8 border-t border-gray-900 flex flex-col-reverse md:flex-row justify-between items-center text-gray-600 text-xs gap-6 md:gap-0">
      <p>© 2024 QuickStor Systems. All rights reserved.</p>
      <div className="flex gap-6">
        <span className="cursor-pointer hover:text-gray-400">Privacy</span>
        <span className="cursor-pointer hover:text-gray-400">Terms</span>
        <span className="cursor-pointer hover:text-gray-400">SLA</span>
      </div>
    </div>
  </footer>
);

export default Footer;