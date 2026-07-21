import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';

const KariahData = ({ userData }) => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // View Toggle State (Initializes to true if user is an admin)
  const [isAdminViewActive, setIsAdminViewActive] = useState(userData.role === 'admin');
  
  // Modal States
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);

  // Form States
  const [newFamName, setNewFamName] = useState('');
  const [newFamStreet, setNewFamStreet] = useState('');
  const [newFamHouse, setNewFamHouse] = useState('');
  const [newFamPhone, setNewFamPhone] = useState(''); // Added Phone Number
  
  const [newMemName, setNewMemName] = useState('');
  const [newMemRel, setNewMemRel] = useState('');

  // Fetch Data
  useEffect(() => {
    fetchKariahDirectory();
  }, []);

  const fetchKariahDirectory = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "families"));
      const familiesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        members: [], // default fallback
        ...doc.data()
      }));
      setFamilies(familiesList);
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Add New Family (Admin Only)
  const handleAddFamily = async (e) => {
    e.preventDefault();
    try {
      const newFamily = {
        familyName: newFamName,
        streetName: newFamStreet,
        houseNumber: newFamHouse,
        phoneNumber: newFamPhone, // Included Phone Number
        members: []
      };
      const docRef = await addDoc(collection(db, "families"), newFamily);
      setFamilies([...families, { id: docRef.id, ...newFamily }]);
      
      // Reset form and close
      setNewFamName(''); setNewFamStreet(''); setNewFamHouse(''); setNewFamPhone('');
      setShowAddFamilyModal(false);
    } catch (error) {
      console.error("Error adding family: ", error);
    }
  };

  // Add Member to Selected Family (Admin Only)
  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const newMember = { name: newMemName, relationship: newMemRel };
      const updatedMembers = [...(selectedFamily.members || []), newMember];
      
      const familyRef = doc(db, "families", selectedFamily.id);
      await updateDoc(familyRef, { members: updatedMembers });
      
      // Update local state
      const updatedFamily = { ...selectedFamily, members: updatedMembers };
      setSelectedFamily(updatedFamily);
      setFamilies(families.map(f => f.id === updatedFamily.id ? updatedFamily : f));
      
      // Reset form
      setNewMemName(''); setNewMemRel('');
    } catch (error) {
      console.error("Error adding member: ", error);
    }
  };

  // Delete Family (Admin Only)
  const handleDeleteFamily = async (familyId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this family? This action cannot be undone.");
    
    if (isConfirmed) {
      try {
        await deleteDoc(doc(db, "families", familyId));
        
        // Update local state to remove the deleted family
        setFamilies(families.filter(f => f.id !== familyId));
        
        // Close the modal
        setSelectedFamily(null);
      } catch (error) {
        console.error("Error deleting family: ", error);
      }
    }
  };

  if (loading) return <div style={{ color: '#27AE60', fontWeight: 'bold' }}>Loading Kariah directory...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#145A32', margin: 0 }}>Kariah Directory</h2>
        
        {/* Admin Add Family Button - Bound to View Toggle */}
        {isAdminViewActive && (
          <button 
            onClick={() => setShowAddFamilyModal(true)}
            style={{ backgroundColor: '#27AE60', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            + Add New Family
          </button>
        )}
      </div>

      <div style={{ backgroundColor: isAdminViewActive ? '#D5F5E3' : '#F2F4F4', padding: '10px 15px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <p style={{ margin: 0, color: isAdminViewActive ? '#145A32' : '#7F8C8D', fontSize: '14px', fontWeight: '500' }}>
          {isAdminViewActive ? '🔑 Admin View: Full profile & edit rights active.' : '👁️ Kariah View: Displaying limited directory.'}
        </p>
        
        {/* View Toggle Button - Only visible to actual admins in the database */}
        {userData.role === 'admin' && (
          <button 
            onClick={() => setIsAdminViewActive(!isAdminViewActive)}
            style={{ 
              backgroundColor: 'transparent', 
              color: isAdminViewActive ? '#145A32' : '#7F8C8D', 
              border: `1px solid ${isAdminViewActive ? '#145A32' : '#7F8C8D'}`, 
              padding: '4px 10px', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            Switch to {isAdminViewActive ? 'Kariah View' : 'Admin View'}
          </button>
        )}
      </div>

      {/* Family Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
        {families.map((family) => (
          <div 
            key={family.id} 
            onClick={() => setSelectedFamily(family)}
            style={{ 
              border: '1px solid #E5E7E9', borderRadius: '8px', padding: '20px', backgroundColor: '#fff',
              borderTop: '4px solid #27AE60', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <h3 style={{ margin: '0 0 15px 0', color: '#145A32', fontSize: '18px' }}>{family.familyName}</h3>
            <div style={{ color: '#555', lineHeight: '1.6' }}>
              <p style={{ margin: '5px 0' }}><strong>Street:</strong> {family.streetName}</p>
              
              {/* Conditional Rendering based on Toggle */}
              {isAdminViewActive ? (
                <>
                  <p style={{ margin: '5px 0' }}><strong>House Number:</strong> {family.houseNumber}</p>
                  <p style={{ margin: '5px 0' }}><strong>House Phone:</strong> {family.phoneNumber || 'N/A'}</p>
                </>
              ) : (
                <p style={{ margin: '5px 0', color: '#95A5A6', fontStyle: 'italic' }}>Exact address & contact hidden for privacy</p>
              )}
              
              <p style={{ margin: '15px 0 0 0', color: '#27AE60', fontSize: '14px', fontWeight: 'bold' }}>
                👥 {(family.members || []).length} Members (Click to view)
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Family Modal (Admin) */}
      {showAddFamilyModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ color: '#145A32', marginTop: 0 }}>Add New Family</h3>
            <form onSubmit={handleAddFamily} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input required placeholder="Family Name (e.g. Keluarga Ahmad)" value={newFamName} onChange={(e) => setNewFamName(e.target.value)} style={inputStyle} />
              <input required placeholder="Street Name (e.g. Jalan SS4A/1)" value={newFamStreet} onChange={(e) => setNewFamStreet(e.target.value)} style={inputStyle} />
              <input required placeholder="House Number (e.g. No. 12)" value={newFamHouse} onChange={(e) => setNewFamHouse(e.target.value)} style={inputStyle} />
              <input required placeholder="House Phone Number (e.g. 03-78765432)" value={newFamPhone} onChange={(e) => setNewFamPhone(e.target.value)} style={inputStyle} type="tel" />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={primaryBtnStyle}>Save Family</button>
                <button type="button" onClick={() => setShowAddFamilyModal(false)} style={cancelBtnStyle}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View/Edit Family Members Modal */}
      {selectedFamily && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ color: '#145A32', marginTop: 0 }}>{selectedFamily.familyName}</h3>
              <button onClick={() => setSelectedFamily(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✖</button>
            </div>
            
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Family Members</h4>
              {(selectedFamily.members || []).length === 0 ? (
                <p style={{ color: '#999', fontStyle: 'italic', margin: 0 }}>No members registered yet.</p>
              ) : (
                <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                  {selectedFamily.members.map((m, idx) => (
                    <li key={idx} style={{ padding: '8px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{m.name}</strong> 
                      <span style={{ color: '#27AE60', fontSize: '14px', backgroundColor: '#E8F8F5', padding: '2px 8px', borderRadius: '12px' }}>{m.relationship}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Admin Add Member Form - Bound to View Toggle */}
            {isAdminViewActive && (
              <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '10px' }}>
                <input required placeholder="Member Name" value={newMemName} onChange={(e) => setNewMemName(e.target.value)} style={{...inputStyle, flex: 2}} />
                <input required placeholder="Relationship (e.g. Anak)" value={newMemRel} onChange={(e) => setNewMemRel(e.target.value)} style={{...inputStyle, flex: 1}} />
                <button type="submit" style={primaryBtnStyle}>Add</button>
              </form>
            )}

            {/* Admin Delete Family Button - Bound to View Toggle */}
            {isAdminViewActive && (
              <div style={{ marginTop: '25px', paddingTop: '15px', borderTop: '2px solid #eee', textAlign: 'right' }}>
                <button 
                  onClick={() => handleDeleteFamily(selectedFamily.id)}
                  style={{ backgroundColor: 'transparent', color: '#E74C3C', border: '1px solid #E74C3C', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  🗑️ Delete Family
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

// --- Reusable Inline Styles ---
const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};

const modalContentStyle = {
  backgroundColor: '#fff', padding: '30px', borderRadius: '10px', width: '90%', maxWidth: '500px',
  maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', animation: 'fadeIn 0.3s'
};

const inputStyle = {
  padding: '12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '15px', outlineColor: '#27AE60'
};

const primaryBtnStyle = {
  backgroundColor: '#27AE60', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
};

const cancelBtnStyle = {
  backgroundColor: '#E74C3C', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
};

export default KariahData;