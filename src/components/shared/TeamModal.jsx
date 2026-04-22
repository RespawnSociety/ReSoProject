import { useState, useRef, useEffect } from 'react'
import { X, Check, ChevronDown, UserX } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ROLE_OPTIONS } from '../../data/mockData'
import MemberAvatar from './MemberAvatar'

const SUPER_ADMIN_EMAIL = 'adrielanderson.s@gmail.com'

function RoleBadge({ role }) {
  const opt = ROLE_OPTIONS.find(r => r.value === role) || ROLE_OPTIONS[ROLE_OPTIONS.length - 1]
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: opt.color + '20', color: opt.color }}
    >
      {opt.label}
    </span>
  )
}

function RoleDropdown({ currentRole, onChange, disabled }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = ROLE_OPTIONS.find(r => r.value === currentRole) || ROLE_OPTIONS[ROLE_OPTIONS.length - 1]

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (disabled) return <RoleBadge role={currentRole} />

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border bg-surface-800 border-surface-700 hover:border-surface-600 text-slate-300 cursor-pointer transition-all"
      >
        <span style={{ color: current.color }}>{current.label}</span>
        <ChevronDown size={11} />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-[100] bg-surface-800 border border-surface-700 rounded-xl shadow-card min-w-[140px] py-1 animate-slide-up">
          {ROLE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-surface-700 transition-colors"
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: opt.color }} />
              <span className={currentRole === opt.value ? 'text-white font-medium' : 'text-slate-300'}>
                {opt.label}
              </span>
              {currentRole === opt.value && <Check size={12} className="ml-auto text-brand-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export { RoleBadge }

export default function TeamModal({ onClose }) {
  const { user, teamMembers, updateMemberRole, updateProfile, kickMember } = useApp()

  // Only the super admin email can manage roles
  const canManageRoles = user?.email === SUPER_ADMIN_EMAIL
  const isAdmin        = user?.role === 'admin'

  const [kickingId, setKickingId]     = useState(null)
  const [editName, setEditName]       = useState(user?.name || '')
  const [editingName, setEditingName] = useState(false)

  const handleSaveName = () => {
    if (editName.trim() && editName.trim() !== user?.name) updateProfile({ name: editName.trim() })
    setEditingName(false)
  }

  const handleKick = async (member) => {
    if (!confirm(`Kick ${member.name}? Mereka tidak akan bisa login lagi.`)) return
    setKickingId(member.id)
    try {
      await kickMember(member.id)
    } catch (err) {
      alert(err.message || 'Gagal kick member')
    } finally {
      setKickingId(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      onWheel={e => e.stopPropagation()}
    >
      <div className="absolute inset-0 bg-black/70 glass" />
      <div
        className="relative bg-surface-900 border border-surface-700 rounded-2xl shadow-card w-full max-w-lg max-h-[85vh] flex flex-col animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-surface-800 rounded-t-2xl">
          <div>
            <h2 className="text-base font-bold text-white">Team Members</h2>
            <p className="text-xs text-slate-500 mt-0.5">{teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={17} /></button>
        </div>

        {/* My profile */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-surface-800">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">My Profile</p>
          <div className="flex items-center gap-3">
            <MemberAvatar member={user} size="lg" />
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false) }}
                    autoFocus
                    className="input-field py-1 text-sm flex-1"
                  />
                  <button onClick={handleSaveName} className="btn-primary py-1 px-2.5 text-xs">Save</button>
                </div>
              ) : (
                <button onClick={() => setEditingName(true)} className="text-sm font-semibold text-white hover:text-brand-300 transition-colors text-left">
                  {user?.name}
                </button>
              )}
              <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <RoleDropdown
                currentRole={user?.role || 'member'}
                onChange={role => updateMemberRole(user.id, role)}
                disabled={!canManageRoles}
              />
            </div>
          </div>
        </div>

        {/* Team list — scrollable */}
        <div
          className="flex-1 overflow-y-auto px-6 py-4"
          onWheel={e => e.stopPropagation()}
        >
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">All Members</p>
          <div className="space-y-1 pb-2">
            {teamMembers.map(member => (
              <div key={member.id} className="flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-surface-800 transition-colors">
                <MemberAvatar member={member} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {member.name}
                    {member.id === user?.id && <span className="text-slate-500 text-xs ml-1.5">(you)</span>}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{member.email}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <RoleDropdown
                    currentRole={member.role || 'member'}
                    onChange={role => updateMemberRole(member.id, role)}
                    disabled={!canManageRoles || member.id === user?.id}
                  />
                  {canManageRoles && member.id !== user?.id && member.role !== 'admin' && (
                    <button
                      onClick={() => handleKick(member)}
                      disabled={kickingId === member.id}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                      title="Kick member"
                    >
                      <UserX size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {!canManageRoles && (
          <div className="flex-shrink-0 px-6 pb-4 rounded-b-2xl">
            <p className="text-xs text-slate-600 text-center">Only admin can change roles</p>
          </div>
        )}
      </div>
    </div>
  )
}
