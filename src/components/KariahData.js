import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const KariahData = ({ userData }) => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKariahDirectory = async () => {
      try {
        // Fetch families collection
        const querySnapshot = await getDocs(collection(db, "families"));
        const familiesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFamilies(familiesList);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKariahDirectory();
  }, []);

  if (loading) return <div>Loading Kariah directory...</div>;

  return (
    <div>
      <h2>Kariah Directory</h2>
      <p style={{ color: '#666' }}>
        {userData.role === 'admin' 
          ? '🔑 Admin View: Full profile visibility active.' 
          : '👁️ Kariah View: Displaying limited profile directory.'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {families.map((family) => (
          <div key={family.id} style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '15px', backgroundColor: '#fff' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1b4d3e' }}>{family.familyName}</h3>
            
            {/* Conditional Data Masking based on user role */}
            <p><strong>Street:</strong> {family.streetName}</p>
            {userData.role === 'admin' ? (
              <>
                <p><strong>House Number:</strong> {family.houseNumber}</p>
                <span style={{ fontSize: '12px', background: '#ffeaa7', padding: '2px 6px', borderRadius: '4px' }}>Sensitive Info Displayed</span>
              </>
            ) : (
              <p><em>Exact address hidden for privacy</em></p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KariahData;