import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar } from 'lucide-react'
import { LABEL_OPTIONS } from '../../data/mockData'
import { useApp } from '../../context/AppContext'
import MemberAvatar from '../shared/MemberAvatar'

const PRIORITY_BORDER = {
  urgent: 'border-l-red-500',
  high:   'border-l-orange-500',
  medium: 'border-l-yellow-400',
  low:    'border-l-green-500',
}

const PRIORITY_DOT = {
  urgent: 'bg-red-500',
  high:   'bg-orange-500',
  medium: 'bg-yellow-500',
  low:    'bg-green-500',
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((d - now) / (1000 * 60 * 60 * 24))
  if (diff < 0)  return { label: 'Overdue', overdue: true }
  if (diff === 0) return { label: 'Today', urgent: true }
  if (diff === 1) return { label: 'Tomorrow', urgent: true }
  return { label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), overdue: false }
}

function shortDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function TaskCard({ task, onClick }) {
  const { teamMembers } = useApp()
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: task.id, data: { task } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const labels = (task.labels || []).map(l => LABEL_OPTIONS.find(o => o.value === l)).filter(Boolean)
  const dueInfo = formatDate(task.dueDate)
  const assignees = (task.assigneeIds || []).map(id => teamMembers.find(m => m.id === id)).filter(Boolean)
  const hasDateRange = task.startDate && task.dueDate

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`group bg-surface-800 border border-surface-700 hover:border-surface-600 rounded-xl p-3.5 cursor-pointer transition-all duration-150 hover:shadow-card border-l-[3px] ${
        PRIORITY_BORDER[task.priority] || 'border-l-transparent'
      } ${isDragging ? 'shadow-card-hover rotate-1 scale-[1.02]' : ''}`}
    >
      {/* Labels */}
      {labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {labels.map(label => (
            <span
              key={label.value}
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ background: label.color + '20', color: label.color }}
            >
              {label.label}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <p className="text-sm font-medium text-slate-200 group-hover:text-white leading-snug mb-3 line-clamp-2">
        {task.title}
      </p>

      {/* Date range bar */}
      {hasDateRange && (
        <div className="flex items-center gap-1.5 mb-2.5 text-[10px] text-slate-500">
          <Calendar size={10} className="flex-shrink-0" />
          <span>{shortDate(task.startDate)}</span>
          <span className="text-slate-600">→</span>
          <span className={task.dueDate && new Date(task.dueDate) < new Date() ? 'text-red-400 font-medium' : ''}>
            {shortDate(task.dueDate)}
          </span>
        </div>
      )}

      {/* Footer: priority · due date · assignee */}
      <div className="flex items-center gap-2">
        {/* Priority dot */}
        {task.priority && (
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority]}`} />
            <span className="text-[10px] text-slate-500 capitalize">{task.priority}</span>
          </div>
        )}

        {/* Due date (only when no date range shown) */}
        {!hasDateRange && dueInfo && (
          <div className={`flex items-center gap-1 ${
            dueInfo.overdue ? 'text-red-400' : dueInfo.urgent ? 'text-amber-400' : 'text-slate-500'
          }`}>
            <Calendar size={10} />
            <span className="text-[10px] font-medium">{dueInfo.label}</span>
          </div>
        )}

        {/* Assignee avatars pushed to right */}
        {assignees.length > 0 && (
          <div className="ml-auto flex -space-x-1.5">
            {assignees.slice(0, 3).map(m => <MemberAvatar key={m.id} member={m} size="sm" />)}
            {assignees.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-surface-700 border border-surface-600 flex items-center justify-center text-[9px] text-slate-400">
                +{assignees.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function TaskCardOverlay({ task }) {
  const labels = (task.labels || []).map(l => LABEL_OPTIONS.find(o => o.value === l)).filter(Boolean)

  return (
    <div className={`bg-surface-800 border-2 border-brand-500 rounded-xl p-3.5 shadow-glow rotate-2 scale-105 border-l-[3px] ${
      PRIORITY_BORDER[task.priority] || 'border-l-brand-500'
    }`}>
      {labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {labels.slice(0, 2).map(label => (
            <span key={label.value} className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: label.color + '20', color: label.color }}>
              {label.label}
            </span>
          ))}
        </div>
      )}
      <p className="text-sm font-medium text-white leading-snug line-clamp-2">{task.title}</p>
    </div>
  )
}
