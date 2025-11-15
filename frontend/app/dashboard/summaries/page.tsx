'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Plus, Search, Brain, Trash2, FileText, Link as LinkIcon, Calendar } from 'lucide-react';
import type { Summary } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function SummariesPage() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'brief' | 'detailed' | 'bullet_points'>('all');

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

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this summary?')) return;

    try {
      await api.deleteSummary(id);
      toast.success('Summary deleted successfully');
      setSummaries(summaries.filter((summary) => summary.id !== id));
    } catch (error) {
      toast.error('Failed to delete summary');
    }
  }

  const filteredSummaries = summaries.filter((summary) => {
    const matchesSearch = summary.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || summary.summary_type === filterType;
    return matchesSearch && matchesType;
  });

  const getSummaryTypeLabel = (type: string) => {
    const labels = {
      brief: 'Brief',
      detailed: 'Detailed',
      bullet_points: 'Bullet Points',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getSummaryTypeBadge = (type: string) => {
    const badges = {
      brief: 'bg-blue-100 text-blue-800',
      detailed: 'bg-purple-100 text-purple-800',
      bullet_points: 'bg-green-100 text-green-800',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Summaries</h1>
          <p className="text-gray-600 mt-1">AI-generated content summaries</p>
        </div>
        <Link href="/dashboard/summaries/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Generate Summary
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search summaries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="brief">Brief</option>
          <option value="detailed">Detailed</option>
          <option value="bullet_points">Bullet Points</option>
        </select>
      </div>

      {/* Summaries List */}
      {filteredSummaries.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery || filterType !== 'all' ? 'No summaries found' : 'No summaries yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterType !== 'all'
                ? 'Try adjusting your filters'
                : 'Generate your first summary to get started'}
            </p>
            {!searchQuery && filterType === 'all' && (
              <Link href="/dashboard/summaries/new">
                <Button variant="primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Summary
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSummaries.map((summary) => (
            <Card key={summary.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getSummaryTypeBadge(
                          summary.summary_type
                        )}`}
                      >
                        {getSummaryTypeLabel(summary.summary_type)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(summary.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {summary.source_type === 'document' ? (
                        <>
                          <FileText className="h-4 w-4" />
                          <span>From Document</span>
                        </>
                      ) : (
                        <>
                          <LinkIcon className="h-4 w-4" />
                          <span>From URL</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(summary.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {summary.summary_type === 'bullet_points' ? (
                    <div
                      className="text-gray-700 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: summary.content.replace(/•/g, '•<br/>') }}
                    />
                  ) : (
                    <p className="text-gray-700 whitespace-pre-wrap">{summary.content}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
