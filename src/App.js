import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch additional role/approval details from Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          setUserData({ isApproved: false, role: 'kariah' });
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Loading Portal...</div>;
  }

  if (!user) {
    return <Auth />;
  }

  if (userData && !userData.isApproved) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', padding: '20px' }}>
        <h2>Account Pending Approval</h2>
        <p>Welcome, {user.displayName}. Your account is waiting for verification from the Masjid Al-Ehsan admin team.</p>
        <button onClick={() => auth.signOut()} style={{ padding: '8px 16px', marginTop: '15px' }}>Sign Out</button>
      </div>
    );
  }

  return <Dashboard user={user} userData={userData} />;
}

export default App;