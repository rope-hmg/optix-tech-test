import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './components/App'
import { BrowserRouter } from "react-router-dom";
import CssBaseline from '@mui/material/CssBaseline';

import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <CssBaseline />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
