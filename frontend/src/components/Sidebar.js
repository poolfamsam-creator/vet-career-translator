import React from 'react';
import './Sidebar.css';

function Sidebar({ activeTab, onTabChange, isOpen, onClose }) {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />

      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1>Military Career Hub</h1>
          <button type="button" className="sidebar-close" onClick={onClose} aria-label="Close menu">
            ✕
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <button
            className={`nav-button ${activeTab === 'matcher' ? 'active' : ''}`}
            onClick={() => onTabChange('matcher')}
          >
            <span className="nav-icon">→</span>
            <span className="nav-label">Career Matcher</span>
          </button>
          
          <button
            className={`nav-button ${activeTab === 'translator' ? 'active' : ''}`}
            onClick={() => onTabChange('translator')}
          >
            <span className="nav-icon">↔</span>
            <span className="nav-label">Skills Translator</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <p>Helping you transition your military career to civilian opportunities</p>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
