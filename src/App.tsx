import React, { useMemo, useState } from 'react'
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, IconButton, Divider
} from '@mui/material'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import EmailIcon from '@mui/icons-material/Email'
import SettingsIcon from '@mui/icons-material/Settings'
import WorkIcon from '@mui/icons-material/Work'
import { PipelineBuilder } from './components/PipelineBuilder'
import { EmailComposer } from './components/EmailComposer'
import { SettingsPanel } from './components/Settings'
import { JobDescriptionManager } from './components/JobDescriptionManager'
import { ErrorBoundary } from './components/ErrorBoundary'

type View = 'pipeline' | 'composer' | 'settings' | 'jd'
const drawerWidth = 240

export default function App() {
  const [currentView, setCurrentView] = useState<View>('pipeline')

  const renderView = useMemo(() => {
    switch (currentView) {
      case 'pipeline': return <PipelineBuilder />
      case 'composer': return <EmailComposer />
      case 'settings': return <SettingsPanel />
      case 'jd': return <JobDescriptionManager />
    }
  }, [currentView])

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: 1201, borderBottom: '1px solid #E5E7EB' }} elevation={0}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img src="/ThisIsAnyAILogo.svg" alt="AnyAI Logo" style={{ height: '30px', marginRight: '16px' }} />
            <Typography variant="h6" noWrap component="div" sx={{ color: 'text.primary' }}>
              for HR - Admin Panel
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {[
            { text: 'Pipeline Builder', icon: <AccountTreeIcon />, view: 'pipeline' },
            { text: 'Email Composer', icon: <EmailIcon />, view: 'composer' },
            { text: 'Job Descriptions', icon: <WorkIcon />, view: 'jd' },
            { text: 'Settings', icon: <SettingsIcon />, view: 'settings' },
          ].map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={currentView === item.view}
                onClick={() => setCurrentView(item.view as View)}
                sx={{
                  '&.Mui-selected': { backgroundColor: 'rgba(43, 106, 243, 0.1)' },
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default' }}>
        <Toolbar />
        <ErrorBoundary>
          {renderView}
        </ErrorBoundary>
      </Box>
    </Box>
  )
}
