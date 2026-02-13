'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Clock, CheckCircle, RotateCcw, XCircle, AlertCircle,
  MessageSquare, ArrowRightLeft, Star, Send, User, Building2, Eye
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/services/axiosInstance';
import { acceptTransferRequest, rejectTransferRequest } from '@/services/complaintService';
import ChatRoom from '@/components/ChatRoom';

const ALL_DEPARTMENTS = [
  "Electricity", "Water", "Roads", "Sanitation", "Parks",
  "Health", "Education", "Transportation", "Building", "Environment", "Other"
];

export default function ComplaintDetailPage() {
  const { complaintNumber } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, isDepartment, loading, department } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Update status
  const [newStatus, setNewStatus] = useState('');
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transfer
  const [transferDept, setTransferDept] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  // Close
  const [closeReason, setCloseReason] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  // Chat
  const [showChat, setShowChat] = useState(false);

  // Transfer accept/reject (for receiving department)
  const [transferRejectReason, setTransferRejectReason] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isDepartment)) {
      router.push('/department/login');
    }
  }, [loading, isAuthenticated, isDepartment, router]);

  useEffect(() => {
    fetchComplaint();
  }, [complaintNumber, isDepartment]);

  const fetchComplaint = async () => {
    if (!isDepartment || !complaintNumber) return;
    try {
      const res = await axiosInstance.get(`/api/departments/complaints/${complaintNumber}`);
      const data = res.data?.complaint || res.data;
      setComplaint(data);
      setNewStatus(data.status);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load complaint', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    setIsSubmitting(true);
    try {
      await axiosInstance.put(`/api/departments/complaints/${complaintNumber}/status`, {
        status: newStatus,
        responseFromDept: responseText
      });
      toast({ title: 'Updated', description: `Status changed to ${getStatusLabel(newStatus)}` });
      setResponseText('');
      fetchComplaint();
    } catch (err) {
      toast({ title: 'Failed', description: err.response?.data?.message || 'Update failed', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferDept || !transferReason) {
      toast({ title: 'Error', description: 'Please select department and provide reason', variant: 'destructive' });
      return;
    }
    setIsTransferring(true);
    try {
      await axiosInstance.post(`/api/departments/complaints/${complaintNumber}/transfer`, {
        toDepartment: transferDept,
        reason: transferReason
      });
      toast({ title: 'Transfer Requested', description: `Transfer request sent to ${transferDept}. Awaiting acceptance.` });
      setTransferDept('');
      setTransferReason('');
      fetchComplaint();
    } catch (err) {
      toast({ title: 'Failed', description: err.response?.data?.message || 'Transfer failed', variant: 'destructive' });
    } finally {
      setIsTransferring(false);
    }
  };

  const handleRequestClose = async () => {
    setIsClosing(true);
    try {
      await axiosInstance.post(`/api/departments/complaints/${complaintNumber}/request-close`, {
        reason: closeReason || 'Complaint resolved, requesting closure'
      });
      toast({ title: 'Sent', description: 'Close request sent to user' });
      setCloseReason('');
      fetchComplaint();
    } catch (err) {
      toast({ title: 'Failed', description: err.response?.data?.message || 'Failed', variant: 'destructive' });
    } finally {
      setIsClosing(false);
    }
  };

  const handleAcceptTransfer = async () => {
    setIsAccepting(true);
    try {
      await acceptTransferRequest(complaintNumber);
      toast({ title: 'Accepted', description: 'Transfer accepted. This complaint is now assigned to your department.' });
      fetchComplaint();
    } catch (err) {
      toast({ title: 'Failed', description: err.response?.data?.message || 'Accept failed', variant: 'destructive' });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRejectTransfer = async () => {
    if (!transferRejectReason.trim()) {
      toast({ title: 'Error', description: 'Please provide a reason for rejection', variant: 'destructive' });
      return;
    }
    setIsRejecting(true);
    try {
      await rejectTransferRequest(complaintNumber, transferRejectReason);
      toast({ title: 'Rejected', description: 'Transfer request has been rejected.' });
      setTransferRejectReason('');
      router.push('/department/dashboard');
    } catch (err) {
      toast({ title: 'Failed', description: err.response?.data?.message || 'Reject failed', variant: 'destructive' });
    } finally {
      setIsRejecting(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatDateTime = (d) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getStatusLabel = (s) => ({ open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed', rejected: 'Rejected' }[s] || s);
  const getStatusColor = (s) => ({ open: 'bg-amber-100 text-amber-800 border-amber-300', in_progress: 'bg-blue-100 text-blue-800 border-blue-300', resolved: 'bg-green-100 text-green-800 border-green-300', closed: 'bg-gray-100 text-gray-700 border-gray-300', rejected: 'bg-red-100 text-red-800 border-red-300' }[s] || 'bg-gray-100 text-gray-700');
  const getStatusIcon = (s) => ({ open: <Clock className="h-4 w-4" />, in_progress: <RotateCcw className="h-4 w-4" />, resolved: <CheckCircle className="h-4 w-4" />, closed: <CheckCircle className="h-4 w-4" />, rejected: <XCircle className="h-4 w-4" /> }[s] || <AlertCircle className="h-4 w-4" />);
  const getPriorityColor = (p) => ({ critical: 'bg-red-100 text-red-800', high: 'bg-orange-100 text-orange-800', medium: 'bg-yellow-100 text-yellow-800', low: 'bg-green-100 text-green-800' }[p] || 'bg-gray-100 text-gray-700');

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 mb-4">Complaint not found</p>
        <Button onClick={() => router.push('/department/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  const tabs = [
    { id: 'details', label: 'Details', icon: <Eye className="h-4 w-4" /> },
    { id: 'update', label: 'Update Status', icon: <RotateCcw className="h-4 w-4" /> },
    { id: 'transfer', label: 'Transfer', icon: <ArrowRightLeft className="h-4 w-4" /> },
    { id: 'history', label: 'History', icon: <Clock className="h-4 w-4" /> },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white py-2.5 border-b shadow-sm">
        <div className="container mx-auto px-4">
          <p className="text-sm text-gray-600">
            <a href="/" className="text-blue-700 hover:underline">Home</a>
            <span className="mx-1.5 text-gray-400">/</span>
            <a href="/department/dashboard" className="text-blue-700 hover:underline">Dashboard</a>
            <span className="mx-1.5 text-gray-400">/</span>
            <span className="font-medium text-gray-800">{complaintNumber}</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => router.push('/department/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{complaint.title}</h1>
                <p className="text-sm text-gray-500 font-mono">{complaint.complaintNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(complaint.status)} flex items-center gap-1 px-3 py-1`}>
                {getStatusIcon(complaint.status)}
                {getStatusLabel(complaint.status)}
              </Badge>
              <Button onClick={() => setShowChat(true)} className="bg-blue-700 hover:bg-blue-800 text-white">
                <MessageSquare className="h-4 w-4 mr-2" /> Chat
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mb-6 bg-white rounded-lg border shadow-sm p-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Area */}
            <div className="lg:col-span-2 space-y-6">

              {/* DETAILS TAB */}
              {activeTab === 'details' && (
                <>
                  <Card className="border-0 shadow-xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 border-b">
                      <CardTitle className="text-lg text-white">Complaint Information</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <Label className="text-xs text-gray-500 uppercase tracking-wide">Description</Label>
                        <p className="mt-1 text-gray-800 leading-relaxed">{complaint.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500 uppercase tracking-wide">Department</Label>
                          <p className="mt-1 font-medium">{complaint.department}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500 uppercase tracking-wide">Priority</Label>
                          <Badge className={`mt-1 ${getPriorityColor(complaint.priority)} capitalize`}>{complaint.priority || 'medium'}</Badge>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500 uppercase tracking-wide">Filed On</Label>
                          <p className="mt-1 text-sm">{formatDateTime(complaint.createdAt)}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500 uppercase tracking-wide">Status</Label>
                          <Badge className={`mt-1 flex w-fit items-center gap-1 ${getStatusColor(complaint.status)}`}>
                            {getStatusIcon(complaint.status)} {getStatusLabel(complaint.status)}
                          </Badge>
                        </div>
                      </div>

                      {complaint.responseFromDept && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <Label className="text-xs text-blue-700 uppercase tracking-wide">Department Response</Label>
                          <p className="mt-1 text-sm text-gray-800">{complaint.responseFromDept}</p>
                        </div>
                      )}

                      {complaint.additionalDetails && Object.keys(complaint.additionalDetails).length > 0 && (
                        <div>
                          <Label className="text-xs text-gray-500 uppercase tracking-wide">Additional Details</Label>
                          <div className="mt-2 grid grid-cols-2 gap-3">
                            {Object.entries(complaint.additionalDetails).map(([key, value]) => (
                              <div key={key} className="bg-gray-50 rounded-md p-3">
                                <span className="text-xs text-gray-500 capitalize">{key}</span>
                                <p className="text-sm font-medium">{String(value)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* User Feedback */}
                  {complaint.userFeedback?.rating && (
                    <Card>
                      <CardHeader className="bg-yellow-50 border-b">
                        <CardTitle className="text-lg text-yellow-900 flex items-center gap-2">
                          <Star className="h-5 w-5" /> User Feedback
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`h-5 w-5 ${star <= complaint.userFeedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="text-sm text-gray-500 ml-2">{complaint.userFeedback.rating}/5</span>
                        </div>
                        {complaint.userFeedback.comment && (
                          <p className="text-sm text-gray-700 mt-2">{complaint.userFeedback.comment}</p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Close Request Status */}
                  {complaint.closeRequest?.requested && (
                    <Card>
                      <CardHeader className="bg-orange-50 border-b">
                        <CardTitle className="text-lg text-orange-900">Close Request</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Status:</span>
                          <Badge className={
                            complaint.closeRequest.userResponse === 'accepted' ? 'bg-green-100 text-green-800' :
                            complaint.closeRequest.userResponse === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {complaint.closeRequest.userResponse || 'Pending'}
                          </Badge>
                        </div>
                        <p className="text-sm"><span className="text-gray-500">Reason:</span> {complaint.closeRequest.reason}</p>
                        {complaint.closeRequest.userResponseMessage && (
                          <p className="text-sm"><span className="text-gray-500">User Response:</span> {complaint.closeRequest.userResponseMessage}</p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {/* UPDATE TAB */}
              {activeTab === 'update' && (
                <Card className="border-0 shadow-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 border-b">
                    <CardTitle className="text-lg text-white">Update Status</CardTitle>
                    <CardDescription className="text-blue-200">Change the complaint status and add a response</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    {complaint.status === 'closed' || complaint.status === 'rejected' || complaint.status === 'resolved' ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">This complaint is {complaint.status} and cannot be updated.</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label className="font-medium">New Status</Label>
                          <Select value={newStatus} onValueChange={setNewStatus}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select new status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="font-medium">Response Message</Label>
                          <Textarea
                            placeholder="Provide details about the status update to the citizen..."
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            rows={5}
                            className="resize-none"
                          />
                        </div>

                        <Button
                          onClick={handleUpdateStatus}
                          disabled={isSubmitting}
                          className="w-full bg-blue-700 hover:bg-blue-800"
                        >
                          {isSubmitting ? 'Updating...' : 'Update Complaint'}
                        </Button>
                      </>
                    )}

                    {/* Request Close Section */}
                    {complaint.status === 'resolved' && !complaint.closeRequest?.requested && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <Label className="font-medium text-green-800">Request Closure</Label>
                          <p className="text-sm text-gray-500">Since the complaint is resolved, you can request the user to close it.</p>
                          <Textarea
                            placeholder="Reason for closing..."
                            value={closeReason}
                            onChange={(e) => setCloseReason(e.target.value)}
                            rows={3}
                            className="resize-none"
                          />
                          <Button
                            onClick={handleRequestClose}
                            disabled={isClosing}
                            variant="outline"
                            className="w-full border-green-600 text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {isClosing ? 'Sending...' : 'Request Close'}
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* TRANSFER TAB */}
              {activeTab === 'transfer' && (
                <Card className="border-0 shadow-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-orange-700 to-orange-600 border-b">
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <ArrowRightLeft className="h-5 w-5" /> Transfer Complaint
                    </CardTitle>
                    <CardDescription className="text-orange-100">Reassign this complaint to another department</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    {/* Pending Transfer - Receiving Department View */}
                    {complaint.pendingTransfer?.isPending && complaint.pendingTransfer?.toDepartment === department?.name ? (
                      <div className="space-y-4">
                        <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                            <h3 className="font-semibold text-orange-900">Incoming Transfer Request</h3>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p><span className="text-gray-500">From:</span> <span className="font-medium">{complaint.pendingTransfer.fromDepartment}</span></p>
                            <p><span className="text-gray-500">Reason:</span> <span className="font-medium">{complaint.pendingTransfer.reason}</span></p>
                            <p><span className="text-gray-500">Requested:</span> <span className="font-medium">{formatDateTime(complaint.pendingTransfer.requestedAt)}</span></p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={handleAcceptTransfer}
                            disabled={isAccepting}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {isAccepting ? 'Accepting...' : 'Accept Transfer'}
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label className="font-medium text-red-800">Reject Transfer</Label>
                          <Textarea
                            placeholder="Provide reason for rejection..."
                            value={transferRejectReason}
                            onChange={(e) => setTransferRejectReason(e.target.value)}
                            rows={3}
                            className="resize-none"
                          />
                          <Button
                            onClick={handleRejectTransfer}
                            disabled={isRejecting || !transferRejectReason.trim()}
                            variant="outline"
                            className="w-full border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            {isRejecting ? 'Rejecting...' : 'Reject Transfer'}
                          </Button>
                        </div>
                      </div>
                    ) : complaint.pendingTransfer?.isPending && complaint.pendingTransfer?.fromDepartment === department?.name ? (
                      /* Pending Transfer - Sending Department View */
                      <div className="space-y-4">
                        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <Clock className="h-5 w-5 text-yellow-600 animate-pulse" />
                            <h3 className="font-semibold text-yellow-900">Transfer Pending Acceptance</h3>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p><span className="text-gray-500">To:</span> <span className="font-medium">{complaint.pendingTransfer.toDepartment}</span></p>
                            <p><span className="text-gray-500">Reason:</span> <span className="font-medium">{complaint.pendingTransfer.reason}</span></p>
                            <p><span className="text-gray-500">Requested:</span> <span className="font-medium">{formatDateTime(complaint.pendingTransfer.requestedAt)}</span></p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 text-center">
                          Waiting for <strong>{complaint.pendingTransfer.toDepartment}</strong> department to accept or reject the transfer.
                          You can use the chat to communicate with them.
                        </p>
                      </div>
                    ) : complaint.status === 'closed' || complaint.status === 'rejected' ? (
                      <div className="text-center py-8">
                        <XCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Closed or rejected complaints cannot be transferred.</p>
                      </div>
                    ) : complaint.status === 'resolved' ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Resolved complaints cannot be transferred.</p>
                      </div>
                    ) : (
                      /* Normal Transfer Form */
                      <>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <Label className="text-xs text-gray-500 uppercase tracking-wide">Current Department</Label>
                          <p className="text-sm font-medium mt-1">{department?.name || complaint.department}</p>
                        </div>

                        <div className="space-y-2">
                          <Label className="font-medium">Transfer To</Label>
                          <Select value={transferDept} onValueChange={setTransferDept}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select target department" />
                            </SelectTrigger>
                            <SelectContent>
                              {ALL_DEPARTMENTS.filter(d => d !== department?.name && d !== complaint.department).map(d => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="font-medium">Reason for Transfer</Label>
                          <Textarea
                            placeholder="Explain why this complaint needs to be transferred..."
                            value={transferReason}
                            onChange={(e) => setTransferReason(e.target.value)}
                            rows={4}
                            className="resize-none"
                          />
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <p className="text-sm text-amber-800">
                            <strong>Note:</strong> A transfer request will be sent to the selected department. The complaint will only move after they accept.
                          </p>
                        </div>

                        <Button
                          onClick={handleTransfer}
                          disabled={isTransferring || !transferDept || !transferReason}
                          className="w-full bg-orange-600 hover:bg-orange-700"
                        >
                          <ArrowRightLeft className="h-4 w-4 mr-2" />
                          {isTransferring ? 'Sending Request...' : 'Request Transfer'}
                        </Button>
                      </>
                    )}

                    {/* Transfer History */}
                    {complaint.transferHistory && complaint.transferHistory.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-3 block">Transfer History</Label>
                          <div className="space-y-3">
                            {complaint.transferHistory.map((t, i) => (
                              <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                                <ArrowRightLeft className={`h-4 w-4 mt-0.5 shrink-0 ${
                                  t.status === 'accepted' ? 'text-green-500' :
                                  t.status === 'rejected' ? 'text-red-500' :
                                  'text-orange-500'
                                }`} />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">{t.fromDepartment} → {t.toDepartment}</p>
                                    {t.status && (
                                      <Badge className={`text-xs ${
                                        t.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                        t.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {t.status}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500">{t.reason}</p>
                                  {t.rejectionReason && (
                                    <p className="text-xs text-red-500 mt-1">Rejection: {t.rejectionReason}</p>
                                  )}
                                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(t.timestamp)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* HISTORY TAB */}
              {activeTab === 'history' && (
                <Card className="border-0 shadow-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-800 to-green-700 border-b">
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Clock className="h-5 w-5" /> Tracking History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {complaint.trackingHistory && complaint.trackingHistory.length > 0 ? (
                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                        <div className="space-y-6">
                          {complaint.trackingHistory.map((entry, idx) => (
                            <div key={idx} className="relative flex items-start gap-4 pl-10">
                              <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-white shadow ${
                                entry.status === 'open' ? 'bg-amber-400' :
                                entry.status === 'in_progress' ? 'bg-blue-500' :
                                entry.status === 'resolved' ? 'bg-green-500' :
                                entry.status === 'closed' ? 'bg-gray-500' :
                                entry.status === 'rejected' ? 'bg-red-500' : 'bg-gray-400'
                              }`}></div>
                              <div className="bg-white border rounded-lg p-4 flex-1 shadow-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <Badge variant="outline" className={`text-xs ${getStatusColor(entry.status)}`}>
                                    {getStatusLabel(entry.status)}
                                  </Badge>
                                  <span className="text-xs text-gray-400">{formatDateTime(entry.timestamp)}</span>
                                </div>
                                <p className="text-sm text-gray-700 mt-1">{entry.message}</p>
                                {entry.updatedByType && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    By: {entry.updatedByType === 'department' ? `${entry.department || 'Department'}` : entry.updatedByType}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No tracking history available</p>
                      </div>
                    )}

                    {/* Department Feedback/Responses */}
                    {complaint.feedback && complaint.feedback.length > 0 && (
                      <>
                        <Separator className="my-6" />
                        <div>
                          <Label className="font-medium text-gray-700 mb-3 block">Department Responses</Label>
                          <div className="space-y-3">
                            {complaint.feedback.map((fb, i) => (
                              <div key={i} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-gray-800">{fb.message}</p>
                                <p className="text-xs text-gray-400 mt-2">{formatDateTime(fb.createdAt)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* User Info */}
              <Card className="border-0 shadow-md overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 border-b py-3">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <User className="h-4 w-4" /> Citizen Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500">Name</span>
                    <p className="font-medium">{complaint.userId?.name || 'N/A'}</p>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-gray-500">Email</span>
                    <p className="font-medium">{complaint.userId?.email || 'N/A'}</p>
                  </div>
                  {complaint.userId?.phone && (
                    <>
                      <Separator />
                      <div>
                        <span className="text-gray-500">Phone</span>
                        <p className="font-medium">{complaint.userId.phone}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Quick Info */}
              <Card className="border-0 shadow-md overflow-hidden">
                <CardHeader className="bg-gray-50 border-b py-3">
                  <CardTitle className="text-sm text-gray-700">Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Priority</span>
                    <Badge className={`capitalize ${getPriorityColor(complaint.priority)}`}>{complaint.priority || 'medium'}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-500">Filed</span>
                    <span className="font-medium">{formatDate(complaint.createdAt)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-500">Updated</span>
                    <span className="font-medium">{formatDate(complaint.updatedAt || complaint.createdAt)}</span>
                  </div>
                  {complaint.transferHistory?.length > 0 && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-500">Transfers</span>
                        <span className="font-medium">{complaint.transferHistory.length}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-0 shadow-md overflow-hidden">
                <CardHeader className="bg-gray-50 border-b py-3">
                  <CardTitle className="text-sm text-gray-700">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShowChat(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" /> Open Chat
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab('update')}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" /> Update Status
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab('transfer')}
                  >
                    <ArrowRightLeft className="h-4 w-4 mr-2" /> Transfer
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chat Modal */}
      {showChat && (
        <ChatRoom
          complaintNumber={complaintNumber}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}
