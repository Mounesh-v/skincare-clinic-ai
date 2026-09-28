import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { NotificationProvider } from './context/NotificationContext'

if (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1') {
  const { protocol, port, pathname, search, hash } = window.location
  const hostPort = port ? `:${port}` : ''
  const redirectUrl = `${protocol}//localhost${hostPort}${pathname}${search}${hash}`
  window.location.replace(redirectUrl)
}

// Register Service Worker for push notifications
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("Service Worker registered:", reg.scope))
      .catch((err) => console.error("Service Worker registration failed:", err));
  });
}

createRoot(document.getElementById('root')).render(
  <NotificationProvider>
    <App />
  </NotificationProvider>,
)
