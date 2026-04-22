import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY       = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL         = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const APP_URL = 'https://project.respawnsociety.web.id'
const FROM    = 'FlowBoard <onboarding@resend.dev>'

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const today    = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0]

  // Fetch tasks with upcoming deadlines that have assignees
  const { data: tasks, error: te } = await supabase
    .from('tasks')
    .select('id, title, due_date, priority, assignee_ids, project:projects(name, emoji)')
    .in('due_date', [today, tomorrow])

  if (te) return new Response(JSON.stringify({ error: te.message }), { status: 500 })

  const activeTasks = (tasks ?? []).filter(t => (t as any).assignee_ids?.length > 0)
  if (!activeTasks.length) {
    return new Response(JSON.stringify({ sent: 0, message: 'No upcoming deadlines' }), { status: 200 })
  }

  // Fetch admin profiles
  const { data: admins } = await supabase
    .from('profiles')
    .select('id, email, name')
    .eq('role', 'admin')

  const admin = admins?.[0] // primary admin

  // Build send queue: per task → 1 assignee (first) + admin (if different)
  // Multiple tasks are queued one by one
  const queue: Array<{ email: string; name: string; task: any }> = []

  for (const task of activeTasks) {
    const assigneeIds: string[] = (task as any).assignee_ids || []
    if (!assigneeIds.length) continue

    // Get first assignee's profile
    const { data: firstAssignee } = await supabase
      .from('profiles')
      .select('id, email, name')
      .eq('id', assigneeIds[0])
      .single()

    if (firstAssignee?.email) {
      queue.push({ email: firstAssignee.email, name: firstAssignee.name || 'Team', task })
    }

    // Admin gets notified too (if not the same person as assignee)
    if (admin?.email && admin.id !== assigneeIds[0]) {
      queue.push({ email: admin.email, name: admin.name || 'Admin', task })
    }
  }

  // Send one by one with 300ms gap
  let sent = 0
  const errors: string[] = []

  for (const item of queue) {
    const isToday = item.task.due_date === today
    const project = (item.task as any).project

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [item.email],
        subject: `${isToday ? '⏰' : '📅'} Deadline task: ${item.task.title}`,
        html: buildEmail(item.task, project, item.name, isToday),
      }),
    })

    if (res.ok) {
      sent++
    } else {
      errors.push(`${item.email}: ${await res.text()}`)
    }

    // Wait 300ms between each email
    await new Promise(r => setTimeout(r, 300))
  }

  return new Response(
    JSON.stringify({ sent, errors, queued: queue.length, tasks: activeTasks.length }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
})

const PRIORITY_COLOR: Record<string, string> = {
  urgent: '#EF4444', high: '#F97316', medium: '#F59E0B', low: '#22C55E',
}

function buildEmail(task: any, project: any, recipientName: string, isToday: boolean) {
  const pColor   = PRIORITY_COLOR[task.priority] ?? '#6B7280'
  const dueLabel = isToday ? '🔴 Deadline hari ini' : '🟡 Deadline besok'
  const dateStr  = formatDate(task.due_date)

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#0A0E1A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0E1A;padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#0F1629;border:1px solid #1E2540;border-radius:20px;overflow:hidden">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1f3a,#111827);padding:24px 28px;border-bottom:1px solid #1E2540">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td>
                <span style="background:linear-gradient(135deg,#4F46E5,#7C3AED);border-radius:8px;padding:6px 14px;font-size:14px;font-weight:800;color:#fff">⚡ FlowBoard</span>
              </td>
              <td align="right">
                <span style="background:${isToday ? '#EF444418' : '#F59E0B18'};color:${isToday ? '#EF4444' : '#F59E0B'};border:1px solid ${isToday ? '#EF444435' : '#F59E0B35'};border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700">${dueLabel}</span>
              </td>
            </tr></table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px">

            <p style="margin:0 0 6px;font-size:17px;font-weight:700;color:#F1F5F9">Hei, ${recipientName} 👋</p>
            <p style="margin:0 0 24px;font-size:14px;color:#94A3B8;line-height:1.6">
              Kamu punya task yang ${isToday ? '<strong style="color:#EF4444">deadline hari ini</strong>' : 'deadline <strong style="color:#F59E0B">besok</strong>'}.
            </p>

            <!-- Task card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#111827;border:1px solid #1E2540;border-radius:14px;overflow:hidden;margin-bottom:24px">
              <tr>
                <td style="padding:20px">
                  <p style="margin:0 0 6px;font-size:12px;color:#64748B;font-weight:600">
                    ${project?.emoji ?? '📁'} ${project?.name ?? 'Project'}
                  </p>
                  <p style="margin:0 0 14px;font-size:16px;font-weight:700;color:#F1F5F9;line-height:1.4">${task.title}</p>
                  <table cellpadding="0" cellspacing="0"><tr>
                    <td style="padding-right:12px">
                      <p style="margin:0 0 3px;font-size:10px;color:#475569;font-weight:600;text-transform:uppercase">Deadline</p>
                      <p style="margin:0;font-size:13px;font-weight:600;color:#F1F5F9">${dateStr}</p>
                    </td>
                    <td style="border-left:1px solid #1E2540;padding-left:12px">
                      <p style="margin:0 0 3px;font-size:10px;color:#475569;font-weight:600;text-transform:uppercase">Priority</p>
                      <p style="margin:0;font-size:13px;font-weight:600;color:${pColor}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</p>
                    </td>
                  </tr></table>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${APP_URL}" style="display:inline-block;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 32px;border-radius:10px">
                  Buka FlowBoard &rarr;
                </a>
              </td></tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:14px 28px;border-top:1px solid #1E2540;text-align:center">
            <p style="margin:0;font-size:11px;color:#334155">Email otomatis dari FlowBoard · setiap hari jam 08.00 WIB</p>
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
