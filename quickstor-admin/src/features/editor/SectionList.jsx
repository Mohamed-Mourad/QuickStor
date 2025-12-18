import React, { useState } from 'react';
import { useContentStore } from '../../hooks/useContentStore';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Trash2, Plus, ChevronDown, BarChart2, Grid } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';

const SectionList = () => {
  // Use the REAL store, not a mock
  const { sections, selectedSectionId, setSelectedSectionId, reorderSections, deleteSection, addSection } = useContentStore();
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    // Create a copy of the array to avoid mutating state directly
    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    reorderSections(items);
  };

  const handleAddSection = (type) => {
    addSection(type);
    setIsAddMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-80 shrink-0 font-sans">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center z-20">
        <h2 className="font-semibold text-sm text-gray-700">Sections</h2>
        
        <div className="relative">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setIsAddMenuOpen(!isAddMenuOpen)} 
            className="h-8 px-3 gap-2 text-xs bg-white hover:bg-gray-50 text-gray-900 border-gray-300"
          >
            <Plus size={14} /> Section <ChevronDown size={12} />
          </Button>

          {/* Dropdown Menu (High Contrast) */}
          {isAddMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setIsAddMenuOpen(false)} 
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-xl py-1 z-40 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5">
                <button 
                  onClick={() => handleAddSection('COMPARISON_GRAPH')}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-900 bg-white hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors border-b border-gray-100"
                >
                  <BarChart2 size={16} className="text-gray-500" />
                  Comparison Graph
                </button>
                <button 
                  onClick={() => handleAddSection('FEATURE_GRID')}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-900 bg-white hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                >
                  <Grid size={16} className="text-gray-500" />
                  Feature Grid
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-200">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {sections.map((section, index) => (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        onClick={() => setSelectedSectionId(section.id)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-md border transition-all cursor-pointer group bg-white relative",
                          selectedSectionId === section.id 
                            ? "border-blue-500 ring-1 ring-blue-500 shadow-sm z-10" 
                            : "border-gray-200 hover:border-blue-300",
                          snapshot.isDragging && "shadow-xl ring-2 ring-blue-500 rotate-1 z-50 opacity-90 scale-105"
                        )}
                        style={provided.draggableProps.style} 
                      >
                        <div 
                          {...provided.dragHandleProps} 
                          className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-gray-100"
                        >
                          <GripVertical size={14} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {section.type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate font-mono">
                            {section.id.split('-')[1] || section.id}
                          </p>
                        </div>

                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if(confirm('Are you sure you want to delete this section?')) {
                                deleteSection(section.id); 
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 bg-transparent border-0 hover:bg-red-50 hover:text-red-600 hover:border-transparent rounded-md transition-all focus:opacity-100 shadow-none"
                          title="Delete section"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default SectionList;