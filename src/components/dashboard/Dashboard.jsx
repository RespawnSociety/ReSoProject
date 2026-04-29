import { useState } from 'react'
import { Plus, Folder, Trash2, ExternalLink, MoreHorizontal, X, Activity, ListChecks } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { COLUMN_CONFIGS } from '../../data/mockData'

const PROJECT_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']
const PROJECT_EMOJIS = ['🚀', '⚡', '📱', '🎯', '💡', '🔧', '🌟', '🏗️', '🎨', '📊', '🔒', '🌐']

export default function Dashboard() {
  const { projects, openProject, createProject, deleteProject } = useApp()
  const [showCreate, setShowCreate] = useState(false)
  const [activeMenu, setActiveMenu] = useState(null)

  const totalTasks = projects.reduce((sum, p) =>
    sum + Object.values(p.tasks).reduce((s, col) => s + col.length, 0), 0)
  const doneTasks = projects.reduce((sum, p) => sum + (p.tasks.done?.length || 0), 0)
  const inProgressTasks = projects.reduce((sum, p) => sum + (p.tasks.inprogress?.length || 0), 0)

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: '#090C19' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/[0.06] px-8 py-4" style={{ background: '#090C19' }}>
        <div className="flex items-center justify-between max-w-6xl">
          <div>
            <h1 className="text-[16px] font-bold text-white">Projects</h1>
            <p className="text-[12px] text-slate-500 mt-0.5">All your workspaces in one place</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary text-[13px] py-1.5 px-3.5">
            <Plus size={14} />
            New Project
          </button>
        </div>
      </div>

      <div className="px-8 py-6 max-w-6xl">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-7">
          {[
            { label: 'Projects', value: projects.length, icon: Folder, color: '#6366F1' },
            { label: 'Total Issues', value: totalTasks, icon: ListChecks, color: '#8B5CF6' },
            { label: 'In Progress', value: inProgressTasks, icon: Activity, color: '#F59E0B' },
          ].map(s => (
            <div
              key={s.label}
              className="flex items-center gap-4 rounded-xl p-4 border border-white/[0.06]"
              style={{ background: '#0D1022' }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: s.color + '18' }}
              >
                <s.icon size={16} style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium">{s.label}</p>
                <p className="text-[22px] font-bold text-white leading-tight">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Projects grid */}
        {projects.length === 0 ? (
          <EmptyState onNew={() => setShowCreate(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => openProject(project.id)}
                onDelete={() => deleteProject(project.id)}
                menuOpen={activeMenu === project.id}
                onMenuToggle={() => setActiveMenu(v => v === project.id ? null : project.id)}
                onMenuClose={() => setActiveMenu(null)}
              />
            ))}
            {/* Create new card */}
            <button
              onClick={() => setShowCreate(true)}
              className="border border-dashed border-white/[0.07] hover:border-brand-500/30 rounded-xl p-6 flex flex-col items-center justify-center gap-2.5 text-slate-600 hover:text-brand-400 transition-all duration-200 group min-h-[168px]"
              style={{ background: '#0D1022' }}
            >
              <div className="w-10 h-10 rounded-lg border border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={18} />
              </div>
              <span className="text-[12px] font-medium">New Project</span>
            </button>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreate={async data => { await createProject(data); setShowCreate(false) }}
        />
      )}
    </div>
  )
}

