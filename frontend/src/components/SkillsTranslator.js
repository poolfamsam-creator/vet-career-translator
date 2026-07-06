import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { trackEvent } from '../analytics';
import './SkillsTranslator.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function SkillsTranslator({ selectedRoles }) {
  const [militarySkills, setMilitarySkills] = useState([]);
  const [careers, setCareers] = useState([]);
  const [targetRole, setTargetRole] = useState('');
  const [resumeSummary, setResumeSummary] = useState('');
  const [bulletPoints, setBulletPoints] = useState([]);
  const [showTranslation, setShowTranslation] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMilitarySkills();
    fetchCareers();
  }, []);

  const fetchMilitarySkills = async () => {
    try {
      const response = await axios.get(`${API_URL}/military-skills`);
      // Sort by military_term alphabetically
      const sortedSkills = response.data.sort((a, b) => 
        a.military_term.localeCompare(b.military_term)
      );
      setMilitarySkills(sortedSkills);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const fetchCareers = async () => {
    try {
      const response = await axios.get(`${API_URL}/careers`);
      setCareers(response.data || []);
    } catch (error) {
      console.error('Error fetching careers:', error);
    }
  };

  const generateTranslation = async () => {
    if (!targetRole.trim()) {
      alert('Please enter the civilian role you\'re applying for');
      return;
    }

    if (selectedRoles.length === 0) {
      alert('Please select military roles from the Career Matcher tab first');
      return;
    }

    setLoading(true);
    try {
      // Get details of selected military roles
      const selectedSkillsData = militarySkills.filter(skill => 
        selectedRoles.includes(skill.id)
      );

      // Generate professional translation
      const translation = generateProfessionalTranslation(selectedSkillsData, targetRole, careers);
      setResumeSummary(translation.summary);
      setBulletPoints(translation.bullets);
      setShowTranslation(true);

      trackEvent('generate_translation', {
        selected_roles_count: selectedRoles.length,
        target_role: targetRole.trim().slice(0, 100),
        selected_skills_found_count: selectedSkillsData.length,
        bullet_count: translation.bullets.length
      });
    } catch (error) {
      console.error('Error generating translation:', error);
      alert('Error generating translation');
    } finally {
      setLoading(false);
    }
  };

  const generateProfessionalTranslation = (skillsData, role, careersData) => {
    // Generate a professional summary
    const allCivilianSkills = [];
    const allKeySkills = [];
    
    skillsData.forEach(skill => {
      allCivilianSkills.push(...(skill.civilian_translations || []));
      allKeySkills.push(...(skill.key_skills || []));
    });

    const uniqueSkills = [...new Set(allKeySkills)];
    const skillsText = uniqueSkills.length > 0
      ? uniqueSkills.slice(0, 5).join(', ')
      : 'operations, leadership, problem solving';

    const normalizedRole = role.trim().toLowerCase();
    const matchedCareer = (careersData || []).find((career) => {
      const title = (career.title || '').toLowerCase();
      return title === normalizedRole || title.includes(normalizedRole) || normalizedRole.includes(title);
    });

    const targetSkills = matchedCareer?.required_skills || [];
    const targetIndustries = matchedCareer?.industries || [];
    const targetSkillsText = targetSkills.length > 0
      ? targetSkills.slice(0, 4).join(', ')
      : 'cross-functional leadership, communication, execution';
    const industryText = targetIndustries.length > 0
      ? targetIndustries.slice(0, 2).join(' and ')
      : 'this industry';

    const alignedSkills = uniqueSkills.filter((skill) =>
      targetSkills.some((req) => req.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(req.toLowerCase()))
    );
    const alignedSkillsText = alignedSkills.length > 0
      ? alignedSkills.slice(0, 3).join(', ')
      : targetSkillsText;

    const summary = `Results-driven professional with extensive background in ${skillsText} and proven expertise aligned to ${role} requirements including ${targetSkillsText}. Prepared to deliver measurable impact in ${industryText} by applying military-developed leadership, execution discipline, and operational excellence.`;

    // Generate bullet points
    const bullets = [
      `Demonstrated expertise as ${skillsData.map(s => s.military_term).join(' and ')}, with direct alignment to ${role} competencies in ${alignedSkillsText}`,
      `Delivered mission-critical outcomes under pressure while maintaining standards directly relevant to ${targetSkillsText}`,
      `Led and coordinated teams across complex operations, translating to strong stakeholder communication and cross-functional execution in ${industryText}`,
      `Applied disciplined process control, risk management, and compliance practices to support reliable and repeatable performance expectations`,
      `Rapidly learned and implemented new tools, systems, and procedures to meet changing operational and business requirements`,
      `Positioned military experience in civilian terms that match hiring criteria for ${role}, emphasizing impact, ownership, and results`
    ];

    return { summary, bullets };
  };

  const veteranResources = [
    {
      name: 'Veterans Affairs (VA)',
      description: 'Federal agency providing services including education, employment, and healthcare benefits for veterans.',
      link: 'https://www.va.gov'
    },
    {
      name: 'Military One Click',
      description: 'One-click access to verified military-verified discounts, jobs, and resources tailored for service members.',
      link: 'https://militaryoneclick.com'
    },
    {
      name: 'Hire Heroes USA',
      description: 'Free employment resources, resume reviews, and job coaching for post-9/11 veterans and their spouses.',
      link: 'https://www.hireheroesusa.org'
    },
    {
      name: 'Team Red White & Blue',
      description: 'Community-based nonprofit connecting veterans through fitness, social engagement, and professional development.',
      link: 'https://www.teamrwb.org'
    },
    {
      name: 'LinkedIn Veterans',
      description: 'LinkedIn\'s initiative providing job opportunities, networking, and resources specifically for veteran professionals.',
      link: 'https://www.linkedin.com/showcase/linkedin-for-veterans'
    },
    {
      name: 'Veterans Business Outreach Center',
      description: 'Federal resource offering free business counseling, training, and mentorship for veteran entrepreneurs and small business owners.',
      link: 'https://www.sba.gov/vboc'
    }
  ];

  const copyTextAndTrack = async (text, copyType) => {
    try {
      await navigator.clipboard.writeText(text);
      trackEvent('copy_translation_content', {
        copy_type: copyType,
        target_role: targetRole.trim().slice(0, 100)
      });
    } catch (error) {
      console.error('Error copying text:', error);
    }
  };

  return (
    <div className="skills-translator">
      <div className="translator-header">
        <h2>Skills Translator: Military to Civilian</h2>
        <div className="translator-intro">
          <p className="intro-title">Why This Matters for Your Job Search</p>
          <p className="intro-text">
            Military experience is valuable but often misunderstood by civilian recruiters and automated screening systems (ATS - Applicant Tracking Systems). 
            This translator helps bridge that gap by converting your military terminology into civilian professional language that resonates with hiring managers 
            and passes through resume scanning software. <strong>A well-translated resume increases your chances of getting noticed and landing interviews.</strong>
          </p>
        </div>
      </div>

      <div className="translator-content">
        <div className="translator-form">
          <div className="form-section">
            <h3>Step 1: Your Military Roles</h3>
            {selectedRoles.length > 0 ? (
              <div className="selected-roles">
                {militarySkills
                  .filter(skill => selectedRoles.includes(skill.id))
                  .map(skill => (
                    <div key={skill.id} className="role-badge">
                      {skill.military_term}
                    </div>
                  ))}
              </div>
            ) : (
              <p className="no-roles">No military roles selected. Please select roles from the Career Matcher tab first.</p>
            )}
          </div>

          <div className="form-section">
            <h3>Step 2: Target Civilian Role</h3>
            <label htmlFor="target-role">What civilian position are you applying for?</label>
            <input
              id="target-role"
              type="text"
              placeholder="e.g., Project Manager, IT Support Specialist, Operations Coordinator"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="role-input"
              onKeyPress={(e) => e.key === 'Enter' && generateTranslation()}
            />
            <p className="input-hint">Be specific about the role title you're targeting for best results</p>
          </div>

          <button 
            className="translate-btn"
            onClick={generateTranslation}
            disabled={loading}
          >
            {loading ? 'Translating...' : 'Generate Professional Translation'}
          </button>
        </div>

        {showTranslation && (
          <div className="translation-results">
            <div className="results-section">
              <h3>Professional Summary (For Your Resume)</h3>
              <div className="summary-box">
                <p>{resumeSummary}</p>
              </div>
              <button className="copy-btn" onClick={() => copyTextAndTrack(resumeSummary, 'summary')}>
                Copy to Clipboard
              </button>
            </div>

            <div className="results-section">
              <h3>Key Bullet Points (Professional Experience)</h3>
              <div className="bullets-box">
                <ul>
                  {bulletPoints.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              </div>
              <button 
                className="copy-btn" 
                onClick={() => copyTextAndTrack(bulletPoints.map((b) => `• ${b}`).join('\n'), 'bullets')}
              >
                Copy All Bullets
              </button>
            </div>

            <div className="results-section tips-section">
              <h3>Resume Tips for Veterans</h3>
              <div className="tips-grid">
                <div className="tip-card">
                  <div className="tip-title">Quantify Your Impact</div>
                  <p>Replace military jargon with measurable outcomes. "Led 50+ personnel" instead of "Squad Leader"</p>
                </div>
                <div className="tip-card">
                  <div className="tip-title">Highlight Transferable Skills</div>
                  <p>Focus on leadership, project management, teamwork, and crisis management - universally valued in any industry</p>
                </div>
                <div className="tip-card">
                  <div className="tip-title">Mirror Job Description Keywords</div>
                  <p>Use terms from the job posting in your resume. ATS systems scan for keyword matches</p>
                </div>
                <div className="tip-card">
                  <div className="tip-title">Avoid Acronyms</div>
                  <p>Explain military acronyms on first use (MOS = Military Occupational Specialty) or avoid them entirely for civilian audiences</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="veteran-resources">
        <h2>Veteran Resources & Support</h2>
        <p className="resources-intro">Explore these organizations dedicated to helping veterans transition to civilian careers:</p>
        
        <div className="resources-grid">
          {veteranResources.map((resource, idx) => (
            <div key={idx} className="resource-card">
              <h4>{resource.name}</h4>
              <p>{resource.description}</p>
              <a href={resource.link} target="_blank" rel="noopener noreferrer" className="resource-link">
                Learn More →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SkillsTranslator;
