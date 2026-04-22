import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY      = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL        = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const today    = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0]

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select(`
      id, title, description, due_date, priority,
      project:projects(name, emoji),
      assignee:profiles(name, email)
    `)
    .in('due_date', [today, tomorrow])
    .not('assignee_id', 'is', null)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  let sent = 0
  const errors: string[] = []

  for (const task of tasks ?? []) {
    const email = (task.assignee as any)?.email
    if (!email) continue

    const isToday  = task.due_date === today
    const dueLabel = isToday ? '🔴 Hari ini' : '🟡 Besok'
    const project  = task.project as any

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'FlowBoard <onboarding@resend.dev>',
        to: [email],
        subject: `${isToday ? '⏰' : '📅'} Deadline task: ${task.title}`,
        html: buildEmail(task, project, dueLabel, isToday),
      }),
    })

    if (res.ok) {
      sent++
    } else {
      const body = await res.text()
      errors.push(`${email}: ${body}`)
    }
  }

  return new Response(JSON.stringify({ sent, errors, total: tasks?.length ?? 0 }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})

function buildEmail(task: any, project: any, dueLabel: string, isToday: boolean) {
  const priorityColor: Record<string, string> = {
    urgent: '#EF4444',
    high:   '#F97316',
    medium: '#F59E0B',
    low:    '#22C55E',
  }
  const pColor = priorityColor[task.priority] ?? '#6B7280'

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#090C19;font-family:Inter,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#090C19;padding:32px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0F1225;border:1px solid #222849;border-radius:16px;overflow:hidden">

        <!-- Header -->
        <tr>
          <td style="background:#171C36;padding:24px 32px;border-bottom:1px solid #222849">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="display:inline-flex;align-items:center;gap:8px">
                    <span style="background:#4F46E5;border-radius:8px;padding:6px 10px;font-size:14px;font-weight:700;color:#fff">
                      FlowBoard
                    </span>
                  </span>
                </td>
                <td align="right">
                  <span style="background:${isToday ? '#EF444420' : '#F59E0B20'};color:${isToday ? '#EF4444' : '#F59E0B'};border:1px solid ${isToday ? '#EF444440' : '#F59E0B40'};border-radius:20px;padding:4px 12px;font-size:12px;font-weight:600">
                    ${dueLabel}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px">

            <p style="margin:0 0 8px;font-size:13px;color:#59638A;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">
              ${project?.emoji ?? ''} ${project?.name ?? 'Project'}
            </p>

            <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#F1F5F9;line-height:1.3">
              ${task.title}
            </h2>

            ${task.description ? `
            <p style="margin:0 0 24px;font-size:14px;color:#94A3B8;line-height:1.6">
              ${task.description}
            </p>` : ''}

            <!-- Info row -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#171C36;border:1px solid #222849;border-radius:12px;padding:16px;margin-bottom:28px">
              <tr>
                <td style="padding:0 16px 0 0">
                  <p style="margin:0 0 4px;font-size:11px;color:#59638A;font-weight:600;text-transform:uppercase">Deadline</p>
                  <p style="margin:0;font-size:14px;color:#F1F5F9;font-weight:600">${formatDate(task.due_date)}</p>
                </td>
                <td style="border-left:1px solid #222849;padding:0 0 0 16px">
                  <p style="margin:0 0 4px;font-size:11px;color:#59638A;font-weight:600;text-transform:uppercase">Priority</p>
                  <p style="margin:0;font-size:14px;font-weight:600;color:${pColor}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</p>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:13px;color:#59638A;text-align:center">
              Email ini dikirim otomatis oleh FlowBoard
            </p>

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
