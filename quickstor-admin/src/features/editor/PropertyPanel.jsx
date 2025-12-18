import React from 'react';
import { useContentStore } from '../../hooks/useContentStore';
import { Label } from '../../components/ui/Label';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Trash2, Plus, GripVertical, AlertCircle } from 'lucide-react';

const PropertyPanel = () => {
  const { sections, selectedSectionId, updateSection } = useContentStore();
  
  const selectedSection = sections.find(s => s.id === selectedSectionId);

  if (!selectedSection) {
    return (
      <div className="w-80 border-l border-gray-200 bg-white p-8 flex flex-col items-center justify-center text-center text-gray-500 h-full">
        <p>Select a section to edit properties</p>
      </div>
    );
  }

  // Generic handler for top-level properties
  const handleChange = (key, value) => {
    const newContent = { ...selectedSection.content, [key]: value };
    updateSection(selectedSection.id, newContent);
  };

  // --- Feature Grid Editor Logic ---
  const renderFeatureGridFields = () => {
    const features = selectedSection.content.features || [];

    const updateFeature = (index, field, value) => {
      const newFeatures = [...features];
      newFeatures[index] = { ...newFeatures[index], [field]: value };
      updateSection(selectedSection.id, { ...selectedSection.content, features: newFeatures });
    };

    const addFeature = () => {
      const newFeatures = [...features, { icon: 'Star', title: 'New Feature', description: 'Describe this amazing feature.' }];
      updateSection(selectedSection.id, { ...selectedSection.content, features: newFeatures });
    };

    const removeFeature = (index) => {
      if (confirm('Delete this feature?')) {
        const newFeatures = features.filter((_, i) => i !== index);
        updateSection(selectedSection.id, { ...selectedSection.content, features: newFeatures });
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-3 rounded-md text-xs text-blue-700 flex gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <p>Tip: Use valid Lucide icon names (e.g., "Shield", "Zap", "Cpu").</p>
        </div>

        {features.map((feature, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm relative group hover:border-blue-300 transition-colors">
            {/* Header / Remove */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                Item #{index + 1}
              </span>
              <button 
                onClick={() => removeFeature(index)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                title="Remove Feature"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {/* Icon Input */}
              <div className="grid grid-cols-4 gap-2 items-center">
                <Label className="col-span-1 text-xs text-gray-500">Icon</Label>
                <Input 
                  value={feature.icon} 
                  onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                  className="col-span-3 h-8 text-sm text-gray-900"
                  placeholder="e.g. Shield"
                />
              </div>

              {/* Title Input */}
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Title</Label>
                <Input 
                  value={feature.title} 
                  onChange={(e) => updateFeature(index, 'title', e.target.value)}
                  className="h-9 font-medium text-gray-900"
                />
              </div>

              {/* Description Input */}
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Description</Label>
                <textarea 
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-h-[80px] resize-y placeholder:text-gray-400"
                  value={feature.description}
                  onChange={(e) => updateFeature(index, 'description', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
        
        <Button onClick={addFeature} variant="outline" className="w-full border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-600 gap-2 h-12">
          <Plus size={16} /> Add Feature Card
        </Button>
      </div>
    );
  };

  const renderFields = () => {
    const { type, content } = selectedSection;

    switch (type) {
      case 'HERO':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Badge Text</Label>
              <Input 
                value={content.badge || ''} 
                onChange={(e) => handleChange('badge', e.target.value)}
                className="text-gray-900" 
              />
            </div>
            <div className="space-y-2">
              <Label>Title (Line 1)</Label>
              <Input 
                value={content.title?.line1 || ''} 
                onChange={(e) => updateSection(selectedSection.id, { 
                  ...content, 
                  title: { ...content.title, line1: e.target.value } 
                })}
                className="text-gray-900"  
              />
            </div>
             <div className="space-y-2">
              <Label>Title Highlight</Label>
              <Input 
                value={content.title?.highlight || ''} 
                onChange={(e) => updateSection(selectedSection.id, { 
                  ...content, 
                  title: { ...content.title, highlight: e.target.value } 
                })}
                className="text-gray-900"  
              />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <textarea 
                className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 placeholder:text-gray-400"
                value={content.subtitle || ''}
                onChange={(e) => handleChange('subtitle', e.target.value)}
              />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary CTA</Label>
                  <Input 
                    value={content.primaryCta || ''} 
                    onChange={(e) => handleChange('primaryCta', e.target.value)}
                    className="text-gray-900"  
                  />
                </div>
                 <div className="space-y-2">
                  <Label>Secondary CTA</Label>
                  <Input 
                    value={content.secondaryCta || ''} 
                    onChange={(e) => handleChange('secondaryCta', e.target.value)}
                    className="text-gray-900"  
                  />
                </div>
            </div>
          </div>
        );
      
      case 'FEATURE_GRID':
        return renderFeatureGridFields();

      case 'COMPARISON_GRAPH':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Section Title</Label>
              <Input 
                value={content.title || ''} 
                onChange={(e) => handleChange('title', e.target.value)}
                className="text-gray-900"  
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
               <textarea 
                className="flex min-h-[120px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 placeholder:text-gray-400"
                value={content.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
            <div className="p-4 bg-gray-100 text-gray-500 text-sm rounded border border-gray-200 text-center">
              Graph data editing coming soon.
            </div>
          </div>
        );

      default:
        return <div className="text-gray-400 italic text-sm p-4 text-center">No editable properties for {type}</div>;
    }
  };

  return (
    <div className="w-96 border-l border-gray-200 bg-white flex flex-col h-full shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">
      <div className="p-4 border-b border-gray-200 bg-gray-50/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <h2 className="font-semibold text-sm text-gray-900">Properties</h2>
        </div>
        <p className="text-[10px] text-gray-400 font-mono truncate pl-4">
          ID: {selectedSection.id}
        </p>
      </div>
      
      <div className="p-5 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-200">
        {renderFields()}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <Button variant="outline" className="w-full text-xs text-gray-500 hover:text-gray-900">
          Reset Section to Defaults
        </Button>
      </div>
    </div>
  );
};

export default PropertyPanel;