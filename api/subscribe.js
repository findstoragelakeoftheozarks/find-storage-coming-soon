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

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

  const responseText = await supabaseRes.text();

  return new Response(JSON.stringify({ 
    status: supabaseRes.status, 
    body: responseText,
    keyLength: key ? key.length : 0
  }), { status: 200 });
}
