import { Save, Palette, ExternalLink, Check, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import EditorContainer from '../features/editor/EditorContainer';

import { useContentStore } from '../hooks/useContentStore';

const Dashboard = () => {
  const {
    saveContent,
    discardChanges,
    activeTheme,
    savedThemes,
    applyTheme,
    publishStagingToLive,
    rejectStaging
  } = useContentStore();

  const handleSaveToStaging = async () => {
    const success = await saveContent();
    if (success) {
      console.log("Saved to staging");
      // Optional: Toast notification
    }
  };

  const handlePublishLive = async () => {
    if (confirm("Are you sure you want to publish the current Staging content to the LIVE website?")) {
      const success = await publishStagingToLive();
      if (success) {
        alert('Successfully published to Live!');
      }
    }
  };

  const handleReject = async () => {
    await rejectStaging();
  };

  const handleThemeChange = (e) => {
    const selectedTheme = savedThemes.find(t => t.id === e.target.value);
    if (selectedTheme) {
      applyTheme(selectedTheme);
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Page Editor (Staging)</h1>
          <p className="text-sm text-gray-500">
            Edit content here. Changes are saved to <strong>Staging</strong> first.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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

          <div className="h-6 w-px bg-gray-300 mx-1 hidden sm:block"></div>

          {/* Staging Actions */}
          <Button variant="outline" onClick={handleReject} className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50">
            <X size={16} className="mr-1" /> Reject / Reset
          </Button>

          <Button variant="outline" onClick={handleSaveToStaging} className="border-blue-200 text-blue-700 hover:bg-blue-50">
            <Save size={16} className="mr-1" /> Save to Staging
          </Button>

          <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white" onClick={handlePublishLive}>
            <Check size={16} /> Confirm & Publish to Live
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