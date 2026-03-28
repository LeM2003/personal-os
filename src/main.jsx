import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/personal-os/sw.js')
      .then(reg => console.log('[PWA] SW enregistré :', reg.scope))
      .catch(err => console.warn('[PWA] Échec SW :', err))
  })
}
