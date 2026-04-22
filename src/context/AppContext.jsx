import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { INITIAL_PROJECTS, MOCK_USER, MOCK_TEAM_MEMBERS, generateId } from '../data/mockData'

const AppContext = createContext(null)

// ── HELPERS ───────────────────────────────────────────────────────────────────

function dbTaskToApp(t) {
  return {
    id: t.id,
    title: t.title,
    description: t.description || '',
    priority: t.priority || 'medium',
    labels: t.labels || [],
    assigneeId: t.assignee_id || null,
    startDate: t.start_date || null,
    dueDate: t.due_date || null,
    createdAt: (t.created_at || new Date().toISOString()).split('T')[0],
  }
}

function groupByColumn(columns, tasks) {
  return Object.fromEntries(
    columns.map(colId => [
      colId,
      tasks
        .filter(t => t.column_id === colId)
        .sort((a, b) => a.position - b.position)
        .map(dbTaskToApp),
    ])
  )
}

function mapSupabaseUser(sbUser) {
  const name =
    sbUser.user_metadata?.full_name ||
    sbUser.user_metadata?.name ||
    sbUser.email?.split('@')[0] ||
    'User'
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  return {
    id: sbUser.id,
    name,
    email: sbUser.email,
    avatar: sbUser.user_metadata?.avatar_url || null,
    initials,
  }
}

