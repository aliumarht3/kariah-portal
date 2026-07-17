import React, { useState } from 'react';
import { auth, googleProvider, facebookProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

const Auth = () => {
  const [error, setError] = useState('');

  const handleSignIn = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // TODO: Fetch user document from Firestore
      // Check if user.uid exists in 'users' collection and isApproved == true
      // If true -> Route to Portal Dashboard
      // If false -> Route to "Pending Approval" screen
      
      console.log("Logged in as:", user.displayName);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
      <h2>Masjid Al-Ehsan SS4A Kariah Portal</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <button 
        onClick={() => handleSignIn(googleProvider)}
        style={{ margin: '10px', padding: '10px 20px', cursor: 'pointer' }}
      >
        Sign in with Google
      </button>
      
      <button 
        onClick={() => handleSignIn(facebookProvider)}
        style={{ margin: '10px', padding: '10px 20px', cursor: 'pointer' }}
      >
        Sign in with Facebook
      </button>
    </div>
  );
};

export default Auth;