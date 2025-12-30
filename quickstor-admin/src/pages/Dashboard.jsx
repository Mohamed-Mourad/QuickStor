import React from 'react';
import { Save } from 'lucide-react';
import { Button } from '../components/ui/Button';
import EditorContainer from '../features/editor/EditorContainer';

import { useContentStore } from '../hooks/useContentStore';

const Dashboard = () => {
  const { saveContent, discardChanges } = useContentStore();

  const handleSave = async () => {
    const success = await saveContent();
    if (success) {
      alert('Changes published successfully to the live site!');
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Page Editor</h1>
          <p className="text-sm text-gray-500">
            Drag sections to reorder. Click to edit content.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={discardChanges}>Discard Changes</Button>
          <Button className="gap-2" onClick={handleSave}>
            <Save size={16} /> Save & Publish
          </Button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 min-h-0">
        <EditorContainer />
      </div>
    </div>
  );
};

export default Dashboard;