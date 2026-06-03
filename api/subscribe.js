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
    return new Response(JSON.stringify({ error: 'Bad request' }), { status: 400 });
  }

 const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const resendKey = process.env.RESEND_API_KEY;

  const supabaseRes = await fetch('https://ebwygacgiraschkmvefz.supabase.co/rest/v1/waitlist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': 'Bearer ' + key,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ email })
  });

  if (supabaseRes.status === 409) {
    return new Response(JSON.stringify({ error: 'Already signed up' }), { status: 409 });
  }

  if (!supabaseRes.ok) {
    const err = await supabaseRes.text();
    return new Response(JSON.stringify({ error: err }), { status: 500 });
  }

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + resendKey
    },
    body: JSON.stringify({
      from: 'Find Storage <hello@findstoragelakeoftheozarks.com>',
      to: 'robin@findstoragelakeoftheozarks.com',
      subject: 'New waitlist signup',
      text: 'New signup: ' + email
    })
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
