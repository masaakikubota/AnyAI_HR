import { Snackbar, Alert } from '@mui/material'
import React from 'react'

export function Toast({ open, onClose, message, severity = 'success' }: {
  open: boolean
  onClose: () => void
  message: string
  severity?: 'success'|'info'|'warning'|'error'
}) {
  return (
    <Snackbar open={open} autoHideDuration={3000} onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Alert onClose={onClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  )
}
