export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { email } = await req.json();

  if (!email || !email.includes('@')) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400 });
  }

  // Save to Supabase
  const supabaseRes = await fetch('https://ebwygacgiraschkmvefz.supabase.co/rest/v1/waitlist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVid3lnYWNnaXJhc2Noa212ZWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NDYwMTMsImV4cCI6MjA5NDUyMjAxM30.FNFWvBdUt-oomoHcp726gG6CN0xkHQSreKa_6XQmPFk',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVid3lnYWNnaXJhc2Noa212ZWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NDYwMTMsImV4cCI6MjA5NDUyMjAxM30.FNFWvBdUt-oomoHcp726gG6CN0xkHQSreKa_6XQmPFk',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ email })
  });

  if (supabaseRes.status === 409) {
    return new Response(JSON.stringify({ error: 'Already signed up' }), { status: 409 });
  }

  if (!supabaseRes.ok) {
    return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
  }

  // Send notification via Resend
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer re_UtHZoEwo_3EBWUt4ucb5N2r6ws8cTpdqV'
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