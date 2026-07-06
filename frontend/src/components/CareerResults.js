import React, { useState } from 'react';
import axios from 'axios';
import { trackEvent } from '../analytics';
import './CareerResults.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function CareerResults({ careers }) {
  const [expandedDetails, setExpandedDetails] = useState({});
  const [isHelpful, setIsHelpful] = useState('');
  const [improvementNote, setImprovementNote] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

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

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    trackEvent('results_feedback_submitted', {
      was_helpful: isHelpful || 'not_selected',
      improvement_note_length: improvementNote.trim().length
    });

    try {
      await axios.post(`${API_URL}/feedback`, {
        helpful: isHelpful || 'not_selected',
        improvement_note: improvementNote.trim(),
        matched_count: careers.length,
        top_career: careers[0]?.title || ''
      });
    } catch (error) {
      console.error('Error saving feedback:', error);
    }

    setFeedbackSubmitted(true);
  };

  return (
    <div className="career-results">
      <div className="results-header">
        <h2>Matched Careers</h2>
        <p>Based on your military skills and interests</p>
        <div className="score-explainer">
          <strong>How match percentage works:</strong> your score is estimated from skill overlap,
          selected interest alignment, and role-description relevance. Higher percentages mean
          stronger overall alignment to typical requirements.
        </div>
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

      <div className="feedback-section">
        <h3>Was this helpful?</h3>
        {!feedbackSubmitted ? (
          <form onSubmit={handleFeedbackSubmit}>
            <div className="feedback-choice">
              <label>
                <input
                  type="radio"
                  name="helpful"
                  value="yes"
                  checked={isHelpful === 'yes'}
                  onChange={(e) => setIsHelpful(e.target.value)}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="helpful"
                  value="no"
                  checked={isHelpful === 'no'}
                  onChange={(e) => setIsHelpful(e.target.value)}
                />
                No
              </label>
            </div>

            <label htmlFor="feedback-improve">What could improve?</label>
            <textarea
              id="feedback-improve"
              rows="3"
              value={improvementNote}
              onChange={(e) => setImprovementNote(e.target.value)}
              placeholder="Share what would make these results more useful for your transition."
            />

            <button type="submit" className="feedback-btn">Submit Feedback</button>
          </form>
        ) : (
          <p className="feedback-thanks">Thanks for your feedback. It helps improve this transition tool for other veterans.</p>
        )}
      </div>
    </div>
  );
}

export default CareerResults;