function ProjectCard({ project, onOpen, onDelete, menuOpen, onMenuToggle, onMenuClose }) {
  const taskCounts = Object.fromEntries(
    Object.entries(project.tasks).map(([k, v]) => [k, v.length])
  )
  const total = Object.values(taskCounts).reduce((a, b) => a + b, 0)
  const done = taskCounts.done || 0
  const progress = total > 0 ? Math.round((done / total) * 100) : 0
  const inProg = taskCounts.inprogress || 0

  return (
    <div
      className="rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 group flex flex-col overflow-hidden cursor-pointer"
      style={{ background: '#0D1022' }}
      onClick={onOpen}
    >
      {/* Colored top strip */}
      <div className="h-1 w-full flex-shrink-0" style={{ background: project.color }} />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[18px] flex-shrink-0"
            style={{ background: project.color + '20' }}
          >
            {project.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[13px] font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
              {project.name}
            </h3>
            <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
              {project.description || 'No description'}
            </p>
          </div>
          <div className="relative flex-shrink-0" onClick={e => e.stopPropagation()}>
            <button
              onClick={onMenuToggle}
              className="w-6 h-6 flex items-center justify-center rounded text-slate-700 hover:text-slate-400 hover:bg-white/[0.05] transition-all opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal size={14} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={onMenuClose} />
                <div className="absolute right-0 top-7 z-30 border border-white/[0.08] rounded-lg shadow-2xl min-w-[140px] py-1 animate-slide-up" style={{ background: '#111527' }}>
                  <button
                    onClick={() => { onOpen(); onMenuClose() }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-slate-400 hover:bg-white/[0.05] hover:text-white transition-colors"
                  >
                    <ExternalLink size={12} /> Open Board
                  </button>
                  <div className="my-1 border-t border-white/[0.06]" />
                  <button
                    onClick={() => { onDelete(); onMenuClose() }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Column dots breakdown */}
        <div className="flex items-center gap-3 flex-wrap">
          {COLUMN_CONFIGS.map(col => (
            <div key={col.id} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: col.color }} />
              <span className="text-[11px] text-slate-600">{taskCounts[col.id] || 0}</span>
            </div>
          ))}
          {total > 0 && (
            <span className="ml-auto text-[10px] text-slate-600">{total} total</span>
          )}
        </div>

        {/* Progress */}
        <div>
          <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: progress === 100 ? '#22C55E' : project.color }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-slate-600">{done}/{total} done</span>
            {inProg > 0 && (
              <span className="text-[10px] text-amber-500/70">{inProg} in progress</span>
            )}
            <span
              className="text-[10px] font-semibold ml-auto"
              style={{ color: progress === 100 ? '#22C55E' : project.color }}
            >
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onNew }) {
  return (
    <div className="text-center py-20">
      <div className="w-14 h-14 border border-white/[0.07] rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: '#0D1022' }}>
        <Folder size={24} className="text-slate-600" />
      </div>
      <h3 className="text-[15px] font-semibold text-slate-300 mb-1.5">No projects yet</h3>
      <p className="text-slate-600 text-[12px] mb-5">Create your first project to get started</p>
      <button onClick={onNew} className="btn-primary mx-auto text-[13px]">
        <Plus size={14} /> Create Project
      </button>
    </div>
  )
}

function CreateProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(PROJECT_COLORS[0])
  const [emoji, setEmoji] = useState(PROJECT_EMOJIS[0])

  const handleSubmit = e => {
    e.preventDefault()
    if (!name.trim()) return
    onCreate({ name: name.trim(), description: description.trim(), color, emoji })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative border border-white/[0.08] rounded-xl shadow-2xl w-full max-w-md animate-slide-up"
        style={{ background: '#0D1022' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-[14px] font-semibold text-white">New Project</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-md text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] transition-all">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Emoji + color row */}
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: color + '20' }}
            >
              {emoji}
            </div>
            <div className="space-y-2 flex-1">
              <div>
                <label className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider mb-1.5 block">Icon</label>
                <div className="flex flex-wrap gap-1">
                  {PROJECT_EMOJIS.map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(e)}
                      className={`w-7 h-7 rounded-md text-sm flex items-center justify-center transition-all ${
                        emoji === e ? 'bg-brand-600/25 ring-1 ring-brand-500/50' : 'hover:bg-white/[0.05]'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider mb-2 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-offset-[#0D1022] ring-white scale-110' : 'hover:scale-105'
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-slate-400 mb-1.5">Project name <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="My Project"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field text-[13px]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-slate-400 mb-1.5">Description</label>
            <textarea
              placeholder="What's this project about?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="input-field resize-none text-[13px]"
            />
          </div>

          <div className="flex gap-2.5 pt-1">
            <button type="button" onClick={onClose} className="flex-1 btn-ghost justify-center border border-white/[0.08] text-[13px]">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim()} className="flex-1 btn-primary justify-center disabled:opacity-40 text-[13px]">
              <Plus size={14} /> Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
