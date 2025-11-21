// ============================================
// LOGIN COMPONENT
// ============================================
import { useState } from 'react';
import { account } from '../appwrite';
import { ID } from 'appwrite';

interface LoginProps {
  onLogin: (userId: string) => void;
}

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    if (!email || !password) {
      setError('Email und Passwort sind erforderlich');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isSignup) {
        // Account erstellen
        await account.create(ID.unique(), email, password);
        console.log('✅ Account created');
      }

      // Session erstellen (Login)
      const session = await account.createEmailPasswordSession(email, password);
      console.log('✅ Login successful:', session.userId);
      onLogin(session.userId);
    } catch (err: any) {
      console.error('❌ Auth failed:', err);
      setError(err.message || 'Authentication fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>🔍 Research Assistant</h1>

      {error && (
        <div style={{ padding: '10px', backgroundColor: '#fee', color: '#c00', borderRadius: '5px', marginBottom: '15px' }}>
          {error}
        </div>
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        style={{ width: '100%', padding: '12px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
        disabled={loading}
        style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
      />

      <button
        onClick={handleAuth}
        disabled={loading}
        style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
      >
        {loading ? '⏳ Bitte warten...' : (isSignup ? 'Account erstellen' : 'Login')}
      </button>

      <button
        onClick={() => setIsSignup(!isSignup)}
        disabled={loading}
        style={{ width: '100%', marginTop: '10px', padding: '10px', backgroundColor: 'transparent', color: '#007bff', border: '1px solid #007bff', borderRadius: '5px', cursor: 'pointer' }}
      >
        {isSignup ? 'Bereits Account? Login' : 'Neuen Account erstellen'}
      </button>
    </div>
  );
}

export default Login;

