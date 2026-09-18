// api/chat.js - 405B ULTRA FAST & SMART
export default async function handler(req, res) {
  // CORS + Fast response
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method!== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, model } = req.body;
    if (!messages) return res.status(400).json({ error: 'No messages' });

    if (!process.env.GROQ_API_KEY) {
      return res.status(200).json({
        choices: [{ message: { content: "⚠️ GROQ_API_KEY Vercel me set nahi hai. Settings > Environment Variables me jao." } }]
      });
    }

    // 1. VISION FAST PATH (Photo/PDF ke liye)
    if (model?.includes('vision') || model?.includes('11b')) {
      const visionRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.GROQ_API_KEY}` },
        body: JSON.stringify({
          model: "llama-3.2-11b-vision-preview",
          messages,
          temperature: 0.4,
          max_tokens: 2048
        })
      });
      const vData = await visionRes.json();
      if (visionRes.ok) return res.status(200).json(vData);
    }

    // 2. SMART FALLBACK SYSTEM - 405B -> 70B
    // Pehle 405B try, fail hua to turant 70B (user ko pata bhi nahi chalega)
    const smartModels = [
      "llama-3.1-405b-reasoning", // ULTRA - Sabse Smart (405B)
      "llama-3.3-70b-versatile", // MEGA - Fast Backup (70B)
      "llama-3.1-70b-versatile" // SUPER - Last Backup
    ];

    for (let currentModel of smartModels) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000); // 25s timeout for speed

        const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.GROQ_API_KEY}` },
          body: JSON.stringify({
            model: currentModel,
            messages,
            temperature: 0.65,
            max_tokens: 3000,
            top_p: 0.9
          })
        });
        clearTimeout(timeout);

        const data = await resp.json();

        // Success? Toh turant bhejo + konsa model use hua ye bhi batao
        if (resp.ok && data.choices && data.choices[0]?.message?.content) {
          // Smart header - frontend me dikhega konsa model laga
          res.setHeader('X-Model-Used', currentModel);
          return res.status(200).json(data);
        }
      } catch (err) {
        console.log(`Model ${currentModel} failed, trying next...`);
        continue; // Next model pe jao
      }
    }

    // Sab fail ho gaye toh
    return res.status(200).json({
      choices: [{ message: { content: "⚡ Sab models busy hain (405B ka limit). 20 sec baad try karo, auto 70B se reply ayega." } }]
    });

  } catch (e) {
    return res.status(200).json({
      choices: [{ message: { content: "❌ Error: " + e.message } }]
    });
  }
            }
