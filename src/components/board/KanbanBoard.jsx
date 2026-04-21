import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import Column from './Column'
import TaskModal from './TaskModal'
import { TaskCardOverlay } from './TaskCard'
import { COLUMN_CONFIGS } from '../../data/mockData'
import { useApp } from '../../context/AppContext'

export default function KanbanBoard({ project, filterPriority, filterLabel, searchQuery }) {
  const { createTask, updateTask, deleteTask, moveTask, reorderTask } = useApp()
  const [activeTask, setActiveTask] = useState(null)
  const [activeColumnId, setActiveColumnId] = useState(null)
  const [modalTask, setModalTask] = useState(null)
  const [modalColumnId, setModalColumnId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const getColumnForTask = (taskId) => {
    for (const colId of project.columns) {
      if (project.tasks[colId]?.find(t => t.id === taskId)) return colId
    }
    return null
  }

  const filterTasks = (tasks) => {
    return tasks.filter(task => {
      if (filterPriority && task.priority !== filterPriority) return false
      if (filterLabel && !(task.labels || []).includes(filterLabel)) return false
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }

  const handleDragStart = ({ active }) => {
    const colId = getColumnForTask(active.id)
    const task = project.tasks[colId]?.find(t => t.id === active.id)
    setActiveTask(task || null)
    setActiveColumnId(colId)
  }

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null)
    setActiveColumnId(null)
    if (!over) return

    const fromCol = getColumnForTask(active.id)
    if (!fromCol) return

    // Dropped over another task
    const toCol = getColumnForTask(over.id) || over.id

    if (fromCol === toCol) {
      const tasks = project.tasks[fromCol]
      const oldIdx = tasks.findIndex(t => t.id === active.id)
      const newIdx = tasks.findIndex(t => t.id === over.id)
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        reorderTask(project.id, fromCol, oldIdx, newIdx)
      }
    } else {
      // Moving to a different column
      const toTasks = project.tasks[toCol] || []
      const overIndex = toTasks.findIndex(t => t.id === over.id)
      const insertAt = overIndex >= 0 ? overIndex : toTasks.length
      moveTask(project.id, fromCol, toCol, active.id, insertAt)
    }
  }

  const handleAddTask = (columnId, taskData) => {
    createTask(project.id, columnId, taskData)
  }

  const handleCardClick = (task, columnId) => {
    setModalTask(task)
    setModalColumnId(columnId)
  }

  const handleModalSave = (updates) => {
    if (modalTask?.id) {
      updateTask(project.id, modalColumnId, modalTask.id, updates)
    } else {
      createTask(project.id, modalColumnId, updates)
    }
    setModalTask(null)
    setModalColumnId(null)
  }

  const handleModalDelete = () => {
    if (modalTask?.id) {
      deleteTask(project.id, modalColumnId, modalTask.id)
    }
    setModalTask(null)
    setModalColumnId(null)
  }

  const handleModalMove = (toColumnId) => {
    if (modalTask?.id && modalColumnId !== toColumnId) {
      const toTasks = project.tasks[toColumnId] || []
      moveTask(project.id, modalColumnId, toColumnId, modalTask.id, toTasks.length)
      setModalColumnId(toColumnId)
    }
  }

  const columns = COLUMN_CONFIGS.filter(c => project.columns.includes(c.id))

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-5 p-6 overflow-x-auto flex-1 items-start">
          {columns.map(col => (
            <Column
              key={col.id}
              column={col}
              tasks={filterTasks(project.tasks[col.id] || [])}
              onAddTask={(taskData) => handleAddTask(col.id, taskData)}
              onCardClick={(task) => handleCardClick(task, col.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      {(modalTask !== null || modalColumnId !== null) && (
        <TaskModal
          task={modalTask}
          columnId={modalColumnId}
          projectKey={project.key}
          onClose={() => { setModalTask(null); setModalColumnId(null) }}
          onSave={handleModalSave}
          onDelete={handleModalDelete}
          onMove={handleModalMove}
        />
      )}
    </>
  )
}
