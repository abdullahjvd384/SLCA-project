'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { BookOpen, Brain, TrendingUp, FileText, GraduationCap, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">SLCA</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI-Powered Learning Platform</span>
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Smart Learning & Career Assistant
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Transform your learning journey with AI-powered notes, summaries, quizzes, and career guidance.
            Upload any document and let AI help you master the content.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="primary">
                Start Learning Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Powerful Features</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<FileText className="h-8 w-8 text-blue-600" />}
            title="Smart Document Processing"
            description="Upload PDFs, Word docs, PowerPoints, or paste URLs. Support for YouTube videos and web articles."
          />
          <FeatureCard
            icon={<BookOpen className="h-8 w-8 text-green-600" />}
            title="AI-Generated Notes"
            description="Automatically generate structured, comprehensive notes from any content with AI assistance."
          />
          <FeatureCard
            icon={<Brain className="h-8 w-8 text-purple-600" />}
            title="Intelligent Summaries"
            description="Get brief, detailed, or bullet-point summaries of any document or article in seconds."
          />
          <FeatureCard
            icon={<TrendingUp className="h-8 w-8 text-orange-600" />}
            title="Interactive Quizzes"
            description="AI generates custom quizzes with multiple choice, true/false, and short answer questions."
          />
          <FeatureCard
            icon={<GraduationCap className="h-8 w-8 text-red-600" />}
            title="Career Guidance"
            description="Resume analysis, career recommendations, and interview preparation powered by AI."
          />
          <FeatureCard
            icon={<Sparkles className="h-8 w-8 text-yellow-600" />}
            title="Progress Tracking"
            description="Track your learning journey with detailed analytics and AI-powered insights."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Learning?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students already learning smarter with SLCA
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Get Started Now - It's Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 SLCA. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="mb-4">{icon}</div>
      <h4 className="text-xl font-semibold mb-2">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
