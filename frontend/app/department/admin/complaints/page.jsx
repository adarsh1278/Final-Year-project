'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
    Search,
    Filter,
    RefreshCw,
    Eye,
    Edit,
    MessageSquare,
    Calendar,
    User,
    MapPin,
    Clock
} from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';

export default function ComplaintsPage() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        search: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });
    const [selectedComplaints, setSelectedComplaints] = useState([]);
    const [bulkUpdateDialog, setBulkUpdateDialog] = useState(false);
    const [bulkUpdate, setBulkUpdate] = useState({
        status: '',
        priority: '',
        response: ''
    });
    const router = useRouter();

    useEffect(() => {
        fetchComplaints();
    }, [filters, pagination.page]);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString()
            });

            if (filters.status) params.append('status', filters.status);
            if (filters.priority) params.append('priority', filters.priority);

            const response = await axiosInstance.get(`/api/department/complaints?${params}`);

            let filteredComplaints = response.data.complaints;

            // Apply search filter on frontend (could be moved to backend)
            if (filters.search) {
                filteredComplaints = filteredComplaints.filter(complaint =>
                    complaint.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
                    complaint.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
                    complaint.complaintNumber?.toLowerCase().includes(filters.search.toLowerCase())
                );
            }

            setComplaints(filteredComplaints);
            setPagination(prev => ({
                ...prev,
                ...response.data.pagination
            }));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching complaints:', error);
            if (error.response?.status === 401) {
                router.push('/department/login');
            }
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (complaintNumber, status, response = '') => {
        try {
            await axiosInstance.put(`/api/department/complaints/${complaintNumber}/status`, {
                status,
                responseFromDept: response
            });
            fetchComplaints();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleBulkUpdate = async () => {
        try {
            const complaintIds = selectedComplaints;
            await axiosInstance.put('/api/department/complaints/bulk-update', {
                complaintIds,
                status: bulkUpdate.status || undefined,
                priority: bulkUpdate.priority || undefined,
                responseFromDept: bulkUpdate.response || undefined
            });

            setSelectedComplaints([]);
            setBulkUpdateDialog(false);
            setBulkUpdate({ status: '', priority: '', response: '' });
            fetchComplaints();
        } catch (error) {
            console.error('Error bulk updating complaints:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-blue-500 text-white';
            case 'in_progress': return 'bg-yellow-500 text-white';
            case 'resolved': return 'bg-green-500 text-white';
            case 'closed': return 'bg-gray-500 text-white';
            case 'rejected': return 'bg-red-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'critical': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleComplaintSelect = (complaintId, checked) => {
        if (checked) {
            setSelectedComplaints([...selectedComplaints, complaintId]);
        } else {
            setSelectedComplaints(selectedComplaints.filter(id => id !== complaintId));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Complaints Management</h1>
                            <p className="text-sm text-gray-600">
                                Manage and track all department complaints
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="outline"
                                onClick={() => router.push('/department/admin')}
                            >
                                Dashboard
                            </Button>
                            {selectedComplaints.length > 0 && (
                                <Dialog open={bulkUpdateDialog} onOpenChange={setBulkUpdateDialog}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            Bulk Update ({selectedComplaints.length})
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Bulk Update Complaints</DialogTitle>
                                            <DialogDescription>
                                                Update multiple complaints at once
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium">Status</label>
                                                <Select value={bulkUpdate.status} onValueChange={(value) => setBulkUpdate(prev => ({ ...prev, status: value }))}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="open">Open</SelectItem>
                                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                                        <SelectItem value="resolved">Resolved</SelectItem>
                                                        <SelectItem value="closed">Closed</SelectItem>
                                                        <SelectItem value="rejected">Rejected</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">Priority</label>
                                                <Select value={bulkUpdate.priority} onValueChange={(value) => setBulkUpdate(prev => ({ ...prev, priority: value }))}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select priority" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="low">Low</SelectItem>
                                                        <SelectItem value="medium">Medium</SelectItem>
                                                        <SelectItem value="high">High</SelectItem>
                                                        <SelectItem value="critical">Critical</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">Response</label>
                                                <Textarea
                                                    value={bulkUpdate.response}
                                                    onChange={(e) => setBulkUpdate(prev => ({ ...prev, response: e.target.value }))}
                                                    placeholder="Add response message..."
                                                    rows={3}
                                                />
                                            </div>
                                            <Button onClick={handleBulkUpdate} className="w-full">
                                                Update {selectedComplaints.length} Complaints
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Input
                                    placeholder="Search complaints..."
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    className="w-full"
                                />
                            </div>
                            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Status</SelectItem>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Priority</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={fetchComplaints} variant="outline">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Complaints List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Complaints ({pagination.total})</CardTitle>
                        <CardDescription>
                            Manage and track complaint status and responses
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : complaints.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No complaints found
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {complaints.map((complaint) => (
                                    <div
                                        key={complaint._id}
                                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-3">
                                                <Checkbox
                                                    checked={selectedComplaints.includes(complaint._id)}
                                                    onCheckedChange={(checked) => handleComplaintSelect(complaint._id, checked)}
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <Badge className={getPriorityColor(complaint.priority)}>
                                                            {complaint.priority}
                                                        </Badge>
                                                        <Badge className={getStatusColor(complaint.status)}>
                                                            {complaint.status}
                                                        </Badge>
                                                        <span className="text-sm text-gray-500">
                                                            #{complaint.complaintNumber}
                                                        </span>
                                                    </div>

                                                    <h3 className="font-semibold text-lg mb-1">
                                                        {complaint.title || 'Untitled Complaint'}
                                                    </h3>

                                                    <p className="text-gray-600 mb-3 line-clamp-2">
                                                        {complaint.description}
                                                    </p>

                                                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                                        <div className="flex items-center">
                                                            <User className="h-4 w-4 mr-1" />
                                                            {complaint.userId?.name || 'Anonymous'}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Calendar className="h-4 w-4 mr-1" />
                                                            {new Date(complaint.createdAt).toLocaleDateString()}
                                                        </div>
                                                        {complaint.location?.address && (
                                                            <div className="flex items-center">
                                                                <MapPin className="h-4 w-4 mr-1" />
                                                                {complaint.location.address}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {complaint.responseFromDept && (
                                                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3">
                                                            <p className="text-sm text-blue-800">
                                                                <strong>Department Response:</strong> {complaint.responseFromDept}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {complaint.feedback && complaint.feedback.length > 0 && (
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <MessageSquare className="h-4 w-4 mr-1" />
                                                            {complaint.feedback.length} feedback messages
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col space-y-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/department/admin/complaints/${complaint._id}`)}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>

                                                <Select
                                                    value={complaint.status}
                                                    onValueChange={(value) => handleStatusUpdate(complaint.complaintNumber, value)}
                                                >
                                                    <SelectTrigger className="w-[140px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
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
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-gray-500">
                                    Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        disabled={pagination.page === 1}
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        disabled={pagination.page === pagination.pages}
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
