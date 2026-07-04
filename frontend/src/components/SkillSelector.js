import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SkillSelector.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function SkillSelector({ selectedSkills = [], onRoleToggle }) {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSkill, setExpandedSkill] = useState(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await axios.get(`${API_URL}/military-skills`);
      const sortedSkills = response.data.sort((a, b) => 
        a.military_term.localeCompare(b.military_term)
      );
      setSkills(sortedSkills);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="skill-selector-loading">Loading skills...</div>;
  }

  return (
    <div className="skill-selector">
      <div className="skills-grid">
        {skills.map(skill => (
          <div key={skill.id}>
            <div
              className={`skill-card ${selectedSkills.includes(skill.id) ? 'selected' : ''}`}
            >
              <div className="skill-content">
                <input
                  type="checkbox"
                  id={`skill-${skill.id}`}
                  checked={selectedSkills.includes(skill.id)}
                  onChange={() => onRoleToggle(skill.id)}
                  className="skill-checkbox"
                />
                <label htmlFor={`skill-${skill.id}`} className="skill-label">
                  <div className="skill-title">{skill.military_term}</div>
                  <div className="skill-translations">
                    {skill.civilian_translations.join(' • ')}
                  </div>
                </label>
              </div>
              <button
                className="expand-btn"
                onClick={() => setExpandedSkill(expandedSkill === skill.id ? null : skill.id)}
                title="View more details"
              >
                {expandedSkill === skill.id ? '↑' : '↓'}
              </button>
            </div>
            {expandedSkill === skill.id && (
              <div className="skill-details">
                <p>
                  <strong>Civilian Equivalents:</strong>
                </p>
                <ul>
                  {skill.civilian_translations.map((trans, idx) => (
                    <li key={idx}>{trans}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkillSelector;
