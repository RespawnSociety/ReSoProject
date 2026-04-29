import { useState } from 'react'
import { ChevronRight, Search, X, LayoutGrid, List } from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState('board')

  if (!currentProject) return null

  const totalTasks = Object.values(currentProject.tasks).reduce((s, arr) => s + arr.length, 0)
  const hasFilters = filterPriority || filterLabel || searchQuery

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#090C19' }}>
      {/* Breadcrumb bar */}
      <div className="flex-shrink-0 border-b border-white/[0.06]" style={{ background: '#090C19' }}>
        <div className="flex items-center gap-1 px-5 h-10">
          <button
            onClick={goToDashboard}
            className="text-[12px] text-slate-600 hover:text-slate-300 transition-colors font-medium"
          >
            Projects
          </button>
          <ChevronRight size={12} className="text-slate-700 flex-shrink-0" />
          <div className="flex items-center gap-1.5">
            <span
              className="w-4 h-4 rounded flex items-center justify-center text-[10px] flex-shrink-0"
              style={{ background: currentProject.color + '28' }}
            >
              {currentProject.emoji}
            </span>
            <span className="text-[12px] font-medium text-slate-400">{currentProject.name}</span>
          </div>
          <ChevronRight size={12} className="text-slate-700 flex-shrink-0" />
          <span className="text-[12px] text-slate-500 font-medium">Board</span>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            {boardViewers.length > 0 && (
              <div className="flex items-center -space-x-1.5 mr-1">
                {boardViewers.slice(0, 4).map(u => (
                  <div key={u.userId} className="relative">
                    <MemberAvatar member={{ name: u.name, avatar: u.avatar }} size="sm" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full ring-1 ring-[#090C19]" />
                  </div>
                ))}
                {boardViewers.length > 4 && (
                  <span className="text-[10px] text-slate-600 pl-2">+{boardViewers.length - 4}</span>
                )}
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-white/[0.04] border border-white/[0.07] hover:border-white/[0.12] text-slate-300 placeholder-slate-700 rounded-md pl-7 pr-6 py-1 text-[12px] w-36 focus:outline-none focus:ring-1 focus:ring-brand-500/40 focus:border-brand-500/40 focus:w-48 transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab bar + filters */}
        <div className="flex items-center px-5 border-t border-white/[0.04]">
          {/* Tabs */}
          <div className="flex items-center">
            {[
              { id: 'board', label: 'Board', icon: LayoutGrid },
              { id: 'list', label: 'List', icon: List, disabled: true },
            ].map(tab => (
              <button
                key={tab.id}
                disabled={tab.disabled}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium border-b-2 transition-all ${
                  tab.disabled
                    ? 'text-slate-700 border-transparent cursor-not-allowed'
                    : activeTab === tab.id
                    ? 'text-brand-300 border-brand-500'
                    : 'text-slate-500 border-transparent hover:text-slate-300'
                }`}
              >
                <tab.icon size={12} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-white/[0.06] mx-3 flex-shrink-0" />

          {/* Filter chips row */}
          <div className="flex items-center gap-1.5 flex-1 overflow-x-auto py-1.5 no-scrollbar">
            {PRIORITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilterPriority(v => v === opt.value ? '' : opt.value)}
                className={`flex-shrink-0 text-[11px] px-2.5 py-0.5 rounded-full transition-all font-medium border ${
                  filterPriority === opt.value
                    ? 'bg-brand-600/20 text-brand-300 border-brand-500/40'
                    : 'text-slate-600 border-white/[0.06] hover:text-slate-400 hover:border-white/[0.12]'
                }`}
              >
                {opt.label}
              </button>
            ))}

            <div className="w-px h-3 bg-white/[0.07] flex-shrink-0" />

            {LABEL_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilterLabel(v => v === opt.value ? '' : opt.value)}
                className={`flex-shrink-0 text-[11px] px-2.5 py-0.5 rounded-full transition-all font-medium border ${
                  filterLabel === opt.value ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                }`}
                style={{
                  background: filterLabel === opt.value ? opt.color + '18' : 'transparent',
                  color: opt.color,
                  borderColor: opt.color + '50',
                }}
              >
                {opt.label}
              </button>
            ))}

            {hasFilters && (
              <button
                onClick={() => { setFilterPriority(''); setFilterLabel(''); setSearchQuery('') }}
                className="flex-shrink-0 ml-1 text-[11px] text-slate-700 hover:text-slate-400 flex items-center gap-1 transition-colors"
              >
                <X size={9} /> Clear
              </button>
            )}
          </div>

          <span className="text-[11px] text-slate-700 ml-2 flex-shrink-0">{totalTasks} issues</span>
        </div>
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
