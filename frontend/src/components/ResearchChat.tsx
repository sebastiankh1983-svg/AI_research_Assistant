// ============================================
// RESEARCH CHAT COMPONENT
// ============================================
// HIER FINDET DIE VERBINDUNG ZUM BACKEND STATT! (fetch() Aufrufe)

import { useState } from 'react';
import { API_ENDPOINTS } from '../config';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface ResearchChatProps {
  userId: string;
}

function ResearchChat({ userId }: ResearchChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // ============================================
  // BACKEND API CALL: POST /api/research
  // ============================================
  const research = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      console.log('🔄 Sending request to backend:', API_ENDPOINTS.research);

      // HIER: fetch() Aufruf zum Backend!
      const response = await fetch(API_ENDPOINTS.research, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          topic: input
        })
      });

      if (!response.ok) {
        throw new Error(`Backend Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Backend response received:', data);

      const aiMsg: Message = {
        role: 'ai',
        content: data.summary
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error: any) {
      console.error('❌ Backend request failed:', error);
      const errorMsg: Message = {
        role: 'ai',
        content: `❌ Fehler: ${error.message}\n\nIst das Backend gestartet? (http://localhost:3001)`
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h1 style={{ margin: '0 0 5px 0' }}>🔍 AI Research Assistant</h1>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          Stelle eine Frage zu einem Thema - Der Agent recherchiert mit Tavily und liest Artikel
        </p>
      </div>

      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        height: '500px',
        overflowY: 'auto',
        marginBottom: '20px',
        backgroundColor: '#fff'
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999', marginTop: '100px' }}>
            <p>💬 Keine Nachrichten</p>
            <p style={{ fontSize: '14px' }}>Beispiel: "Recherchiere AI Agents Trends 2025"</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: '15px',
              padding: '15px',
              backgroundColor: msg.role === 'user' ? '#007bff' : '#f0f0f0',
              color: msg.role === 'user' ? 'white' : 'black',
              borderRadius: '8px',
              maxWidth: '80%',
              marginLeft: msg.role === 'user' ? 'auto' : '0',
              marginRight: msg.role === 'user' ? '0' : 'auto'
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '12px', opacity: 0.8 }}>
              {msg.role === 'user' ? '👤 You' : '🤖 AI Assistant'}
            </div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#007bff' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
            <div>🔍 Recherchiere mit Tavily...</div>
            <div style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>
              Dies kann 30-60 Sekunden dauern
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && research()}
          placeholder='z.B. "AI Agents Trends 2025" oder "Latest LangChain Features"'
          disabled={loading}
          style={{
            flex: 1,
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
        <button
          onClick={research}
          disabled={loading || !input.trim()}
          style={{
            padding: '15px 30px',
            backgroundColor: loading || !input.trim() ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? '⏳' : '🔍'} Research
        </button>
      </div>
    </div>
  );
}

export default ResearchChat;
