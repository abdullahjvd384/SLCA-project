'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/api';
import { createNoteSchema, type CreateNoteFormData } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft, Sparkles, FileText, List, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import type { Document } from '@/lib/types';

export default function NewNotePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [noteType, setNoteType] = useState<'structured' | 'bullet' | 'detailed'>('structured');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateNoteFormData>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      note_type: 'structured',
    },
  });

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const data = await api.getDocuments();
        setDocuments(data);
      } catch (error) {
        console.error('Failed to load documents');
        toast.error('Failed to load documents');
      }
    }
    fetchDocuments();
  }, []);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const onSubmit = async (data: CreateNoteFormData) => {
    if (!data.document_id) {
      toast.error('Please select a document');
      return;
    }

    try {
      setIsLoading(true);
      const noteData = {
        title: data.title,
        document_id: data.document_id,
        note_type: noteType,
        additional_context: data.additional_context || undefined,
        tags: tags.length > 0 ? tags : undefined,
      };

      toast.loading('Generating AI-powered notes... This may take a moment', { 
        id: 'generating',
        duration: 30000 
      });

      await api.createNote(noteData);
      
      toast.dismiss('generating');
      toast.success('Notes generated successfully!');
      router.push('/dashboard/notes');
    } catch (error: any) {
      toast.dismiss('generating');
      console.error('Error creating note:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate notes');
    } finally {
      setIsLoading(false);
    }
  };

  const noteTypeOptions = [
    {
      value: 'structured',
      label: 'Structured Notes',
      icon: FileText,
      description: 'Organized with headings, sections, and clear structure',
    },
    {
      value: 'bullet',
      label: 'Bullet Points',
      icon: List,
      description: 'Concise bullet-point format for quick review',
    },
    {
      value: 'detailed',
      label: 'Detailed Notes',
      icon: BookOpen,
      description: 'Comprehensive notes with examples and explanations',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/notes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Generate AI Notes</h1>
          <p className="text-gray-600 mt-1">Create comprehensive notes from your documents using AI</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Note Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Document Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Select Document <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                {...register('document_id')}
              >
                <option value="">-- Choose a document --</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.title}
                  </option>
                ))}
              </select>
              {errors.document_id && (
                <p className="mt-1 text-sm text-red-600">{errors.document_id.message}</p>
              )}
              {documents.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  No documents available. Please{' '}
                  <Link href="/dashboard/documents" className="text-blue-600 hover:underline">
                    upload a document
                  </Link>{' '}
                  first.
                </p>
              )}
            </div>

            {/* Title */}
            <Input
              label="Note Title"
              placeholder="e.g., Introduction to Machine Learning - Chapter 1"
              error={errors.title?.message}
              required
              {...register('title')}
            />

            {/* Note Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Note Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {noteTypeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.value}
                      onClick={() => {
                        setNoteType(option.value as any);
                        setValue('note_type', option.value as any);
                      }}
                      className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                        noteType === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon
                          className={`h-5 w-5 mt-1 ${
                            noteType === option.value ? 'text-blue-600' : 'text-gray-400'
                          }`}
                        />
                        <div className="flex-1">
                          <div
                            className={`font-medium mb-1 ${
                              noteType === option.value ? 'text-blue-900' : 'text-gray-900'
                            }`}
                          >
                            {option.label}
                          </div>
                          <p
                            className={`text-sm ${
                              noteType === option.value ? 'text-blue-700' : 'text-gray-500'
                            }`}
                          >
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional Context */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Additional Context (Optional)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] bg-white text-gray-900"
                placeholder="Add any specific instructions, focus areas, or additional context you want incorporated into the notes..."
                {...register('additional_context')}
              />
              {errors.additional_context && (
                <p className="mt-1 text-sm text-red-600">{errors.additional_context.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Examples: "Focus on key formulas and their applications", "Include real-world examples", "Emphasize historical context"
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Tags (Optional)
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  type="text"
                  placeholder="Add a tag (e.g., Machine Learning, Chapter 1)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-900 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={isLoading || documents.length === 0}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="h-4 w-4 mr-2" />
                Generating Notes...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate AI Notes
              </>
            )}
          </Button>
          <Link href="/dashboard/notes" className="flex-1">
            <Button type="button" variant="outline" className="w-full" disabled={isLoading}>
              Cancel
            </Button>
          </Link>
        </div>

        {/* Info Box */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-2">AI-Powered Note Generation</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Automatically extracts and organizes key information</li>
                  <li>Creates structured notes with headings and sections</li>
                  <li>Incorporates your additional context and preferences</li>
                  <li>Generates comprehensive, study-ready notes</li>
                  <li>Download as PDF for offline access</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
