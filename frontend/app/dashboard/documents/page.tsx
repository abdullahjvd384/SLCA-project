'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Upload,
  FileText,
  Trash2,
  Download,
  ExternalLink,
  Search,
  Plus,
  Link as LinkIcon,
} from 'lucide-react';
import type { Document } from '@/lib/types';
import { formatDate, formatFileSize, getFileTypeIcon } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [url, setUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      setIsLoading(true);
      const data = await api.getDocuments();
      setDocuments(data);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      setIsUploading(true);
      await api.uploadDocument(file);
      toast.success('Document uploaded successfully!');
      await fetchDocuments();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    try {
      setIsUploading(true);
      await api.processUrl(url);
      toast.success('URL content processed successfully!');
      setUrl('');
      setShowUrlInput(false);
      await fetchDocuments();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to process URL');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await api.deleteDocument(id);
      toast.success('Document deleted successfully');
      setDocuments(documents.filter((doc) => doc.id !== id));
    } catch (error) {
      toast.error('Failed to delete document');
    }
  }

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-1">Upload and manage your learning materials</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowUrlInput(!showUrlInput)}
            disabled={isUploading}
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            Add URL
          </Button>
          <label>
            <Button variant="primary" disabled={isUploading} asChild>
              <span>
                {isUploading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </>
                )}
              </span>
            </Button>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.docx,.pptx,.txt,.md,.csv,.xlsx,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {/* URL Input */}
      {showUrlInput && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleUrlSubmit} className="flex gap-3">
              <Input
                type="url"
                placeholder="Paste YouTube video URL or web article URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isUploading}
              />
              <Button type="submit" disabled={isUploading || !url.trim()}>
                {isUploading ? <LoadingSpinner size="sm" /> : 'Process'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowUrlInput(false);
                  setUrl('');
                }}
              >
                Cancel
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No documents found' : 'No documents yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Upload your first document to get started'}
            </p>
            {!searchQuery && (
              <label>
                <Button variant="primary">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.pptx,.txt,.md,.csv,.xlsx,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getFileTypeIcon(doc.file_type)}</span>
                    <div>
                      <CardTitle className="text-base">{doc.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {formatDate(doc.created_at)}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium uppercase">{doc.file_type}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        doc.processing_status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : doc.processing_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {doc.processing_status}
                    </span>
                  </div>
                  {doc.url && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <ExternalLink className="h-4 w-4" />
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline truncate"
                      >
                        View Source
                      </a>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
