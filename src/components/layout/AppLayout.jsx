import Sidebar from './Sidebar'

export default function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden bg-surface-950">
        {children}
      </main>
    </div>
  )
}
