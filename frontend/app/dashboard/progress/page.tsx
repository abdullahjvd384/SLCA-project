'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, Target, Award, Clock, BookOpen, FileText,
  Brain, Calendar, Activity, Zap
} from 'lucide-react';

interface DetailedAnalytics {
  total_documents: number;
  total_notes: number;
  total_summaries: number;
  total_quizzes: number;
  total_quiz_attempts: number;
  average_quiz_score: number;
  total_study_time: number;
  documents_by_type: Record<string, number>;
  quiz_performance_by_topic: Array<{
    topic: string;
    avg_score: number;
    attempts: number;
  }>;
  recent_activity: Array<{
    date: string;
    documents: number;
    notes: number;
    quizzes: number;
  }>;
  study_streak: number;
  improvement_rate: number;
}

interface AIInsight {
  category: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export default function ProgressPage() {
  const [analytics, setAnalytics] = useState<DetailedAnalytics | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsData, insightsData] = await Promise.all([
        api.getDetailedAnalytics(),
        api.getAIInsights()
      ]);
      
      setAnalytics(analyticsData);
      setInsights(insightsData);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to load analytics');
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

  if (!analytics) {
    return <div className="text-center py-12">No analytics data available</div>;
  }

  // Prepare chart data
  const documentTypeData = Object.entries(analytics.documents_by_type).map(([type, count]) => ({
    name: type.toUpperCase(),
    value: count
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const topicPerformanceData = analytics.quiz_performance_by_topic
    .sort((a, b) => b.avg_score - a.avg_score)
    .slice(0, 10);

  const activityData = analytics.recent_activity.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Documents: item.documents,
    Notes: item.notes,
    Quizzes: item.quizzes
  }));

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getImprovementIcon = () => {
    if (analytics.improvement_rate > 0) {
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    }
    return <Activity className="w-5 h-5 text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Progress Analytics</h1>
        <button
          onClick={loadAnalytics}
          className="text-primary hover:text-primary-dark"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold">{analytics.total_documents}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Notes Created</p>
              <p className="text-2xl font-bold">{analytics.total_notes}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Quiz Attempts</p>
              <p className="text-2xl font-bold">{analytics.total_quiz_attempts}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${getScoreColor(analytics.average_quiz_score)}`}>
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Quiz Score</p>
              <p className="text-2xl font-bold">{analytics.average_quiz_score.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Study Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold">Study Streak</h3>
          </div>
          <p className="text-3xl font-bold text-orange-600">{analytics.study_streak} days</p>
          <p className="text-sm text-gray-600 mt-2">Keep it up!</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Study Time</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {Math.round(analytics.total_study_time / 60)} hrs
          </p>
          <p className="text-sm text-gray-600 mt-2">Total time invested</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            {getImprovementIcon()}
            <h3 className="font-semibold">Improvement Rate</h3>
          </div>
          <p className={`text-3xl font-bold ${analytics.improvement_rate > 0 ? 'text-green-600' : 'text-gray-600'}`}>
            {analytics.improvement_rate > 0 ? '+' : ''}{analytics.improvement_rate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600 mt-2">Over last 7 days</p>
        </Card>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl font-bold">AI-Powered Insights</h2>
          </div>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.priority === 'high'
                    ? 'bg-red-50 border-red-500'
                    : insight.priority === 'medium'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <p className="font-semibold text-sm mb-1">{insight.category}</p>
                <p className="text-gray-700">{insight.message}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Types Distribution */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Documents by Type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={documentTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {documentTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Topic Performance */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Quiz Performance by Topic</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topicPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="topic" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avg_score" fill="#3b82f6" name="Avg Score %" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Activity Timeline */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Documents" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="Notes" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="Quizzes" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Topic Performance Details */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Detailed Topic Performance</h2>
        <div className="space-y-4">
          {topicPerformanceData.map((topic, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{topic.topic}</span>
                  <span className="text-sm text-gray-600">
                    {topic.attempts} attempt{topic.attempts !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      topic.avg_score >= 80
                        ? 'bg-green-600'
                        : topic.avg_score >= 60
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${topic.avg_score}%` }}
                  />
                </div>
              </div>
              <span className="font-bold text-lg w-16 text-right">
                {topic.avg_score.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
