import { useEffect, useState } from 'react'
import './index.css'
import { usePortalStore } from './store/usePortalStore'
import { Login } from './pages/Login'
import { Portal } from './pages/Portal'
import { Download } from './pages/Download'
import { InstallPWA } from './components/InstallPWA'

function isDownloadPath() {
  return typeof window !== 'undefined' && window.location.pathname.replace(/\/+$/, '') === '/download'
}

export default function App() {
  const token = usePortalStore(s => s.token)
  const [onDownload, setOnDownload] = useState(isDownloadPath)

  useEffect(() => {
    const onPop = () => setOnDownload(isDownloadPath())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  if (onDownload) return <Download />

  return (
    <>
      {token ? <Portal /> : <Login />}
      <InstallPWA />
    </>
  )
}
