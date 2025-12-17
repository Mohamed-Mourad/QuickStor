import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, Settings, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';

const AdminLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Page Builder', path: '/' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* Mobile Header: Visible only on small screens */}
      <div className="md:hidden fixed top-0 w-full h-16 bg-black border-b border-gray-800 z-40 flex items-center justify-between px-4 shadow-md">
         <span className="text-lg font-bold tracking-wider text-blue-500">QUICKSTOR</span>
         <button 
           onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
           className="text-gray-400 hover:text-white p-1"
         >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
         </button>
      </div>

      {/* Overlay: Closes sidebar when clicking outside on mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar: Transform based on state for mobile, always visible on desktop */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-black text-white flex flex-col border-r border-gray-800 transition-transform duration-300 ease-in-out shadow-xl md:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Desktop Header */}
        <div className="p-6 border-b border-gray-800 hidden md:block">
          <h1 className="text-xl font-bold tracking-wider text-blue-500">QUICKSTOR</h1>
          <p className="text-xs text-gray-500 mt-1">Admin Console</p>
        </div>
        
        {/* Mobile Sidebar Header */}
        <div className="md:hidden h-16 flex items-center px-6 border-b border-gray-800 bg-black/50">
           <span className="text-sm font-medium text-gray-400">Menu</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={() => setIsSidebarOpen(false)} // Auto-close on mobile nav
                className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-900'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20 gap-3">
            <LogOut size={18} />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area: Padding top added for mobile header */}
      <main className="flex-1 overflow-auto pt-16 md:pt-0 w-full relative">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)] md:min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;