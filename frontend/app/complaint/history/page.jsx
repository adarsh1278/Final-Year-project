'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, AlertTriangle } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getComplaintHistory } from '@/services/complaintService';
import ComplaintCard from '@/components/ComplaintCard';

export default function ComplaintHistoryPage() {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    const fetchComplaints = async () => {
      if (!isAuthenticated) return;

      try {
        const data = await getComplaintHistory();
        setComplaints(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load complaint history',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
  }, [isAuthenticated, toast]);

  const filteredComplaints = complaints.filter((complaint) => {
    const query = searchQuery.toLowerCase();
    return (
      complaint.complaintNumber.toLowerCase().includes(query) ||
      complaint.title.toLowerCase().includes(query) ||
      complaint.department.toLowerCase().includes(query) ||
      complaint.status.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)]">

      {/* Breadcrumb */}
      <div className="bg-white py-2.5 border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="text-sm text-gray-500">
            <Link href="/" className="text-blue-700 hover:underline">Home</Link>
            <span className="mx-1.5 text-gray-300">/</span>
            <Link href="/complaint/register" className="text-blue-600 hover:underline">Register Complaint</Link>
            <span className="mx-1.5 text-gray-300">/</span>
            <span className="font-medium text-gray-800">Complaint History</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl text-white font-bold">
                  Complaint History
                </CardTitle>
                <CardDescription className="text-blue-200 text-sm mt-1">
                  View and track your registered complaints with government departments.
                </CardDescription>
              </div>

              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title, number, dept..."
                  className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
              </div>
            ) : filteredComplaints.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredComplaints.map((complaint, index) => (
                  <ComplaintCard
                    key={complaint.complaintNumber}
                    complaint={complaint}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <AlertTriangle className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No complaints found
                </h3>
                <p className="text-gray-500 mb-6 text-sm">
                  {searchQuery
                    ? 'No complaints match your search criteria.'
                    : "You haven't filed any complaints yet."}
                </p>
                <Button
                  className="bg-blue-800 text-white hover:bg-blue-900"
                  onClick={() => router.push('/complaint/register')}
                >
                  Register a New Complaint
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </div>
  );
}
