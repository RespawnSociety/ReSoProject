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
      className={`relative flex flex-col border-r border-white/[0.06] transition-all duration-300 ease-in-out flex-shrink-0 ${
        collapsed ? 'w-[52px]' : 'w-[220px]'
      }`}
      style={{ background: '#07091A' }}
    >
      {/* Logo */}
      <div className={`h-12 flex items-center border-b border-white/[0.05] flex-shrink-0 ${collapsed ? 'justify-center px-3' : 'px-4 gap-2.5'}`}>
        <div className="w-6 h-6 bg-brand-600 rounded-md flex items-center justify-center flex-shrink-0">
          <Layers size={13} className="text-white" />
        </div>
        {!collapsed && (
          <>
            <span className="font-bold text-white text-[13px] tracking-tight flex-1">FlowBoard</span>
            <button
              onClick={() => setCollapsed(true)}
              className="w-5 h-5 flex items-center justify-center text-slate-700 hover:text-slate-400 transition-colors rounded"
            >
              <ChevronLeft size={13} />
            </button>
          </>
        )}
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="absolute -right-3 top-9 w-6 h-6 bg-[#111527] border border-white/[0.1] rounded-full flex items-center justify-center text-slate-500 hover:text-white z-10 shadow-lg"
        >
          <ChevronRight size={11} />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-1.5 space-y-0.5">
        <NavItem icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} active={view === 'dashboard'} onClick={goToDashboard} />
        <NavItem icon={Search} label="Search" collapsed={collapsed} active={false} onClick={() => {}} />
        <NavItem icon={Users} label="Team" collapsed={collapsed} active={false} onClick={() => setShowTeam(true)} />

        {/* Projects section */}
        {!collapsed ? (
          <div className="flex items-center justify-between pt-5 pb-1.5 px-2">
            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-[0.1em]">Projects</span>
            <button
              onClick={goToDashboard}
              className="w-4 h-4 flex items-center justify-center text-slate-600 hover:text-slate-400 transition-colors rounded"
              title="New project"
            >
              <Plus size={11} />
            </button>
          </div>
        ) : (
          <div className="pt-4 pb-2 px-3">
            <div className="h-px bg-white/[0.05]" />
          </div>
        )}

        {projects.map(project => (
          <ProjectNavItem
            key={project.id}
            project={project}
            collapsed={collapsed}
            active={currentProject?.id === project.id && view === 'board'}
            onClick={() => openProject(project.id)}
          />
        ))}

        {!collapsed && (
          <button
            onClick={goToDashboard}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] text-slate-700 hover:text-slate-400 hover:bg-white/[0.03] transition-all group mt-0.5"
          >
            <span className="w-5 h-5 rounded border border-dashed border-slate-800 flex items-center justify-center flex-shrink-0 group-hover:border-slate-600 transition-colors">
              <Plus size={10} />
            </span>
            Add project
          </button>
        )}

        {/* Online users */}
        {!collapsed && others.length > 0 && (
          <>
            <div className="pt-5 pb-1.5 px-2">
              <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-[0.1em] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Online · {others.length}
              </span>
            </div>
            {others.map(ou => (
              <div key={ou.userId} className="flex items-center gap-2 px-2 py-1.5 rounded-md">
                <div className="relative flex-shrink-0">
                  <MemberAvatar member={{ name: ou.name, avatar: ou.avatar }} size="sm" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full ring-1 ring-[#07091A]" />
                </div>
                <span className="text-[12px] text-slate-500 truncate flex-1">{ou.name}</span>
              </div>
            ))}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/[0.05] p-2 flex-shrink-0">
        {collapsed ? (
          <button
            onClick={() => setShowTeam(true)}
            className="w-8 h-8 mx-auto flex items-center justify-center rounded-full bg-brand-600/20 border border-brand-500/25"
          >
            <span className="text-[10px] font-bold text-brand-300">{initials}</span>
          </button>
        ) : (
          <div
            onClick={() => setShowTeam(true)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-full bg-brand-600/20 border border-brand-500/25 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-brand-300">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-slate-300 truncate leading-none">{user?.name}</p>
              {userRole && (
                <span className="text-[10px] font-medium mt-0.5 block" style={{ color: userRole.color }}>
                  {userRole.label}
                </span>
              )}
            </div>
            <button
              onClick={e => { e.stopPropagation(); logout() }}
              className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center text-slate-700 hover:text-slate-400 transition-all rounded"
              title="Sign out"
            >
              <LogOut size={12} />
            </button>
          </div>
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
      className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] font-medium transition-all duration-100 ${
        active
          ? 'bg-brand-600/15 text-brand-300'
          : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
      } ${collapsed ? 'justify-center' : ''}`}
    >
      <Icon size={14} className="flex-shrink-0" />
      {!collapsed && <span>{label}</span>}
    </button>
  )
}

function ProjectNavItem({ project, collapsed, active, onClick }) {
  const key = (project.key || project.name.substring(0, 2)).toUpperCase().slice(0, 2)

  return (
    <button
      onClick={onClick}
      title={collapsed ? project.name : undefined}
      className={`relative w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] font-medium transition-all duration-100 ${
        active
          ? 'bg-brand-600/15 text-white'
          : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
      } ${collapsed ? 'justify-center' : ''}`}
    >
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-500 rounded-r-full" />
      )}
      <span
        className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold flex-shrink-0"
        style={{ background: project.color + '28', color: project.color }}
      >
        {key}
      </span>
      {!collapsed && (
        <span className="truncate flex-1 text-left">{project.name}</span>
      )}
    </button>
  )
}
