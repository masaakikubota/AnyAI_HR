import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Dialog, DialogActions, DialogContent,
  DialogTitle, List, ListItem, ListItemText, IconButton, Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Toast } from './Toast';
import { loadSettings } from '../lib/storage';
import { fetchJDs, saveJD, deleteJD, type JobDescription } from '../lib/api';

export const JobDescriptionManager: React.FC = () => {
  const [jds, setJds] = useState<JobDescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentJD, setCurrentJD] = useState<Partial<JobDescription> | null>(null);
  const [toast, setToast] = useState<{ open: boolean, msg: string, sev?: 'success' | 'error' }>({ open: false, msg: '' });
  const settings = loadSettings();

  const refreshJDs = async () => {
    setIsLoading(true);
    try {
      const data = await fetchJDs();
      setJds(data);
    } catch (error) {
      setToast({ open: true, msg: 'Failed to load JDs. Check backend connection.', sev: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshJDs();
  }, []);

  const handleOpenDialog = (jd: Partial<JobDescription> | null = null) => {
    setCurrentJD(jd || { title: '', description: '' });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentJD(null);
  };

  const handleSave = async () => {
    if (!currentJD || !currentJD.title) {
      setToast({ open: true, msg: 'Title is required.', sev: 'error' });
      return;
    }
    try {
      await saveJD(currentJD as any);
      await refreshJDs();
      setToast({ open: true, msg: 'Job Description saved successfully!', sev: 'success' });
      handleCloseDialog();
    } catch (error) {
      setToast({ open: true, msg: `Failed to save: ${error}`, sev: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this?')) {
      try {
        await deleteJD(id);
        await refreshJDs();
        setToast({ open: true, msg: 'Deleted successfully!', sev: 'success' });
      } catch (error) {
        setToast({ open: true, msg: `Failed to delete: ${error}`, sev: 'error' });
      }
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Job Description Management</Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => handleOpenDialog()}
        sx={{ mb: 2 }}
      >
        Add New JD
      </Button>

      <Paper>
        <List>
          {isLoading ? <ListItem><ListItemText primary="Loading..." /></ListItem> :
            jds.map(jd => (
              <ListItem
                key={jd.id}
                secondaryAction={
                  <>
                    <IconButton edge="end" aria-label="edit" onClick={() => handleOpenDialog(jd)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(jd.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                }
              >
                <ListItemText primary={jd.title} secondary={jd.description.substring(0, 100) + '...'} />
              </ListItem>
            ))
          }
        </List>
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{currentJD?.id ? 'Edit' : 'Add'} Job Description</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Job Title"
            type="text"
            fullWidth
            variant="outlined"
            value={currentJD?.title || ''}
            onChange={(e) => setCurrentJD({ ...currentJD, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={10}
            variant="outlined"
            value={currentJD?.description || ''}
            onChange={(e) => setCurrentJD({ ...currentJD, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Toast open={toast.open} onClose={() => setToast({ ...toast, open: false })} message={toast.msg} severity={toast.sev} />
    </Box>
  );
};
