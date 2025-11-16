'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Plus, Search, BookOpen, Trash2, Calendar, Tag, Download, Sparkles } from 'lucide-react';
import type { Note } from '@/lib/types';
import { formatDate, truncateText } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
      setIsLoading(true);
      const data = await api.getNotes();
      // Ensure data is an array
      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load notes:', error);
      toast.error('Failed to load notes');
      setNotes([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await api.deleteNote(id);
      toast.success('Note deleted successfully');
      setNotes(notes.filter((note) => note.id !== id));
    } catch (error) {
      toast.error('Failed to delete note');
    }
  }

  async function handleDownloadDocx(id: number, title: string) {
    try {
      toast.loading('Preparing DOCX download...', { id: 'docx-download' });
      
      console.log('Downloading DOCX for note:', id);
      const blob = await api.exportNoteDocx(id);
      
      console.log('DOCX blob received, size:', blob.size);
      
      if (!blob || blob.size === 0) {
        throw new Error('Received empty DOCX file');
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.docx`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      toast.success('DOCX downloaded successfully', { id: 'docx-download' });
    } catch (error: any) {
      console.error('Download failed:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to download DOCX';
      toast.error(errorMessage, { id: 'docx-download' });
    }
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <BookOpen className="h-10 w-10" />
              </motion.div>
              <h1 className="text-4xl font-bold">Notes</h1>
              <Sparkles className="h-6 w-6 text-yellow-300" />
            </div>
            <p className="text-blue-100 text-lg">Create and manage your study notes</p>
          </div>
          <Link href="/dashboard/notes/new">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-xl">
                <Plus className="h-5 w-5 mr-2" />
                Create Note
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search notes by title or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-14 text-lg border-2 focus:border-blue-500 shadow-md"
        />
      </motion.div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try a different search term' : 'Create your first note to get started'}
            </p>
            {!searchQuery && (
              <Link href="/dashboard/notes/new">
                <Button variant="primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Note
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-2xl transition-all h-full bg-gradient-to-br from-white to-gray-50 overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg"
                    >
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </motion.div>
                    {note.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-xs">
                    <Calendar className="h-3 w-3" />
                    {formatDate(note.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {truncateText(note.content, 150)}
                  </p>
                  
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {note.tags.slice(0, 3).map((tag, tagIndex) => (
                        <motion.span
                          key={tagIndex}
                          whileHover={{ scale: 1.05 }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full font-medium shadow-md"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </motion.span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-xs text-gray-500 font-medium">+{note.tags.length - 3} more</span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleDownloadDocx(note.id, note.title)}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium shadow-lg"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(note.id)}
                        className="text-red-600 hover:bg-red-50 border-red-200 font-medium"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
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
