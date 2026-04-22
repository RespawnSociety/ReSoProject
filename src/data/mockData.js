export const ROLE_OPTIONS = [
  { value: 'admin',     label: 'Admin',     color: '#6366F1' },
  { value: 'pm',        label: 'PM',        color: '#8B5CF6' },
  { value: 'developer', label: 'Developer', color: '#3B82F6' },
  { value: 'designer',  label: 'Designer',  color: '#EC4899' },
  { value: 'qa',        label: 'QA',        color: '#10B981' },
  { value: 'devops',    label: 'DevOps',    color: '#F97316' },
  { value: 'member',    label: 'Member',    color: '#6B7280' },
]

export const MOCK_USER = {
  id: 'user-1',
  name: 'Adriel Dev',
  email: 'developer.ai05@sungaibudi.com',
  avatar: null,
  initials: 'AD',
  role: 'admin',
}

export const MOCK_TEAM_MEMBERS = []

export const COLUMN_CONFIGS = [
  { id: 'backlog',     title: 'Backlog',      color: '#6B7280', limit: null },
  { id: 'todo',        title: 'To Do',        color: '#3B82F6', limit: null },
  { id: 'inprogress',  title: 'In Progress',  color: '#F59E0B', limit: 3    },
  { id: 'review',      title: 'In Review',    color: '#8B5CF6', limit: null },
  { id: 'done',        title: 'Done',         color: '#22C55E', limit: null },
]

export const PRIORITY_OPTIONS = [
  { value: 'urgent', label: 'Urgent',  color: '#EF4444' },
  { value: 'high',   label: 'High',    color: '#F97316' },
  { value: 'medium', label: 'Medium',  color: '#F59E0B' },
  { value: 'low',    label: 'Low',     color: '#22C55E' },
]

export const LABEL_OPTIONS = [
  { value: 'frontend',  label: 'Frontend',  color: '#60A5FA' },
  { value: 'backend',   label: 'Backend',   color: '#34D399' },
  { value: 'design',    label: 'Design',    color: '#F472B6' },
  { value: 'bug',       label: 'Bug',       color: '#F87171' },
  { value: 'feature',   label: 'Feature',   color: '#A78BFA' },
  { value: 'docs',      label: 'Docs',      color: '#94A3B8' },
  { value: 'devops',    label: 'DevOps',    color: '#FB923C' },
  { value: 'testing',   label: 'Testing',   color: '#4ADE80' },
]

let idCounter = 100

export function generateId(prefix = 'task') {
  return `${prefix}-${++idCounter}`
}

