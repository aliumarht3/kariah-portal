import React, { useState } from 'react';
import { auth } from '../firebase';
import KariahData from './KariahData';

const Dashboard = ({ user, userData }) => {
  const [activeTab, setActiveTab] = useState('news');

  const tabs = [
    { id: 'news', label: 'News & Announcements' },
    { id: 'activities', label: 'Masjid Activities' },
    { id: 'orgChart', label: 'Org Chart' },
    { id: 'gallery', label: 'Photo Gallery' },
    { id: 'kariah', label: 'Kariah Data' }
  ];

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header Bar */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1b4d3e' }}>Masjid Al-Ehsan SS4A</h1>
          <small>Logged in as: <strong>{user.displayName}</strong> ({userData.role})</small>
        </div>
        <button onClick={() => auth.signOut()} style={{ backgroundColor: '#c0392b', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>
          Sign Out
        </button>
      </header>

      {/* Navigation Tabs */}
      <nav style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: activeTab === tab.id ? '#1b4d3e' : '#e0e0e0',
              color: activeTab === tab.id ? '#fff' : '#333',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab Panels */}
      <main style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', minHeight: '300px' }}>
        {activeTab === 'news' && (
          <div>
            <h2>News & Announcements</h2>
            <p>Welcome to the portal. Manual announcements from the committee will load here.</p>
          </div>
        )}

        {activeTab === 'activities' && (
          <div>
            <h2>Masjid Activities and Events</h2>
            <p>Upcoming Kuliah schedules and community events calendar.</p>
          </div>
        )}

        {activeTab === 'orgChart' && (
          <div>
            <h2>Organization Chart</h2>
            <p>Masjid Al-Ehsan Committee structure and leadership team details.</p>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div>
            <h2>Photo Gallery</h2>
            <p>Recent images capturing activities around the mosque.</p>
          </div>
        )}

        {activeTab === 'kariah' && (
          <KariahData userData={userData} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;