'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { CareerRecommendation } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import toast from 'react-hot-toast';
import { Briefcase, TrendingUp, Award, Target, BookOpen, ArrowRight } from 'lucide-react';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const data = await api.getCareerRecommendations();
      setRecommendations(data);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to load recommendations');
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

  if (recommendations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-12 text-center">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">No Recommendations Available</h2>
          <p className="text-gray-600 mb-6">
            Upload your resume first to get personalized career recommendations
          </p>
          <a
            href="/dashboard/career"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Upload Resume
            <ArrowRight className="w-4 h-4" />
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Career Recommendations</h1>
        <p className="text-gray-600">
          Personalized career paths based on your skills and experience
        </p>
      </div>

      <div className="space-y-6">
        {recommendations.map((rec, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{rec.role_title}</h2>
                    {rec.company_examples && rec.company_examples.length > 0 && (
                      <p className="text-sm text-gray-600">
                        Companies: {rec.company_examples.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
                    <Award className="w-4 h-4" />
                    <span className="font-semibold">{rec.match_percentage}% Match</span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{rec.description}</p>

                {/* Required Skills */}
                {rec.required_skills && rec.required_skills.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Required Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {rec.required_skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Growth Potential */}
                {rec.growth_potential && (
                  <div className="flex items-center gap-2 text-green-600 mb-4">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-semibold">{rec.growth_potential}</span>
                  </div>
                )}

                {/* Salary Range */}
                {rec.salary_range && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Salary Range:</span> {rec.salary_range}
                    </p>
                  </div>
                )}

                {/* Learning Path */}
                {rec.learning_path && rec.learning_path.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Recommended Learning Path
                    </h3>
                    <ol className="space-y-2">
                      {rec.learning_path.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="flex items-center justify-center w-6 h-6 bg-purple-200 text-purple-900 rounded-full text-sm font-bold flex-shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-purple-800 pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Next Steps */}
                {rec.next_steps && rec.next_steps.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Next Steps:</h3>
                    <ul className="space-y-1">
                      {rec.next_steps.map((step, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-700">
                          <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
