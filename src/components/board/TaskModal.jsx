import { useState } from 'react'
import {
  X, Trash2, Calendar, Tag, AlignLeft,
  ChevronDown, Save, UserCircle,
} from 'lucide-react'
import { LABEL_OPTIONS, PRIORITY_OPTIONS, COLUMN_CONFIGS } from '../../data/mockData'
import { useApp } from '../../context/AppContext'
import MemberAvatar from '../shared/MemberAvatar'
import { RoleBadge } from '../shared/TeamModal'

const PRIORITY_STYLES = {
  urgent: { dot: 'bg-red-500',    text: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30' },
  high:   { dot: 'bg-orange-500', text: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
  medium: { dot: 'bg-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  low:    { dot: 'bg-green-500',  text: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/30' },
}

export default function TaskModal({ task, columnId, projectKey, onClose, onSave, onDelete, onMove }) {
  const { teamMembers } = useApp()

  const [title, setTitle]               = useState(task?.title || '')
  const [description, setDescription]   = useState(task?.description || '')
  const [priority, setPriority]         = useState(task?.priority || 'medium')
  const [labels, setLabels]             = useState(task?.labels || [])
  const [assigneeId, setAssigneeId]     = useState(task?.assigneeId || null)
  const [startDate, setStartDate]       = useState(task?.startDate || '')
  const [dueDate, setDueDate]           = useState(task?.dueDate || '')
  const [currentColumn, setCurrentColumn] = useState(columnId)

  const [showPriorityMenu, setShowPriorityMenu]   = useState(false)
  const [showLabelsMenu, setShowLabelsMenu]         = useState(false)
  const [showMoveMenu, setShowMoveMenu]             = useState(false)
  const [showAssigneeMenu, setShowAssigneeMenu]     = useState(false)

  const isNew = !task?.id
  const taskKey = task?.id ? `${projectKey}-${task.id.split('-')[1]}` : 'New'
  const assignedMember = assigneeId ? teamMembers.find(m => m.id === assigneeId) : null

  const handleSave = () => {
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      description,
      priority,
      labels,
      assigneeId: assigneeId || null,
      startDate: startDate || null,
      dueDate: dueDate || null,
    })
    onClose()
  }

  const handleDelete = () => {
    if (confirm('Delete this task?')) {
      onDelete()
      onClose()
    }
  }

  const toggleLabel = (value) => {
    setLabels(prev => prev.includes(value) ? prev.filter(l => l !== value) : [...prev, value])
  }

  const activeLabels = labels.map(l => LABEL_OPTIONS.find(o => o.value === l)).filter(Boolean)
  const ps = PRIORITY_STYLES[priority]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 glass" />
      <div
        className="relative bg-surface-900 border border-surface-700 rounded-2xl shadow-card w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono bg-surface-800 px-2 py-1 rounded-lg">
              {taskKey}
            </span>
            {/* Column badge / move */}
            <div className="relative">
              <button
                onClick={() => setShowMoveMenu(v => !v)}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-300 transition-colors"
              >
                <div className="w-2 h-2 rounded-full" style={{ background: COLUMN_CONFIGS.find(c => c.id === currentColumn)?.color }} />
                {COLUMN_CONFIGS.find(c => c.id === currentColumn)?.title}
                <ChevronDown size={12} />
              </button>
              {showMoveMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMoveMenu(false)} />
                  <div className="absolute left-0 top-9 z-20 bg-surface-800 border border-surface-700 rounded-xl shadow-card min-w-[160px] py-1 animate-slide-up">
                    {COLUMN_CONFIGS.map(col => (
                      <button
                        key={col.id}
                        onClick={() => { if (col.id !== currentColumn) onMove(col.id); setCurrentColumn(col.id); setShowMoveMenu(false) }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                          col.id === currentColumn ? 'text-white bg-surface-700' : 'text-slate-400 hover:bg-surface-700 hover:text-white'
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
          <div className="flex items-center gap-1">
            {!isNew && (
              <button onClick={handleDelete} className="btn-ghost p-1.5 hover:text-red-400 hover:bg-red-500/10">
                <Trash2 size={15} />
              </button>
            )}
            <button onClick={onClose} className="btn-ghost p-1.5">
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title */}
          <textarea
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Task title..."
            rows={2}
            className="w-full bg-transparent text-lg font-semibold text-white placeholder-slate-500 resize-none outline-none leading-snug"
            autoFocus={isNew}
          />

          {/* Meta row */}
          <div className="flex flex-wrap gap-2">

            {/* Priority */}
            <div className="relative">
              <button
                onClick={() => setShowPriorityMenu(v => !v)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${ps.bg} ${ps.text}`}
              >
                <div className={`w-2 h-2 rounded-full ${ps.dot}`} />
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
                <ChevronDown size={12} />
              </button>
              {showPriorityMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowPriorityMenu(false)} />
                  <div className="absolute left-0 top-10 z-20 bg-surface-800 border border-surface-700 rounded-xl shadow-card min-w-[140px] py-1 animate-slide-up">
                    {PRIORITY_OPTIONS.map(opt => {
                      const s = PRIORITY_STYLES[opt.value]
                      return (
                        <button key={opt.value} onClick={() => { setPriority(opt.value); setShowPriorityMenu(false) }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-surface-700 ${priority === opt.value ? 'text-white' : 'text-slate-400'}`}
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

            {/* Assignee */}
            <div className="relative">
              <button
                onClick={() => setShowAssigneeMenu(v => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-800 border border-surface-700 text-xs text-slate-300 hover:border-surface-600 transition-colors"
              >
                {assignedMember ? (
                  <>
                    <MemberAvatar member={assignedMember} size="xs" />
                    <span className="max-w-[80px] truncate">{assignedMember.name.split(' ')[0]}</span>
                  </>
                ) : (
                  <>
                    <UserCircle size={13} className="text-slate-500" />
                    <span className="text-slate-500">Assignee</span>
                  </>
                )}
                <ChevronDown size={12} />
              </button>
              {showAssigneeMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowAssigneeMenu(false)} />
                  <div className="absolute left-0 top-10 z-20 bg-surface-800 border border-surface-700 rounded-xl shadow-card min-w-[180px] py-1.5 animate-slide-up">
                    <button
                      onClick={() => { setAssigneeId(null); setShowAssigneeMenu(false) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-400 hover:bg-surface-700 hover:text-white transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full border border-dashed border-slate-600 flex items-center justify-center flex-shrink-0">
                        <UserCircle size={12} className="text-slate-500" />
                      </div>
                      Unassigned
                    </button>
                    <div className="mx-3 my-1 border-t border-surface-700" />
                    {teamMembers.length === 0 ? (
                      <p className="px-3 py-2 text-xs text-slate-500">No team members yet</p>
                    ) : teamMembers.map(member => (
                      <button
                        key={member.id}
                        onClick={() => { setAssigneeId(member.id); setShowAssigneeMenu(false) }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-surface-700 ${
                          assigneeId === member.id ? 'text-white bg-surface-700/50' : 'text-slate-300'
                        }`}
                      >
                        <MemberAvatar member={member} size="sm" />
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-medium truncate">{member.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {member.role && <RoleBadge role={member.role} />}
                            <p className="text-[10px] text-slate-500 truncate">{member.email}</p>
                          </div>
                        </div>
                        {assigneeId === member.id && (
                          <div className="w-4 h-4 rounded bg-brand-600 flex items-center justify-center text-white text-[10px] flex-shrink-0">✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Labels */}
            <div className="relative">
              <button
                onClick={() => setShowLabelsMenu(v => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-800 border border-surface-700 text-xs text-slate-300 hover:border-surface-600 transition-colors"
              >
                <Tag size={12} className="text-slate-400" />
                {activeLabels.length > 0 ? `${activeLabels.length} label${activeLabels.length > 1 ? 's' : ''}` : 'Labels'}
                <ChevronDown size={12} />
              </button>
              {showLabelsMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowLabelsMenu(false)} />
                  <div className="absolute left-0 top-10 z-20 bg-surface-800 border border-surface-700 rounded-xl shadow-card min-w-[160px] py-2 animate-slide-up">
                    {LABEL_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => toggleLabel(opt.value)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:bg-surface-700 hover:text-white transition-colors"
                      >
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: opt.color }} />
                        <span className="flex-1 text-left">{opt.label}</span>
                        {labels.includes(opt.value) && (
                          <div className="w-4 h-4 rounded bg-brand-600 flex items-center justify-center text-white text-[10px]">✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Active labels */}
          {activeLabels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {activeLabels.map(label => (
                <span key={label.value} onClick={() => toggleLabel(label.value)}
                  className="text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer"
                  style={{ background: label.color + '20', color: label.color }}
                >
                  {label.label} ×
                </span>
              ))}
            </div>
          )}

          {/* Dates */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-slate-500" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Dates</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Start date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Due date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlignLeft size={14} className="text-slate-500" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Description</span>
            </div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add a more detailed description..."
              rows={5}
              className="w-full bg-surface-800 border border-surface-700 rounded-xl p-3.5 text-sm text-slate-300 placeholder-slate-600 resize-none outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
            />
          </div>

          {task?.createdAt && (
            <p className="text-xs text-slate-600">
              Created {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-surface-800">
          {/* Assigned member preview */}
          <div className="flex items-center gap-2">
            {assignedMember ? (
              <>
                <MemberAvatar member={assignedMember} size="md" />
                <div>
                  <p className="text-xs font-medium text-slate-300">{assignedMember.name}</p>
                  <p className="text-[10px] text-slate-500">Assignee</p>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-600">No assignee</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onClose} className="btn-ghost border border-surface-600">
              Discard
            </button>
            <button onClick={handleSave} disabled={!title.trim()} className="btn-primary disabled:opacity-40">
              <Save size={15} />
              {isNew ? 'Create Task' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
