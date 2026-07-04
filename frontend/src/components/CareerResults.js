import React, { useState } from 'react';
import './CareerResults.css';

function CareerResults({ careers }) {
  const [expandedDetails, setExpandedDetails] = useState({});

  const getMatchColor = (score) => {
    return score > 50 ? '#22c55e' : '#eab308';
  };

  const toggleDetails = (careerId) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [careerId]: !prev[careerId]
    }));
  };

  const getVeteranSupportDetail = (description = '') => {
    const text = description.toLowerCase();

    if (text.includes('mentorship')) {
      return 'How this helps veterans: mentorship supports resume translation, interview prep, and faster transition into civilian teams.';
    }
    if (text.includes('hiring') || text.includes('recruit')) {
      return 'How this helps veterans: dedicated veteran hiring pipelines can improve interview access and speed up placement.';
    }
    if (text.includes('certification') || text.includes('sponsorship')) {
      return 'How this helps veterans: certification support helps you close credential gaps needed for this field.';
    }
    if (text.includes('development') || text.includes('training')) {
      return 'How this helps veterans: structured training and development programs help align military experience to civilian role expectations.';
    }
    if (text.includes('defense') || text.includes('contractor')) {
      return 'How this helps veterans: defense-adjacent environments often value military systems knowledge and security-focused experience.';
    }
    return 'How this helps veterans: these employers and organizations typically offer transition support, networking access, and veteran-aware recruiting practices.';
  };

  return (
    <div className="career-results">
      <div className="results-header">
        <h2>Matched Careers</h2>
        <p>Based on your military skills and interests</p>
      </div>

      <div className="careers-list">
        {careers.map((career, index) => (
          <div key={career.id} className="career-card">
            <div className="career-rank">#{index + 1}</div>
            
            <div className="career-header">
              <div className="career-title-section">
                <h3>{career.title}</h3>
                <p className="career-description">{career.description}</p>
              </div>
              <div className="match-score" style={{ borderColor: getMatchColor(career.match_score) }}>
                <div className="score-value" style={{ color: getMatchColor(career.match_score) }}>
                  {career.match_score}%
                </div>
                <div className="score-label">Match</div>
              </div>
            </div>

            <div className="career-details">
              <div className="detail-group">
                <strong>Salary Range:</strong>
                <span>{career.salary_range}</span>
              </div>
              <div className="detail-group">
                <strong>Growth Potential:</strong>
                <span className={`potential ${career.growth_potential.toLowerCase()}`}>
                  {career.growth_potential}
                </span>
              </div>
              <div className="detail-group">
                <strong>Industries:</strong>
                <span>{career.industries.join(', ')}</span>
              </div>
            </div>

            <div className="skills-breakdown">
              <h4>Skill Match</h4>
              <div className="skill-match-list">
                {career.skill_match.map((skill, idx) => (
                  <div key={idx} className={`skill-match-item ${skill.matched ? 'matched' : 'missing'}`}>
                    <span className="skill-checkbox-icon">
                      {skill.matched ? '✓' : '○'}
                    </span>
                    <span className="skill-name">{skill.skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {career.interest_match && career.interest_match.length > 0 && (
              <div className="interests-breakdown">
                <h4>Interest Match</h4>
                <div className="interest-match-list">
                  {career.interest_match.map((interest, idx) => (
                    <div key={idx} className={`interest-match-item ${interest.matched ? 'matched' : ''}`}>
                      <span className="interest-checkbox-icon">
                        {interest.matched ? '✓' : '○'}
                      </span>
                      <span className="interest-name">{interest.interest}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              className="details-toggle"
              onClick={() => toggleDetails(career.id)}
            >
              <span>Details & Tips</span>
              <span className={`toggle-arrow ${expandedDetails[career.id] ? 'open' : ''}`}>▾</span>
            </button>

            {expandedDetails[career.id] && (
              <div className="tips-section">
                <div className="tips-grid">
                  <div className="tip-group">
                    <h5>How To Get Started</h5>
                    <ul>
                      {(career.getting_started || []).map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="tip-group">
                    <h5>Helpful Certifications</h5>
                    <ul>
                      {(career.certifications || []).map((cert, idx) => (
                        <li key={idx}>{cert}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="tip-group">
                    <h5>How To Market Your Skills</h5>
                    <ul>
                      {(career.marketing_tips || []).map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="tip-group">
                    <h5>Relevant Companies and Organizations That Support Veterans</h5>
                    <ul>
                      {(career.veteran_friendly_companies || []).map((org, idx) => (
                        <li key={idx}>
                          <strong>{org.name}:</strong> {org.description}
                          <div className="support-detail">{getVeteranSupportDetail(org.description)}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {careers.length === 0 && (
        <div className="no-results">
          <p>No careers matched your criteria. Try selecting different skills or interests.</p>
        </div>
      )}
    </div>
  );
}

export default CareerResults;
