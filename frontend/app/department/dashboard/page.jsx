'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Filter, Clock, CheckCircle, RotateCcw, AlertCircle, ArrowUpDown, XCircle, Eye, ArrowRightLeft, Bell } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getDepartmentComplaints, getIncomingTransfers, acceptTransferRequest, rejectTransferRequest } from '@/services/complaintService';

export default function DepartmentDashboardPage() {
  const [complaints, setComplaints] = useState([]);
  const [incomingTransfers, setIncomingTransfers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const { isAuthenticated, isDepartment, loading, department } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isDepartment)) {
      router.push('/department/login');
    }
  }, [loading, isAuthenticated, isDepartment, router]);

  const fetchComplaints = async () => {
    if (!isDepartment) return;
    try {
      const response = await getDepartmentComplaints();
      if (response.complaints && Array.isArray(response.complaints)) {
        setComplaints(response.complaints);
      } else if (Array.isArray(response)) {
        setComplaints(response);
      } else {
        setComplaints([]);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load complaints', variant: 'destructive' });
      setComplaints([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchIncomingTransfers = async () => {
    if (!isDepartment) return;
    try {
      const response = await getIncomingTransfers();
      setIncomingTransfers(response.transfers || []);
    } catch (error) {
      setIncomingTransfers([]);
    }
  };

  const handleAcceptTransfer = async (complaintNumber) => {
    try {
      await acceptTransferRequest(complaintNumber);
      toast({ title: 'Transfer Accepted', description: `Complaint ${complaintNumber} has been accepted` });
      fetchComplaints();
      fetchIncomingTransfers();
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to accept transfer', variant: 'destructive' });
    }
  };

  const handleRejectTransfer = async (complaintNumber) => {
    if (!rejectReason.trim()) {
      toast({ title: 'Error', description: 'Please provide a reason for rejection', variant: 'destructive' });
      return;
    }
    try {
      await rejectTransferRequest(complaintNumber, rejectReason);
      toast({ title: 'Transfer Rejected', description: `Transfer for ${complaintNumber} has been rejected` });
      setRejectingId(null);
      setRejectReason('');
      fetchIncomingTransfers();
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to reject transfer', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchIncomingTransfers();
  }, [isDepartment]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusLabel = (s) => ({ open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed', rejected: 'Rejected' }[s] || s);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <RotateCcw className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (s) => ({ open: 'bg-amber-100 text-amber-800', in_progress: 'bg-blue-100 text-blue-800', resolved: 'bg-green-100 text-green-800', closed: 'bg-gray-100 text-gray-800', rejected: 'bg-red-100 text-red-800' }[s] || 'bg-gray-100 text-gray-600');
  const getPriorityColor = (p) => ({ critical: 'bg-red-100 text-red-800', high: 'bg-orange-100 text-orange-800', medium: 'bg-yellow-100 text-yellow-800', low: 'bg-green-100 text-green-800' }[p] || 'bg-gray-100 text-gray-800');

  const filteredComplaints = (complaints || []).filter(complaint => {
    if (!complaint) return false;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (complaint.complaintNumber || '').toLowerCase().includes(q) ||
      (complaint.title || '').toLowerCase().includes(q) ||
      (complaint.userId?.name || '').toLowerCase().includes(q) ||
      (complaint.description || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedComplaints = [...filteredComplaints].sort((a, b) => {
    const { key, direction } = sortConfig;
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white py-2.5 border-b shadow-sm">
        <div className="container mx-auto px-4">
          <p className="text-sm text-gray-600">
            <a href="/" className="text-blue-700 hover:underline">Home</a>
            <span className="mx-1.5 text-gray-400">/</span>
            <span className="font-medium text-gray-800">Department Dashboard</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="grid gap-6">
            <Card className="border-0 shadow-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl text-white">Department Dashboard</CardTitle>
                    <CardDescription className="text-blue-200">Manage and respond to citizen complaints</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white/10 text-white border-white/20 px-3 py-1 text-sm">
                      {department?.name || 'Department'} Office
                    </Badge>
                    <Button variant="outline" size="sm" className="text-white border-white/30 bg-transparent hover:bg-white/10" onClick={() => { setIsLoading(true); fetchComplaints(); fetchIncomingTransfers(); }}>
                      <RotateCcw className="h-4 w-4 mr-1" /> Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Total', count: complaints?.length || 0, color: 'text-gray-900', bg: 'bg-white' },
                { label: 'Open', count: complaints?.filter(c => c?.status === 'open')?.length || 0, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'In Progress', count: complaints?.filter(c => c?.status === 'in_progress')?.length || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Resolved', count: complaints?.filter(c => c?.status === 'resolved' || c?.status === 'closed')?.length || 0, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Rejected', count: complaints?.filter(c => c?.status === 'rejected')?.length || 0, color: 'text-red-600', bg: 'bg-red-50' },
              ].map(stat => (
                <Card key={stat.label} className="border-0 shadow-md">
                  <CardContent className={`p-4 ${stat.bg} rounded-lg`}>
                    <div className="flex flex-col items-center text-center">
                      <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Incoming Transfer Requests */}
            {incomingTransfers.length > 0 && (
              <Card className="border-0 shadow-xl overflow-hidden border-l-4 border-l-orange-500">
                <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-500 text-white py-4">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    <CardTitle className="text-lg text-white">Incoming Transfer Requests ({incomingTransfers.length})</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {incomingTransfers.map((transfer) => (
                    <div key={transfer.complaintNumber} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <ArrowRightLeft className="h-4 w-4 text-orange-600" />
                            <span className="font-mono text-sm font-medium">{transfer.complaintNumber}</span>
                            <Badge className="bg-orange-100 text-orange-800 text-xs">Pending</Badge>
                          </div>
                          <h4 className="font-medium text-gray-900">{transfer.title}</h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{transfer.description}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            From: <span className="font-medium">{transfer.pendingTransfer?.fromDepartment}</span> • 
                            Reason: <span className="font-medium">{transfer.pendingTransfer?.reason}</span> • 
                            User: <span className="font-medium">{transfer.userId?.name || 'N/A'}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {rejectingId === transfer.complaintNumber ? (
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="Reason for rejection..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-48 h-9 text-sm"
                              />
                              <Button size="sm" variant="destructive" onClick={() => handleRejectTransfer(transfer.complaintNumber)}>
                                Confirm
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => { setRejectingId(null); setRejectReason(''); }}>
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAcceptTransfer(transfer.complaintNumber)}>
                                <CheckCircle className="h-4 w-4 mr-1" /> Accept
                              </Button>
                              <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => setRejectingId(transfer.complaintNumber)}>
                                <XCircle className="h-4 w-4 mr-1" /> Reject
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => router.push(`/department/dashboard/${transfer.complaintNumber}`)}>
                                <Eye className="h-4 w-4 mr-1" /> View
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Table */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <CardHeader className="bg-gray-50 border-b">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <CardTitle className="text-gray-900">Manage Complaints</CardTitle>
                  <div className="flex gap-2 flex-col sm:flex-row">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="Search complaints..." className="pl-9 w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-400" />
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px]"><SelectValue placeholder="Filter status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div></div>
                ) : (
                  <div className="rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="px-4 py-3 text-left font-medium">
                              <Button variant="ghost" className="h-8 p-0 font-medium flex items-center" onClick={() => requestSort('complaintNumber')}>
                                Complaint #<ArrowUpDown className="ml-1 h-3 w-3" />
                              </Button>
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                              <Button variant="ghost" className="h-8 p-0 font-medium flex items-center" onClick={() => requestSort('title')}>
                                Title<ArrowUpDown className="ml-1 h-3 w-3" />
                              </Button>
                            </th>
                            <th className="px-4 py-3 text-left font-medium">User</th>
                            <th className="px-4 py-3 text-left font-medium">
                              <Button variant="ghost" className="h-8 p-0 font-medium flex items-center" onClick={() => requestSort('priority')}>
                                Priority<ArrowUpDown className="ml-1 h-3 w-3" />
                              </Button>
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                              <Button variant="ghost" className="h-8 p-0 font-medium flex items-center" onClick={() => requestSort('createdAt')}>
                                Date<ArrowUpDown className="ml-1 h-3 w-3" />
                              </Button>
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                              <Button variant="ghost" className="h-8 p-0 font-medium flex items-center" onClick={() => requestSort('status')}>
                                Status<ArrowUpDown className="ml-1 h-3 w-3" />
                              </Button>
                            </th>
                            <th className="px-4 py-3 text-center font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedComplaints.length > 0 ? (
                            sortedComplaints.map((comp) => (
                              <tr
                                key={comp.complaintNumber}
                                className="border-b hover:bg-blue-50/50 transition-colors cursor-pointer"
                                onClick={() => router.push(`/department/dashboard/${comp.complaintNumber}`)}
                              >
                                <td className="px-4 py-3 text-left font-mono text-xs">{comp.complaintNumber}</td>
                                <td className="px-4 py-3 text-left font-medium max-w-[200px] truncate">{comp.title}</td>
                                <td className="px-4 py-3 text-left text-xs">{comp.userId?.name || 'N/A'}</td>
                                <td className="px-4 py-3 text-left">
                                  <Badge variant="outline" className={`text-xs ${getPriorityColor(comp.priority)}`}>
                                    {comp.priority || 'medium'}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-left text-xs">{formatDate(comp.createdAt)}</td>
                                <td className="px-4 py-3 text-left">
                                  <Badge variant="outline" className={`flex w-fit items-center gap-1 ${getStatusColor(comp.status)}`}>
                                    {getStatusIcon(comp.status)}
                                    <span>{getStatusLabel(comp.status)}</span>
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    size="sm"
                                    className="bg-blue-700 hover:bg-blue-800 text-white text-xs"
                                    onClick={() => router.push(`/department/dashboard/${comp.complaintNumber}`)}
                                  >
                                    <Eye className="h-3.5 w-3.5 mr-1" />
                                    View & Manage
                                  </Button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                No complaints found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
