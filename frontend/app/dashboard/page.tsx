'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FileText, BookOpen, Brain, ClipboardCheck, TrendingUp, Calendar, Sparkles, Target, Zap } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import type { UserProgress, ActivityLog } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [progressData, activityData] = await Promise.all([
          api.getProgressOverview(),
          api.getActivityLog(),
        ]);
        setProgress(progressData);
        // Ensure activityData is an array
        const activities = Array.isArray(activityData) ? activityData : [];
        setActivities(activities.slice(0, 5)); // Latest 5 activities
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setActivities([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    {
      name: 'Documents',
      value: progress?.total_documents || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      lightBg: 'bg-blue-50',
      href: '/dashboard/documents',
      description: 'Uploaded files',
    },
    {
      name: 'Notes',
      value: progress?.total_notes || 0,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
      lightBg: 'bg-green-50',
      href: '/dashboard/notes',
      description: 'Created notes',
    },
    {
      name: 'Summaries',
      value: progress?.total_summaries || 0,
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-500 to-pink-600',
      lightBg: 'bg-purple-50',
      href: '/dashboard/summaries',
      description: 'AI summaries',
    },
    {
      name: 'Quizzes',
      value: progress?.total_quizzes_generated || 0,
      icon: ClipboardCheck,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-500 to-red-600',
      lightBg: 'bg-orange-50',
      href: '/dashboard/quizzes',
      description: 'Quiz tests',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header with Animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl blur-3xl" />
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome back, {user?.first_name || 'Student'}!
            </h1>
          </div>
          <p className="text-gray-600 text-lg ml-11">
            Ready to continue your learning journey? Here's your progress today.
          </p>
        </div>
      </motion.div>

      {/* Stats Grid with Animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link href={stat.href}>
                <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-50" />
                  <CardContent className="relative pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                        <p className="text-xs text-gray-500">{stat.description}</p>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`p-4 rounded-2xl ${stat.bgColor} shadow-lg group-hover:shadow-xl transition-shadow`}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </motion.div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <motion.p
                        key={stat.value}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-4xl font-bold text-gray-900"
                      >
                        {stat.value}
                      </motion.p>
                      <Zap className="w-5 h-5 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Stats */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="h-full border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-600" />
                Study Statistics
              </CardTitle>
              <CardDescription>Your learning performance overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white shadow-lg"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <TrendingUp className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-100 mb-1">Average Quiz Score</p>
                      <p className="text-3xl font-bold">
                        {progress?.average_quiz_score?.toFixed(1) || '0'}%
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-5 text-white shadow-lg"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Calendar className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-sm text-green-100 mb-1">Study Streak</p>
                      <p className="text-3xl font-bold">
                        {progress?.study_streak_days || 0} days
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <Link href="/dashboard/progress">
                <Button variant="outline" className="w-full group hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                  <TrendingUp className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                  View Detailed Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="h-full border-0 shadow-xl bg-gradient-to-br from-white to-purple-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest actions</CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <FileText className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-900 font-medium mb-1">No recent activity</p>
                  <p className="text-sm text-gray-500">Start by uploading a document!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity, index) => {
                    const description = getActivityDescription(activity);
                    const Icon = getActivityIconComponent(activity.activity_type);
                    
                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
                      >
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg"
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 font-medium leading-relaxed">
                            {description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatRelativeTime(activity.timestamp)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              Quick Actions
            </CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { href: '/dashboard/documents', icon: FileText, label: 'Upload Document', gradient: 'from-blue-500 to-cyan-500' },
                { href: '/dashboard/notes', icon: BookOpen, label: 'Create Note', gradient: 'from-green-500 to-emerald-500' },
                { href: '/dashboard/quizzes', icon: ClipboardCheck, label: 'Take Quiz', gradient: 'from-orange-500 to-red-500' },
                { href: '/dashboard/career', icon: TrendingUp, label: 'Career Guidance', gradient: 'from-purple-500 to-pink-500' },
              ].map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.label}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href={action.href}>
                      <div className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${action.gradient} p-6 text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer`}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
                        <div className="relative flex flex-col items-center gap-3">
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                            className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm"
                          >
                            <Icon className="h-8 w-8" />
                          </motion.div>
                          <span className="font-semibold text-center">{action.label}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function getActivityDescription(activity: ActivityLog): string {
  const details = activity.activity_details || {};
  
  switch (activity.activity_type) {
    case 'upload':
      return `Uploaded document: ${details.filename || 'New document'}`;
    case 'note':
      return `Created note: ${details.title || 'New note'}`;
    case 'summary':
      return `Generated summary for ${details.document_title || 'document'}`;
    case 'quiz':
      return `Generated quiz: ${details.title || details.quiz_title || 'New quiz'}`;
    case 'quiz_attempt':
      const score = details.score !== undefined ? ` (Score: ${details.score}%)` : '';
      return `Completed quiz${score}`;
    case 'resume_uploaded':
      return `Uploaded resume: ${details.filename || 'Resume'}`;
    case 'resume_analyzed':
      return `Analyzed resume with ${details.ats_score || 0}% ATS score`;
    default:
      return 'Activity recorded';
  }
}

function getActivityIconComponent(type: string) {
  switch (type) {
    case 'upload':
      return FileText;
    case 'quiz':
    case 'quiz_attempt':
      return ClipboardCheck;
    case 'note':
      return BookOpen;
    case 'summary':
      return Brain;
    case 'resume_uploaded':
    case 'resume_analyzed':
      return TrendingUp;
    default:
      return FileText;
  }
}
