export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({reply: 'Method not allowed'});
  const { message } = req.body;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(200).json({reply: 'ERROR: Vercel me GROQ_API_KEY nahi mili'});

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{role: "user", content: message}],
      })
    });
    const data = await r.json();
    console.log(JSON.stringify(data));
    if (data.error) return res.status(200).json({reply: `GROQ ERROR: ${data.error.message}`});
    if (!data.choices) return res.status(200).json({reply: `GROQ RESPONSE: ${JSON.stringify(data).slice(0,200)}`});
    return res.status(200).json({reply: data.choices[0].message.content});
  } catch (e) {
    return res.status(200).json({reply: `CODE ERROR: ${e.message}`});
  }
      }
