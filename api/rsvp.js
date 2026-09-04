const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzbTU3rLr7e4ewTW8USS2NwuSbQliD66lJuh2PFlVS-YSRqBbOJ16eJYCTOQBWSg5bKLg/exec';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, answer, people, note } = req.body || {};

    if (!name || !['sim', 'nao'].includes(answer)) {
      return res.status(400).json({ error: 'Dados de confirmação inválidos.' });
    }

    const payload = {
      name: String(name).trim(),
      answer,
      people: answer === 'sim' ? Math.max(1, Number(people) || 1) : 0,
      note: String(note || '').trim()
    };

    const googleResponse = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });

    const text = await googleResponse.text();

    if (!googleResponse.ok) {
      console.error('RSVP Google error:', googleResponse.status, text);
      return res.status(502).json({ error: 'Não foi possível registrar a confirmação.' });
    }

    let parsed = null;
    try { parsed = JSON.parse(text); } catch {}

    if (parsed && parsed.success === false) {
      return res.status(502).json({ error: 'O Google não confirmou o registro.' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('RSVP exception:', err);
    return res.status(500).json({ error: 'Erro ao registrar a confirmação.' });
  }
};
