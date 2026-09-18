export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(405).json({error: 'Method not allowed'});

  const { message } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) return res.status(500).json({reply: 'GROQ_API_KEY set nahi hai Vercel me'});

  // Models jinka limit kabhi nahi lagta
  const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];

  for (let model of models) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model,
          messages: [{role: "user", content: message}],
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0]) {
        return res.status(200).json({ reply: data.choices[0].message.content });
      }
    } catch (e) { console.log(model + " fail"); }
  }

  return res.status(500).json({ reply: '⚡ Thoda wait karo, Groq 30 sec ke liye busy hai, fir try karo' });
}
