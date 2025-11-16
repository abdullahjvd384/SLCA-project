'use client';

import { useEffect, useState, useRef } from 'react';
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
  FolderOpen,
  Sparkles,
  CloudUpload,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import type { Document } from '@/lib/types';
import { formatDate, formatFileSize, getFileTypeIcon } from '@/lib/utils';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [url, setUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      setIsLoading(true);
      const data = await api.getDocuments();
      // Ensure data is an array
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast.error('Failed to load documents');
      setDocuments([]); // Set empty array on error
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
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      await api.uploadDocument(formData);
      toast.success('Document uploaded successfully!');
      await fetchDocuments();
      // Reset file input
      event.target.value = '';
    } catch (error: any) {
      console.error('Upload error:', error);
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
      await api.addDocumentFromUrl({ url, title: url });
      toast.success('URL content processed successfully!');
      setUrl('');
      setShowUrlInput(false);
      await fetchDocuments();
    } catch (error: any) {
      console.error('URL processing error:', error);
      toast.error(error.response?.data?.detail || 'Failed to process URL');
    } finally {
      setIsUploading(false);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      await api.uploadDocument(formData);
      toast.success('Document uploaded successfully!');
      await fetchDocuments();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(id: string) {
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
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
            <FolderOpen className="w-10 h-10 text-blue-600" />
            Documents
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Upload and manage your learning materials</p>
        </div>
        <div className="flex gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              onClick={() => setShowUrlInput(!showUrlInput)}
              disabled={isUploading}
              className="border-2 hover:border-blue-500 hover:text-blue-600"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Add URL
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg"
            >
              {isUploading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Upload File
                </>
              )}
            </Button>
          </motion.div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.pptx,.txt,.md,.csv,.xlsx,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </div>
      </motion.div>

      {/* Drag and Drop Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ${
          isDragging
            ? 'border-blue-500 bg-blue-50 scale-[1.02]'
            : 'border-gray-300 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 hover:border-blue-400'
        }`}
      >
        <div className="p-12 text-center">
          <motion.div
            animate={{
              scale: isDragging ? [1, 1.1, 1] : 1,
              rotate: isDragging ? [0, 5, -5, 0] : 0,
            }}
            transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
          >
            <CloudUpload className={`w-16 h-16 mx-auto mb-4 ${
              isDragging ? 'text-blue-600' : 'text-gray-400'
            }`} />
          </motion.div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {isDragging ? 'Drop your file here!' : 'Drag & Drop your files'}
          </h3>
          <p className="text-gray-600 mb-4">
            or click the upload button above
          </p>
          <p className="text-sm text-gray-500">
            Supports PDF, DOCX, PPTX, TXT, MD, CSV, XLSX, Images (Max 10MB)
          </p>
        </div>
      </motion.div>

      {/* URL Input */}
      <AnimatePresence>
        {showUrlInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <form onSubmit={handleUrlSubmit} className="flex gap-3">
                  <Input
                    type="url"
                    placeholder="Paste YouTube video URL or web article URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isUploading}
                    className="h-12 border-2 focus:border-blue-500"
                  />
                  <Button
                    type="submit"
                    disabled={isUploading || !url.trim()}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                  >
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 border-2 focus:border-blue-500 rounded-xl shadow-sm"
        />
      </motion.div>

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
              <Button
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-2xl transition-all h-full bg-gradient-to-br from-white to-gray-50 overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ duration: 0.3 }}
                        className="text-3xl p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl"
                      >
                        {getFileTypeIcon(doc.content_type)}
                      </motion.div>
                      <div>
                        <CardTitle className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {doc.title}
                        </CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(doc.created_at)}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">Type:</span>
                      <span className="font-bold text-gray-900 uppercase text-xs px-2 py-1 bg-white rounded-md shadow-sm">
                        {doc.content_type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 font-medium">Status:</span>
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-md ${
                          doc.processing_status === 'completed'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                            : doc.processing_status === 'pending'
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                            : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                        }`}
                      >
                        {doc.processing_status}
                      </motion.span>
                    </div>
                    {doc.file_url && (
                      <motion.a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 p-2 bg-blue-50 rounded-lg transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="font-medium truncate">View Source</span>
                      </motion.a>
                    )}
                    <div className="flex gap-2 pt-2">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-600 hover:from-red-100 hover:to-pink-100 hover:border-red-300 font-medium"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