export const INITIAL_PROJECTS = [
  {
    id: 'proj-1',
    name: 'FlowBoard App',
    key: 'FLW',
    description: 'Main application development — frontend & backend',
    color: '#6366F1',
    emoji: '🚀',
    createdAt: '2026-03-10',
    columns: ['backlog', 'todo', 'inprogress', 'review', 'done'],
    tasks: {
      backlog: [
        {
          id: 'task-1',
          title: 'Setup authentication with Supabase',
          description: 'Integrate Supabase Auth with email/password and GitHub OAuth. Handle session persistence and redirect flows.',
          priority: 'high',
          labels: ['backend', 'feature'],
          assigneeId: 'user-2',
          startDate: '2026-04-15',
          dueDate: '2026-04-30',
          createdAt: '2026-03-15',
        },
        {
          id: 'task-2',
          title: 'Design system & component library',
          description: 'Create reusable components: Button, Input, Modal, Badge, Avatar, Dropdown.',
          priority: 'medium',
          labels: ['frontend', 'design'],
          assigneeId: 'user-3',
          startDate: null,
          dueDate: null,
          createdAt: '2026-03-16',
        },
        {
          id: 'task-3',
          title: 'Write API documentation',
          description: 'Document all REST endpoints and Supabase table schemas.',
          priority: 'low',
          labels: ['docs'],
          assigneeId: null,
          startDate: '2026-04-20',
          dueDate: '2026-05-10',
          createdAt: '2026-03-20',
        },
      ],
      todo: [
        {
          id: 'task-4',
          title: 'Implement drag & drop reordering',
          description: 'Use @dnd-kit to enable smooth card reordering within columns and across columns.',
          priority: 'high',
          labels: ['frontend', 'feature'],
          assigneeId: 'user-1',
          startDate: '2026-04-18',
          dueDate: '2026-04-25',
          createdAt: '2026-03-22',
        },
        {
          id: 'task-5',
          title: 'Supabase realtime sync',
          description: 'Subscribe to Supabase Realtime channels so board updates reflect instantly across sessions.',
          priority: 'medium',
          labels: ['backend', 'feature'],
          assigneeId: 'user-2',
          startDate: null,
          dueDate: '2026-05-01',
          createdAt: '2026-03-23',
        },
      ],
      inprogress: [
        {
          id: 'task-6',
          title: 'Kanban board UI',
          description: 'Build the main board view with columns and task cards, filter bar, and header actions.',
          priority: 'urgent',
          labels: ['frontend', 'feature'],
          assigneeId: 'user-1',
          startDate: '2026-04-10',
          dueDate: '2026-04-22',
          createdAt: '2026-03-25',
        },
        {
          id: 'task-7',
          title: 'Login & onboarding flow',
          description: 'Create animated login page, project creation wizard, and empty state screens.',
          priority: 'high',
          labels: ['frontend', 'design'],
          assigneeId: 'user-3',
          startDate: '2026-04-14',
          dueDate: '2026-04-21',
          createdAt: '2026-03-26',
        },
      ],
      review: [
        {
          id: 'task-8',
          title: 'Project dashboard page',
          description: 'Overview of all projects with metrics, last activity, and quick-access shortcuts.',
          priority: 'medium',
          labels: ['frontend'],
          assigneeId: 'user-4',
          startDate: '2026-04-12',
          dueDate: '2026-04-20',
          createdAt: '2026-03-28',
        },
      ],
      done: [
        {
          id: 'task-9',
          title: 'Initialize Vite + React + Tailwind',
          description: 'Bootstrap the project with Vite, React 18, Tailwind CSS v3, and ESLint.',
          priority: 'low',
          labels: ['devops'],
          assigneeId: 'user-1',
          startDate: '2026-03-10',
          dueDate: null,
          createdAt: '2026-03-10',
        },
        {
          id: 'task-10',
          title: 'Define color palette & typography',
          description: 'Establish design tokens: colors, font sizes, spacing, border radius.',
          priority: 'medium',
          labels: ['design'],
          assigneeId: 'user-3',
          startDate: '2026-03-12',
          dueDate: null,
          createdAt: '2026-03-12',
        },
      ],
    },
  },
  {
    id: 'proj-2',
    name: 'API Service',
    key: 'API',
    description: 'REST API layer & Supabase database schema',
    color: '#10B981',
    emoji: '⚡',
    createdAt: '2026-03-18',
    columns: ['backlog', 'todo', 'inprogress', 'review', 'done'],
    tasks: {
      backlog: [
        {
          id: 'task-11',
          title: 'Rate limiting middleware',
          description: 'Implement per-user rate limiting to prevent abuse.',
          priority: 'medium',
          labels: ['backend', 'devops'],
          dueDate: '2026-05-15',
          createdAt: '2026-03-20',
        },
      ],
      todo: [
        {
          id: 'task-12',
          title: 'Database schema migrations',
          description: 'Create Supabase migrations for projects, tasks, columns, and users tables.',
          priority: 'high',
          labels: ['backend'],
          dueDate: '2026-04-28',
          createdAt: '2026-03-22',
        },
        {
          id: 'task-13',
          title: 'Row Level Security policies',
          description: 'Set up RLS so users can only access their own project data.',
          priority: 'urgent',
          labels: ['backend', 'feature'],
          dueDate: '2026-04-25',
          createdAt: '2026-03-23',
        },
      ],
      inprogress: [
        {
          id: 'task-14',
          title: 'CRUD endpoints for tasks',
          description: 'Build create, read, update, delete endpoints for task management.',
          priority: 'high',
          labels: ['backend'],
          dueDate: '2026-04-22',
          createdAt: '2026-03-25',
        },
      ],
      review: [],
      done: [
        {
          id: 'task-15',
          title: 'Supabase project setup',
          description: 'Create Supabase project, configure environment variables, test connection.',
          priority: 'low',
          labels: ['devops'],
          dueDate: null,
          createdAt: '2026-03-18',
        },
      ],
    },
  },
  {
    id: 'proj-3',
    name: 'Mobile App',
    key: 'MOB',
    description: 'React Native companion app for iOS & Android',
    color: '#F59E0B',
    emoji: '📱',
    createdAt: '2026-04-01',
    columns: ['backlog', 'todo', 'inprogress', 'review', 'done'],
    tasks: {
      backlog: [
        {
          id: 'task-16',
          title: 'Push notifications',
          description: 'Integrate Expo Notifications for task deadline reminders.',
          priority: 'medium',
          labels: ['feature'],
          dueDate: '2026-06-01',
          createdAt: '2026-04-05',
        },
        {
          id: 'task-17',
          title: 'Offline mode',
          description: 'Cache board data locally and sync when connection restores.',
          priority: 'high',
          labels: ['feature', 'backend'],
          dueDate: '2026-06-15',
          createdAt: '2026-04-06',
        },
      ],
      todo: [
        {
          id: 'task-18',
          title: 'Board view for mobile',
          description: 'Horizontal scroll kanban layout optimized for small screens.',
          priority: 'high',
          labels: ['frontend', 'design'],
          dueDate: '2026-05-10',
          createdAt: '2026-04-08',
        },
      ],
      inprogress: [],
      review: [],
      done: [],
    },
  },
]
