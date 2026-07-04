from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
from pathlib import Path
from matching_engine import MatchingEngine

app = Flask(__name__)
CORS(app)

# Load data files
def load_json_file(filename):
    # Get the directory where this script is located
    base_dir = Path(__file__).parent
    filepath = base_dir / filename
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

military_skills = load_json_file('military_skills.json')['military_skills']
careers = load_json_file('careers.json')['careers']

# Initialize matching engine
matcher = MatchingEngine(military_skills, careers)

@app.route('/api/military-skills', methods=['GET'])
def get_military_skills():
    """Get all military skills for the dropdown"""
    skills_list = [
        {
            'id': skill['id'],
            'military_term': skill['military_term'],
            'civilian_translations': skill['civilian_translations'],
            'key_skills': skill.get('key_skills', [])
        }
        for skill in military_skills
    ]
    return jsonify(skills_list)

@app.route('/api/translate-skill', methods=['POST'])
def translate_skill():
    """Translate a military skill to civilian language"""
    data = request.json
    skill_id = data.get('skill_id')
    
    skill = next((s for s in military_skills if s['id'] == skill_id), None)
    if not skill:
        return jsonify({'error': 'Skill not found'}), 404
    
    return jsonify({
        'military_term': skill['military_term'],
        'description': skill['description'],
        'civilian_translations': skill['civilian_translations'],
        'key_skills': skill['key_skills']
    })

@app.route('/api/match-careers', methods=['POST'])
def match_careers():
    """Match careers based on military skills"""
    data = request.json
    skill_ids = data.get('skill_ids', [])
    interests = data.get('interests', [])
    
    if not skill_ids and not interests:
        return jsonify({'error': 'At least one skill or interest is required'}), 400
    
    matched_careers = matcher.match_careers(skill_ids, interests)
    return jsonify(matched_careers)

@app.route('/api/careers', methods=['GET'])
def get_all_careers():
    """Get all available careers"""
    return jsonify(careers)

@app.route('/api/skills-summary', methods=['POST'])
def skills_summary():
    """Get a summary of selected skills"""
    data = request.json
    skill_ids = data.get('skill_ids', [])
    
    selected_skills = [s for s in military_skills if s['id'] in skill_ids]
    
    # Aggregate key skills
    all_key_skills = {}
    for skill in selected_skills:
        for key_skill in skill['key_skills']:
            all_key_skills[key_skill] = all_key_skills.get(key_skill, 0) + 1
    
    return jsonify({
        'selected_skills': [
            {
                'id': s['id'],
                'military_term': s['military_term'],
                'civilian_translations': s['civilian_translations']
            }
            for s in selected_skills
        ],
        'aggregated_skills': sorted(
            all_key_skills.items(),
            key=lambda x: x[1],
            reverse=True
        )
    })

@app.route('/api/interests', methods=['GET'])
def get_interests():
    """Get all available interests for filtering"""
    all_interests = set()
    for career in careers:
        all_interests.update(career['interests'])
    return jsonify(sorted(list(all_interests)))

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
