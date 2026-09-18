// api/chat.js - FINAL FIX for [object Object]
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { model, messages } = req.body;
    
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ choices: [{ message: { content: "GROQ_API_KEY Vercel me set nahi hai. Settings > Environment Variables me dalo." } }] });
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: model || "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    const data = await groqRes.json();

    if (!groqRes.ok) {
      console.log("Groq Error:", data);
      return res.status(200).json({
        choices: [{ message: { content: `Groq Error: ${data.error?.message || JSON.stringify(data)}` } }]
      });
    }

    // Sahi format me bhejo
    return res.status(200).json(data);

  } catch (err) {
    console.error(err);
    return res.status(200).json({
      choices: [{ message: { content: "Server error: " + err.message } }]
    });
  }
}
