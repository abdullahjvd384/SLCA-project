'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Plus, Search, Brain, Trash2, FileText, Calendar, Eye, EyeOff, ChevronDown, ChevronUp, Sparkles, Zap } from 'lucide-react';
import type { Summary } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

export default function SummariesPage() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'short' | 'medium' | 'detailed'>('all');
  const [expandedSummaries, setExpandedSummaries] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSummaries();
  }, []);

  async function fetchSummaries() {
    try {
      setIsLoading(true);
      const data = await api.getSummaries();
      // Ensure data is an array
      setSummaries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load summaries:', error);
      toast.error('Failed to load summaries');
      setSummaries([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this summary?')) return;

    try {
      console.log('Deleting summary with ID:', id);
      await api.deleteSummary(id);
      toast.success('Summary deleted successfully');
      setSummaries(summaries.filter((summary) => summary.id !== id));
    } catch (error: any) {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to delete summary';
      toast.error(errorMessage);
    }
  }

  function toggleExpanded(id: string) {
    const newExpanded = new Set(expandedSummaries);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSummaries(newExpanded);
  }

  const filteredSummaries = summaries.filter((summary) => {
    const searchText = (summary.summary_text || '').toLowerCase();
    const matchesSearch = searchText.includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || summary.summary_length === filterType;
    return matchesSearch && matchesType;
  });

  const getSummaryTypeLabel = (type: string) => {
    const labels = {
      short: 'Bullet Points',
      medium: 'Medium',
      detailed: 'Detailed',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getSummaryTypeBadge = (type: string) => {
    const badges = {
      short: 'bg-blue-100 text-blue-800',
      medium: 'bg-green-100 text-green-800',
      detailed: 'bg-purple-100 text-purple-800',
    };
    return badges[type as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

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
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-xl"
            >
              <Brain className="h-10 w-10" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-2">
                Summaries
                <Sparkles className="h-8 w-8 text-yellow-300" />
              </h1>
              <p className="text-blue-100 text-lg mt-1">AI-generated content summaries</p>
            </div>
          </div>
          <Link href="/dashboard/summaries/new">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-xl px-6 py-3 text-lg">
                <Plus className="h-5 w-5 mr-2" />
                Generate Summary
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search summaries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-lg border-2 focus:border-blue-500 shadow-md"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-700 shadow-md bg-white hover:border-blue-400 transition-all"
        >
          <option value="all">All Types</option>
          <option value="short">Bullet Points</option>
          <option value="medium">Medium</option>
          <option value="detailed">Detailed</option>
        </select>
      </motion.div>

      {/* Summaries List */}
      {filteredSummaries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-xl">
            <CardContent className="py-20 text-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl mb-6"
              >
                <Brain className="h-16 w-16 text-blue-600" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {searchQuery || filterType !== 'all' ? 'No summaries found' : 'No summaries yet'}
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                {searchQuery || filterType !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Generate your first summary to get started'}
              </p>
              {!searchQuery && filterType === 'all' && (
                <Link href="/dashboard/summaries/new">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-6 text-lg font-bold shadow-xl">
                      <Plus className="h-5 w-5 mr-2" />
                      Generate Summary
                    </Button>
                  </motion.div>
                </Link>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {filteredSummaries.map((summary, index) => {
            const isExpanded = expandedSummaries.has(summary.id);
            const previewText = summary.summary_text?.substring(0, 200) || '';
            const hasMore = (summary.summary_text?.length || 0) > 200;

            return (
              <motion.div
                key={summary.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all overflow-hidden bg-gradient-to-br from-white to-gray-50 relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                              summary.summary_length === 'short'
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                                : summary.summary_length === 'medium'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            }`}
                          >
                            {getSummaryTypeLabel(summary.summary_length)}
                          </motion.span>
                          <span className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1.5 rounded-lg">
                            <Calendar className="h-4 w-4" />
                            {formatDate(summary.generated_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(summary.id)}
                            className="text-blue-600 hover:bg-blue-50 font-semibold border-2 border-blue-200 rounded-xl"
                          >
                            {isExpanded ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-1" />
                                Collapse
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-1" />
                                View Full
                              </>
                            )}
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(summary.id)}
                            className="text-red-600 hover:bg-red-50 font-semibold border-2 border-red-200 rounded-xl"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                    </CardHeader>
                  <CardContent>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={isExpanded ? 'expanded' : 'collapsed'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`rounded-xl p-6 border-2 shadow-inner ${
                          summary.summary_length === 'short'
                            ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
                            : summary.summary_length === 'medium'
                            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                            : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
                        }`}
                      >
                        {isExpanded ? (
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown
                              className="text-gray-800"
                              components={{
                                h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-3" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-gray-900 mt-3 mb-2" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-gray-900 mt-2 mb-2" {...props} />,
                                p: ({ node, ...props }) => <p className="text-gray-700 mb-3 leading-relaxed" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700" {...props} />,
                                li: ({ node, ...props }) => <li className="ml-2 text-gray-700 font-medium" {...props} />,
                                strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
                                em: ({ node, ...props }) => <em className="italic text-gray-700" {...props} />,
                                code: ({ node, ...props }) => <code className="bg-gray-200 px-2 py-1 rounded text-sm font-mono text-gray-800" {...props} />,
                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-3 bg-white/50 py-2 rounded-r" {...props} />,
                              }}
                            >
                              {summary.summary_text || 'No content'}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <div>
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown
                                className="text-gray-700"
                                components={{
                                  p: ({ node, ...props }) => <p className="text-gray-700 leading-relaxed font-medium" {...props} />,
                                  strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
                                }}
                              >
                                {previewText + (hasMore ? '...' : '')}
                              </ReactMarkdown>
                            </div>
                            {hasMore && (
                              <motion.button
                                whileHover={{ scale: 1.05, x: 5 }}
                                onClick={() => toggleExpanded(summary.id)}
                                className="mt-4 px-4 py-2 bg-white border-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-lg font-bold flex items-center gap-2 shadow-md transition-all"
                              >
                                Show more
                                <ChevronDown className="h-4 w-4" />
                              </motion.button>
                            )}
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
