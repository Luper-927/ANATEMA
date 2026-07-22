import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const savedName = window.localStorage.getItem('anatema_name');
    if (savedName) setName(savedName);

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const saveName = () => {
    if (!nameInput.trim()) return;
    window.localStorage.setItem('anatema_name', nameInput.trim());
    setName(nameInput.trim());
  };

  const askAnatema = async () => {
    if (!question.trim() || loading) return;
    const userMessage = question;
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setQuestion('');
    setLoading(true);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Something went wrong. Try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askAnatema();
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveName();
    }
  };

  return (
    <div style={{ background: '#0A0908', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif", color: '#EDEAE3', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;700;900&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::placeholder { color: #6B665C; }
        .msg h1, .msg h2, .msg h3 { font-family: 'Archivo', sans-serif; margin: 14px 0 8px; }
        .msg p { margin: 8px 0; line-height: 1.6; }
        .msg ol, .msg ul { padding-left: 20px; line-height: 1.7; }
        .msg strong { color: #E8382B; }
        .msg code { background: #211E1A; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
      `}</style>

      <div style={{ maxWidth: 1100, width: '100%', margin: '0 auto', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: 20, letterSpacing: '-0.02em' }}>ANATEMA</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#6B665C' }}>BETA</div>
      </div>

      <div style={{ flex: 1, maxWidth: 760, width: '100%', margin: '0 auto', padding: '20px 20px 0', display: 'flex', flexDirection: 'column' }}>
        {messages.length === 0 && (
          <div style={{ margin: 'auto', textAlign: 'center', padding: '0 20px' }}>
            {name ? (
              <div style={{ fontSize: 15, color: '#9A948A', marginBottom: 10 }}>{greeting}, {name}.</div>
            ) : (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 14, color: '#9A948A', marginBottom: 10 }}>{greeting}. What should I call you?</div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={handleNameKeyDown}
                    placeholder="Your name"
                    style={{ background: '#161412', border: '1px solid #2A2621', borderRadius: 8, padding: '8px 12px', color: '#EDEAE3', fontSize: 14, outline: 'none' }}
                  />
                  <button onClick={saveName} style={{ background: '#E8382B', border: 'none', color: '#0A0908', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Save</button>
                </div>
              </div>
            )}
            <h1 style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: 'clamp(28px, 6vw, 44px)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 16 }}>
              Keep <span style={{ color: '#E8382B' }}>building</span>.
            </h1>
            <p style={{ fontSize: 15.5, color: '#9A948A', marginBottom: 0 }}>
              For people who take their builds seriously.
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
            <div style={{ maxWidth: '85%', background: m.role === 'user' ? '#211E1A' : 'transparent', border: m.role === 'user' ? 'none' : '1px solid #211E1A', borderRadius: 12, padding: '12px 16px', fontSize: 15 }}>
              {m.role === 'user' ? <span>{m.content}</span> : <div className="msg"><ReactMarkdown>{m.content}</ReactMarkdown></div>}
            </div>
          </div>
        ))}

        {loading && <div style={{ color: '#6B665C', fontSize: 14, fontFamily: "'JetBrains Mono', monospace", marginBottom: 16 }}>thinking...</div>}
      </div>

      <div style={{ maxWidth: 760, width: '100%', margin: '0 auto', padding: '16px 20px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, background: '#161412', border: '1px solid #2A2621', borderRadius: 14, padding: '10px 10px 10px 18px' }}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the part, code, or fit problem..."
            rows={1}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#EDEAE3', fontSize: 15, resize: 'none', fontFamily: 'inherit', padding: '8px 0' }}
          />
          <button onClick={askAnatema} disabled={loading} style={{ background: '#E8382B', border: 'none', color: '#0A0908', width: 40, height: 40, borderRadius: 10, cursor: 'pointer', fontWeight: 700, flexShrink: 0, opacity: loading ? 0.5 : 1 }}>→</button>
        </div>
      </div>
    </div>
  );
}
