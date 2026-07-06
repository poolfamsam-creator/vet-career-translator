from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
from datetime import datetime
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
feedback_file = Path(__file__).parent / 'feedback_submissions.jsonl'

# Initialize matching engine
matcher = MatchingEngine(military_skills, careers)


def refine_resume_summary(summary, target_role):
    """Refine generated summary text to be sharper and more role-focused."""
    text = (summary or '').strip()
    role_label = (target_role or 'the target role').strip()
    if not text:
        return text

    text = text.replace('Results-driven professional', 'Impact-focused professional')
    text = text.replace('Prepared to deliver measurable impact', f'Positioned to deliver measurable outcomes as a {role_label}')
    text = text.replace('military-developed leadership', 'mission-proven leadership')
    text = text.replace('operational excellence', 'reliable execution')
    text = text.replace('seen across listings for', 'mapped to role requirements from')

    if 'Positioned to deliver measurable outcomes' not in text:
        text = f"{text} Positioned to deliver measurable outcomes as a {role_label}."

    text = ' '.join(text.split())
    if not text.endswith('.'):
        text = f"{text}."

    return text


def refine_resume_bullets(bullets, target_role):
    """Refine generated bullets into concise, civilian-first impact statements."""
    refined = []
    banned_phrases = [
        'translated military',
        'civilian job language',
        'civilian terms',
        'positioned military experience',
        'applying for',
        'apply for',
        'role expectations',
        'hiring criteria',
        'target role',
        'job role',
        'listings such as',
        'reflected in listings'
    ]

    for bullet in bullets or []:
        text = (bullet or '').strip()
        if not text:
            continue

        lowered = text.lower()
        if any(phrase in lowered for phrase in banned_phrases):
            continue

        text = text.replace('Applied experience from', 'Leveraged experience from')
        text = text.replace('Delivered reliable outcomes in high-pressure environments', 'Consistently delivered outcomes in high-pressure environments')
        text = text.replace('Coordinated teams and resources across complex operations', 'Led teams and coordinated resources across complex operations')
        text = text.replace('Implemented disciplined risk controls and process improvements', 'Implemented disciplined risk controls and process improvements that increased execution reliability')
        text = text.replace('Quickly adopted new systems, tools, and workflows', 'Rapidly adopted new systems, tools, and workflows')
        text = text.replace('support', 'advance')

        if 'including' in text:
            text = text.replace('including', 'with direct alignment to')

        text = text.strip()
        text = ' '.join(text.split())

        if not text.endswith('.'):
            text = f"{text}."

        refined.append(text)

    # Keep output tight and unique for resumes.
    unique_refined = []
    seen = set()
    for line in refined:
        normalized = line.lower()
        if normalized in seen:
            continue
        seen.add(normalized)
        unique_refined.append(line)

    return unique_refined[:5]


def save_feedback_submission(payload):
    record = {
        'submitted_at': datetime.utcnow().isoformat(timespec='seconds') + 'Z',
        'helpful': payload.get('helpful', ''),
        'improvement_note': payload.get('improvement_note', ''),
        'matched_count': payload.get('matched_count', 0),
        'top_career': payload.get('top_career', '')
    }

    with open(feedback_file, 'a', encoding='utf-8') as f:
        f.write(json.dumps(record, ensure_ascii=True) + '\n')


def read_feedback_submissions(limit=50):
    if not feedback_file.exists():
        return []

    with open(feedback_file, 'r', encoding='utf-8') as f:
        lines = [line.strip() for line in f if line.strip()]

    submissions = []
    for line in reversed(lines[-limit:]):
        try:
            submissions.append(json.loads(line))
        except json.JSONDecodeError:
            continue

    return submissions

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


@app.route('/api/refine-translation', methods=['POST'])
def refine_translation():
    """Refine generated resume content into stronger civilian language."""
    data = request.json or {}
    summary = data.get('summary', '')
    bullets = data.get('bullets', [])
    target_role = data.get('target_role', '')

    if not summary and not bullets:
        return jsonify({'error': 'Summary or bullets are required'}), 400

    return jsonify({
        'summary': refine_resume_summary(summary, target_role),
        'bullets': refine_resume_bullets(bullets, target_role)
    })


@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    """Store user feedback from career results page."""
    data = request.json or {}
    save_feedback_submission(data)
    return jsonify({'status': 'saved'})


@app.route('/api/feedback-submissions', methods=['GET'])
def get_feedback_submissions():
    """Return recent feedback submissions for review."""
    try:
        limit = int(request.args.get('limit', '50'))
    except ValueError:
        limit = 50

    limit = max(1, min(limit, 200))
    return jsonify(read_feedback_submissions(limit))

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
