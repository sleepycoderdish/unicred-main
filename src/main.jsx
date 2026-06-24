// src/main.jsx
// ─────────────────────────────────────────────────────────────
// Application entry point.
// Imports global CSS first (important — Tailwind base must load before
// component styles), then renders the React tree into #root.
// ─────────────────────────────────────────────────────────────

import { StrictMode } from 'react'
import { createRoot }  from 'react-dom/client'

// Global styles MUST be imported before App so CSS variables and
// Tailwind base styles are available when components mount.
import './index.css'

import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
