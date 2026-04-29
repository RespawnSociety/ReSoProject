import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, ArrowUp, ArrowDown, Minus, Flame } from 'lucide-react'
import { LABEL_OPTIONS } from '../../data/mockData'
import { useApp } from '../../context/AppContext'
import MemberAvatar from '../shared/MemberAvatar'

const PRIORITY_CONFIG = {
  urgent: { Icon: Flame,     color: '#EF4444', label: 'Urgent'  },
  high:   { Icon: ArrowUp,   color: '#F97316', label: 'High'    },
  medium: { Icon: Minus,     color: '#EAB308', label: 'Medium'  },
  low:    { Icon: ArrowDown, color: '#22C55E', label: 'Low'     },
}

const PRIORITY_BORDER = {
  urgent: 'border-l-red-500',
  high:   'border-l-orange-500',
  medium: 'border-l-yellow-400',
  low:    'border-l-green-500',
}

function formatDue(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const diff = Math.floor((d - new Date()) / 86400000)
  if (diff < 0)  return { label: 'Overdue',   cls: 'text-red-400 bg-red-500/10 border border-red-500/20' }
  if (diff === 0) return { label: 'Today',    cls: 'text-amber-400 bg-amber-500/10 border border-amber-500/20' }
  if (diff === 1) return { label: 'Tomorrow', cls: 'text-amber-400 bg-amber-500/10 border border-amber-500/20' }
  return {
    label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    cls: 'text-slate-600',
  }
}

export default function TaskCard({ task, onClick, projectKey }) {
  const { teamMembers } = useApp()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, data: { task } })

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.35 : 1 }

  const labels = (task.labels || []).map(l => LABEL_OPTIONS.find(o => o.value === l)).filter(Boolean)
  const dueInfo = formatDue(task.dueDate)
  const assignees = (task.assigneeIds || []).map(id => teamMembers.find(m => m.id === id)).filter(Boolean)
  const pc = PRIORITY_CONFIG[task.priority]
  const taskKey = projectKey ? `${projectKey}-${task.id.slice(-4).toUpperCase()}` : null

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, background: '#111527' }}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`group border border-white/[0.07] hover:border-white/[0.14] rounded-lg p-3 cursor-pointer transition-all duration-150 border-l-2 ${
        PRIORITY_BORDER[task.priority] || 'border-l-transparent'
      } ${isDragging ? 'shadow-2xl rotate-1 scale-[1.02]' : 'hover:shadow-md hover:-translate-y-px'}`}
    >
      {/* Labels */}
      {labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {labels.map(label => (
            <span
              key={label.value}
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm"
              style={{ background: label.color + '18', color: label.color }}
            >
              {label.label}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <p className="text-[13px] font-medium text-slate-300 group-hover:text-white leading-snug mb-3 line-clamp-2">
        {task.title}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-2">
        {/* Priority icon */}
        {pc && (
          <pc.Icon size={12} style={{ color: pc.color }} className="flex-shrink-0" title={pc.label} />
        )}

        {/* Due date */}
        {dueInfo && (
          <span className={`flex items-center gap-1 text-[10px] font-medium px-1 py-0.5 rounded ${dueInfo.cls}`}>
            <Calendar size={9} />
            {dueInfo.label}
          </span>
        )}

        {/* Assignees */}
        {assignees.length > 0 && (
          <div className="ml-auto flex -space-x-1.5">
            {assignees.slice(0, 3).map(m => <MemberAvatar key={m.id} member={m} size="sm" />)}
            {assignees.length > 3 && (
              <div className="w-5 h-5 rounded-full bg-surface-700 border border-surface-600 flex items-center justify-center text-[8px] text-slate-400">
                +{assignees.length - 3}
              </div>
            )}
          </div>
        )}

        {/* Task key */}
        {taskKey && (
          <span className={`text-[9px] font-mono text-slate-700 group-hover:text-slate-500 transition-colors ${assignees.length > 0 ? 'ml-1.5' : 'ml-auto'}`}>
            {taskKey}
          </span>
        )}
      </div>
    </div>
  )
}

export function TaskCardOverlay({ task }) {
  const labels = (task.labels || []).map(l => LABEL_OPTIONS.find(o => o.value === l)).filter(Boolean)
  const BORDER = { urgent: 'border-l-red-500', high: 'border-l-orange-500', medium: 'border-l-yellow-400', low: 'border-l-green-500' }
  return (
    <div
      className={`border-2 border-brand-500 rounded-lg p-3 shadow-2xl rotate-2 scale-105 border-l-2 ${BORDER[task.priority] || ''}`}
      style={{ background: '#111527' }}
    >
      {labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {labels.slice(0, 2).map(label => (
            <span key={label.value} className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm" style={{ background: label.color + '18', color: label.color }}>
              {label.label}
            </span>
          ))}
        </div>
      )}
      <p className="text-[13px] font-medium text-white leading-snug line-clamp-2">{task.title}</p>
    </div>
  )
}
