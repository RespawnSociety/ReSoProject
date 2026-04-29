import { useState } from 'react'
import {
  X, Trash2, Tag, AlignLeft,
  ChevronDown, Save, UserCircle,
} from 'lucide-react'
import { LABEL_OPTIONS, PRIORITY_OPTIONS, COLUMN_CONFIGS } from '../../data/mockData'
import { useApp } from '../../context/AppContext'
import MemberAvatar from '../shared/MemberAvatar'
import { RoleBadge } from '../shared/TeamModal'

const PRIORITY_STYLES = {
  urgent: { dot: 'bg-red-500',    text: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/25' },
  high:   { dot: 'bg-orange-500', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/25' },
  medium: { dot: 'bg-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/25' },
  low:    { dot: 'bg-green-500',  text: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/25' },
}

export default function TaskModal({ task, columnId, projectKey, onClose, onSave, onDelete, onMove }) {
  const { teamMembers } = useApp()

  const [title, setTitle]             = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [priority, setPriority]       = useState(task?.priority || 'medium')
  const [labels, setLabels]           = useState(task?.labels || [])
  const [assigneeIds, setAssigneeIds] = useState(task?.assigneeIds || [])
  const [startDate, setStartDate]     = useState(task?.startDate || '')
  const [dueDate, setDueDate]         = useState(task?.dueDate || '')
  const [currentColumn, setCurrentColumn] = useState(columnId)

  const [showPriorityMenu, setShowPriorityMenu]   = useState(false)
  const [showLabelsMenu, setShowLabelsMenu]         = useState(false)
  const [showMoveMenu, setShowMoveMenu]             = useState(false)
  const [showAssigneeMenu, setShowAssigneeMenu]     = useState(false)

  const isNew = !task?.id
  const taskKey = task?.id ? `${projectKey}-${task.id.slice(-4).toUpperCase()}` : null
  const assignedMembers = teamMembers.filter(m => assigneeIds.includes(m.id))
  const activeLabels = labels.map(l => LABEL_OPTIONS.find(o => o.value === l)).filter(Boolean)
  const currentCol = COLUMN_CONFIGS.find(c => c.id === currentColumn)
  const ps = PRIORITY_STYLES[priority]

  const toggleAssignee = id =>
    setAssigneeIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleLabel = value =>
    setLabels(prev => prev.includes(value) ? prev.filter(l => l !== value) : [...prev, value])

  const handleSave = () => {
    if (!title.trim()) return
    onSave({ title: title.trim(), description, priority, labels, assigneeIds, startDate: startDate || null, dueDate: dueDate || null })
    onClose()
  }

  const handleDelete = () => {
    if (confirm('Delete this issue?')) { onDelete(); onClose() }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div
        className="relative border border-white/[0.08] rounded-xl shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col animate-slide-up overflow-hidden"
        style={{ background: '#0D1022' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 px-5 py-3 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {taskKey ? (
              <span className="text-[11px] font-mono text-slate-500 bg-white/[0.05] px-2 py-0.5 rounded flex-shrink-0">
                {taskKey}
              </span>
            ) : (
              <span className="text-[11px] font-mono text-slate-500 bg-white/[0.05] px-2 py-0.5 rounded flex-shrink-0">
                NEW
              </span>
            )}

            {/* Status / move column */}
            <div className="relative">
              <button
                onClick={() => setShowMoveMenu(v => !v)}
                className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 transition-colors"
              >
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: currentCol?.color }} />
                {currentCol?.title}
                <ChevronDown size={10} className="text-slate-500" />
              </button>
              {showMoveMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMoveMenu(false)} />
                  <div className="absolute left-0 top-8 z-20 border border-white/[0.08] rounded-lg shadow-2xl min-w-[160px] py-1 animate-slide-up" style={{ background: '#111527' }}>
                    {COLUMN_CONFIGS.map(col => (
                      <button
                        key={col.id}
                        onClick={() => { if (col.id !== currentColumn) onMove(col.id); setCurrentColumn(col.id); setShowMoveMenu(false) }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] transition-colors ${
                          col.id === currentColumn ? 'text-white bg-white/[0.06]' : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                        {col.title}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {!isNew && (
              <button
                onClick={handleDelete}
                className="w-7 h-7 flex items-center justify-center rounded-md text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <Trash2 size={13} />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-md text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] transition-all"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Two-column body */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Left: title + description ── */}
          <div className="flex-1 overflow-y-auto p-6 min-w-0">
            <textarea
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Issue title..."
              rows={2}
              className="w-full bg-transparent text-[18px] font-semibold text-white placeholder-slate-700 resize-none outline-none leading-snug mb-6"
              autoFocus={isNew}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) e.preventDefault() }}
            />

            <div className="flex items-center gap-2 mb-2">
              <AlignLeft size={12} className="text-slate-600" />
              <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Description</span>
            </div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add a more detailed description..."
              rows={9}
              className="w-full border border-white/[0.06] hover:border-white/[0.1] focus:border-brand-500/40 rounded-lg p-3.5 text-[13px] text-slate-300 placeholder-slate-700 resize-none outline-none transition-all leading-relaxed"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            />

            {task?.createdAt && (
              <p className="text-[11px] text-slate-700 mt-5">
                Created {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>

          {/* ── Right: details panel ── */}
          <div
            className="w-[220px] flex-shrink-0 border-l border-white/[0.05] overflow-y-auto"
            style={{ background: 'rgba(0,0,0,0.15)' }}
          >
            <div className="p-4 space-y-1">

              {/* Priority */}
              <SidebarField label="Priority">
                <div className="relative">
                  <button
                    onClick={() => setShowPriorityMenu(v => !v)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12px] font-medium border transition-all ${ps.bg} ${ps.text} ${ps.border}`}
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ps.dot}`} />
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    <ChevronDown size={10} className="ml-auto opacity-50" />
                  </button>
                  {showPriorityMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowPriorityMenu(false)} />
                      <div className="absolute left-0 top-9 z-20 border border-white/[0.08] rounded-lg shadow-2xl w-full py-1 animate-slide-up" style={{ background: '#111527' }}>
                        {PRIORITY_OPTIONS.map(opt => {
                          const s = PRIORITY_STYLES[opt.value]
                          return (
                            <button
                              key={opt.value}
                              onClick={() => { setPriority(opt.value); setShowPriorityMenu(false) }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] transition-colors hover:bg-white/[0.05] ${priority === opt.value ? 'text-white' : 'text-slate-400'}`}
                            >
                              <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                              {opt.label}
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              </SidebarField>

              {/* Assignees */}
              <SidebarField label="Assignees">
                <div className="relative">
                  <button
                    onClick={() => setShowAssigneeMenu(v => !v)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] text-[12px] text-slate-400 hover:text-slate-300 transition-all"
                  >
                    {assignedMembers.length > 0 ? (
                      <>
                        <div className="flex -space-x-1">
                          {assignedMembers.slice(0, 3).map(m => <MemberAvatar key={m.id} member={m} size="xs" />)}
                        </div>
                        <span className="truncate">{assignedMembers.length} assigned</span>
                      </>
                    ) : (
                      <>
                        <UserCircle size={12} className="text-slate-700 flex-shrink-0" />
                        <span className="text-slate-700">Unassigned</span>
                      </>
                    )}
                    <ChevronDown size={10} className="ml-auto opacity-50 flex-shrink-0" />
                  </button>
                  {showAssigneeMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowAssigneeMenu(false)} />
                      <div className="absolute left-0 top-9 z-20 border border-white/[0.08] rounded-lg shadow-2xl min-w-[200px] py-1.5 animate-slide-up" style={{ background: '#111527' }}>
                        <button
                          onClick={() => setAssigneeIds([])}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-slate-500 hover:bg-white/[0.05] hover:text-white transition-colors"
                        >
                          <UserCircle size={12} /> Clear all
                        </button>
                        <div className="mx-3 my-1 border-t border-white/[0.06]" />
                        {teamMembers.length === 0 ? (
                          <p className="px-3 py-2 text-[11px] text-slate-600">No team members</p>
                        ) : teamMembers.map(member => {
                          const selected = assigneeIds.includes(member.id)
                          return (
                            <button
                              key={member.id}
                              onClick={() => toggleAssignee(member.id)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] transition-colors hover:bg-white/[0.05] ${selected ? 'text-white' : 'text-slate-400'}`}
                            >
                              <MemberAvatar member={member} size="sm" />
                              <div className="flex-1 min-w-0 text-left">
                                <p className="font-medium truncate">{member.name}</p>
                                {member.role && <RoleBadge role={member.role} />}
                              </div>
                              {selected && (
                                <div className="w-4 h-4 rounded bg-brand-600 flex items-center justify-center text-white text-[9px] flex-shrink-0">✓</div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              </SidebarField>

              {/* Labels */}
              <SidebarField label="Labels">
                <div className="relative">
                  <button
                    onClick={() => setShowLabelsMenu(v => !v)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] text-[12px] text-slate-400 hover:text-slate-300 transition-all"
                  >
                    <Tag size={11} className="text-slate-600 flex-shrink-0" />
                    {activeLabels.length > 0
                      ? <span>{activeLabels.length} label{activeLabels.length > 1 ? 's' : ''}</span>
                      : <span className="text-slate-700">None</span>
                    }
                    <ChevronDown size={10} className="ml-auto opacity-50 flex-shrink-0" />
                  </button>
                  {showLabelsMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowLabelsMenu(false)} />
                      <div className="absolute left-0 top-9 z-20 border border-white/[0.08] rounded-lg shadow-2xl min-w-[160px] py-1.5 animate-slide-up" style={{ background: '#111527' }}>
                        {LABEL_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => toggleLabel(opt.value)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-slate-400 hover:bg-white/[0.05] hover:text-white transition-colors"
                          >
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: opt.color }} />
                            <span className="flex-1 text-left">{opt.label}</span>
                            {labels.includes(opt.value) && (
                              <div className="w-4 h-4 rounded bg-brand-600 flex items-center justify-center text-white text-[9px]">✓</div>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {activeLabels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {activeLabels.map(label => (
                      <span
                        key={label.value}
                        onClick={() => toggleLabel(label.value)}
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm cursor-pointer hover:opacity-70 transition-opacity"
                        style={{ background: label.color + '18', color: label.color }}
                      >
                        {label.label} ×
                      </span>
                    ))}
                  </div>
                )}
              </SidebarField>

              {/* Start date */}
              <SidebarField label="Start date">
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] rounded-md px-2.5 py-1.5 text-[12px] text-slate-400 outline-none focus:ring-1 focus:ring-brand-500/40 focus:border-brand-500/40 transition-all"
                />
              </SidebarField>

              {/* Due date */}
              <SidebarField label="Due date">
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] rounded-md px-2.5 py-1.5 text-[12px] text-slate-400 outline-none focus:ring-1 focus:ring-brand-500/40 focus:border-brand-500/40 transition-all"
                />
              </SidebarField>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/[0.05] flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-[12px] text-slate-600 hover:text-slate-300 transition-colors"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-[12px] font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save size={12} />
            {isNew ? 'Create Issue' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SidebarField({ label, children }) {
  return (
    <div className="py-2.5 border-b border-white/[0.04] last:border-0">
      <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">{label}</p>
      {children}
    </div>
  )
}
