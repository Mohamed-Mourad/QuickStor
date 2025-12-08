import React from 'react';
import { ShieldCheck, Cpu, Activity } from 'lucide-react';

const FeatureGrid = () => (
  <section id="zfs" className="py-16 md:py-24 bg-[#050505] px-4 sm:px-6 lg:px-12">
    <div className="max-w-screen-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
        
        {/* Feature 1 */}
        <div className="p-6 md:p-8 bg-[#0a0a0a] rounded-xl border border-gray-800 hover:border-blue-600 transition-all group">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-900 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <ShieldCheck size={24} className="text-blue-500 group-hover:text-white md:w-7 md:h-7" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white mb-3">Self-Healing Data</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Every block is checksummed. If ZFS detects silent data corruption ("bit rot"), it automatically repairs the damaged data from parity before you even know it happened.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="p-6 md:p-8 bg-[#0a0a0a] rounded-xl border border-gray-800 hover:border-blue-600 transition-all group">
           <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-900 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Cpu size={24} className="text-blue-500 group-hover:text-white md:w-7 md:h-7" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white mb-3">Open Hardware</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            No proprietary RAID cards. No vendor lock-in. If a controller fails, plug your drives into any standard HBA and your data is accessible instantly.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="p-6 md:p-8 bg-[#0a0a0a] rounded-xl border border-gray-800 hover:border-blue-600 transition-all group">
           <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-900 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Activity size={24} className="text-blue-500 group-hover:text-white md:w-7 md:h-7" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white mb-3">Intelligent Tiering</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Hybrid Storage Pools automatically route hot data to NVMe/SSD and cold data to high-capacity HDDs, giving you flash speed at spinning-disk prices.
          </p>
        </div>

      </div>
    </div>
  </section>
);

export default FeatureGrid;