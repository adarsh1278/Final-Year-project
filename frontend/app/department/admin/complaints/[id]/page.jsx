'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    User,
    Calendar,
    MapPin,
    Phone,
    Mail,
    Clock,
    MessageSquare,
    Send,
    ArrowLeft,
    Edit,
    FileText
} from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';

export default function ComplaintDetailsPage() {
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState('');
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState('');
    const [response, setResponse] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        fetchComplaintDetails();
    }, [params.id]);

    const fetchComplaintDetails = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/api/department/complaints/${params.id}`);
            setComplaint(response.data);
            setStatus(response.data.status);
            setPriority(response.data.priority);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching complaint details:', error);
            if (error.response?.status === 401) {
                router.push('/department/login');
            }
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        try {
            setSubmitting(true);
            await axiosInstance.put(`/api/department/complaints/${complaint.complaintNumber}/status`, {
                status,
                priority,
                responseFromDept: response
            });
            await fetchComplaintDetails();
            setResponse('');
            setSubmitting(false);
        } catch (error) {
            console.error('Error updating complaint:', error);
            setSubmitting(false);
        }
    };

    const handleFeedbackSubmit = async () => {
        try {
            setSubmitting(true);
            await axiosInstance.post(`/api/department/complaints/${complaint.complaintNumber}/feedback`, {
                message: feedback
            });
            await fetchComplaintDetails();
            setFeedback('');
            setSubmitting(false);
        } catch (error) {
            console.error('Error adding feedback:', error);
            setSubmitting(false);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Complaint Not Found</h2>
                    <p className="text-gray-600 mb-4">The complaint you're looking for doesn't exist.</p>
                    <Button onClick={() => router.push('/department/admin/complaints')}>
                        Back to Complaints
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="outline"
                                onClick={() => router.push('/department/admin/complaints')}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Complaints
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Complaint #{complaint.complaintNumber}
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {complaint.title || 'Untitled Complaint'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge className={getPriorityColor(complaint.priority)}>
                                {complaint.priority}
                            </Badge>
                            <Badge className={getStatusColor(complaint.status)}>
                                {complaint.status}
                            </Badge>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Complaint Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <FileText className="h-5 w-5 mr-2" />
                                    Complaint Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">
                                        {complaint.title || 'Untitled Complaint'}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {complaint.description}
                                    </p>
                                </div>

                                {complaint.location?.address && (
                                    <div className="flex items-start space-x-2">
                                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="font-medium">Location</p>
                                            <p className="text-gray-600">{complaint.location.address}</p>
                                        </div>
                                    </div>
                                )}

                                {complaint.additionalDetails && (
                                    <div>
                                        <h4 className="font-medium mb-2">Additional Details</h4>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                                                {JSON.stringify(complaint.additionalDetails, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <Calendar className="h-4 w-4" />
                                        <span>Created: {new Date(complaint.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <Clock className="h-4 w-4" />
                                        <span>Updated: {new Date(complaint.updatedAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Department Response */}
                        {complaint.responseFromDept && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Department Response</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                                        <p className="text-blue-800">{complaint.responseFromDept}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Feedback History */}
                        {complaint.feedback && complaint.feedback.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <MessageSquare className="h-5 w-5 mr-2" />
                                        Feedback History
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {complaint.feedback.map((feedbackItem, index) => (
                                            <div key={index} className="border-l-4 border-gray-200 pl-4">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium text-sm">
                                                        {feedbackItem.author} ({feedbackItem.type})
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(feedbackItem.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 text-sm">{feedbackItem.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* User Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    User Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {complaint.userId ? (
                                    <>
                                        <div className="flex items-center space-x-2">
                                            <User className="h-4 w-4 text-gray-400" />
                                            <span className="font-medium">{complaint.userId.name}</span>
                                        </div>
                                        {complaint.userId.email && (
                                            <div className="flex items-center space-x-2">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">{complaint.userId.email}</span>
                                            </div>
                                        )}
                                        {complaint.userId.phone && (
                                            <div className="flex items-center space-x-2">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">{complaint.userId.phone}</span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-gray-500 text-sm">Anonymous user</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Update Status & Priority */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Edit className="h-5 w-5 mr-2" />
                                    Update Complaint
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Status</label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger>
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

                                <div>
                                    <label className="text-sm font-medium mb-1 block">Priority</label>
                                    <Select value={priority} onValueChange={setPriority}>
                                        <SelectTrigger>
                                            <SelectValue />
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
                                    <label className="text-sm font-medium mb-1 block">Response</label>
                                    <Textarea
                                        value={response}
                                        onChange={(e) => setResponse(e.target.value)}
                                        placeholder="Add your response..."
                                        rows={3}
                                    />
                                </div>

                                <Button
                                    onClick={handleStatusUpdate}
                                    disabled={submitting}
                                    className="w-full"
                                >
                                    {submitting ? 'Updating...' : 'Update Complaint'}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Add Feedback */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <MessageSquare className="h-5 w-5 mr-2" />
                                    Add Feedback
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Add feedback message..."
                                    rows={3}
                                />
                                <Button
                                    onClick={handleFeedbackSubmit}
                                    disabled={!feedback.trim() || submitting}
                                    className="w-full"
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    {submitting ? 'Sending...' : 'Send Feedback'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
