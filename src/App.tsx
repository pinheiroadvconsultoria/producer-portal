import './index.css'
import { usePortalStore } from './store/usePortalStore'
import { Login } from './pages/Login'
import { Portal } from './pages/Portal'

export default function App() {
  const token = usePortalStore(s => s.token)
  return token ? <Portal /> : <Login />
}
