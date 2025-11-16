'use client';

import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Brain,
  ClipboardCheck,
  TrendingUp,
  Briefcase,
  User,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Documents', href: '/dashboard/documents', icon: FileText },
  { name: 'Notes', href: '/dashboard/notes', icon: BookOpen },
  { name: 'Summaries', href: '/dashboard/summaries', icon: Brain },
  { name: 'Quizzes', href: '/dashboard/quizzes', icon: ClipboardCheck },
  { name: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
  { name: 'Career', href: '/dashboard/career', icon: Briefcase },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-72 bg-gradient-to-b from-white via-white to-blue-50/50 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Platform Header - SLCA */}
        <div className="relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-10" />
          <div className="relative flex items-center justify-between px-6 py-6 border-b border-gray-200/50">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg"
              >
                <GraduationCap className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  SLCA
                </h1>
                <p className="text-xs text-gray-600 font-medium">Smart Learning Platform</p>
              </div>
            </div>
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Navigation - All Services */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'}`} />
                  </motion.div>
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto"
                    >
                      <Sparkles className="h-4 w-4 text-yellow-300" />
                    </motion.div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* User Profile Section - Bottom */}
        <div className="border-t-2 border-gray-200/50 p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 backdrop-blur-sm flex-shrink-0">
          <Link href="/dashboard/profile">
            <motion.div
              whileHover={{ scale: 1.03, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.2)" }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 mb-3 p-4 bg-white rounded-xl shadow-md cursor-pointer hover:shadow-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all border border-gray-100"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg relative"
              >
                <User className="h-7 w-7 text-white" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user?.first_name && user?.last_name 
                    ? `${user.first_name} ${user.last_name}` 
                    : 'User Profile'}
                </p>
                <p className="text-xs text-gray-600 truncate font-medium">{user?.email}</p>
                <p className="text-[10px] text-blue-600 font-semibold mt-0.5">Click to view profile →</p>
              </div>
            </motion.div>
          </Link>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </motion.div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="lg:hidden sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm"
        >
          <div className="flex items-center justify-between px-4 py-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSidebarOpen(true)}
              className="text-gray-700 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Menu className="h-6 w-6" />
            </motion.button>
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="p-1.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg"
              >
                <GraduationCap className="h-5 w-5 text-white" />
              </motion.div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SLCA
              </h1>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </motion.header>

        {/* Page content */}
        <main className="min-h-screen p-6 text-gray-900">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
