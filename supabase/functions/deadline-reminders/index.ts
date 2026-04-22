import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY       = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL         = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const APP_URL = 'https://project.respawnsociety.web.id'
const FROM    = 'FlowBoard <noreply@reminder.respawnsociety.web.id>'

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const today    = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0]

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

  const results = await Promise.all(
    (members ?? [])
      .filter(m => m.email)
      .map(async member => {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: FROM,
            to: [member.email],
            subject: `⏰ ${tasks.length} task deadline dalam 2 hari — FlowBoard`,
            html: buildEmail(tasks, member.name, today),
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

const PRIORITY_LABEL: Record<string, string> = {
  urgent: 'Urgent', high: 'High', medium: 'Medium', low: 'Low',
}

function taskRow(t: any, isToday: boolean) {
  const pColor   = PRIORITY_COLOR[t.priority] ?? '#6B7280'
  const pLabel   = PRIORITY_LABEL[t.priority] ?? t.priority
  const project  = t.project as any
  const assignee = (t.assignee as any)?.name

  return `
  <tr>
    <td style="padding:14px 20px;border-bottom:1px solid #1E2540">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="vertical-align:top">
          <p style="margin:0 0 5px;font-size:14px;font-weight:600;color:#F1F5F9;line-height:1.4">${t.title}</p>
          <p style="margin:0;font-size:12px;color:#64748B">
            ${project?.emoji ?? '📁'}&nbsp;${project?.name ?? 'Unknown Project'}
            &nbsp;·&nbsp;
            ${assignee
              ? `<span style="color:#818CF8">${assignee}</span>`
              : `<span style="color:#475569">Unassigned</span>`}
          </p>
        </td>
        <td style="vertical-align:top;text-align:right;padding-left:12px;white-space:nowrap">
          <span style="display:inline-block;background:${pColor}18;color:${pColor};border:1px solid ${pColor}35;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700">${pLabel}</span>
          <br>
          <span style="display:inline-block;margin-top:5px;font-size:11px;font-weight:600;color:${isToday ? '#EF4444' : '#F59E0B'}">${isToday ? '🔴 Hari ini' : '🟡 Besok'}</span>
        </td>
      </tr></table>
    </td>
  </tr>`
}

function section(label: string, color: string, emoji: string, list: any[], isToday: boolean) {
  if (!list.length) return ''
  return `
  <tr><td style="padding:20px 28px 8px">
    <p style="margin:0;font-size:10px;font-weight:800;color:${color};text-transform:uppercase;letter-spacing:0.1em">${emoji} ${label} — ${list.length} task</p>
  </td></tr>
  <tr><td style="padding:0 28px 4px">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#111827;border:1px solid #1E2540;border-radius:12px;overflow:hidden">
      ${list.map(t => taskRow(t, isToday)).join('')}
    </table>
  </td></tr>`
}

function buildEmail(tasks: any[], recipientName: string, today: string) {
  const todayTasks    = tasks.filter(t => t.due_date === today)
  const tomorrowTasks = tasks.filter(t => t.due_date !== today)
  const dateStr       = formatDate(new Date().toISOString().split('T')[0])

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Deadline Reminder — FlowBoard</title>
</head>
<body style="margin:0;padding:0;background:#0A0E1A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0E1A;padding:40px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- Logo -->
        <tr>
          <td style="padding-bottom:24px" align="center">
            <a href="${APP_URL}" style="text-decoration:none">
              <span style="background:linear-gradient(135deg,#4F46E5,#7C3AED);border-radius:10px;padding:8px 18px;font-size:15px;font-weight:800;color:#fff;letter-spacing:0.02em">⚡ FlowBoard</span>
            </a>
          </td>
        </tr>

        <!-- Card -->
        <tr><td style="background:#0F1629;border:1px solid #1E2540;border-radius:20px;overflow:hidden">
          <table width="100%" cellpadding="0" cellspacing="0">

            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#1a1f3a,#111827);padding:28px;border-bottom:1px solid #1E2540">
                <table width="100%" cellpadding="0" cellspacing="0"><tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:22px;font-weight:800;color:#F1F5F9">Deadline Reminder 📋</p>
                    <p style="margin:0;font-size:13px;color:#64748B">${dateStr}</p>
                  </td>
                  <td align="right">
                    <span style="background:#EF444418;border:1px solid #EF444435;border-radius:20px;padding:6px 14px;font-size:12px;font-weight:700;color:#EF4444">${tasks.length} task menunggu</span>
                  </td>
                </tr></table>
              </td>
            </tr>

            <!-- Greeting -->
            <tr>
              <td style="padding:24px 28px 12px">
                <p style="margin:0 0 6px;font-size:17px;font-weight:700;color:#F1F5F9">Hei, ${recipientName} 👋</p>
                <p style="margin:0;font-size:14px;color:#94A3B8;line-height:1.6">
                  Ada <strong style="color:#F1F5F9">${tasks.length} task</strong> yang deadline dalam 2 hari ke depan. Jangan sampai kelewat!
                </p>
              </td>
            </tr>

            ${section('Deadline Hari Ini', '#EF4444', '🔴', todayTasks, true)}
            ${section('Deadline Besok', '#F59E0B', '🟡', tomorrowTasks, false)}

            <!-- CTA -->
            <tr>
              <td style="padding:20px 28px">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:#1a1f3a;border:1px solid #1E2540;border-radius:14px;padding:20px;text-align:center">
                      <p style="margin:0 0 14px;font-size:13px;color:#94A3B8">Buka board untuk lihat detail dan update status task</p>
                      <a href="${APP_URL}" style="display:inline-block;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 32px;border-radius:10px">
                        Buka FlowBoard &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:16px 28px 24px;border-top:1px solid #1E2540;text-align:center">
                <p style="margin:0 0 4px;font-size:11px;color:#334155">Email ini dikirim otomatis setiap hari jam 08.00 WIB oleh FlowBoard</p>
                <a href="${APP_URL}" style="font-size:11px;color:#4F46E5;text-decoration:none">project.respawnsociety.web.id</a>
              </td>
            </tr>

          </table>
        </td></tr>

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
