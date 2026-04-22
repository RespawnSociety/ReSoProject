import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY       = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL         = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const today    = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0]

  // Ambil semua task yang deadline hari ini / besok
  const [{ data: tasks, error: te }, { data: members, error: me }] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, title, due_date, priority, project:projects(name, emoji), assignee:profiles(name)')
      .in('due_date', [today, tomorrow]),
    supabase
      .from('profiles')
      .select('email, name')
      .not('email', 'is', null),
  ])

  if (te || me) {
    return new Response(JSON.stringify({ error: (te || me)?.message }), { status: 500 })
  }

  if (!tasks?.length) {
    return new Response(JSON.stringify({ sent: 0, message: 'No upcoming deadlines' }), { status: 200 })
  }

  // Kirim summary email ke semua member sekaligus
  const results = await Promise.all(
    (members ?? [])
      .filter(m => m.email)
      .map(async member => {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'FlowBoard <onboarding@resend.dev>',
            to: [member.email],
            subject: `⏰ ${tasks.length} task deadline dalam 2 hari ke depan`,
            html: buildSummaryEmail(tasks, member.name, today),
          }),
        })
        if (res.ok) return { ok: true }
        return { ok: false, err: `${member.email}: ${await res.text()}` }
      })
  )

  const sent   = results.filter(r => r.ok).length
  const errors = results.filter(r => !r.ok).map(r => (r as any).err)

  return new Response(JSON.stringify({ sent, errors, tasks: tasks.length }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})

const PRIORITY_COLOR: Record<string, string> = {
  urgent: '#EF4444', high: '#F97316', medium: '#F59E0B', low: '#22C55E',
}

function buildSummaryEmail(tasks: any[], recipientName: string, today: string) {
  const todayTasks    = tasks.filter(t => t.due_date === today)
  const tomorrowTasks = tasks.filter(t => t.due_date !== today)

  const renderTasks = (list: any[], isToday: boolean) => list.map(t => {
    const pColor   = PRIORITY_COLOR[t.priority] ?? '#6B7280'
    const project  = t.project as any
    const assignee = (t.assignee as any)?.name

    return `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #1E2540">
        <div style="display:flex;align-items:flex-start;gap:12px">
          <div style="flex:1">
            <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#F1F5F9">${t.title}</p>
            <p style="margin:0;font-size:12px;color:#59638A">
              ${project?.emoji ?? ''} ${project?.name ?? ''}
              ${assignee ? `· <span style="color:#818CF8">${assignee}</span>` : '· <span style="color:#475569">Unassigned</span>'}
            </p>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0">
            <span style="background:${pColor}20;color:${pColor};border:1px solid ${pColor}40;border-radius:12px;padding:2px 8px;font-size:11px;font-weight:600">
              ${t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
            </span>
            <span style="background:${isToday ? '#EF444420' : '#F59E0B20'};color:${isToday ? '#EF4444' : '#F59E0B'};font-size:11px;font-weight:600;border-radius:12px;padding:2px 8px">
              ${isToday ? '🔴 Hari ini' : '🟡 Besok'}
            </span>
          </div>
        </div>
      </td>
    </tr>`
  }).join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#090C19;font-family:Inter,system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#090C19;padding:32px 16px">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#0F1225;border:1px solid #222849;border-radius:16px;overflow:hidden">

        <!-- Header -->
        <tr>
          <td style="background:#171C36;padding:24px 32px;border-bottom:1px solid #222849">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td>
                <span style="background:#4F46E5;border-radius:8px;padding:6px 12px;font-size:14px;font-weight:700;color:#fff">FlowBoard</span>
              </td>
              <td align="right">
                <span style="font-size:12px;color:#59638A">${formatDate(new Date().toISOString().split('T')[0])}</span>
              </td>
            </tr></table>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:28px 32px 16px">
            <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#F1F5F9">
              Hei ${recipientName} 👋
            </h2>
            <p style="margin:0;font-size:14px;color:#94A3B8;line-height:1.6">
              Ada <strong style="color:#F1F5F9">${tasks.length} task</strong> yang deadline dalam 2 hari ke depan di workspace kamu.
            </p>
          </td>
        </tr>

        <!-- Today tasks -->
        ${todayTasks.length ? `
        <tr><td style="padding:0 32px 8px">
          <p style="margin:0;font-size:11px;font-weight:700;color:#EF4444;text-transform:uppercase;letter-spacing:0.08em">🔴 Deadline Hari Ini — ${todayTasks.length} task</p>
        </td></tr>
        <tr><td style="padding:0 32px 20px">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#171C36;border:1px solid #222849;border-radius:12px;overflow:hidden">
            ${renderTasks(todayTasks, true)}
          </table>
        </td></tr>` : ''}

        <!-- Tomorrow tasks -->
        ${tomorrowTasks.length ? `
        <tr><td style="padding:0 32px 8px">
          <p style="margin:0;font-size:11px;font-weight:700;color:#F59E0B;text-transform:uppercase;letter-spacing:0.08em">🟡 Deadline Besok — ${tomorrowTasks.length} task</p>
        </td></tr>
        <tr><td style="padding:0 32px 20px">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#171C36;border:1px solid #222849;border-radius:12px;overflow:hidden">
            ${renderTasks(tomorrowTasks, false)}
          </table>
        </td></tr>` : ''}

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #222849;text-align:center">
            <p style="margin:0;font-size:12px;color:#3B4574">Email ini dikirim otomatis setiap hari jam 08.00 oleh FlowBoard</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}
