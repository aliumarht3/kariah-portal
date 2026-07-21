import React, { useState } from 'react';
import { auth } from '../firebase';
import KariahData from './KariahData';

const Dashboard = ({ user, userData }) => {
  const [activeTab, setActiveTab] = useState('news');

  // Trimmed down to only two tabs
  const tabs = [
    { id: 'news', label: 'News & Announcements' },
    { id: 'kariah', label: 'Kariah Data' }
  ];

  return (
    <div style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', backgroundColor: '#f0f4f1', minHeight: '100vh' }}>
      
      {/* Top Header Bar */}
      <header style={{ backgroundColor: '#145A32', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', letterSpacing: '0.5px' }}>Masjid Al-Ehsan SS4A</h1>
          <small style={{ color: '#A9DFBF', fontSize: '14px' }}>
            Logged in as: <strong>{user.displayName}</strong> ({userData.role})
          </small>
        </div>
        <button 
          onClick={() => auth.signOut()} 
          style={{ backgroundColor: 'transparent', color: '#fff', border: '1px solid #A9DFBF', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.3s' }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#1e8449'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          Sign Out
        </button>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        
        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '15px', marginBottom: '30px', borderBottom: '2px solid #D5F5E3', paddingBottom: '10px' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 24px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? '#27AE60' : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#145A32',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px',
                boxShadow: activeTab === tab.id ? '0 4px 6px rgba(39, 174, 96, 0.3)' : 'none',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Main Content Area */}
        <main style={{ background: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', minHeight: '400px' }}>
          
          {activeTab === 'news' && (
            <div style={{ animation: 'fadeIn 0.5s' }}>
              <h2 style={{ color: '#145A32', marginTop: 0, borderBottom: '2px solid #EAEDED', paddingBottom: '10px' }}>News & Announcements</h2>
              <div style={{ backgroundColor: '#EAEDED', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #27AE60', color: '#555' }}>
                <p style={{ margin: 0 }}>Welcome to the Masjid Al-Ehsan portal. Currently, there are no new announcements from the committee.</p>
              </div>
            </div>
          )}

          {activeTab === 'kariah' && (
            <div style={{ animation: 'fadeIn 0.5s' }}>
              <KariahData userData={userData} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;