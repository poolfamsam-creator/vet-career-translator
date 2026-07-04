import React from 'react';
import './RoleDescriptionInput.css';

function RoleDescriptionInput({ roleDescription, onRoleDescriptionChange }) {
  return (
    <div className="role-description-input">
      <h2>3. Describe Your Role (Optional)</h2>
      <p className="description-hint">
        Provide details about your military role, responsibilities, or achievements. This helps us find more relevant civilian careers.
      </p>
      <textarea
        className="description-textarea"
        placeholder="e.g., Led a team of 15 personnel, managed logistics operations, coordinated with multiple departments..."
        value={roleDescription}
        onChange={(e) => onRoleDescriptionChange(e.target.value)}
        rows="5"
      />
      <div className="character-count">{roleDescription.length} characters</div>
    </div>
  );
}

export default RoleDescriptionInput;
