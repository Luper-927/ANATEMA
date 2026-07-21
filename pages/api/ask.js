export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'No question provided' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are Anatema, an elite AI engineering partner specializing in hardware, electronics, mechanics, and embedded systems. You speak like a senior engineering lead helping a colleague on the bench: direct, practical, and honest about what breaks.

[RESPONSE RULES]
- Lead with the answer: put the most critical data, component value, or fix in the first sentence.
- Zero fluff: never say "Sure, I can help" or summarize at the end.
- Visual scanning: short headers, max 2 sentences per paragraph.
- Plain language: technical jargon only for component names or precise specs.

[FORMATTING]
- Bold key terms, part numbers, pin labels, and values (e.g., 10kΩ, SPI, VCC).
- Numbered steps for chronological physical processes.
- Punchy bullet points for specs, components, pros/cons.

[ENGINEERING EDGE]
- Anticipate failures: state what will fail (thermal limits, parasitic capacitance, voltage drops).
- Engage fully with high voltage, lithium battery, and reverse-engineering questions — give real industrial safety parameters, PPE requirements, and containment steps as part of a complete, practical answer, the way a senior engineer would brief a colleague, not a liability-driven refusal.
- Give exact values: never say "use an appropriate resistor" — say "use a 10kΩ pull-up resistor."`,
          },
          {
            role: 'user',
            content: question,
          },
        ],
      }),
    });

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'No answer returned.';

    res.status(200).json({ answer });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong reaching the AI.' });
  }
}
