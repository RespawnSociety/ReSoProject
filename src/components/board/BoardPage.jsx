import { useState } from 'react'
import {
  ArrowLeft, Search, Filter, X,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import KanbanBoard from './KanbanBoard'
import MemberAvatar from '../shared/MemberAvatar'
import { PRIORITY_OPTIONS, LABEL_OPTIONS } from '../../data/mockData'

export default function BoardPage() {
  const { currentProject, goToDashboard, onlineUsers, user } = useApp()
  const boardViewers = onlineUsers.filter(u => u.userId !== user?.id && u.projectId === currentProject?.id)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterLabel, setFilterLabel] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  if (!currentProject) return null

  const totalTasks = Object.values(currentProject.tasks).reduce((s, arr) => s + arr.length, 0)
  const hasFilters = filterPriority || filterLabel || searchQuery

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Board header */}
      <div className="flex-shrink-0 border-b border-surface-800 bg-surface-950">
        {/* Top bar */}
        <div className="flex items-center gap-4 px-6 py-3">
          <button
            onClick={goToDashboard}
            className="btn-ghost py-1.5 px-2"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Projects</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
              style={{ background: currentProject.color + '25' }}
            >
              {currentProject.emoji}
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-none">{currentProject.name}</h1>
              <p className="text-[11px] text-slate-500 mt-0.5">{totalTasks} tasks</p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Board viewers */}
            {boardViewers.length > 0 && (
              <div className="flex items-center gap-1 mr-1" title={`${boardViewers.length} orang lagi lihat board ini`}>
                {boardViewers.slice(0, 4).map(u => (
                  <div key={u.userId} className="relative">
                    <MemberAvatar member={{ name: u.name, avatar: u.avatar }} size="sm" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full ring-1 ring-surface-950" />
                  </div>
                ))}
                {boardViewers.length > 4 && (
                  <span className="text-xs text-slate-500 ml-0.5">+{boardViewers.length - 4}</span>
                )}
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-surface-800 border border-surface-700 text-slate-200 placeholder-slate-500 rounded-lg pl-9 pr-8 py-2 text-sm w-52 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`btn-ghost py-2 ${showFilters || hasFilters ? 'text-brand-400 bg-brand-600/10' : ''}`}
            >
              <Filter size={15} />
              <span className="hidden sm:inline">Filter</span>
              {hasFilters && (
                <span className="w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {[filterPriority, filterLabel, searchQuery].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter bar */}
        {showFilters && (
          <div className="flex items-center gap-3 px-6 py-2.5 bg-surface-900/50 border-t border-surface-800 animate-slide-up">
            <span className="text-xs font-medium text-slate-500">Filter by:</span>

            {/* Priority filter */}
            <div className="flex items-center gap-1">
              {PRIORITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilterPriority(v => v === opt.value ? '' : opt.value)}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-all font-medium ${
                    filterPriority === opt.value
                      ? 'bg-brand-600/20 text-brand-300 ring-1 ring-brand-500/50'
                      : 'bg-surface-800 text-slate-400 hover:text-slate-200 hover:bg-surface-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-surface-700" />

            {/* Label filter */}
            <div className="flex items-center gap-1 flex-wrap">
              {LABEL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilterLabel(v => v === opt.value ? '' : opt.value)}
                  className={`text-xs px-2.5 py-1 rounded-full transition-all font-medium ${
                    filterLabel === opt.value
                      ? 'ring-2'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    background: opt.color + '20',
                    color: opt.color,
                    borderColor: opt.color,
                    ...(filterLabel === opt.value ? { ringColor: opt.color } : {}),
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {hasFilters && (
              <button
                onClick={() => { setFilterPriority(''); setFilterLabel(''); setSearchQuery('') }}
                className="ml-auto text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
              >
                <X size={12} /> Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden flex">
        <KanbanBoard
          project={currentProject}
          filterPriority={filterPriority}
          filterLabel={filterLabel}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  )
}
