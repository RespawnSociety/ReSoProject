import { AppProvider, useApp } from './context/AppContext'
import LoginPage from './components/auth/LoginPage'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './components/dashboard/Dashboard'
import BoardPage from './components/board/BoardPage'

function AppRoutes() {
  const { user, view } = useApp()

  if (!user) return <LoginPage />

  return (
    <AppLayout>
      {view === 'dashboard' && <Dashboard />}
      {view === 'board' && <BoardPage />}
    </AppLayout>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  )
}
