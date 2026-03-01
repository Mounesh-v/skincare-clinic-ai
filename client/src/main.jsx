import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1') {
  const { protocol, port, pathname, search, hash } = window.location
  const hostPort = port ? `:${port}` : ''
  const redirectUrl = `${protocol}//localhost${hostPort}${pathname}${search}${hash}`
  window.location.replace(redirectUrl)
}

createRoot(document.getElementById('root')).render(
  <>
    <App />
  </>,
)
