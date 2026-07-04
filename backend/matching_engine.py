"""
Matching engine for correlating military skills to civilian careers.
Uses a weighted scoring system based on skill overlap and interests.
"""

class MatchingEngine:
    def __init__(self, military_skills, careers):
        self.military_skills = military_skills
        self.careers = careers
        self.skill_weights = {skill['id']: skill for skill in military_skills}
    
    def match_careers(self, skill_ids, interests):
        """
        Match careers based on military skills and user interests.
        
        Args:
            skill_ids: List of military skill IDs the user has
            interests: List of career interests (e.g., "leadership", "technology")
        
        Returns:
            List of matched careers sorted by match score
        """
        scored_careers = []
        
        # Get aggregated skills from military skills
        user_skills = self._aggregate_skills(skill_ids)
        user_interests_set = set(interests)
        
        for career in self.careers:
            score = self._calculate_match_score(
                career,
                user_skills,
                user_interests_set
            )
            
            if score > 0:  # Only include careers with positive matches
                scored_careers.append({
                    'id': career['id'],
                    'title': career['title'],
                    'description': career['description'],
                    'required_skills': career['required_skills'],
                    'salary_range': career['salary_range'],
                    'growth_potential': career['growth_potential'],
                    'industries': career['industries'],
                    'interests': career['interests'],
                    'certifications': career.get('certifications', []),
                    'getting_started': career.get('getting_started', []),
                    'marketing_tips': career.get('marketing_tips', []),
                    'veteran_friendly_companies': career.get('veteran_friendly_companies', []),
                    'match_score': round(score, 2),
                    'skill_match': self._get_skill_breakdown(career, user_skills),
                    'interest_match': self._get_interest_breakdown(career, user_interests_set)
                })
        
        # Sort by match score (descending)
        scored_careers.sort(key=lambda x: x['match_score'], reverse=True)
        return scored_careers
    
    def _aggregate_skills(self, skill_ids):
        """Extract all key skills from selected military skills"""
        aggregated = {}
        for skill_id in skill_ids:
            skill = next((s for s in self.military_skills if s['id'] == skill_id), None)
            if skill:
                for key_skill in skill['key_skills']:
                    aggregated[key_skill] = aggregated.get(key_skill, 0) + 1
        return aggregated
    
    def _calculate_match_score(self, career, user_skills, user_interests):
        """
        Calculate match score for a career (0-100).
        Weighted: 70% skill match, 30% interest match
        """
        skill_score = self._calculate_skill_match(career, user_skills)
        interest_score = self._calculate_interest_match(career, user_interests)
        
        # Weighted combination
        total_score = (skill_score * 0.7) + (interest_score * 0.3)
        return total_score
    
    def _calculate_skill_match(self, career, user_skills):
        """Calculate skill match percentage (0-100)"""
        if not career['required_skills']:
            return 0
        
        matched_skills = 0
        for req_skill in career['required_skills']:
            if req_skill in user_skills:
                matched_skills += 1
        
        match_percentage = (matched_skills / len(career['required_skills'])) * 100
        return match_percentage
    
    def _calculate_interest_match(self, career, user_interests):
        """Calculate interest match percentage (0-100)"""
        if not user_interests or not career['interests']:
            return 0
        
        matched_interests = len(user_interests.intersection(set(career['interests'])))
        max_possible = max(len(user_interests), len(career['interests']))
        
        if max_possible == 0:
            return 0
        
        match_percentage = (matched_interests / max_possible) * 100
        return match_percentage
    
    def _get_skill_breakdown(self, career, user_skills):
        """Get detailed skill match breakdown"""
        breakdown = []
        for req_skill in career['required_skills']:
            has_skill = req_skill in user_skills
            breakdown.append({
                'skill': req_skill,
                'matched': has_skill
            })
        return breakdown
    
    def _get_interest_breakdown(self, career, user_interests):
        """Get detailed interest match breakdown"""
        breakdown = []
        for career_interest in career['interests']:
            matched = career_interest in user_interests
            breakdown.append({
                'interest': career_interest,
                'matched': matched
            })
        return breakdown
