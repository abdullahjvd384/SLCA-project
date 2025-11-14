'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FileText, BookOpen, Brain, ClipboardCheck, TrendingUp, Calendar } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import type { UserProgress, ActivityLog } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
        setActivities(activityData.slice(0, 5)); // Latest 5 activities
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
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
      bgColor: 'bg-blue-100',
      href: '/dashboard/documents',
    },
    {
      name: 'Notes',
      value: progress?.total_notes || 0,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/dashboard/notes',
    },
    {
      name: 'Summaries',
      value: progress?.total_summaries || 0,
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: '/dashboard/summaries',
    },
    {
      name: 'Quizzes',
      value: progress?.total_quizzes || 0,
      icon: ClipboardCheck,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      href: '/dashboard/quizzes',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.first_name || 'Student'}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your learning today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.name} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Study Statistics</CardTitle>
            <CardDescription>Your learning performance overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Average Quiz Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {progress?.average_quiz_score?.toFixed(1) || '0'}%
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Study Streak</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {progress?.study_streak_days || 0} days
                  </p>
                </div>
              </div>
            </div>

            <Link href="/dashboard/progress">
              <Button variant="outline" className="w-full">
                View Detailed Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions</CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity</p>
                <p className="text-sm mt-1">Start by uploading a document!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <getActivityIcon type={activity.activity_type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatRelativeTime(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/documents">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <FileText className="h-6 w-6" />
                <span>Upload Document</span>
              </Button>
            </Link>
            <Link href="/dashboard/notes">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <BookOpen className="h-6 w-6" />
                <span>Create Note</span>
              </Button>
            </Link>
            <Link href="/dashboard/quizzes">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <ClipboardCheck className="h-6 w-6" />
                <span>Take Quiz</span>
              </Button>
            </Link>
            <Link href="/dashboard/career">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <TrendingUp className="h-6 w-6" />
                <span>Career Guidance</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getActivityIcon({ type }: { type: string }) {
  switch (type) {
    case 'document_upload':
      return <FileText className="h-4 w-4 text-blue-600" />;
    case 'quiz_taken':
      return <ClipboardCheck className="h-4 w-4 text-orange-600" />;
    case 'note_created':
      return <BookOpen className="h-4 w-4 text-green-600" />;
    case 'summary_generated':
      return <Brain className="h-4 w-4 text-purple-600" />;
    default:
      return <FileText className="h-4 w-4 text-gray-600" />;
  }
}
