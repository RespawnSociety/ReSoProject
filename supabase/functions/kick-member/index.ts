import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL         = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SUPABASE_ANON_KEY    = Deno.env.get('SUPABASE_ANON_KEY')!

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return new Response('Unauthorized', { status: 401, headers: cors })

  // Verify requester via their JWT
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user: requester } } = await userClient.auth.getUser()
  if (!requester) return new Response('Unauthorized', { status: 401, headers: cors })

  // Check requester is admin
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const { data: requesterProfile } = await admin
    .from('profiles').select('role').eq('id', requester.id).single()

  if (requesterProfile?.role !== 'admin') {
    return new Response('Forbidden', { status: 403, headers: cors })
  }

  const { userId } = await req.json()

  if (!userId) return new Response('Missing userId', { status: 400, headers: cors })
  if (userId === requester.id) return new Response('Cannot kick yourself', { status: 400, headers: cors })

  // Prevent kicking other admins
  const { data: targetProfile } = await admin
    .from('profiles').select('role').eq('id', userId).single()

  if (targetProfile?.role === 'admin') {
    return new Response('Cannot kick another admin', { status: 400, headers: cors })
  }

  // Ban user (~100 years) so they can't log in
  const { error: banErr } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: '876600h',
  })
  if (banErr) return new Response(JSON.stringify({ error: banErr.message }), { status: 500, headers: cors })

  // Remove from profiles (hides them from team list)
  await admin.from('profiles').delete().eq('id', userId)

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
})
