import { useState } from 'react'
import {
  LayoutDashboard, Plus, ChevronLeft, ChevronRight,
  Layers, LogOut, Search, Users,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import MemberAvatar from '../shared/MemberAvatar'
import TeamModal from '../shared/TeamModal'
import { ROLE_OPTIONS } from '../../data/mockData'

export default function Sidebar() {
  const { user, projects, currentProject, view, openProject, goToDashboard, logout, onlineUsers } = useApp()
  const others = onlineUsers.filter(u => u.userId !== user?.id)
  const [showTeam, setShowTeam] = useState(false)
  const userRole = ROLE_OPTIONS.find(r => r.value === user?.role)
  const [collapsed, setCollapsed] = useState(false)

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  return (
    <aside
      className={`relative flex flex-col bg-surface-900 border-r border-surface-800 transition-all duration-300 ease-in-out flex-shrink-0 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className={`h-14 flex items-center border-b border-surface-800 ${collapsed ? 'justify-center px-4' : 'px-5 gap-3'}`}>
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-glow-sm">
          <Layers size={16} className="text-white" />
        </div>
        {!collapsed && <span className="font-bold text-white text-sm tracking-wide">FlowBoard</span>}
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="absolute -right-3 top-10 w-6 h-6 bg-surface-800 border border-surface-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-surface-700 transition-all z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        <NavItem
          icon={LayoutDashboard}
          label="Dashboard"
          collapsed={collapsed}
          active={view === 'dashboard'}
          onClick={goToDashboard}
        />
        <NavItem
          icon={Search}
          label="Search"
          collapsed={collapsed}
          active={false}
          onClick={() => {}}
        />
        <NavItem
          icon={Users}
          label="Team"
          collapsed={collapsed}
          active={false}
          onClick={() => setShowTeam(true)}
        />

        {/* Projects section */}
        <div className={`pt-4 pb-1 ${collapsed ? 'px-0' : 'px-2'}`}>
          {!collapsed && (
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Projects
            </span>
          )}
        </div>

        {projects.map(project => (
          <button
            key={project.id}
            onClick={() => openProject(project.id)}
            title={collapsed ? project.name : undefined}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-all duration-150 group ${
              currentProject?.id === project.id && view === 'board'
                ? 'bg-brand-600/20 text-brand-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-800'
            }`}
          >
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center text-base flex-shrink-0 font-medium"
              style={{ background: project.color + '25', color: project.color }}
            >
              {project.emoji}
            </span>
            {!collapsed && (
              <span className="truncate font-medium">{project.name}</span>
            )}
            {!collapsed && currentProject?.id === project.id && view === 'board' && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
            )}
          </button>
        ))}

        {/* Online section */}
        {!collapsed && others.length > 0 && (
          <>
            <div className="pt-4 pb-1 px-2">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                Online · {others.length}
              </span>
            </div>
            {others.map(ou => (
              <div key={ou.userId} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg">
                <div className="relative flex-shrink-0">
                  <MemberAvatar member={{ name: ou.name, avatar: ou.avatar }} size="sm" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full ring-1 ring-surface-900" />
                </div>
                <span className="text-xs text-slate-400 truncate flex-1">{ou.name}</span>
                {ou.view === 'board' && (
                  <span className="text-[10px] text-slate-600 flex-shrink-0">on board</span>
                )}
              </div>
            ))}
          </>
        )}

        {/* New project button */}
        <button
          onClick={goToDashboard}
          title={collapsed ? 'New project' : undefined}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-300 hover:bg-surface-800 transition-all duration-150 group"
        >
          <span className="w-7 h-7 rounded-lg border border-dashed border-surface-600 flex items-center justify-center flex-shrink-0 group-hover:border-slate-500 transition-colors">
            <Plus size={13} />
          </span>
          {!collapsed && <span className="font-medium">New project</span>}
        </button>
      </nav>

      {/* User footer */}
      <div className={`border-t border-surface-800 p-3 ${collapsed ? 'flex justify-center' : 'flex items-center gap-3'}`}>
        <button onClick={() => setShowTeam(true)} className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-brand-600/30 border border-brand-500/40 flex items-center justify-center">
            <span className="text-xs font-semibold text-brand-300">{initials}</span>
          </div>
        </button>
        {!collapsed && (
          <>
            <button onClick={() => setShowTeam(true)} className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              {userRole && (
                <span className="text-[10px] font-semibold" style={{ color: userRole.color }}>
                  {userRole.label}
                </span>
              )}
            </button>
            <button
              onClick={logout}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-surface-800"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </>
        )}
      </div>

      {showTeam && <TeamModal onClose={() => setShowTeam(false)} />}
    </aside>
  )
}

function NavItem({ icon: Icon, label, collapsed, active, onClick }) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
        active
          ? 'bg-brand-600/20 text-brand-300'
          : 'text-slate-400 hover:text-slate-200 hover:bg-surface-800'
      } ${collapsed ? 'justify-center' : ''}`}
    >
      <Icon size={17} className="flex-shrink-0" />
      {!collapsed && <span>{label}</span>}
    </button>
  )
}
