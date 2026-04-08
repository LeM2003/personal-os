import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppProvider } from './context/AppContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[PWA] SW enregistré :', reg.scope))
      .catch(err => console.warn('[PWA] Échec SW :', err))
  })
}
