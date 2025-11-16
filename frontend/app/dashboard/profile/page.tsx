'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { User, Mail, Calendar, CheckCircle2, Edit2, Save, X, Camera } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      // Update profile via API
      const response = await api.updateProfile(formData);
      
      // Update local state
      setUser(response);
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                <User className="w-12 h-12" />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white text-blue-600 rounded-full shadow-lg hover:bg-blue-50 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold">
                {user.first_name || user.last_name
                  ? `${user.first_name} ${user.last_name}`.trim()
                  : 'Your Profile'}
              </h1>
              <p className="text-blue-100 text-lg mt-1 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                {user.email}
              </p>
            </div>
          </div>
          {user.is_verified && (
            <div className="flex items-center gap-2 text-green-300">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Verified Account</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Profile Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <User className="w-6 h-6 text-blue-600" />
                Personal Information
              </CardTitle>
              {!isEditing ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </motion.div>
              ) : (
                <div className="flex gap-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      disabled={isSaving}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                    >
                      {isSaving ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      placeholder="Enter your first name"
                      className="h-12 border-2 focus:border-blue-500"
                      disabled={isSaving}
                    />
                  ) : (
                    <div className="h-12 flex items-center px-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                      <span className="text-gray-900 font-medium">
                        {user.first_name || 'Not set'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      placeholder="Enter your last name"
                      className="h-12 border-2 focus:border-blue-500"
                      disabled={isSaving}
                    />
                  ) : (
                    <div className="h-12 flex items-center px-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                      <span className="text-gray-900 font-medium">
                        {user.last_name || 'Not set'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="h-12 flex items-center px-4 bg-gray-100 rounded-lg border-2 border-gray-300">
                    <Mail className="w-5 h-5 text-gray-500 mr-3" />
                    <span className="text-gray-600 font-medium">{user.email}</span>
                    <span className="ml-auto text-xs text-gray-500">(Cannot be changed)</span>
                  </div>
                </div>

                {/* Account Created */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Member Since
                  </label>
                  <div className="h-12 flex items-center px-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <Calendar className="w-5 h-5 text-gray-500 mr-3" />
                    <span className="text-gray-900 font-medium">
                      {formatDate(user.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50/50">
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Email Verification</span>
                  {user.is_verified ? (
                    <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Verified
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-bold">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Account Type</span>
                  <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-bold">
                    Student
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
