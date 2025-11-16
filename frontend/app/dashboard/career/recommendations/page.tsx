'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { CareerRecommendation } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import toast from 'react-hot-toast';
import { Briefcase, TrendingUp, Award, Target, BookOpen, ArrowRight, Sparkles, Zap, Star, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState<any>(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      
      // Get latest resume first
      const latestResume = await api.getLatestResume();
      if (!latestResume) {
        setRecommendations(null);
        setResume(null);
        return;
      }
      
      setResume(latestResume);
      
      // Get recommendations using the resume ID
      const data = await api.getCareerRecommendations(latestResume.id);
      setRecommendations(data);
    } catch (error: any) {
      const errorMessage = error.message || error.response?.data?.detail || 'Failed to load recommendations';
      toast.error(errorMessage);
      console.error('Recommendations error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!recommendations || !recommendations.recommendations || Object.keys(recommendations.recommendations).length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-12 text-center">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">No Recommendations Available</h2>
          <p className="text-gray-600 mb-6">
            {!resume 
              ? 'Upload your resume first to get personalized career recommendations'
              : recommendations?.message || 'Upload study materials to get personalized recommendations based on your learning profile'}
          </p>
          <a
            href="/dashboard/career"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            {!resume ? 'Upload Resume' : 'Go to Career Dashboard'}
            <ArrowRight className="w-4 h-4" />
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Sparkles className="w-10 h-10 text-yellow-300" />
            </motion.div>
            <h1 className="text-4xl font-bold">Career Recommendations</h1>
          </div>
          <p className="text-blue-100 text-lg ml-13">
            Personalized AI-powered recommendations based on your resume and learning profile
          </p>
        </div>
      </motion.div>

      {/* User Learning Profile */}
      {recommendations.interest_profile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="w-7 h-7" />
                Your Learning Profile
              </h2>
              <p className="text-blue-100 mt-1">Skills and domains from your study materials</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.interest_profile.primary_domains && recommendations.interest_profile.primary_domains.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-2">Primary Domains</h3>
                <div className="flex flex-wrap gap-2">
                  {recommendations.interest_profile.primary_domains.map((domain: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {domain}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {recommendations.interest_profile.top_skills && recommendations.interest_profile.top_skills.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-2">Learned Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {recommendations.interest_profile.top_skills.slice(0, 5).map((skill: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {recommendations.interest_profile.top_topics && recommendations.interest_profile.top_topics.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-2">Top Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {recommendations.interest_profile.top_topics.slice(0, 5).map((topic: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Skills to Add */}
      {recommendations.recommendations.skills_to_add && recommendations.recommendations.skills_to_add.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Target className="w-7 h-7" />
                Skills to Add to Your Resume
              </h2>
              <p className="text-green-100 mt-1">Enhance your profile with these learned skills</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-green-50/50 to-emerald-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.recommendations.skills_to_add.map((skill: any, idx: number) => {
                  const skillName = typeof skill === 'string' ? skill : (skill.skill || skill.name || 'Skill');
                  const reason = typeof skill === 'object' && skill.reason ? skill.reason : '';
                  const priority = typeof skill === 'object' && skill.priority ? skill.priority : 'medium';
                  
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.03, y: -4 }}
                      className="bg-white border-2 border-green-200 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-green-900 text-lg flex items-center gap-2">
                          <Star className="w-5 h-5 text-green-600" />
                          {skillName}
                        </h3>
                      </div>
                      {reason && <p className="text-sm text-green-700 mb-3 leading-relaxed">{reason}</p>}
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${
                        priority === 'high' ? 'bg-red-500 text-white' :
                        priority === 'medium' ? 'bg-yellow-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        <Zap className="w-3 h-3" />
                        {priority} priority
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Projects to Add */}
      {recommendations.recommendations.projects_to_add && recommendations.recommendations.projects_to_add.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Briefcase className="w-7 h-7" />
                Recommended Projects to Showcase
              </h2>
              <p className="text-blue-100 mt-1">Build impressive projects to demonstrate your skills</p>
            </div>
            <div className="p-6 space-y-4 bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
            {recommendations.recommendations.projects_to_add.map((project: any, idx: number) => {
              const projectIdea = typeof project === 'string' ? project : (project.project_idea || project.title || project.name || 'Project');
              const description = typeof project === 'object' && project.description ? project.description : '';
              const technologies = typeof project === 'object' && Array.isArray(project.technologies) ? project.technologies : [];
              const estimatedTime = typeof project === 'object' && project.estimated_time ? project.estimated_time : null;
              
              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="bg-white border-2 border-blue-200 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <h3 className="font-bold text-blue-900 mb-2 text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-blue-600" />
                    {projectIdea}
                  </h3>
                  {description && <p className="text-sm text-blue-800 mb-3 leading-relaxed">{description}</p>}
                  {technologies.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-bold text-blue-900 mb-2">Technologies:</p>
                      <div className="flex flex-wrap gap-2">
                        {technologies.map((tech: any, techIdx: number) => (
                          <span key={techIdx} className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-xs font-medium shadow-sm">
                            {typeof tech === 'string' ? tech : tech.name || 'Tech'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {estimatedTime && (
                    <p className="text-xs text-blue-700 font-medium flex items-center gap-1">
                      <span>⏱️ Estimated time: {estimatedTime}</span>
                    </p>
                  )}
                </motion.div>
              );
            })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Certifications to Pursue */}
      {recommendations.recommendations.certifications_to_pursue && recommendations.recommendations.certifications_to_pursue.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Award className="w-7 h-7" />
                Recommended Certifications
              </h2>
              <p className="text-purple-100 mt-1">Boost your credentials with industry-recognized certifications</p>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
            {recommendations.recommendations.certifications_to_pursue.map((cert: any, idx: number) => {
              const certName = typeof cert === 'string' ? cert : (cert.certification_name || cert.name || 'Certification');
              const provider = typeof cert === 'object' && cert.provider ? cert.provider : '';
              const reason = typeof cert === 'object' && cert.reason ? cert.reason : '';
              const duration = typeof cert === 'object' && cert.duration ? cert.duration : null;
              const difficulty = typeof cert === 'object' && cert.difficulty ? cert.difficulty : null;
              const costEstimate = typeof cert === 'object' && cert.cost_estimate ? cert.cost_estimate : null;
              
              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="bg-white border-2 border-purple-200 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <Award className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-bold text-purple-900 text-lg">{certName}</h3>
                      {provider && <p className="text-sm text-purple-700 font-medium mt-1">{provider}</p>}
                    </div>
                  </div>
                  {reason && <p className="text-xs text-purple-700 mb-3 leading-relaxed">{reason}</p>}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {duration && (
                      <span className="px-3 py-1.5 bg-purple-500 text-white rounded-full font-medium">
                        📅 {duration}
                      </span>
                    )}
                    {difficulty && (
                      <span className="px-3 py-1.5 bg-pink-500 text-white rounded-full font-medium">
                        {difficulty}
                      </span>
                    )}
                    {costEstimate && (
                      <span className="px-3 py-1.5 bg-purple-600 text-white rounded-full font-medium">
                        💰 {costEstimate}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Job Roles Suited */}
      {recommendations.recommendations.job_roles_suited && recommendations.recommendations.job_roles_suited.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Briefcase className="w-7 h-7" />
                Job Roles You're Suited For
              </h2>
              <p className="text-orange-100 mt-1">Career paths matching your skills and interests</p>
            </div>
            <div className="p-6 space-y-4 bg-gradient-to-br from-orange-50/50 to-red-50/50">
            {recommendations.recommendations.job_roles_suited.map((role: any, idx: number) => {
              const roleTitle = typeof role === 'string' ? role : (role.role_title || role.title || role.name || 'Job Role');
              const description = typeof role === 'object' && role.description ? role.description : '';
              const matchScore = typeof role === 'object' && role.match_score ? role.match_score : null;
              const requiredSkills = typeof role === 'object' && Array.isArray(role.required_skills) ? role.required_skills : [];
              const salaryRange = typeof role === 'object' && role.salary_range ? role.salary_range : null;
              
              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="bg-white border-2 border-orange-200 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-orange-900 text-xl flex items-center gap-2">
                      <Briefcase className="w-6 h-6 text-orange-600" />
                      {roleTitle}
                    </h3>
                    {matchScore && (
                      <div className="text-center">
                        <div className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-bold shadow-lg">
                          {matchScore}% Match
                        </div>
                      </div>
                    )}
                  </div>
                  {matchScore && (
                    <div className="mb-4">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${matchScore}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                        />
                      </div>
                    </div>
                  )}
                  {description && <p className="text-sm text-orange-800 mb-4 leading-relaxed">{description}</p>}
                  {requiredSkills.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-bold text-orange-900 mb-2 flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        Required Skills:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {requiredSkills.map((skill: any, skillIdx: number) => (
                          <span key={skillIdx} className="px-3 py-1 bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-full text-xs font-medium shadow-sm">
                            {typeof skill === 'string' ? skill : skill.name || 'Skill'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {salaryRange && (
                    <p className="text-sm text-orange-700 font-bold flex items-center gap-1">
                      💵 Salary Range: {salaryRange}
                    </p>
                  )}
                </motion.div>
              );
            })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Immediate Actions */}
      {recommendations.recommendations.immediate_actions && recommendations.recommendations.immediate_actions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Target className="w-7 h-7" />
                Immediate Actions
              </h2>
              <p className="text-red-100 mt-1">Start with these high-priority tasks today</p>
            </div>
            <div className="p-6 space-y-3 bg-gradient-to-br from-red-50/50 to-pink-50/50">
            {recommendations.recommendations.immediate_actions.map((action: any, idx: number) => {
              const actionText = typeof action === 'string' ? action : action.action || action.step || JSON.stringify(action);
              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="flex items-start gap-4 bg-white rounded-xl p-4 border-2 border-red-200 shadow-md hover:shadow-lg transition-all"
                >
                  <motion.span
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-red-600 to-pink-600 text-white rounded-full text-sm font-bold flex-shrink-0 shadow-lg"
                  >
                    {idx + 1}
                  </motion.span>
                  <p className="text-gray-800 pt-1 leading-relaxed font-medium">{actionText}</p>
                </motion.div>
              );
            })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Learning Path */}
      {recommendations.recommendations.learning_path && recommendations.recommendations.learning_path.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-7 h-7" />
                Your Learning Path
              </h2>
              <p className="text-indigo-100 mt-1">Step-by-step roadmap to achieve your goals</p>
            </div>
            <div className="p-6 space-y-4 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
            {recommendations.recommendations.learning_path.map((step: any, idx: number) => {
              // Handle both string and object formats
              const stepText = typeof step === 'string' ? step : step.step || step.action || JSON.stringify(step);
              const timeframe = typeof step === 'object' && step.timeframe ? step.timeframe : null;
              const resources = typeof step === 'object' && step.resources ? step.resources : null;
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 + 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-start gap-4"
                >
                  <motion.span
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full text-base font-bold flex-shrink-0 shadow-lg"
                  >
                    {idx + 1}
                  </motion.span>
                  <div className="bg-white border-2 border-indigo-200 rounded-xl p-5 flex-1 shadow-md hover:shadow-lg transition-shadow">
                    <p className="text-indigo-900 font-semibold text-base leading-relaxed">{stepText}</p>
                    {timeframe && (
                      <p className="text-sm text-indigo-700 mt-2 flex items-center gap-1 font-medium">
                        ⏱️ {timeframe}
                      </p>
                    )}
                    {resources && Array.isArray(resources) && resources.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-bold text-indigo-900 mb-2 flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          Resources:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {resources.map((resource: any, rIdx: number) => (
                            <span key={rIdx} className="text-xs bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1.5 rounded-full font-medium shadow-sm">
                              {typeof resource === 'string' ? resource : resource.name || 'Resource'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
