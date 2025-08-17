import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2B6AF3', // from tokens.css
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F9FAFB', // bg-subtle
      paper: '#FFFFFF',   // bg
    },
    text: {
      primary: '#0F172A',
      secondary: '#6B7280',
    },
  },
  shape: {
    borderRadius: 8, // radius-sm
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#0F172A',
          boxShadow: '0 1px 2px rgba(0,0,0,.06)',
        }
      }
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
)
