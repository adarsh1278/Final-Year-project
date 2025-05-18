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
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();


  const fetchComplaintStatistics = async () => {
    try {
      setIsLoadingComplaints(true);
      const response = await fetch('/api/complaints/statistics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Important for sending cookies
      });

      const data = await response.json();

      if (data.status === 'success') {
        setComplaintsData(data.data);
      } else {
        setError(data.message || 'Failed to load complaint statistics');
      }
    } catch (error) {
      setError('Network error. Please try again later.');
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
    pending: 0
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



    <div className="bg-gray-50 min-h-screen font-sans">

      {/* Breadcrumb */}
      <div className="bg-gray-100 py-2 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <p className="text-sm text-gray-600">
            <a href="/" className="text-blue-700 hover:underline">Home</a> &gt;
            <span className="font-medium text-gray-800"> Profile</span>
          </p>
        </div>
      </div>


      <div className="max-w-6xl mx-auto  px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
            <Card className="bg-white border border-blue-100 shadow-sm">
              <CardHeader className="bg-blue-50 border-b border-blue-200 rounded-t-md">
                <CardTitle className="text-blue-900 text-lg font-semibold">User Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-6 py-4">
                <div className="flex justify-center mb-2">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-12 w-12 text-blue-700" />
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
              <Card className="border border-blue-100 bg-white shadow-sm">
                <CardHeader className="bg-blue-50 border-b border-blue-200 rounded-t-md">
                  <CardTitle className="text-blue-900 text-lg font-semibold">Quick Actions</CardTitle>
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

              <Card className="border border-blue-100 bg-white shadow-sm">
                <CardHeader className="bg-blue-50 border-b border-blue-200 rounded-t-md">
                  <CardTitle className="text-blue-900 text-lg font-semibold">Complaint Statistics</CardTitle>
                </CardHeader>
                <CardContent className="px-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
                      <p className="text-2xl font-bold text-blue-900">5</p>
                      <p className="text-sm text-gray-600">Total Complaints</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
                      <p className="text-2xl font-bold text-green-700">3</p>
                      <p className="text-sm text-gray-600">Resolved</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-200">
                      <p className="text-2xl font-bold text-yellow-600">1</p>
                      <p className="text-sm text-gray-600">In Progress</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
                      <p className="text-2xl font-bold text-red-600">1</p>
                      <p className="text-sm text-gray-600">Pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
