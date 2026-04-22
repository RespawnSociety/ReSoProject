import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, MoreHorizontal } from 'lucide-react'
import TaskCard from './TaskCard'

export default function Column({ column, tasks, onAddTask, onCardClick }) {
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  const handleAddSubmit = (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    onAddTask({ title: newTitle.trim(), priority: 'medium', labels: [], dueDate: null, description: '' })
    setNewTitle('')
    setShowAdd(false)
  }

  const taskCount = tasks.length
  const isAtLimit = column.limit && taskCount >= column.limit

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: column.color }} />
        <span className="text-sm font-semibold text-slate-200 flex-1">{column.title}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          isAtLimit
            ? 'bg-red-500/20 text-red-400'
            : 'bg-surface-700 text-slate-400'
        }`}>
          {taskCount}{column.limit ? `/${column.limit}` : ''}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2.5 flex-1 min-h-[120px] rounded-2xl p-2 transition-all duration-200 ${
          isOver
            ? 'bg-brand-600/10 border border-dashed border-brand-500/50'
            : 'bg-surface-900/50'
        }`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onCardClick(task)}
            />
          ))}
        </SortableContext>

        {/* Empty state */}
        {tasks.length === 0 && !isOver && (
          <div className="flex items-center justify-center h-20 text-slate-600 text-xs text-center px-4">
            Drop tasks here
          </div>
        )}

        {/* Inline add form */}
        {showAdd ? (
          <form onSubmit={handleAddSubmit} className="bg-surface-800 border border-surface-700 rounded-xl p-3 animate-slide-up">
            <textarea
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Task title..."
              rows={2}
              className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-500 resize-none outline-none"
              autoFocus
              autoComplete="off"
              spellCheck={false}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddSubmit(e) }
                if (e.key === 'Escape') { setShowAdd(false); setNewTitle('') }
              }}
            />
            <div className="flex gap-2 mt-2">
              <button type="submit" className="btn-primary py-1 px-3 text-xs">Add</button>
              <button type="button" onClick={() => { setShowAdd(false); setNewTitle('') }} className="btn-ghost py-1 px-3 text-xs">Cancel</button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            disabled={isAtLimit}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 hover:bg-surface-800 px-3 py-2 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus size={13} />
            {isAtLimit ? `Limit reached (${column.limit})` : 'Add task'}
          </button>
        )}
      </div>
    </div>
  )
}
