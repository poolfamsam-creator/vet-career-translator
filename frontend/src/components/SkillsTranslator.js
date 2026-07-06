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
  const [listingReferences, setListingReferences] = useState([]);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showTranslationNotice, setShowTranslationNotice] = useState(false);
  const [refining, setRefining] = useState(false);
  const [refinementApplied, setRefinementApplied] = useState(false);
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
      setListingReferences(translation.listingReferences || []);
      setShowTranslation(true);
      setShowTranslationNotice(true);
      setRefinementApplied(false);

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
    const roleTokens = role
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean);

    const allKeySkills = [];
    
    skillsData.forEach(skill => {
      allKeySkills.push(...(skill.key_skills || []));
    });

    const uniqueSkills = [...new Set(allKeySkills.map((s) => s.toLowerCase()))];

    const rankedListings = (careersData || [])
      .map((career) => {
        const title = (career.title || '').toLowerCase();
        const description = (career.description || '').toLowerCase();
        const titleTokenMatches = roleTokens.filter((token) => title.includes(token)).length;
        const descriptionTokenMatches = roleTokens.filter((token) => description.includes(token)).length;
        const requiredSkills = (career.required_skills || []).map((s) => s.toLowerCase());
        const skillOverlap = requiredSkills.filter((req) =>
          uniqueSkills.some((skill) => req.includes(skill) || skill.includes(req))
        ).length;

        return {
          ...career,
          rankScore: titleTokenMatches * 4 + descriptionTokenMatches + skillOverlap * 3
        };
      })
      .filter((career) => career.rankScore > 0)
      .sort((a, b) => b.rankScore - a.rankScore)
      .slice(0, 3);

    const fallbackListing = (careersData || []).slice(0, 2);
    const selectedListings = rankedListings.length > 0 ? rankedListings : fallbackListing;
    const listingReferences = selectedListings.map((listing) => listing.title);

    const requiredSkillsPool = [...new Set(
      selectedListings.flatMap((listing) => listing.required_skills || []).map((s) => s.toLowerCase())
    )];

    const industriesPool = [...new Set(
      selectedListings.flatMap((listing) => listing.industries || [])
    )];

    const alignedSkills = uniqueSkills.filter((skill) =>
      requiredSkillsPool.some((req) => req.includes(skill) || skill.includes(req))
    );

    const uniqueMatchedSkills = [...new Set(alignedSkills)].slice(0, 6);
    const skillsText = uniqueSkills.length > 0
      ? uniqueSkills.slice(0, 5).join(', ')
      : 'operations, leadership, problem solving';

    const targetSkillsText = requiredSkillsPool.length > 0
      ? requiredSkillsPool.slice(0, 5).join(', ')
      : 'cross-functional leadership, communication, execution';
    const industryText = industriesPool.length > 0
      ? industriesPool.slice(0, 2).join(' and ')
      : 'this industry';

    const alignedSkillsText = uniqueMatchedSkills.length > 0
      ? uniqueMatchedSkills.slice(0, 4).join(', ')
      : targetSkillsText;

    const listingReferenceText = listingReferences.length > 0
      ? listingReferences.join(', ')
      : 'similar civilian job listings';

    const summary = `Results-driven professional with extensive background in ${skillsText} and proven expertise aligned to ${role} requirements seen across listings for ${listingReferenceText}. Prepared to deliver measurable impact in ${industryText} through role-relevant strengths in ${targetSkillsText}.`;

    const roleExperience = skillsData.map((s) => s.military_term).join(', ');
    const candidateBullets = [
      `Applied ${roleExperience} experience to core business priorities including ${alignedSkillsText}.`,
      `Delivered reliable outcomes in high-pressure environments while maintaining standards expected for ${targetSkillsText}.`,
      `Coordinated teams and resources across complex operations to improve execution, communication, and delivery outcomes.`,
      `Implemented disciplined risk controls and process improvements that supported consistent results across ${industryText}.`,
      `Quickly adopted new systems, tools, and workflows to meet changing business requirements in ${industryText}.`,
      `Prioritized safety, compliance, and execution discipline to strengthen performance across ${industryText}.`
    ];

    const seen = new Set();
    const bullets = candidateBullets.filter((bullet) => {
      const normalized = bullet.toLowerCase();
      if (seen.has(normalized)) {
        return false;
      }
      seen.add(normalized);
      return true;
    });

    return { summary, bullets, listingReferences };
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

  const handleRefineWithAI = async () => {
    if (!showTranslation) {
      return;
    }

    setRefining(true);
    try {
      const response = await axios.post(`${API_URL}/refine-translation`, {
        target_role: targetRole,
        summary: resumeSummary,
        bullets: bulletPoints
      });

      setResumeSummary(response.data.summary || resumeSummary);
      setBulletPoints(response.data.bullets || bulletPoints);
      setRefinementApplied(true);

      trackEvent('refine_translation_ai', {
        target_role: targetRole.trim().slice(0, 100),
        bullet_count: (response.data.bullets || []).length
      });
    } catch (error) {
      console.error('Error refining translation:', error);
      alert('Unable to refine translation right now. Please try again.');
    } finally {
      setRefining(false);
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
        {showTranslationNotice && (
          <div className="translation-complete-notice" role="status" aria-live="polite">
            Translation complete. Your civilian-ready resume summary and bullet points are below.
          </div>
        )}

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
            {listingReferences.length > 0 && (
              <div className="listing-reference-box">
                <strong>Job listings referenced:</strong> {listingReferences.join(', ')}
              </div>
            )}

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

            <div className="translation-actions">
              <button
                type="button"
                className="refine-btn"
                onClick={handleRefineWithAI}
                disabled={refining}
              >
                {refining ? 'Refining with AI...' : 'Improve Translation with AI Refinement'}
              </button>
              {refinementApplied && (
                <p className="refined-status">AI refinement applied. Your resume language has been strengthened.</p>
              )}
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
