import React from 'react';
import { Save, Palette } from 'lucide-react';
import { Button } from '../components/ui/Button';
import EditorContainer from '../features/editor/EditorContainer';

import { useContentStore } from '../hooks/useContentStore';

const Dashboard = () => {
  const { saveContent, discardChanges, activeTheme, savedThemes, applyTheme } = useContentStore();

  const handleSave = async () => {
    const success = await saveContent();
    if (success) {
      alert('Changes published successfully to the live site!');
    }
  };

  const handleThemeChange = (e) => {
    const selectedTheme = savedThemes.find(t => t.id === e.target.value);
    if (selectedTheme) {
      applyTheme(selectedTheme);
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
        <div className="flex items-center gap-3">
          {/* Theme Selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg border border-gray-200">
            <Palette size={16} className="text-gray-500" />
            <select
              value={activeTheme.id}
              onChange={handleThemeChange}
              className="bg-transparent text-sm text-gray-700 border-none outline-none cursor-pointer"
            >
              {savedThemes.map(theme => (
                <option key={theme.id} value={theme.id}>{theme.name}</option>
              ))}
            </select>
          </div>

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