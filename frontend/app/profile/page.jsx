'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Calendar, Globe } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supportedLanguages } from '@/utils/translator';
import { getUserComplaintStats } from '@/services/complaintService';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();


  const fetchComplaintStatistics = async () => {
    try {
      setIsLoadingComplaints(true);
      const data = await getUserComplaintStats();
      if (data && data.stats) {
        setComplaintsData(data.stats);
      } else {
        setComplaintsData({ total: 0, resolved: 0, inProgress: 0, pending: 0, rejected: 0 });
      }
    } catch (error) {
      setError('Failed to load complaint statistics.');
    } finally {
      setIsLoadingComplaints(false);
    }
  };

  useEffect(() => {
    if (user && user._id) {
      fetchComplaintStatistics();
    }
  }, [user]);

  const [complaintsData, setComplaintsData] = useState({
    total: 0,
    resolved: 0,
    inProgress: 0,
    pending: 0,
    rejected: 0
  });
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getLanguageName = (code) => {
    const language = supportedLanguages.find(lang => lang.code === code);
    return language ? language.name : code;
  };

  return (



    <div className="bg-gray-50 min-h-[calc(100vh-200px)]">

      {/* Breadcrumb */}
      <div className="bg-white py-2.5 border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <p className="text-sm text-gray-500">
            <a href="/" className="text-blue-700 hover:underline">Home</a>
            <span className="mx-1.5 text-gray-300">/</span>
            <span className="font-medium text-gray-800">Profile</span>
          </p>
        </div>
      </div>


      <div className="max-w-6xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
            <Card className="bg-white border-0 shadow-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-b from-blue-900 to-blue-800 border-b-0 rounded-t-lg pb-4">
                <CardTitle className="text-white text-lg font-bold">User Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-6 py-5">
                <div className="flex justify-center -mt-10 mb-2">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-lg">
                      <User className="h-10 w-10 text-blue-700" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1 text-center">
                  <h2 className="text-lg font-medium text-gray-900">{user.name}</h2>
                  <p className="text-sm text-gray-500">User ID: {user._id}</p>
                </div>
                <Separator />
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-blue-600" /> {user.email}
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-blue-600" /> {user.phone}
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-blue-600" /> Preferred Language: {getLanguageName(user.languagePreference)}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-600" /> Joined: {formatDate(user.createdAt)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-0 bg-white shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 border-b-0">
                  <CardTitle className="text-white text-lg font-bold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="px-6 py-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Link href="/complaint/register" passHref>
                      <Button className="w-full bg-blue-800 text-white hover:bg-blue-900">Register Complaint</Button>
                    </Link>
                    <Link href="/complaint/history" passHref>
                      <Button variant="outline" className="w-full border-blue-800 text-blue-800 hover:bg-blue-50">Complaint History</Button>
                    </Link>
                    <Link href="/editprofile" passHref>
                      <Button variant="secondary" className="w-full">Edit Profile</Button>
                    </Link>
                    <Button variant="outline" className="w-full">Change Password</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 border-b-0">
                  <CardTitle className="text-white text-lg font-bold">Complaint Statistics</CardTitle>
                </CardHeader>
                <CardContent className="px-6 py-4">
                  {isLoadingComplaints ? (
                    <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div></div>
                  ) : error ? (
                    <p className="text-sm text-red-500 text-center py-4">{error}</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
                        <p className="text-2xl font-bold text-blue-900">{complaintsData.total}</p>
                        <p className="text-sm text-gray-600">Total Complaints</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
                        <p className="text-2xl font-bold text-green-700">{complaintsData.resolved}</p>
                        <p className="text-sm text-gray-600">Resolved</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-200">
                        <p className="text-2xl font-bold text-yellow-600">{complaintsData.inProgress}</p>
                        <p className="text-sm text-gray-600">In Progress</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
                        <p className="text-2xl font-bold text-red-600">{complaintsData.pending}</p>
                        <p className="text-sm text-gray-600">Pending</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