// ── PROVIDER ──────────────────────────────────────────────────────────────────

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [projects, setProjects] = useState(isSupabaseConfigured ? [] : INITIAL_PROJECTS)
  const [teamMembers, setTeamMembers] = useState(isSupabaseConfigured ? [] : MOCK_TEAM_MEMBERS)
  const [currentProjectId, setCurrentProjectId] = useState(null)
  const [view, setView] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [onlineUsers, setOnlineUsers] = useState([])
  const reloadTimer = useRef(null)
  const ownWrites = useRef(new Set())
  const presenceRef = useRef(null)

  const currentProject = projects.find(p => p.id === currentProjectId) || null

  // ── DATA LOADING ─────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    if (!isSupabaseConfigured) return

    const [
      { data: pRows, error: pe },
      { data: tRows, error: te },
      { data: mRows, error: me },
    ] = await Promise.all([
      supabase.from('projects').select('*').order('created_at'),
      supabase.from('tasks').select('*').order('position'),
      supabase.from('profiles').select('id, name, email, avatar_url, role').order('name'),
    ])

    if (pe || te || me) { console.error('loadData:', pe || te || me); return }

    const members = (mRows || []).map(m => ({
      id: m.id,
      name: m.name || m.email?.split('@')[0] || 'User',
      email: m.email || '',
      avatar: m.avatar_url || null,
      role: m.role || 'member',
    }))
    setTeamMembers(members)
    setUser(prev => {
      if (!prev) return prev
      const mine = members.find(m => m.id === prev.id)
      return mine ? { ...prev, role: mine.role } : prev
    })

    setProjects((pRows || []).map(row => ({
      id: row.id,
      name: row.name,
      key: row.key,
      description: row.description || '',
      color: row.color || '#6366F1',
      emoji: row.emoji || '🚀',
      createdAt: row.created_at.split('T')[0],
      columns: row.columns || ['backlog', 'todo', 'inprogress', 'review', 'done'],
      tasks: groupByColumn(
        row.columns || ['backlog', 'todo', 'inprogress', 'review', 'done'],
        (tRows || []).filter(t => t.project_id === row.id)
      ),
    })))
  }, [])

  const scheduleReload = useCallback((payload) => {
    const id = payload?.new?.id || payload?.old?.id
    if (id && ownWrites.current.has(id)) {
      ownWrites.current.delete(id)
      return
    }
    if (reloadTimer.current) clearTimeout(reloadTimer.current)
    reloadTimer.current = setTimeout(loadData, 400)
  }, [loadData])

  // ── AUTH INIT ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isSupabaseConfigured) return

    const fetchAndSetUser = async (sbUser) => {
      const base = mapSupabaseUser(sbUser)
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', sbUser.id).single()
      setUser({ ...base, role: profile?.role || 'member' })
      loadData()
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchAndSetUser(session.user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchAndSetUser(session.user)
      } else {
        setUser(null)
        setProjects([])
        setTeamMembers([])
        setCurrentProjectId(null)
        setView('dashboard')
      }
    })

    return () => subscription.unsubscribe()
  }, [loadData])

  // ── REALTIME ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isSupabaseConfigured || !user) return

    const channel = supabase
      .channel('flowboard-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, scheduleReload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, scheduleReload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, scheduleReload)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      if (reloadTimer.current) clearTimeout(reloadTimer.current)
    }
  }, [user, scheduleReload])

  // ── PRESENCE ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isSupabaseConfigured || !user) { setOnlineUsers([]); return }

    const ch = supabase.channel('flowboard-presence')
    ch.on('presence', { event: 'sync' }, () => {
      setOnlineUsers(Object.values(ch.presenceState()).flat())
    })
    .subscribe(async (status) => {
      if (status !== 'SUBSCRIBED') return
      await ch.track({ userId: user.id, name: user.name, initials: user.initials, avatar: user.avatar || null, projectId: currentProjectId, view })
    })

    presenceRef.current = ch
    return () => { supabase.removeChannel(ch); presenceRef.current = null; setOnlineUsers([]) }
  }, [user, isSupabaseConfigured])

  useEffect(() => {
    if (!presenceRef.current || !user) return
    presenceRef.current.track({ userId: user.id, name: user.name, initials: user.initials, avatar: user.avatar || null, projectId: currentProjectId, view })
  }, [view, currentProjectId])

  // ── AUTH ACTIONS ──────────────────────────────────────────────────────────

  const login = useCallback(async (email, password) => {
    setIsLoading(true)
    setAuthError('')
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setUser(mapSupabaseUser(data.user))
      } else {
        await new Promise(r => setTimeout(r, 1000))
        setUser(MOCK_USER)
      }
      setView('dashboard')
    } catch (err) {
      const msg = err?.message || 'Login failed. Check your credentials.'
      setAuthError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loginWithGitHub = useCallback(async () => {
    setIsLoading(true)
    setAuthError('')
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: { redirectTo: window.location.origin },
        })
        if (error) throw error
      } else {
        await new Promise(r => setTimeout(r, 1200))
        setUser({ ...MOCK_USER, name: 'Adriel (GitHub)' })
        setView('dashboard')
      }
    } catch (err) {
      setAuthError(err?.message || 'GitHub login failed.')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signup = useCallback(async (email, password, fullName) => {
    setIsLoading(true)
    setAuthError('')
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        })
        if (error) throw error
        if (data.user && !data.session) return { needsConfirmation: true }
        if (data.user) setUser(mapSupabaseUser(data.user))
      } else {
        await new Promise(r => setTimeout(r, 1000))
        setUser({ ...MOCK_USER, name: fullName || 'New User', email })
        setView('dashboard')
      }
      return { needsConfirmation: false }
    } catch (err) {
      setAuthError(err?.message || 'Signup failed.')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut()
    setUser(null)
    setCurrentProjectId(null)
    setView('dashboard')
    setAuthError('')
    if (!isSupabaseConfigured) {
      setProjects(INITIAL_PROJECTS)
      setTeamMembers(MOCK_TEAM_MEMBERS)
    }
  }, [])

  // ── NAVIGATION ────────────────────────────────────────────────────────────

  const openProject = useCallback((projectId) => {
    setCurrentProjectId(projectId)
    setView('board')
  }, [])

  const goToDashboard = useCallback(() => {
    setCurrentProjectId(null)
    setView('dashboard')
  }, [])

  // ── PROJECTS ──────────────────────────────────────────────────────────────

  const createProject = useCallback(async ({ name, description, color, emoji }) => {
    const key = name.slice(0, 3).toUpperCase()
    const id = generateId('proj')
    const defaultColumns = ['backlog', 'todo', 'inprogress', 'review', 'done']
    const newProject = {
      id, name, key, description, color, emoji,
      createdAt: new Date().toISOString().split('T')[0],
      columns: defaultColumns,
      tasks: Object.fromEntries(defaultColumns.map(c => [c, []])),
    }

    setProjects(prev => [...prev, newProject])

    if (isSupabaseConfigured) {
      ownWrites.current.add(id)
      const { error } = await supabase.from('projects').insert({
        id, name, key, description, color, emoji, columns: defaultColumns,
      })
      if (error) {
        console.error('createProject:', error)
        setProjects(prev => prev.filter(p => p.id !== id))
        throw error
      }
    }

    return newProject
  }, [])

  const deleteProject = useCallback(async (projectId) => {
    setProjects(prev => prev.filter(p => p.id !== projectId))
    if (currentProjectId === projectId) {
      setCurrentProjectId(null)
      setView('dashboard')
    }
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('projects').delete().eq('id', projectId)
      if (error) console.error('deleteProject:', error)
    }
  }, [currentProjectId])

  // ── TASKS ─────────────────────────────────────────────────────────────────

  const createTask = useCallback(async (projectId, columnId, taskData) => {
    const id = generateId('task')
    const task = { id, createdAt: new Date().toISOString().split('T')[0], ...taskData }

    let newColTasks
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p
      newColTasks = [task, ...(p.tasks[columnId] || [])]
      return { ...p, tasks: { ...p.tasks, [columnId]: newColTasks } }
    }))

    if (isSupabaseConfigured) {
      ownWrites.current.add(id)
      const { error } = await supabase.from('tasks').insert({
        id,
        project_id: projectId,
        column_id: columnId,
        title: taskData.title,
        description: taskData.description || '',
        priority: taskData.priority || 'medium',
        labels: taskData.labels || [],
        assignee_id: taskData.assigneeId || null,
        start_date: taskData.startDate || null,
        due_date: taskData.dueDate || null,
        position: 0,
      })
      if (error) {
        console.error('createTask:', error)
        setProjects(prev => prev.map(p => {
          if (p.id !== projectId) return p
          return { ...p, tasks: { ...p.tasks, [columnId]: p.tasks[columnId].filter(t => t.id !== id) } }
        }))
        throw error
      }
      if (newColTasks) {
        newColTasks.forEach((t, i) => {
          ownWrites.current.add(t.id)
          supabase.from('tasks').update({ position: i }).eq('id', t.id)
        })
      }
    }

    return task
  }, [])

  const updateTask = useCallback(async (projectId, columnId, taskId, updates) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p
      return {
        ...p,
        tasks: {
          ...p.tasks,
          [columnId]: p.tasks[columnId].map(t => t.id === taskId ? { ...t, ...updates } : t),
        },
      }
    }))

    if (isSupabaseConfigured) {
      ownWrites.current.add(taskId)
      const { error } = await supabase.from('tasks').update({
        title: updates.title,
        description: updates.description,
        priority: updates.priority,
        labels: updates.labels,
        assignee_id: updates.assigneeId || null,
        start_date: updates.startDate || null,
        due_date: updates.dueDate || null,
      }).eq('id', taskId)
      if (error) console.error('updateTask:', error)
    }
  }, [])

  const deleteTask = useCallback(async (projectId, columnId, taskId) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p
      return { ...p, tasks: { ...p.tasks, [columnId]: p.tasks[columnId].filter(t => t.id !== taskId) } }
    }))
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId)
      if (error) console.error('deleteTask:', error)
    }
  }, [])

  const moveTask = useCallback(async (projectId, fromColumnId, toColumnId, taskId, toIndex) => {
    let newFrom, newTo
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p
      const task = p.tasks[fromColumnId]?.find(t => t.id === taskId)
      if (!task) return p
      newFrom = p.tasks[fromColumnId].filter(t => t.id !== taskId)
      newTo = [...(p.tasks[toColumnId] || [])]
      newTo.splice(toIndex, 0, task)
      return { ...p, tasks: { ...p.tasks, [fromColumnId]: newFrom, [toColumnId]: newTo } }
    }))

    if (isSupabaseConfigured) {
      ownWrites.current.add(taskId)
      await supabase.from('tasks').update({ column_id: toColumnId }).eq('id', taskId)
      newFrom?.forEach((t, i) => { ownWrites.current.add(t.id); supabase.from('tasks').update({ position: i }).eq('id', t.id) })
      newTo?.forEach((t, i) => { ownWrites.current.add(t.id); supabase.from('tasks').update({ position: i }).eq('id', t.id) })
    }
  }, [])

  const updateMemberRole = useCallback(async (memberId, role) => {
    setTeamMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m))
    if (memberId === user?.id) setUser(prev => prev ? { ...prev, role } : prev)
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('profiles').update({ role }).eq('id', memberId)
      if (error) console.error('updateMemberRole:', error)
    }
  }, [user, isSupabaseConfigured])

  const updateProfile = useCallback(async ({ name }) => {
    setUser(prev => prev ? { ...prev, name } : prev)
    setTeamMembers(prev => prev.map(m => m.id === user?.id ? { ...m, name } : m))
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('profiles').update({ name }).eq('id', user?.id)
      if (error) console.error('updateProfile:', error)
    }
  }, [user, isSupabaseConfigured])

  const kickMember = useCallback(async (memberId) => {
    if (!isSupabaseConfigured) return
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kick-member`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ userId: memberId }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(err)
    }
    setTeamMembers(prev => prev.filter(m => m.id !== memberId))
  }, [isSupabaseConfigured])

  const reorderTask = useCallback(async (projectId, columnId, fromIndex, toIndex) => {
    let newTasks
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p
      newTasks = [...p.tasks[columnId]]
      const [moved] = newTasks.splice(fromIndex, 1)
      newTasks.splice(toIndex, 0, moved)
      return { ...p, tasks: { ...p.tasks, [columnId]: newTasks } }
    }))

    if (isSupabaseConfigured && newTasks) {
      newTasks.forEach((t, i) => {
        ownWrites.current.add(t.id)
        supabase.from('tasks').update({ position: i }).eq('id', t.id)
      })
    }
  }, [])

  return (
    <AppContext.Provider value={{
      user, isLoading, authError,
      isSupabaseConfigured,
      projects, currentProject,
      teamMembers,
      onlineUsers,
      view,
      login, loginWithGitHub, signup, logout,
      updateProfile, updateMemberRole, kickMember,
      openProject, goToDashboard,
      createProject, deleteProject,
      createTask, updateTask, deleteTask,
      moveTask, reorderTask,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
