'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Filter, Clock, CheckCircle, RotateCcw, AlertCircle, ArrowUpDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getDepartmentComplaints, updateComplaintStatus } from '@/services/complaintService';
import axiosInstance from '@/services/axiosInstance';

export default function DepartmentDashboardPage() {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const { isAuthenticated, isDepartment, loading, department } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Redirect if not authenticated as department
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isDepartment)) {
      router.push('/department/login');
    }
  }, [loading, isAuthenticated, isDepartment, router]);

  // Fetch department complaints
  useEffect(() => {
    const fetchComplaints = async () => {
      if (!isDepartment) return;

      try {
        const data = await getDepartmentComplaints();
        setComplaints(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load complaints',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
  }, [isDepartment, toast]);

  // Handle update complaint status
  const handleUpdateComplaint = async () => {
    if (!selectedComplaint || !newStatus) return;

    setIsSubmitting(true);

    try {
      await updateComplaintStatus(selectedComplaint.complaintNumber, {
        status: newStatus,
        responseFromDept: responseText
      });

      // Update local state
      setComplaints(complaints.map(complaint =>
        complaint.complaintNumber === selectedComplaint.complaintNumber
          ? { ...complaint, status: newStatus, responseFromDept: responseText }
          : complaint
      ));

      // Show success toast
      toast({
        title: 'Complaint Updated',
        description: `Status changed to ${newStatus}`,
        variant: 'success',
      });

      // Reset form
      setSelectedComplaint(null);
      setResponseText('');
      setNewStatus('');

    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update complaint',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Filter complaints based on search query and status filter
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch =
      complaint.complaintNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (complaint.userId && complaint.userId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort complaints
  const sortedComplaints = [...filteredComplaints].sort((a, b) => {
    const { key, direction } = sortConfig;

    if (a[key] < b[key]) {
      return direction === 'asc' ? -1 : 1;
    }
    if (a[key] > b[key]) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Request sort
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4" />;
      case 'inProgress':
        return <RotateCcw className="h-4 w-4" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'inProgress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'closed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid gap-6">
          {/* Dashboard Header */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">Department Dashboard</CardTitle>
                  <CardDescription>
                    Manage and respond to citizen complaints
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    {department?.name || 'Department'} Office
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="text-3xl font-bold">
                    {complaints.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Complaints</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="text-3xl font-bold text-amber-500">
                    {complaints.filter(c => c.status === 'open').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Open</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="text-3xl font-bold text-blue-500">
                    {complaints.filter(c => c.status === 'inProgress').length}
                  </div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="text-3xl font-bold text-green-500">
                    {complaints.filter(c => c.status === 'closed').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Complaints Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <CardTitle>Manage Complaints</CardTitle>

                <div className="flex gap-2 flex-col sm:flex-row">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search complaints..."
                      className="pl-9 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Filter status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="inProgress">In Progress</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="open">Open</TabsTrigger>
                  <TabsTrigger value="inProgress">In Progress</TabsTrigger>
                  <TabsTrigger value="closed">Closed</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="px-4 py-3 text-left font-medium">
                                <Button
                                  variant="ghost"
                                  className="h-8 p-0 font-medium flex items-center"
                                  onClick={() => requestSort('complaintNumber')}
                                >
                                  Complaint #
                                  <ArrowUpDown className="ml-2 h-3 w-3" />
                                </Button>
                              </th>
                              <th className="px-4 py-3 text-left font-medium">
                                <Button
                                  variant="ghost"
                                  className="h-8 p-0 font-medium flex items-center"
                                  onClick={() => requestSort('title')}
                                >
                                  Title
                                  <ArrowUpDown className="ml-2 h-3 w-3" />
                                </Button>
                              </th>
                              <th className="px-4 py-3 text-left font-medium">
                                <Button
                                  variant="ghost"
                                  className="h-8 p-0 font-medium flex items-center"
                                  onClick={() => requestSort('createdAt')}
                                >
                                  Date
                                  <ArrowUpDown className="ml-2 h-3 w-3" />
                                </Button>
                              </th>
                              <th className="px-4 py-3 text-left font-medium">
                                <Button
                                  variant="ghost"
                                  className="h-8 p-0 font-medium flex items-center"
                                  onClick={() => requestSort('status')}
                                >
                                  Status
                                  <ArrowUpDown className="ml-2 h-3 w-3" />
                                </Button>
                              </th>
                              <th className="px-4 py-3 text-right font-medium">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedComplaints.length > 0 ? (
                              sortedComplaints.map((complaint) => (
                                <tr
                                  key={complaint.complaintNumber}
                                  className="border-b hover:bg-muted/50 transition-colors"
                                >
                                  <td className="px-4 py-3 text-left">
                                    {complaint.complaintNumber}
                                  </td>
                                  <td className="px-4 py-3 text-left font-medium">
                                    {complaint.title}
                                  </td>
                                  <td className="px-4 py-3 text-left">
                                    {formatDate(complaint.createdAt)}
                                  </td>
                                  <td className="px-4 py-3 text-left">
                                    <Badge
                                      variant="outline"
                                      className={`flex w-fit items-center gap-1 ${getStatusColor(complaint.status)}`}
                                    >
                                      {getStatusIcon(complaint.status)}
                                      <span className="capitalize">{complaint.status}</span>
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setSelectedComplaint(complaint);
                                            setResponseText(complaint.responseFromDept || '');
                                            setNewStatus(complaint.status);
                                          }}
                                        >
                                          Update
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Update Complaint</DialogTitle>
                                          <DialogDescription>
                                            Change status and provide response for complaint #{selectedComplaint?.complaintNumber}
                                          </DialogDescription>
                                        </DialogHeader>

                                        <div className="grid gap-4 py-4">
                                          <div className="space-y-2">
                                            <Label>Complaint Title</Label>
                                            <p className="font-medium">{selectedComplaint?.title}</p>
                                          </div>

                                          <div className="space-y-2">
                                            <Label htmlFor="status">Update Status</Label>
                                            <Select
                                              value={newStatus}
                                              onValueChange={setNewStatus}
                                            >
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="open">Open</SelectItem>
                                                <SelectItem value="inProgress">In Progress</SelectItem>
                                                <SelectItem value="closed">Closed</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>

                                          <div className="space-y-2">
                                            <Label htmlFor="response">Department Response</Label>
                                            <Textarea
                                              id="response"
                                              placeholder="Provide details about the resolution or current status..."
                                              value={responseText}
                                              onChange={(e) => setResponseText(e.target.value)}
                                              rows={4}
                                            />
                                          </div>
                                        </div>

                                        <DialogFooter>
                                          <Button variant="outline">Cancel</Button>
                                          <Button
                                            onClick={handleUpdateComplaint}
                                            disabled={isSubmitting}
                                          >
                                            {isSubmitting && (
                                              <span className="mr-2">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                              </span>
                                            )}
                                            Save Changes
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                  No complaints found matching your filters
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="open">
                  {/* Similar table but filtered for open complaints */}
                </TabsContent>

                <TabsContent value="inProgress">
                  {/* Similar table but filtered for in-progress complaints */}
                </TabsContent>

                <TabsContent value="closed">
                  {/* Similar table but filtered for closed complaints */}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}