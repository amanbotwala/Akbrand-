export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method!== 'POST') return res.status(200).json({reply: 'Method not allowed'});

  try {
    const { message } = req.body || {};
    if (!message) return res.status(200).json({reply: 'Message empty hai'});

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(200).json({reply: 'Vercel me GROQ_API_KEY set nahi hai'});

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {role: "system", content: "You are Akbrand Assistant, a helpful AI."},
          {role: "user", content: message}
        ],
        temperature: 0.7
      })
    });

    const data = await groqRes.json();

    if (data.error) {
      return res.status(200).json({reply: `Groq Error: ${data.error.message}`});
    }

    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) {
      return res.status(200).json({reply: `Groq se reply nahi aaya: ${JSON.stringify(data).slice(0,300)}`});
    }

    return res.status(200).json({reply});

  } catch (err) {
    return res.status(200).json({reply: `Server Error: ${err.message}`});
  }
  }
