import React, { useMemo, useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, TextField, IconButton, Button, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import AddIcon from '@mui/icons-material/Add';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import StarterKit from '@tiptap/starter-kit';
import {
  MenuButtonBold,
  MenuButtonItalic,
  MenuButtonUnderline,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditor,
  RichTextEditorRef,
} from "mui-tiptap";
import { Toolbar } from '@mui/material';

import { type Pipeline } from '../lib/pipeline';
import { loadSettings } from '../lib/storage';
import { fetchPipeline, fetchComposerState, saveComposerState } from '../lib/api';
import { Toast } from './Toast';

export type Section = { id: string; type: 'prompt' | 'text'; name: string; content?: string; stepId?: string };
export type ComposerState = { sections: Section[]; subjectTemplate: string };

const SortableSectionItem: React.FC<{
  section: Section;
  onUpdate: (s: Section) => void;
  onDelete: (id: string) => void;
}> = ({ section, onUpdate, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const rteRef = React.useRef<RichTextEditorRef>(null);

  return (
    <Paper ref={setNodeRef} style={style} sx={{ mb: 2, p: 2, display: 'flex', alignItems: 'start', gap: 1 }}>
      <Box {...attributes} {...listeners} sx={{ cursor: 'grab', touchAction: 'none', pt: 1 }}><DragIndicatorIcon /></Box>
      <Box sx={{ flexGrow: 1 }}>
        {section.type === 'prompt' ? (
          <Typography variant="body1"><strong>Step:</strong> {section.name}</Typography>
        ) : (
          <Box sx={{ border: '1px solid #ccc', borderRadius: 1 }}>
            <RichTextEditor
              ref={rteRef}
              extensions={[StarterKit.configure({
                heading: {
                  levels: [1, 2, 3],
                },
              })]}
              content={section.content}
              onUpdate={({ editor }) => {
                onUpdate({ ...section, content: editor.getHTML() });
              }}
              renderControls={() => (
                <Toolbar sx={{ display: 'flex', flexDirection: 'row', minHeight: 'auto', paddingY: '5px' }}>
                  <MenuControlsContainer>
                    <MenuSelectHeading />
                    <MenuDivider />
                    <MenuButtonBold />
                    <MenuButtonItalic />
                    <MenuButtonUnderline />
                  </MenuControlsContainer>
                </Toolbar>
              )}
            />
          </Box>
        )}
      </Box>
      <IconButton size="small" onClick={() => onDelete(section.id)}><DeleteIcon fontSize="small" /></IconButton>
    </Paper>
  );
};

export const EmailComposer: React.FC = () => {
  // ... (The rest of the component remains largely the same)
  // ... Make sure to handle the HTML content from the rich text editor correctly
  const settings = loadSettings();
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [composerState, setComposerState] = useState<ComposerState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{open: boolean, msg: string, sev?: any}>({open: false, msg: ''});

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetchPipeline(),
      fetchComposerState()
    ]).then(([pipelineData, composerData]) => {
      setPipeline(pipelineData);
      setComposerState(composerData);
    }).catch(err => {
      console.error(err);
      setToast({ open: true, msg: 'Failed to load data from server.', sev: 'error' });
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const availablePromptSections: Section[] = useMemo(() => 
    pipeline ? pipeline.steps.map(s => ({ id: s.id, type: 'prompt', name: s.name, stepId: s.id })) : [],
  [pipeline]);

  const handleSaveLayout = async () => {
    if (!composerState) return;
    try {
      await saveComposerState(composerState);
      setToast({ open: true, msg: 'Layout saved to server!', sev: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ open: true, msg: 'Failed to save layout.', sev: 'error' });
    }
  };
  
  const sensors = useSensors(useSensor(PointerSensor));

  if (isLoading || !composerState || !pipeline) {
    return <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}><CircularProgress /></Box>;
  }

  const { sections, subjectTemplate } = composerState;

  const setSections = (updater: (prev: Section[]) => Section[]) => {
    setComposerState(prev => ({ ...prev!, sections: updater(prev!.sections) }));
  };
  const setSubjectTemplate = (newSubject: string) => {
    setComposerState(prev => ({ ...prev!, subjectTemplate: newSubject }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex(i => i.id === active.id);
      const newIndex = sections.findIndex(i => i.id === over.id);
      setSections(currentSections => arrayMove(currentSections, oldIndex, newIndex));
    }
  };

  const addTextBlock = () => setSections(prev => [...prev, { id: `text_${Date.now()}`, type: 'text', name: 'TextBlock', content: '' }]);
  const addPromptSection = (s: Section) => {
    if (!sections.find(x => x.id === s.id)) setSections(prev => [...prev, s]);
  };
  const deleteSection = (id: string) => setSections(prev => prev.filter(s => s.id !== id));
  const updateSection = (updated: Section) => setSections(prev => prev.map(s => s.id === updated.id ? updated : s));

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <TextField
            label="Email Subject Template"
            value={subjectTemplate}
            onChange={(e) => setSubjectTemplate(e.target.value)}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="h6" gutterBottom>Email Body Sections</Typography>
              <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1, minHeight: '60vh' }}>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    {sections.map(section => (
                      <SortableSectionItem key={section.id} section={section} onUpdate={updateSection} onDelete={deleteSection} />
                    ))}
                  </SortableContext>
                </DndContext>
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button startIcon={<AddIcon />} variant="outlined" onClick={addTextBlock}>Add Text Block</Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6" gutterBottom>Live Preview</Typography>
              <Paper variant="outlined" sx={{ p: 2, minHeight: '60vh' }}>
                <div dangerouslySetInnerHTML={{ __html: sections.map(s => s.type === 'prompt' ? `<h3>${s.name}</h3><p>...</p>` : s.content).join('<br/>') }} />
              </Paper>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle1">Available Prompt Sections</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {availablePromptSections.map(s => (
                  <Button key={s.id} variant="text" onClick={() => addPromptSection(s)}>
                    + {s.name}
                  </Button>
                ))}
              </Box>
            </Box>
            <Button 
              variant="contained" 
              onClick={handleSaveLayout}
            >
              Save Layout
            </Button>
          </Box>
        </Grid>
      </Grid>
      <Toast open={toast.open} onClose={() => setToast({ ...toast, open: false })} message={toast.msg} severity={toast.sev} />
    </Box>
  );
};