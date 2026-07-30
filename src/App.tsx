import { useEffect, useState } from 'react'
import './index.css'
import { usePortalStore } from './store/usePortalStore'
import { Login } from './pages/Login'
import { Portal } from './pages/Portal'
import { Download } from './pages/Download'
import { AdminPage } from './pages/AdminPage'
import { InstallPWA } from './components/InstallPWA'

function currentPath() {
  return typeof window !== 'undefined' ? window.location.pathname.replace(/\/+$/, '') : ''
}

export default function App() {
  const token = usePortalStore(s => s.token)
  const [path, setPath] = useState(currentPath)

  useEffect(() => {
    const onPop = () => setPath(currentPath())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  if (path === '/download') return <Download />
  if (path === '/admin') return <AdminPage />

  return (
    <>
      {token ? <Portal /> : <Login />}
      <InstallPWA />
    </>
  )
}
