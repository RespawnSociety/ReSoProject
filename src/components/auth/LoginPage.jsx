import { useState } from 'react'
import { Github, Eye, EyeOff, Layers, ArrowRight, Zap, Shield, Users, CheckCircle2, AlertCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const FEATURES = [
  { icon: Layers,  text: 'Organize projects with visual kanban boards' },
  { icon: Zap,     text: 'Drag & drop tasks across columns instantly' },
  { icon: Shield,  text: 'Secure with Supabase Auth & row-level security' },
  { icon: Users,   text: 'Track everything from idea to deployment' },
]

export default function LoginPage() {
  const { login, loginWithGitHub, signup, isLoading, authError, isSupabaseConfigured } = useApp()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [localError, setLocalError] = useState('')
  const [confirmationSent, setConfirmationSent] = useState(false)

  const error = localError || authError

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    if (!email || !password) { setLocalError('Please fill in all fields.'); return }
    if (mode === 'signup' && !fullName.trim()) { setLocalError('Please enter your name.'); return }
    if (password.length < 6) { setLocalError('Password must be at least 6 characters.'); return }

    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        const result = await signup(email, password, fullName)
        if (result?.needsConfirmation) {
          setConfirmationSent(true)
        }
      }
    } catch {
      // error is handled in context
    }
  }

  if (confirmationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4">
        <div className="text-center max-w-sm animate-slide-up">
          <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={32} className="text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-slate-400 text-sm mb-6">
            We sent a confirmation link to <span className="text-white font-medium">{email}</span>.
            Click it to activate your account.
          </p>
          <button onClick={() => setConfirmationSent(false)} className="btn-ghost border border-surface-600">
            ← Back to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[52%] relative bg-gradient-to-br from-surface-900 via-brand-900/30 to-surface-950 p-12 flex-col justify-between overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-600/15 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-purple-600/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-3/4 left-1/3 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '4s' }} />

        {/* Grid dots */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(circle, #6366F1 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-glow">
            <Layers size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">FlowBoard</span>
        </div>

        {/* Hero */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Ship projects{' '}
              <span className="text-gradient">faster</span>
              <br />than ever before.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              A beautiful kanban workspace built for developers who care about clarity and speed.
            </p>
          </div>

          <div className="space-y-3.5">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-600/15 border border-brand-500/25 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-brand-400" />
                </div>
                <span className="text-slate-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini board preview */}
        <div className="relative z-10 animate-float">
          <div className="bg-surface-800/50 glass border border-surface-700/40 rounded-2xl p-4 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-brand-600/30 rounded flex items-center justify-center">
                <Layers size={11} className="text-brand-400" />
              </div>
              <span className="text-xs font-medium text-slate-300">FlowBoard App</span>
              <div className="ml-auto flex gap-1">
                {['#EF4444', '#F59E0B', '#22C55E'].map(c => (
                  <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />
                ))}
              </div>
            </div>
            <div className="flex gap-2.5">
              {[
                { label: 'To Do',       color: '#3B82F6', cards: [70, 90] },
                { label: 'In Progress', color: '#F59E0B', cards: [85, 60] },
                { label: 'Done',        color: '#22C55E', cards: [75, 95, 55] },
              ].map(col => (
                <div key={col.label} className="flex-1">
                  <div className="flex items-center gap-1 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: col.color }} />
                    <span className="text-[10px] text-slate-400">{col.label}</span>
                  </div>
                  <div className="space-y-1">
                    {col.cards.map((w, i) => (
                      <div key={i} className="h-6 bg-surface-700/70 rounded" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-950">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-glow-sm">
              <Layers size={17} className="text-white" />
            </div>
            <span className="text-lg font-bold">FlowBoard</span>
          </div>

          {/* Dev mode badge */}
          {!isSupabaseConfigured && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 rounded-lg px-3 py-2 mb-5">
              <AlertCircle size={13} className="text-amber-400 flex-shrink-0" />
              <span className="text-xs text-amber-300">
                Dev mode — Supabase not connected. Any credentials work.
              </span>
            </div>
          )}

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-white mb-1">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-slate-400 text-sm">
              {mode === 'login' ? 'Sign in to your workspace' : 'Start organizing your projects for free'}
            </p>
          </div>

          {/* GitHub OAuth */}
          <button
            onClick={loginWithGitHub}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-surface-800 hover:bg-surface-700 border border-surface-600 hover:border-surface-500 rounded-xl text-sm font-medium text-slate-200 transition-all duration-200 mb-5 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Github size={17} />
            Continue with GitHub
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-surface-800" />
            <span className="text-xs text-slate-600 font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-surface-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Full name</label>
                <input
                  type="text"
                  placeholder="Adriel Dev"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="input-field"
                  autoFocus
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                autoComplete="email"
                autoFocus={mode === 'login'}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Password</label>
                {mode === 'login' && (
                  <button type="button" className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-medium">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pr-10"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/25 rounded-xl px-3 py-2.5">
                <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary justify-center py-2.5 mt-1 disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {mode === 'login' ? 'Sign in' : 'Create account'}
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setLocalError('') }}
              className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>

          <p className="text-center text-xs text-slate-700 mt-8">
            By continuing you agree to our{' '}
            <span className="text-slate-600 hover:text-slate-400 cursor-pointer transition-colors">Terms</span>
            {' & '}
            <span className="text-slate-600 hover:text-slate-400 cursor-pointer transition-colors">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  )
}
