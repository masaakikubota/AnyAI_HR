import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, TextField, IconButton, Button, Switch, FormControlLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { type Pipeline, type Step } from '../lib/pipeline';
import { loadSettings } from '../lib/storage';
import { fetchPipeline, savePipeline } from '../lib/api';
import { Toast } from './Toast';

const PromptEditDialog: React.FC<{
  open: boolean;
  prompt: string;
  onClose: () => void;
  onSave: (newPrompt: string) => void;
}> = ({ open, prompt, onClose, onSave }) => {
  const [localPrompt, setLocalPrompt] = useState(prompt);

  React.useEffect(() => {
    if (open) setLocalPrompt(prompt);
  }, [open, prompt]);

  const handleSave = () => {
    onSave(localPrompt);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Prompt</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          value={localPrompt}
          onChange={(e) => setLocalPrompt(e.target.value)}
          fullWidth
          multiline
          rows={15}
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

const SortableStep: React.FC<{
  step: Step;
  onUpdate: (s: Step) => void;
  onDelete: (id: string) => void;
}> = ({ step, onUpdate, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: step.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Paper ref={setNodeRef} style={style} sx={{ p: 2, mb: 2, display: 'flex', gap: 1, alignItems: 'start' }}>
        <Box {...attributes} {...listeners} sx={{ cursor: 'grab', mt: '6px' }}><DragIndicatorIcon /></Box>
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            label="Step Name"
            value={step.name}
            onChange={(e) => onUpdate({ ...step, name: e.target.value })}
            size="small"
            fullWidth
            sx={{ mb: 1 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Prompt: {step.prompt.substring(0, 50)}...
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setDialogOpen(true)}
            >
              Open Editor
            </Button>
          </Box>
          <FormControlLabel
            control={<Switch checked={step.enabled ?? true} onChange={(e, v) => onUpdate({ ...step, enabled: v })} />}
            label="Enabled"
            sx={{ mt: 1 }}
          />
        </Box>
        <IconButton onClick={() => onDelete(step.id)}><DeleteIcon /></IconButton>
      </Paper>
      <PromptEditDialog
        open={dialogOpen}
        prompt={step.prompt}
        onClose={() => setDialogOpen(false)}
        onSave={(newPrompt) => onUpdate({ ...step, prompt: newPrompt })}
      />
    </>
  );
};


export const PipelineBuilder: React.FC = () => {
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ open: boolean, msg: string, sev?: any }>({ open: false, msg: '' });
  const settings = loadSettings();
  
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    setIsLoading(true);
    fetchPipeline()
      .then(data => setPipeline(data))
      .catch(err => {
        console.error(err);
        setToast({ open: true, msg: 'Failed to load pipeline from server.', sev: 'error' });
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleDragEnd = (evt: DragEndEvent) => {
    if (!pipeline) return;
    const { active, over } = evt;
    if (over && active.id !== over.id) {
      const oldIndex = pipeline.steps.findIndex(s => s.id === active.id);
      const newIndex = pipeline.steps.findIndex(s => s.id === over.id);
      const steps = arrayMove(pipeline.steps, oldIndex, newIndex);
      setPipeline({ ...pipeline, steps });
    }
  };

  const addStep = () => {
    if (!pipeline) return;
    const id = `s_${Date.now()}`;
    setPipeline(p => ({ ...p!, steps: [...p!.steps, { id, name: 'New Step', prompt: '', enabled: true }] }));
  };
  const deleteStep = (id: string) => {
    if (!pipeline) return;
    setPipeline(p => ({ ...p!, steps: p!.steps.filter(s => s.id !== id) }));
  };
  const updateStep = (updated: Step) => {
    if (!pipeline) return;
    setPipeline(p => ({ ...p!, steps: p!.steps.map(s => s.id === updated.id ? updated : s) }));
  };

  const handleSave = async () => {
    if (!pipeline) return;
    try {
      await savePipeline(pipeline);
      setToast({ open: true, msg: 'Pipeline saved to server!', sev: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ open: true, msg: 'Failed to save pipeline.', sev: 'error' });
    }
  };
  
  const handleModelChange = (event: React.MouseEvent<HTMLElement>, newValue: string | null) => {
    if (newValue !== null && pipeline) {
      setPipeline({ ...pipeline, model: newValue });
    }
  };

  if (isLoading || !pipeline) {
    return <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Pipeline Builder</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Define the sequence of prompts (steps) for the AI to execute. The model used for execution is configured in the Settings panel.
      </Typography>
      <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={pipeline.steps.map(s => s.id)} strategy={verticalListSortingStrategy}>
            {pipeline.steps.map(step => (
              <SortableStep key={step.id} step={step} onUpdate={updateStep} onDelete={deleteStep} />
            ))}
          </SortableContext>
        </DndContext>
        <Button startIcon={<AddIcon />} sx={{ mt: 1 }} onClick={addStep} variant="outlined">Add Step</Button>
      </Box>
      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button variant="contained" onClick={handleSave}>Save Pipeline to Server</Button>
      </Box>
      <Toast open={toast.open} onClose={() => setToast({ ...toast, open: false })} message={toast.msg} severity={toast.sev} />
    </Box>
  );
};
