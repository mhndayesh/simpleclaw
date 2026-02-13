(async () => {
  const base = 'http://localhost:3001';
  async function post(path, body) {
    const r = await fetch(base + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    let t = null;
    try { t = await r.json(); } catch (e) { t = null; }
    console.log(path, '->', r.status, t);
    return t;
  }

  console.log('Archiving/creating fresh session');
  await post('/api/session/new', { session: 'default' });

  console.log('Setting mode to STANDARD');
  await post('/api/chat', { query: 'SYSTEM: Change mode to STANDARD', session: 'default' });

  for (let i = 1; i <= 12; i++) {
    console.log(`Sending message ${i}`);
    await post('/api/chat', { query: `Standard test message ${i}`, session: 'default' });
    await new Promise(r => setTimeout(r, 300));
  }

  console.log('Fetching session');
  const sess = await (await fetch(base + '/api/session?session=default')).json();
  console.log('SESSION:', JSON.stringify(sess, null, 2));
})().catch(e => { console.error(e); process.exit(1); });
