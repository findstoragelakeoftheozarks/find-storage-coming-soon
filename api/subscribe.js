export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let email;
  try {
    const body = await req.json();
    email = body.email;
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Bad request: ' + e.message }), { status: 400 });
  }

  if (!email || !email.includes('@')) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400 });
  }

  const supabaseRes = await fetch('https://ebwygacgiraschkmvefz.supabase.co/rest/v1/waitlist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ email })
  });

  if (!supabaseRes.ok) {
    const errText = await supabaseRes.text();
    return new Response(JSON.stringify({ error: 'Supabase error', detail: errText }), { status: 500 });
  }

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'Find Storage <hello@findstoragelakeoftheozarks.com>',
      to: 'hello@findstoragelakeoftheozarks.com',
      subject: 'New waitlist signup',
      text: `New signup: ${email}`
    })
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
