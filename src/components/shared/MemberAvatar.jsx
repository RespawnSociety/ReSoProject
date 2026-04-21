const COLORS = ['#6366F1','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6','#F97316']

function colorFor(name = '') {
  let h = 0
  for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h)
  return COLORS[Math.abs(h) % COLORS.length]
}

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

const SIZE = {
  xs: 'w-5 h-5 text-[8px]',
  sm: 'w-6 h-6 text-[9px]',
  md: 'w-7 h-7 text-[10px]',
  lg: 'w-8 h-8 text-xs',
}

export default function MemberAvatar({ member, size = 'md', className = '' }) {
  if (!member) return null
  const sz = SIZE[size] || SIZE.md
  if (member.avatar) {
    return (
      <img
        src={member.avatar}
        alt={member.name}
        title={member.name}
        className={`${sz} rounded-full object-cover ring-1 ring-white/10 flex-shrink-0 ${className}`}
      />
    )
  }
  return (
    <div
      title={member.name}
      className={`${sz} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ring-1 ring-white/10 ${className}`}
      style={{ background: colorFor(member.name) }}
    >
      {initials(member.name)}
    </div>
  )
}
