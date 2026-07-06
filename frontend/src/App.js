import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import RoleSelector from './components/SkillSelector';
import SkillSummary from './components/SkillSummary';
import InterestSelector from './components/InterestSelector';
import RoleDescriptionInput from './components/RoleDescriptionInput';
import CareerResults from './components/CareerResults';
import SkillsTranslator from './components/SkillsTranslator';
import { initAnalytics, trackEvent, trackPageView } from './analytics';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [roleDescription, setRoleDescription] = useState('');
  const [matchedCareers, setMatchedCareers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableInterests, setAvailableInterests] = useState([]);
  const [activeTab, setActiveTab] = useState('skills');
  const [currentPage, setCurrentPage] = useState('matcher');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 768);

  // Load available interests on mount
  useEffect(() => {
    initAnalytics();
    fetchInterests();
  }, []);

  useEffect(() => {
    const pagePath = currentPage === 'translator'
      ? '/translator'
      : activeTab === 'results'
        ? '/matcher/results'
        : '/matcher/skills';

    trackPageView(pagePath, 'Military Career Translator');
  }, [currentPage, activeTab]);

  const fetchInterests = async () => {
    try {
      const response = await axios.get(`${API_URL}/interests`);
      setAvailableInterests(response.data);
    } catch (error) {
      console.error('Error fetching interests:', error);
    }
  };

  const handleRoleToggle = (roleId) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleInterestToggle = (interest) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleFindCareers = async () => {
    if (selectedRoles.length === 0 && selectedInterests.length === 0 && roleDescription.trim() === '') {
      alert('Please select at least one role, interest, or describe your role');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/match-careers`, {
        skill_ids: selectedRoles,
        interests: selectedInterests,
        role_description: roleDescription
      });
      setMatchedCareers(response.data);
      setActiveTab('results');

      trackEvent('find_careers', {
        selected_roles_count: selectedRoles.length,
        selected_interests_count: selectedInterests.length,
        has_role_description: roleDescription.trim().length > 0,
        matches_count: response.data.length
      });
    } catch (error) {
      console.error('Error matching careers:', error);
      alert('Error finding matching careers');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    trackEvent('clear_filters', {
      selected_roles_count: selectedRoles.length,
      selected_interests_count: selectedInterests.length,
      had_role_description: roleDescription.trim().length > 0
    });

    setSelectedRoles([]);
    setSelectedInterests([]);
    setRoleDescription('');
    setMatchedCareers([]);
  };

  return (
    <div className="app-layout">
      <Sidebar
        activeTab={currentPage}
        onTabChange={(tab) => {
          setCurrentPage(tab);
          if (window.innerWidth <= 768) {
            setIsSidebarOpen(false);
          }
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className={`app-main ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle navigation menu"
        >
          {isSidebarOpen ? '✕ Close' : '☰ Menu'}
        </button>

        {currentPage === 'matcher' ? (
          <div className="app">
            <header className="app-header">
              <h1>Military Career Translator</h1>
              <p>Translate military experience into civilian resume language in minutes.</p>
            </header>

            <div className="app-container">
              <div className="tabs">
                <button
                  className={`tab-button ${activeTab === 'skills' ? 'active' : ''}`}
                  onClick={() => setActiveTab('skills')}
                >
                  Select Roles & Interests
                </button>
                <button
                  className={`tab-button ${activeTab === 'results' ? 'active' : ''}`}
                  onClick={() => setActiveTab('results')}
                  disabled={matchedCareers.length === 0}
                >
                  Career Matches ({matchedCareers.length})
                </button>
              </div>

              {activeTab === 'skills' && (
                <div className="skills-panel">
                  <div className="panel-section">
                    <h2>1. Select Your Military Roles</h2>
                    <RoleSelector
                      selectedSkills={selectedRoles}
                      onRoleToggle={handleRoleToggle}
                    />
                  </div>

                  {selectedRoles.length > 0 && (
                    <div className="panel-section">
                      <h2>Your Selected Roles</h2>
                      <SkillSummary selectedSkills={selectedRoles} />
                    </div>
                  )}

                  <div className="panel-section">
                    <h2>2. Select Your Interests (Optional)</h2>
                    <InterestSelector
                      availableInterests={availableInterests}
                      selectedInterests={selectedInterests}
                      onInterestToggle={handleInterestToggle}
                    />
                  </div>

                  <div className="panel-section">
                    <RoleDescriptionInput 
                      roleDescription={roleDescription}
                      onRoleDescriptionChange={setRoleDescription}
                    />
                  </div>

                  <div className="action-buttons">
                    <button
                      className="btn btn-primary"
                      onClick={handleFindCareers}
                      disabled={loading}
                    >
                      {loading ? 'Finding Matches...' : 'Find Matching Careers'}
                    </button>
                    <button className="btn btn-secondary" onClick={handleClear}>
                      Clear All
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'results' && matchedCareers.length > 0 && (
                <div className="results-panel">
                  <CareerResults careers={matchedCareers} />
                  <div className="action-buttons">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setActiveTab('skills')}
                    >
                      Back to Selection
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'results' && matchedCareers.length === 0 && (
                <div className="empty-state">
                  <p>No career matches yet. Select roles and interests to get started!</p>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setActiveTab('skills')}
                  >
                    Go to Selection
                  </button>
                </div>
              )}
            </div>

            <div className="homepage-trust-footer">
              Built by a US Marine veteran to make civilian transition easier.
            </div>
          </div>
        ) : (
          <SkillsTranslator selectedRoles={selectedRoles} />
        )}
      </div>
    </div>
  );
}

export default App;
