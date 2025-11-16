'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Plus, Search, ClipboardCheck, Play, BarChart3, Calendar, Trophy, Zap, Target } from 'lucide-react';
import type { Quiz, QuizAnalytics } from '@/lib/types';
import { formatDate, getDifficultyBadgeClass } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setIsLoading(true);
      const [quizzesData, analyticsData] = await Promise.all([
        api.getQuizzes(),
        api.getQuizAnalytics(),
      ]);
      // Ensure quizzesData is an array
      setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
      toast.error('Failed to load quizzes');
      setQuizzes([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  }

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
            <Trophy className="w-10 h-10 text-orange-600" />
            Quizzes
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Test your knowledge with AI-generated quizzes</p>
        </div>
        <Link href="/dashboard/quizzes/new">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 shadow-lg">
              <Plus className="h-5 w-5 mr-2" />
              Generate Quiz
            </Button>
          </motion.div>
        </Link>
      </motion.div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-100 mb-1">Total Quizzes</p>
                    <p className="text-4xl font-bold">{analytics.total_quizzes}</p>
                  </div>
                  <ClipboardCheck className="h-12 w-12 opacity-80" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-100 mb-1">Total Attempts</p>
                    <p className="text-4xl font-bold">{analytics.total_attempts}</p>
                  </div>
                  <Play className="h-12 w-12 opacity-80" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-100 mb-1">Average Score</p>
                    <p className="text-4xl font-bold">
                      {analytics.average_score.toFixed(1)}%
                    </p>
                  </div>
                  <BarChart3 className="h-12 w-12 opacity-80" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search quizzes by title or topic..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 border-2 focus:border-orange-500 rounded-xl shadow-sm"
        />
      </motion.div>

      {/* Quizzes Grid */}
      {filteredQuizzes.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No quizzes found' : 'No quizzes yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Generate your first quiz to test your knowledge'}
            </p>
            {!searchQuery && (
              <Link href="/dashboard/quizzes/new">
                <Button variant="primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Quiz
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-2xl transition-all h-full bg-gradient-to-br from-white to-orange-50/30">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg font-bold text-gray-900">{quiz.title}</CardTitle>
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getDifficultyBadgeClass(quiz.difficulty || quiz.difficulty_level || 'medium')}`}
                    >
                      {quiz.difficulty || quiz.difficulty_level || 'Medium'}
                    </motion.span>
                  </div>
                  <CardDescription className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-3 w-3" />
                    {formatDate(quiz.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Target className="w-4 h-4 text-orange-600" />
                        Topic:
                      </span>
                      <span className="font-semibold text-gray-900">{quiz.topic || quiz.title || 'General'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-gray-600 flex items-center gap-2">
                        <ClipboardCheck className="w-4 h-4 text-blue-600" />
                        Questions:
                      </span>
                      <span className="font-semibold text-gray-900">{quiz.questions?.length || 0}</span>
                    </div>
                    <Link href={`/dashboard/quizzes/${quiz.id}`} className="block pt-2">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 shadow-lg">
                          <Play className="h-4 w-4 mr-2" />
                          Take Quiz
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Topics Performance */}
      {analytics && analytics.topics && analytics.topics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
                Performance by Topic
              </CardTitle>
              <CardDescription>Your quiz scores across different topics</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                {analytics.topics.map((topic, index) => (
                  <motion.div
                    key={topic.topic}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base font-bold text-gray-800 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        {topic.topic}
                      </span>
                      <span className="text-sm font-semibold text-gray-600 px-3 py-1 bg-white rounded-full shadow-sm">
                        {topic.average_score.toFixed(1)}% ({topic.count} {topic.count === 1 ? 'quiz' : 'quizzes'})
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${topic.average_score}%` }}
                        transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full shadow-sm"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
