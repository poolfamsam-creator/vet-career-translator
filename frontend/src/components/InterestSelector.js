import React from 'react';
import './InterestSelector.css';

function InterestSelector({ availableInterests, selectedInterests, onInterestToggle }) {
  return (
    <div className="interest-selector">
      <div className="interests-grid">
        {availableInterests.map(interest => (
          <button
            key={interest}
            className={`interest-button ${selectedInterests.includes(interest) ? 'selected' : ''}`}
            onClick={() => onInterestToggle(interest)}
          >
            {interest}
          </button>
        ))}
      </div>
      {selectedInterests.length > 0 && (
        <div className="selected-interests">
          <strong>Selected Interests:</strong> {selectedInterests.join(', ')}
        </div>
      )}
    </div>
  );
}

export default InterestSelector;
