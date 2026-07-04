# 🎖️ Military Career Translator

A web application that helps military personnel translate their military skills and experience into civilian career opportunities. The tool matches military skills to civilian roles and provides career recommendations based on skills and interests.

## Features

✅ **Military Skill Translation** - Convert military job titles and tasks into civilian language suitable for resumes
✅ **Career Matching Engine** - Find careers that match your military skills with confidence scores
✅ **Interest-Based Filtering** - Refine career matches based on your personal interests
✅ **Detailed Match Breakdown** - See exactly which skills match each career opportunity
✅ **Salary & Growth Info** - Get compensation ranges and career growth potential for each match

## Project Structure

```
military-career-translator/
├── backend/
│   ├── app.py                    # Flask API server
│   ├── matching_engine.py        # Matching algorithm
│   ├── military_skills.json      # Military skills database
│   ├── careers.json              # Civilian careers database
│   └── requirements.txt          # Python dependencies
└── frontend/
    ├── public/
    │   └── index.html            # HTML template
    ├── src/
    │   ├── App.js                # Main React component
    │   ├── App.css               # Styling
    │   ├── index.js              # React entry point
    │   ├── index.css             # Global styles
    │   └── components/
    │       ├── SkillSelector.js      # Military skill selection
    │       ├── SkillSummary.js       # Selected skills summary
    │       ├── InterestSelector.js   # Interest filter
    │       └── CareerResults.js      # Career match results
    └── package.json              # Node dependencies
```

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+ and npm

### Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (optional but recommended):**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Flask server:**
   ```bash
   python app.py
   ```
   
   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **In a new terminal, navigate to frontend folder:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the React development server:**
   ```bash
   npm start
   ```
   
   The app will open at `http://localhost:3000`

## How to Use

1. **Select Your Military Skills**: Choose all military skills/roles that apply to your experience
2. **View Skill Summary**: See your selected skills and aggregated competencies
3. **Add Interests (Optional)**: Filter careers by your personal interests
4. **Find Matches**: Click "Find Matching Careers" to see recommended civilian careers
5. **Review Results**: Each career shows:
   - Match score (0-100%)
   - Required skills (with matching breakdown)
   - Salary range
   - Growth potential
   - Related industries

## Matching Algorithm

The matching engine uses a weighted scoring system:

- **70% Skill Match**: Based on overlap between your military skills and career requirements
- **30% Interest Match**: Based on alignment between your interests and career interests

Careers are scored 0-100 and sorted by match score.

## Data Files

### military_skills.json
Defines military roles and their:
- Military terminology
- Civilian translations
- Key competencies
- Related career paths

### careers.json
Defines civilian careers with:
- Job title and description
- Required skills
- Salary ranges
- Growth potential
- Industries
- Career interests

## Extending the Tool

### Add More Military Skills
Edit `backend/military_skills.json` and add new entries following this format:
```json
{
  "id": "unique_id",
  "military_term": "Military Job Title",
  "description": "Description of the role",
  "civilian_translations": ["Civilian Job 1", "Civilian Job 2"],
  "key_skills": ["skill1", "skill2"],
  "related_careers": ["career_type1", "career_type2"]
}
```

### Add More Careers
Edit `backend/careers.json` and add new career entries:
```json
{
  "id": "unique_id",
  "title": "Job Title",
  "description": "Job description",
  "required_skills": ["skill1", "skill2"],
  "salary_range": "$XX,000 - $YY,000",
  "growth_potential": "High|Medium|Low",
  "industries": ["Industry1", "Industry2"],
  "interests": ["interest1", "interest2"]
}
```

## API Endpoints

### GET `/api/military-skills`
Get all available military skills

### POST `/api/translate-skill`
Translate a specific military skill
```json
{ "skill_id": "leadership" }
```

### POST `/api/match-careers`
Find matching careers
```json
{
  "skill_ids": ["leadership", "communications"],
  "interests": ["technology", "management"]
}
```

### GET `/api/careers`
Get all available civilian careers

### GET `/api/interests`
Get all available career interests

### POST `/api/skills-summary`
Get summary of selected skills
```json
{ "skill_ids": ["leadership", "logistics"] }
```

## Technologies Used

- **Frontend**: React, Axios
- **Backend**: Flask, Flask-CORS
- **Data**: JSON files
- **Styling**: CSS3 with gradients and animations

## Future Enhancements

- 📊 Machine Learning-based skill matching
- 📚 Larger skill and career database
- 💾 User profiles and saved results
- 📱 Mobile-optimized interface
- 📄 Resume generator
- 🔗 LinkedIn integration
- 🌐 Multi-language support

## License

This project is open source and available for military transition programs.

## Support

For issues, suggestions, or to contribute, please create an issue or pull request.

---

**Happy career transitioning! 🚀**
