import React, { useState } from 'react'
import {
  Box, Typography, Grid, TextField, Button, FormControlLabel, Switch,
  ToggleButtonGroup, ToggleButton
} from '@mui/material'
import { loadSettings, saveSettings, type Settings } from '../lib/storage'

export const SettingsPanel: React.FC = () => {
  const [s, setS] = useState<Settings>(() => loadSettings())

  const save = () => {
    saveSettings(s)
    alert('Settings saved')
  }

  const handleModelChange = (event: React.MouseEvent<HTMLElement>, newValue: string | null) => {
    if (newValue !== null) {
      setS({ ...s, model: newValue });
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Settings</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <TextField label="Backend URL" value={s.backendUrl} onChange={(e) => setS({ ...s, backendUrl: e.target.value })} fullWidth sx={{ mb: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>Model</Typography>
          <ToggleButtonGroup
            value={s.model}
            exclusive
            onChange={handleModelChange}
            aria-label="text alignment"
            sx={{ mb: 2 }}
          >
            <ToggleButton value="google/gemini-2.5-pro" aria-label="Gemini 1.5 Pro">
              Pro
            </ToggleButton>
            <ToggleButton value="google/gemini-2.5-flash" aria-label="Gemini 1.5 Flash">
              Flash
            </ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={<Switch checked={s.shareContext} onChange={(e, v) => setS({ ...s, shareContext: v })} />}
              label="Share Context between prompts"
            />
            <Typography variant="caption" display="block">
              Enables conversational context between pipeline steps. If disabled, each step runs independently.
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={<Switch checked={s.fallbackAppendTranscript} onChange={(e, v) => setS({ ...s, fallbackAppendTranscript: v })} />}
              label="Fallback: Append Transcript"
            />
            <Typography variant="caption" display="block">
              If context sharing is disabled or fails, automatically append the full transcript to each prompt.
            </Typography>
          </Box>

          <TextField label="Transcript (for testing; paste here)" value={s.transcript ?? ''} onChange={(e) => setS({ ...s, transcript: e.target.value })} fullWidth multiline rows={6} sx={{ mb: 2 }} />
          <Button variant="contained" onClick={save}>Save Settings</Button>
        </Grid>
      </Grid>
    </Box>
  )
}
