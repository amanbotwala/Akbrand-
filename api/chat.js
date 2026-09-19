export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(200).json({ reply: "KEY MISSING" });

  try {
    const { message } = req.body || {};
    if (!message) return res.status(200).json({ reply: "Message empty" });

    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: message }]
      })
    });
    const data = await r.json();
    if (data.error) return res.status(200).json({ reply: "GROQ ERROR: " + data.error.message });
    return res.status(200).json({ reply: data.choices[0].message.content });
  } catch (e) {
    return res.status(200).json({ reply: "ERROR: " + e.message });
  }
}
