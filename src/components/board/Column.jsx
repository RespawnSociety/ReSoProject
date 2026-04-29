import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import TaskCard from './TaskCard'

export default function Column({ column, tasks, onAddTask, onCardClick, projectKey }) {
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  const handleAddSubmit = e => {
    e.preventDefault()
    if (!newTitle.trim()) return
    onAddTask({ title: newTitle.trim(), priority: 'medium', labels: [], dueDate: null, description: '' })
    setNewTitle('')
    setShowAdd(false)
  }

  const taskCount = tasks.length
  const isAtLimit = column.limit && taskCount >= column.limit

  return (
    <div className="flex flex-col w-[268px] flex-shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: column.color }} />
        <span className="text-[12px] font-semibold text-slate-300 flex-1 truncate tracking-wide uppercase">
          {column.title}
        </span>
        <span
          className={`text-[11px] font-bold min-w-[20px] text-center px-1.5 py-0.5 rounded ${
            isAtLimit
              ? 'bg-red-500/15 text-red-400'
              : 'text-slate-600'
          }`}
        >
          {taskCount}{column.limit ? `/${column.limit}` : ''}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2 flex-1 min-h-[80px] rounded-lg p-1.5 transition-all duration-200 ${
          isOver
            ? 'bg-brand-600/[0.08] ring-1 ring-inset ring-brand-500/30'
            : 'bg-white/[0.025]'
        }`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              projectKey={projectKey}
              onClick={() => onCardClick(task)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && !isOver && !showAdd && (
          <div className="flex items-center justify-center h-14 text-slate-800 text-[11px]">
            Drop here
          </div>
        )}

        {/* Inline add form */}
        {showAdd ? (
          <form
            onSubmit={handleAddSubmit}
            className="rounded-lg p-2.5 border border-brand-500/30 animate-slide-up"
            style={{ background: '#111527' }}
          >
            <textarea
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="What needs to be done?"
              rows={2}
              className="w-full bg-transparent text-[12px] text-slate-200 placeholder-slate-600 resize-none outline-none leading-snug"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddSubmit(e) }
                if (e.key === 'Escape') { setShowAdd(false); setNewTitle('') }
              }}
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                type="submit"
                className="px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white text-[11px] font-medium rounded-md transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => { setShowAdd(false); setNewTitle('') }}
                className="px-2 py-1 text-slate-600 hover:text-slate-400 text-[11px] transition-colors"
              >
                Cancel
              </button>
              <span className="ml-auto text-[10px] text-slate-700">↵ create</span>
            </div>
          </form>
        ) : (
          <button
            onClick={() => !isAtLimit && setShowAdd(true)}
            disabled={isAtLimit}
            className="flex items-center gap-1.5 text-[11px] text-slate-700 hover:text-slate-400 hover:bg-white/[0.03] px-2 py-1.5 rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
          >
            <Plus size={12} className="group-hover:text-brand-500 transition-colors" />
            {isAtLimit ? `Limit (${column.limit})` : 'Add issue'}
          </button>
        )}
      </div>
    </div>
  )
}
