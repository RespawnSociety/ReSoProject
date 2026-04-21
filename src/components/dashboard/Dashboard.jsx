import { useState } from 'react'
import { Plus, LayoutGrid, List, Folder, Calendar, MoreHorizontal, Trash2, ExternalLink, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { COLUMN_CONFIGS } from '../../data/mockData'

const PROJECT_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']
const PROJECT_EMOJIS = ['🚀', '⚡', '📱', '🎯', '💡', '🔧', '🌟', '🏗️', '🎨', '📊', '🔒', '🌐']

export default function Dashboard() {
  const { projects, openProject, createProject, deleteProject } = useApp()
  const [showCreate, setShowCreate] = useState(false)
  const [activeMenu, setActiveMenu] = useState(null)

  const totalTasks = projects.reduce((sum, p) => {
    return sum + Object.values(p.tasks).reduce((s, col) => s + col.length, 0)
  }, 0)

  const doneTasks = projects.reduce((sum, p) => sum + (p.tasks.done?.length || 0), 0)
  const inProgressTasks = projects.reduce((sum, p) => sum + (p.tasks.inprogress?.length || 0), 0)

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface-950/90 glass border-b border-surface-800 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Projects</h1>
            <p className="text-sm text-slate-400 mt-0.5">All your workspaces in one place</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus size={16} />
            New Project
          </button>
        </div>
      </div>

      <div className="px-8 py-6 max-w-6xl">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Projects', value: projects.length,    color: 'from-brand-500/20 to-brand-600/5',   border: 'border-brand-500/20',   text: 'text-brand-400'  },
            { label: 'Total Tasks',    value: totalTasks,         color: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/20',  text: 'text-purple-400' },
            { label: 'In Progress',    value: inProgressTasks,    color: 'from-amber-500/20 to-amber-600/5',   border: 'border-amber-500/20',   text: 'text-amber-400'  },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-2xl p-5`}>
              <p className="text-sm text-slate-400 mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.text}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Projects grid */}
        {projects.length === 0 ? (
          <EmptyState onNew={() => setShowCreate(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
            {/* Create card */}
            <button
              onClick={() => setShowCreate(true)}
              className="border-2 border-dashed border-surface-700 hover:border-brand-500/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-brand-400 transition-all duration-200 group min-h-[180px]"
            >
              <div className="w-12 h-12 rounded-xl border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={22} />
              </div>
              <span className="text-sm font-medium">Create New Project</span>
            </button>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreate={async (data) => {
            await createProject(data)
            setShowCreate(false)
          }}
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

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5 hover:border-surface-700 transition-all duration-200 group hover:shadow-card relative flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: project.color + '25' }}
        >
          {project.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate group-hover:text-brand-300 transition-colors text-sm">
            {project.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{project.description}</p>
        </div>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); onMenuToggle() }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-surface-700 transition-all opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal size={15} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={onMenuClose} />
              <div className="absolute right-0 top-8 z-30 bg-surface-800 border border-surface-700 rounded-xl shadow-card min-w-[140px] py-1 animate-slide-up">
                <button
                  onClick={() => { onOpen(); onMenuClose() }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-surface-700 hover:text-white transition-colors"
                >
                  <ExternalLink size={14} /> Open board
                </button>
                <div className="my-1 border-t border-surface-700" />
                <button
                  onClick={() => { onDelete(); onMenuClose() }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Column task counts */}
      <div className="flex gap-2 flex-wrap">
        {COLUMN_CONFIGS.map(col => (
          <div key={col.id} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: col.color }} />
            <span className="text-xs text-slate-500">{taskCounts[col.id] || 0}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-500">{done}/{total} done</span>
          <span className="text-xs font-medium" style={{ color: project.color }}>{progress}%</span>
        </div>
        <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: project.color }}
          />
        </div>
      </div>

      {/* Open button */}
      <button
        onClick={onOpen}
        className="w-full py-2 rounded-xl text-sm font-medium border border-surface-700 text-slate-400 hover:bg-surface-800 hover:text-white hover:border-surface-600 transition-all"
        style={{ '--hover-color': project.color }}
      >
        Open Board
      </button>
    </div>
  )
}

function EmptyState({ onNew }) {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Folder size={28} className="text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-2">No projects yet</h3>
      <p className="text-slate-500 text-sm mb-6">Create your first project to get started</p>
      <button onClick={onNew} className="btn-primary mx-auto">
        <Plus size={16} /> Create Project
      </button>
    </div>
  )
}

function CreateProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(PROJECT_COLORS[0])
  const [emoji, setEmoji] = useState(PROJECT_EMOJIS[0])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onCreate({ name: name.trim(), description: description.trim(), color, emoji })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 glass" onClick={onClose} />
      <div className="relative bg-surface-900 border border-surface-700 rounded-2xl shadow-card w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-surface-800">
          <h2 className="text-lg font-semibold text-white">New Project</h2>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Emoji & color */}
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: color + '25' }}
            >
              {emoji}
            </div>
            <div className="space-y-2 flex-1">
              <div>
                <label className="text-xs text-slate-500 font-medium mb-1 block">Emoji</label>
                <div className="flex flex-wrap gap-1">
                  {PROJECT_EMOJIS.map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(e)}
                      className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${
                        emoji === e ? 'bg-brand-600/30 ring-1 ring-brand-500' : 'hover:bg-surface-700'
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
            <label className="text-xs text-slate-500 font-medium mb-2 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-offset-surface-900 ring-white scale-110' : 'hover:scale-105'
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Project name *</label>
            <input
              type="text"
              placeholder="My Awesome Project"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              placeholder="What's this project about?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="input-field resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-ghost justify-center border border-surface-600">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim()} className="flex-1 btn-primary justify-center disabled:opacity-40">
              <Plus size={16} /> Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
