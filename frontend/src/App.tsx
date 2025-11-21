// ============================================
// MAIN APP COMPONENT
// ============================================
import { useState, useEffect } from 'react';
import Login from './components/Login';
import ResearchChat from './components/ResearchChat';
import { account } from './appwrite';
import './App.css';

type View = 'chat' | 'history';

function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [view, setView] = useState<View>('chat');
  const [checking, setChecking] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    account.get()
      .then(user => {
        console.log('✅ User already logged in:', user.$id);
        setUserId(user.$id);
      })
      .catch(() => {
        console.log('ℹ️ No active session');
      })
      .finally(() => setChecking(false));
  }, []);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      setUserId(null);
      console.log('✅ Logged out');
    } catch (error) {
      console.error('❌ Logout failed:', error);
    }
  };

  if (checking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <div>Lade...</div>
        </div>
      </div>
    );
  }

  if (!userId) {
    return <Login onLogin={setUserId} />;
  }

  return (
    <div>
      <nav style={{
        padding: '15px 30px',
        backgroundColor: '#2c3e50',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>🔍 Research Assistant</span>
          <button
            onClick={() => setView('chat')}
            style={{
              padding: '8px 20px',
              backgroundColor: view === 'chat' ? '#007bff' : 'transparent',
              color: 'white',
              border: view === 'chat' ? 'none' : '1px solid white',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: view === 'chat' ? 'bold' : 'normal'
            }}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setView('history')}
            style={{
              padding: '8px 20px',
              backgroundColor: view === 'history' ? '#007bff' : 'transparent',
              color: 'white',
              border: view === 'history' ? 'none' : '1px solid white',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: view === 'history' ? 'bold' : 'normal'
            }}
          >
            📚 History
          </button>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🚪 Logout
        </button>
      </nav>

      {view === 'chat' && <ResearchChat userId={userId} />}
      {view === 'history' && <HistoryView userId={userId} />}
    </div>
  );
}

// ============================================
// HISTORY VIEW COMPONENT
// ============================================
// HIER FINDET DIE VERBINDUNG ZUM BACKEND STATT! (fetch() Aufrufe)

import { API_ENDPOINTS } from './config';

interface HistoryItem {
  $id: string;
  userId: string;
  topic: string;
  summary: string;
  sources: string[];
  timestamp: string;
}

interface HistoryViewProps {
  userId: string;
}

function HistoryView({ userId }: HistoryViewProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ============================================
  // BACKEND API CALL: GET /api/history
  // ============================================
  const loadHistory = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Fetching history from backend:', API_ENDPOINTS.history);

      // HIER: fetch() Aufruf zum Backend!
      const response = await fetch(`${API_ENDPOINTS.history}?userId=${userId}`);

      if (!response.ok) {
        throw new Error(`Backend Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ History loaded:', data.length, 'items');
      setHistory(data);

    } catch (err: any) {
      console.error('❌ Failed to load history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // BACKEND API CALL: DELETE /api/history/:id
  // ============================================
  const deleteItem = async (id: string) => {
    if (!confirm('Möchtest du diese Recherche wirklich löschen?')) return;

    try {
      console.log('🔄 Deleting item:', id);

      // HIER: fetch() Aufruf zum Backend!
      const response = await fetch(API_ENDPOINTS.deleteHistory(id), {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      console.log('✅ Item deleted');
      // Neu laden
      loadHistory();

    } catch (err: any) {
      console.error('❌ Delete failed:', err);
      alert('Löschen fehlgeschlagen: ' + err.message);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [userId]);

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
        <div>Lade Recherche-Historie...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px' }}>
        <div style={{ padding: '20px', backgroundColor: '#fee', color: '#c00', borderRadius: '8px' }}>
          <strong>❌ Fehler beim Laden:</strong> {error}
          <div style={{ marginTop: '10px' }}>
            <button onClick={loadHistory} style={{ padding: '10px 20px', cursor: 'pointer' }}>
              🔄 Erneut versuchen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0' }}>📚 Recherche-Historie</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            {history.length} gespeicherte {history.length === 1 ? 'Recherche' : 'Recherchen'}
          </p>
        </div>
        <button
          onClick={loadHistory}
          style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          🔄 Aktualisieren
        </button>
      </div>

      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📭</div>
          <p>Noch keine Recherchen gespeichert</p>
          <p style={{ fontSize: '14px' }}>Gehe zu "Chat" und starte deine erste Recherche!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {history.map((item) => (
            <div
              key={item.$id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#007bff' }}>
                    {item.topic}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {new Date(item.timestamp).toLocaleString('de-DE')}
                  </div>
                </div>
                <button
                  onClick={() => deleteItem(item.$id)}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  🗑️ Löschen
                </button>
              </div>

              <div style={{
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '5px',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
                marginBottom: '15px'
              }}>
                {item.summary}
              </div>

              {item.sources && item.sources.length > 0 && (
                <div>
                  <strong style={{ fontSize: '14px', color: '#666' }}>
                    🔗 Quellen ({item.sources.length}):
                  </strong>
                  <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                    {item.sources.slice(0, 5).map((source, idx) => (
                      <li key={idx} style={{ fontSize: '13px', marginBottom: '5px' }}>
                        <a
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#007bff', wordBreak: 'break-all' }}
                        >
                          {source}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
