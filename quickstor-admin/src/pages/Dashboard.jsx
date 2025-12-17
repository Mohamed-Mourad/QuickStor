import React from 'react';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Page Builder</h1>
        <div className="text-sm text-gray-500">
          Manage your landing page content
        </div>
      </div>
      
      <div className="p-10 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
        <p>Editor Interface will be loaded here...</p>
      </div>
    </div>
  );
};

export default Dashboard;