'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { CareerAnalysis } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import toast from 'react-hot-toast';
import {
  Briefcase, Upload, FileText, TrendingUp, Target,
  Award, BookOpen, Users, Sparkles, CheckCircle, ArrowRight, Zap, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CareerPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<CareerAnalysis | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const data = await api.getCurrentCareerAnalysis();
      setAnalysis(data);
    } catch (error: any) {
      // No analysis yet - this is fine
      if (error.response?.status !== 404) {
        toast.error('Failed to load career analysis');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      toast.loading('Uploading and analyzing resume...', { id: 'resume-upload' });
      
      // Upload and analyze in one call
      const { resume, analysis: analysisData } = await api.uploadAndAnalyzeResume(file);
      
      setAnalysis(analysisData);
      toast.success('Resume analyzed successfully!', { id: 'resume-upload' });
    } catch (error: any) {
      console.error('Resume analysis error:', error);
      toast.error(
        error.response?.data?.detail || 'Failed to analyze resume. Please try again.',
        { id: 'resume-upload' }
      );
    } finally {
      setUploading(false);
      // Reset input so same file can be uploaded again
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // No analysis yet - show upload prompt
  if (!analysis) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-12 text-white shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full -ml-36 -mb-36" />
          <div className="relative text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-block p-4 bg-white/20 backdrop-blur-sm rounded-2xl mb-6"
            >
              <Briefcase className="w-16 h-16" />
            </motion.div>
            <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-3">
              Career Guidance Center
              <Sparkles className="h-8 w-8 text-yellow-300" />
            </h1>
            <p className="text-blue-100 text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Upload your resume to receive AI-powered career insights, personalized recommendations, 
              and targeted skill development advice to advance your career.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mb-6"
            >
              <label
                htmlFor="resume-upload"
                className={`inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 rounded-2xl hover:bg-blue-50 cursor-pointer transition-all shadow-2xl font-bold text-lg ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Analyzing Your Resume...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6" />
                    <span>Upload Resume</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </label>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </motion.div>

            <div className="text-blue-100 text-sm font-medium">
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Supported formats: PDF, DOC, DOCX (Max 10MB)
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -8, scale: 1.02 }}
          >
            <Card className="p-8 border-0 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-br from-blue-50 to-cyan-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl w-fit mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">Career Recommendations</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get personalized career path suggestions based on your skills and experience
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -8, scale: 1.02 }}
          >
            <Card className="p-8 border-0 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-br from-green-50 to-emerald-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl w-fit mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">Skill Gap Analysis</h3>
                <p className="text-gray-600 leading-relaxed">
                  Identify missing skills and receive learning recommendations
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -8, scale: 1.02 }}
          >
            <Card className="p-8 border-0 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-br from-purple-50 to-pink-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl w-fit mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">Interview Preparation</h3>
                <p className="text-gray-600 leading-relaxed">
                  Access role-specific interview questions and best practices
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show analysis results
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-xl"
            >
              <Briefcase className="h-10 w-10" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-2">
                Career Analysis
                <Star className="h-8 w-8 text-yellow-300" />
              </h1>
              <p className="text-blue-100 text-lg mt-1">AI-Powered Career Insights</p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <label
              htmlFor="resume-reupload"
              className={`inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 cursor-pointer transition-all shadow-xl font-bold ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Update Resume</span>
                </>
              )}
            </label>
            <input
              id="resume-reupload"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6">
            <div className="flex items-start gap-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg"
              >
                <FileText className="w-10 h-10 text-white" />
              </motion.div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2 text-gray-900">{analysis.resume_filename}</h2>
                <p className="text-gray-600 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Analyzed on {new Date(analysis.analyzed_at).toLocaleDateString()}
                </p>
                {analysis.overall_assessment && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-5 shadow-lg"
                  >
                    <div className="flex items-start gap-3">
                      <Zap className="w-6 h-6 flex-shrink-0 mt-0.5" />
                      <p className="leading-relaxed font-medium">{analysis.overall_assessment}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Career Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <div className="flex items-center gap-3 text-white">
                <Briefcase className="w-7 h-7" />
                <h2 className="text-2xl font-bold">Career Recommendations</h2>
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </div>
            </div>
            <div className="p-6 space-y-6">
              {analysis.recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-blue-50 to-purple-50 border-l-4 border-blue-600 rounded-xl p-6 shadow-md hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-2xl text-gray-900">{rec.role_title}</h3>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-bold shadow-lg">
                      <Award className="w-5 h-5" />
                      <span>{rec.match_percentage}%</span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed text-lg">{rec.description}</p>
                  
                  {rec.required_skills && rec.required_skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-600" />
                        Required Skills:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {rec.required_skills.map((skill, idx) => (
                          <motion.span
                            key={idx}
                            whileHover={{ scale: 1.1 }}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-semibold shadow-md"
                          >
                            {skill}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-6 text-sm">
                    {rec.growth_potential && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg font-semibold">
                        <TrendingUp className="w-4 h-4" />
                        <span>{rec.growth_potential}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Skill Gaps */}
      {analysis.skill_gaps && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6">
              <div className="flex items-center gap-3 text-white">
                <Target className="w-7 h-7" />
                <h2 className="text-2xl font-bold">Skill Development Areas</h2>
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* High Priority Skills */}
              {analysis.skill_gaps.high_priority && analysis.skill_gaps.high_priority.length > 0 && (
                <div>
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-red-600">
                    <Zap className="w-6 h-6" />
                    High Priority Skills
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.skill_gaps.high_priority.map((skill: string, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-5 shadow-md hover:shadow-xl transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg">
                            <Target className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-bold text-lg text-red-900">{skill}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medium Priority Skills */}
              {analysis.skill_gaps.medium_priority && analysis.skill_gaps.medium_priority.length > 0 && (
                <div>
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-orange-600">
                    <Award className="w-6 h-6" />
                    Medium Priority Skills
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {analysis.skill_gaps.medium_priority.map((skill: string, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg p-4 shadow-md hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-orange-600" />
                          <span className="font-semibold text-orange-900">{skill}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Low Priority Skills */}
              {analysis.skill_gaps.low_priority && analysis.skill_gaps.low_priority.length > 0 && (
                <div>
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-yellow-600">
                    <BookOpen className="w-6 h-6" />
                    Nice to Have Skills
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {analysis.skill_gaps.low_priority.map((skill: string, index: number) => (
                      <motion.span
                        key={index}
                        whileHover={{ scale: 1.1 }}
                        className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-300 rounded-full font-semibold shadow-sm hover:shadow-md transition-all"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Interview Preparation */}
      {analysis.interview_prep && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
              <div className="flex items-center gap-3 text-white">
                <Users className="w-7 h-7" />
                <h2 className="text-2xl font-bold">Interview Preparation</h2>
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </div>
            </div>
            <div className="p-6">
              {analysis.interview_prep.common_questions && 
               analysis.interview_prep.common_questions.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-gray-900">
                    <Target className="w-6 h-6 text-green-600" />
                    Common Interview Questions
                  </h3>
                  <div className="space-y-4">
                    {analysis.interview_prep.common_questions.map((question, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-600 rounded-xl p-5 shadow-md hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-green-600 text-white rounded-lg font-bold text-sm">
                            Q{index + 1}
                          </div>
                          <p className="font-semibold text-green-900 text-lg leading-relaxed">{question}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.interview_prep.tips && analysis.interview_prep.tips.length > 0 && (
                <div>
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-gray-900">
                    <Sparkles className="w-6 h-6 text-green-600" />
                    Pro Interview Tips
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.interview_prep.tips.map((tip, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        className="flex items-start gap-3 bg-white border-2 border-green-200 rounded-xl p-4 shadow-md hover:shadow-lg transition-all"
                      >
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 leading-relaxed font-medium">{tip}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.02 }}
      >
        <Button
          onClick={() => router.push('/dashboard/career/recommendations')}
          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-6 text-lg font-bold rounded-xl shadow-2xl hover:shadow-3xl transition-all"
        >
          View All Recommendations
          <ArrowRight className="w-6 h-6 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}
