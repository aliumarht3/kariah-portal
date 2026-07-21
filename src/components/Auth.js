import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

const Auth = () => {
  const [error, setError] = useState('');

  const handleSignIn = async (provider) => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      backgroundColor: '#f0f4f1',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    }}>
      <div style={{
        background: '#fff',
        padding: '50px 40px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(20, 90, 50, 0.1)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
      }}>
        
        <div style={{ 
          width: '60px', 
          height: '60px', 
          backgroundColor: '#145A32', 
          borderRadius: '50%', 
          margin: '0 auto 20px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ color: '#fff', fontSize: '24px' }}>🕌</span>
        </div>

        <h2 style={{ color: '#145A32', marginBottom: '10px', marginTop: 0 }}>Kariah Portal</h2>
        <p style={{ color: '#7F8C8D', marginBottom: '30px' }}>Masjid Al-Ehsan SS4A</p>
        
        {error && <p style={{ color: '#E74C3C', backgroundColor: '#FADBD8', padding: '10px', borderRadius: '6px', fontSize: '14px' }}>{error}</p>}
        
        <button 
          onClick={() => handleSignIn(googleProvider)}
          style={{ 
            width: '100%',
            padding: '12px 20px', 
            backgroundColor: '#27AE60', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(39, 174, 96, 0.2)',
            transition: 'background 0.3s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#229954'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#27AE60'}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Auth;