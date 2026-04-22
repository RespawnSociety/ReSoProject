import { useState } from 'react'
import { X, Check, ChevronDown } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ROLE_OPTIONS } from '../../data/mockData'
import MemberAvatar from './MemberAvatar'

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
  const current = ROLE_OPTIONS.find(r => r.value === currentRole) || ROLE_OPTIONS[ROLE_OPTIONS.length - 1]

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setOpen(v => !v)}
        disabled={disabled}
        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all ${
          disabled
            ? 'bg-surface-800 border-surface-700 text-slate-500 cursor-default'
            : 'bg-surface-800 border-surface-700 hover:border-surface-600 text-slate-300 cursor-pointer'
        }`}
      >
        <span style={{ color: current.color }}>{current.label}</span>
        {!disabled && <ChevronDown size={11} />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 bg-surface-800 border border-surface-700 rounded-xl shadow-card min-w-[140px] py-1 animate-slide-up">
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
        </>
      )}
    </div>
  )
}

export { RoleBadge }

export default function TeamModal({ onClose }) {
  const { user, teamMembers, updateMemberRole, updateProfile } = useApp()
  const isAdmin     = user?.role === 'admin'
  const adminCount  = teamMembers.filter(m => m.role === 'admin').length
  const isOnlyAdmin = isAdmin && adminCount <= 1

  const [editName, setEditName] = useState(user?.name || '')
  const [editingName, setEditingName] = useState(false)

  const handleSaveName = () => {
    if (editName.trim() && editName.trim() !== user?.name) {
      updateProfile({ name: editName.trim() })
    }
    setEditingName(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 glass" />
      <div
        className="relative bg-surface-900 border border-surface-700 rounded-2xl shadow-card w-full max-w-lg animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800">
          <div>
            <h2 className="text-base font-bold text-white">Team Members</h2>
            <p className="text-xs text-slate-500 mt-0.5">{teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={17} /></button>
        </div>

        {/* My profile */}
        <div className="px-6 py-4 border-b border-surface-800">
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
                <button
                  onClick={() => setEditingName(true)}
                  className="text-sm font-semibold text-white hover:text-brand-300 transition-colors text-left"
                >
                  {user?.name}
                </button>
              )}
              <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <RoleDropdown
                currentRole={user?.role || 'member'}
                onChange={role => updateMemberRole(user.id, role)}
                disabled={isOnlyAdmin}
              />
              {isOnlyAdmin && (
                <span className="text-[10px] text-slate-600">satu-satunya admin</span>
              )}
            </div>
          </div>
        </div>

        {/* Team list */}
        <div className="px-6 py-4 max-h-80 overflow-y-auto">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">All Members</p>
          <div className="space-y-1">
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
                <RoleDropdown
                  currentRole={member.role || 'member'}
                  onChange={role => updateMemberRole(member.id, role)}
                  disabled={!isAdmin || (member.id === user?.id && isOnlyAdmin)}
                />
              </div>
            ))}
          </div>
        </div>

        {!isAdmin && (
          <div className="px-6 pb-4">
            <p className="text-xs text-slate-600 text-center">Only admins can change other members' roles</p>
          </div>
        )}
      </div>
    </div>
  )
}
