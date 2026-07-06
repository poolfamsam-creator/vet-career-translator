import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './SkillSummary.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function SkillSummary({ selectedSkills }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await axios.post(`${API_URL}/skills-summary`, {
        skill_ids: selectedSkills
      });
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedSkills]);

  useEffect(() => {
    if (selectedSkills.length > 0) {
      fetchSummary();
    }
  }, [selectedSkills, fetchSummary]);

  if (loading || !summary) {
    return <div>Loading summary...</div>;
  }

  return (
    <div className="skill-summary">
      <div className="summary-section">
        <h3>Selected Military Skills</h3>
        <div className="skill-list">
          {summary.selected_skills.map(skill => (
            <div key={skill.id} className="summary-skill">
              <span className="skill-badge">{skill.military_term}</span>
              <span className="translations">
                {skill.civilian_translations.join(', ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="summary-section">
        <h3>Core Competencies</h3>
        <div className="competencies">
          {summary.aggregated_skills.map(([skill, count]) => (
            <div key={skill} className="competency">
              <span className="competency-name">{skill}</span>
              <span className="competency-count">({count})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SkillSummary;
