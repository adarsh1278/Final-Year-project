'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, ChevronLeft, User, CalendarDays, Mail, MessageSquare, Star, Send, ArrowRightLeft, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { trackComplaint, submitUserFeedback, respondToCloseRequest } from '@/services/complaintService';
import ChatRoom from '@/components/ChatRoom';
import Link from 'next/link';

export default function TrackComplaintPage() {
  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHover, setFeedbackHover] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [closeResponseMsg, setCloseResponseMsg] = useState('');
  const [isRespondingClose, setIsRespondingClose] = useState(false);
  const params = useParams();
  const complaintNumber = params.complaintNumber;
  const { toast } = useToast();
  const { isAuthenticated, isUser } = useAuth();

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const data = await trackComplaint(complaintNumber);
        setComplaint(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch complaint details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchComplaint();
  }, [complaintNumber, toast]);

  const handleSubmitFeedback = async () => {
    if (feedbackRating === 0) {
      toast({ title: 'Error', description: 'Please select a rating', variant: 'destructive' });
      return;
    }
    setIsSubmittingFeedback(true);
    try {
      await submitUserFeedback(complaintNumber, { rating: feedbackRating, comment: feedbackComment });
      toast({ title: 'Thank you!', description: 'Your feedback has been submitted', variant: 'success' });
      // Refresh complaint data
      const data = await trackComplaint(complaintNumber);
      setComplaint(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit feedback',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const refreshComplaint = async () => {
    try {
      const data = await trackComplaint(complaintNumber);
      setComplaint(data);
    } catch (error) {}
  };

  const handleCloseResponse = async (accepted) => {
    setIsRespondingClose(true);
    try {
      await respondToCloseRequest(complaintNumber, { accepted, responseMessage: closeResponseMsg });
      toast({
        title: accepted ? 'Complaint Closed' : 'Closure Rejected',
        description: accepted ? 'Your complaint has been closed successfully.' : 'You have rejected the closure request. The department will continue working on it.',
      });
      setCloseResponseMsg('');
      refreshComplaint();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to respond',
        variant: 'destructive',
      });
    } finally {
      setIsRespondingClose(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <Clock className="h-5 w-5 text-amber-500" />;
      case 'in_progress': return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'resolved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'closed': return <CheckCircle className="h-5 w-5 text-gray-500" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-amber-100 text-amber-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-amber-100 text-amber-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'open': return 'Open';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      case 'closed': return 'Closed';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const getTimelineDotColor = (status) => {
    switch (status) {
      case 'open': return 'bg-amber-500';
      case 'in_progress': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader><CardTitle className="text-2xl">Complaint Not Found</CardTitle>
              <CardDescription>The complaint number {complaintNumber} could not be found</CardDescription>
            </CardHeader>
            <CardContent><p className="text-center py-8 text-gray-500">Please check the complaint number and try again</p></CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/"><ChevronLeft className="h-4 w-4 mr-2" />Back to Home</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  const trackingHistory = complaint.trackingHistory || [];
  const canGiveFeedback = isAuthenticated && isUser && ['resolved', 'closed'].includes(complaint.status) && !complaint.userFeedback?.rating;

  // Status progress steps
  const statusSteps = ['open', 'in_progress', 'resolved', 'closed'];
  const currentStepIndex = statusSteps.indexOf(complaint.status);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white py-2.5 border-b shadow-sm">
        <div className="container mx-auto px-4">
          <p className="text-sm text-gray-600">
            <Link href="/" className="text-blue-700 hover:underline">Home</Link>
            <span className="mx-1.5 text-gray-400">/</span>
            <span className="font-medium text-gray-800">Track Complaint</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

            {/* Status Progress Bar */}
            <Card className="mb-6 border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">Complaint Status</h3>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600 font-medium">Current Status</span>
                  <Badge variant="outline" className={getStatusColor(complaint.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(complaint.status)}
                      {getStatusLabel(complaint.status)}
                    </span>
                  </Badge>
                </div>
                {complaint.status !== 'rejected' && (
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 z-0"></div>
                    <div className="absolute top-4 left-0 h-1 bg-blue-500 z-0 transition-all duration-500"
                      style={{ width: `${Math.max(0, currentStepIndex) / (statusSteps.length - 1) * 100}%` }}></div>
                    {statusSteps.map((step, idx) => (
                      <div key={step} className="flex flex-col items-center z-10 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${idx <= currentStepIndex ? 'bg-blue-600' : 'bg-gray-300'}`}>
                          {idx <= currentStepIndex ? '✓' : idx + 1}
                        </div>
                        <span className={`text-xs mt-2 font-medium ${idx <= currentStepIndex ? 'text-blue-700' : 'text-gray-400'}`}>
                          {getStatusLabel(step)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Transfer Notification */}
            {complaint.pendingTransfer?.isPending && (
              <Card className="mb-6 border-2 border-orange-300 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-white" />
                  <h3 className="text-sm font-semibold text-white">Transfer In Progress</h3>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700">
                    Your complaint is being transferred from <strong>{complaint.pendingTransfer.fromDepartment}</strong> to <strong>{complaint.pendingTransfer.toDepartment}</strong>.
                    The receiving department has been notified and will review your complaint shortly.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Requested: {formatDate(complaint.pendingTransfer.requestedAt)}</p>
                </CardContent>
              </Card>
            )}

            {/* Complaint Details */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <Card className="md:col-span-2 border-0 shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
                  <CardTitle className="text-xl text-white">{complaint.title}</CardTitle>
                  <CardDescription className="text-blue-200">Complaint # {complaint.complaintNumber}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-700">{complaint.description}</p>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>Department: <span className="font-medium">{complaint.department}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-gray-400" />
                      <span>Filed: <span className="font-medium">{formatDate(complaint.createdAt)}</span></span>
                    </div>
                    {complaint.priority && (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                        <span>Priority: <Badge variant="outline" className="capitalize">{complaint.priority}</Badge></span>
                      </div>
                    )}
                    {complaint.expectedResolutionDate && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>Expected: <span className="font-medium">{formatDate(complaint.expectedResolutionDate)}</span></span>
                      </div>
                    )}
                  </div>

                  {complaint.responseFromDept && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Latest Response from Department:</h4>
                        <div className="bg-blue-50 p-4 rounded-md text-sm border border-blue-200">
                          {complaint.responseFromDept}
                        </div>
                      </div>
                    </>
                  )}

                  {complaint.additionalDetails && Object.keys(complaint.additionalDetails).length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Additional Details:</h4>
                        <div className="bg-gray-50 p-4 rounded-md grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(complaint.additionalDetails).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-gray-500 capitalize">{key}:</span>
                              <div className="font-medium">{String(value)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Transfer History */}
                  {complaint.transferHistory && complaint.transferHistory.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2"><ArrowRightLeft className="h-4 w-4" /> Transfer History:</h4>
                        <div className="space-y-2">
                          {complaint.transferHistory.map((transfer, idx) => (
                            <div key={idx} className={`p-3 rounded-md text-sm border ${
                              transfer.status === 'accepted' ? 'bg-green-50 border-green-200' :
                              transfer.status === 'rejected' ? 'bg-red-50 border-red-200' :
                              'bg-orange-50 border-orange-200'
                            }`}>
                              <div className="flex items-center justify-between">
                                <p><span className="font-medium">{transfer.fromDepartment}</span> → <span className="font-medium">{transfer.toDepartment}</span></p>
                                {transfer.status && (
                                  <Badge className={`text-xs ${
                                    transfer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                    transfer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>{transfer.status}</Badge>
                                )}
                              </div>
                              <p className="text-gray-500 text-xs mt-1">Reason: {transfer.reason}</p>
                              {transfer.rejectionReason && (
                                <p className="text-red-500 text-xs mt-1">Rejection: {transfer.rejectionReason}</p>
                              )}
                              <p className="text-gray-500 text-xs">{formatDate(transfer.timestamp)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Actions Sidebar */}
              <div className="space-y-4">
                {/* Close Request from Department */}
                {isAuthenticated && isUser && complaint.closeRequest?.requested && complaint.closeRequest?.userResponse === 'pending' && (
                  <Card className="border-2 border-orange-300 shadow-xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-orange-600 to-amber-500 py-3">
                      <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" /> Closure Request
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <p className="text-sm text-gray-700">
                        The <strong>{complaint.closeRequest.requestedBy || complaint.department}</strong> department has requested to close this complaint.
                      </p>
                      {complaint.closeRequest.reason && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Reason</p>
                          <p className="text-sm text-gray-800">{complaint.closeRequest.reason}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Your response (optional)</p>
                        <Textarea
                          placeholder="Add a message..."
                          value={closeResponseMsg}
                          onChange={(e) => setCloseResponseMsg(e.target.value)}
                          rows={2}
                          className="resize-none text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleCloseResponse(true)}
                          disabled={isRespondingClose}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {isRespondingClose ? 'Processing...' : 'Accept & Close'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => handleCloseResponse(false)}
                          disabled={isRespondingClose}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Close Request Already Responded */}
                {complaint.closeRequest?.requested && complaint.closeRequest?.userResponse !== 'pending' && (
                  <Card className="border-0 shadow-md overflow-hidden">
                    <CardHeader className={`py-3 ${complaint.closeRequest.userResponse === 'accepted' ? 'bg-green-50' : 'bg-red-50'}`}>
                      <CardTitle className={`text-sm font-medium ${complaint.closeRequest.userResponse === 'accepted' ? 'text-green-900' : 'text-red-900'}`}>
                        Closure {complaint.closeRequest.userResponse === 'accepted' ? 'Accepted' : 'Rejected'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 text-sm space-y-1">
                      <p className="text-gray-600">Reason: {complaint.closeRequest.reason}</p>
                      {complaint.closeRequest.userResponseMessage && (
                        <p className="text-gray-600">Your response: {complaint.closeRequest.userResponseMessage}</p>
                      )}
                    </CardContent>
                  </Card>
                )}
                <Card className="border-0 shadow-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 pb-3">
                    <CardTitle className="text-sm font-medium text-white">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {isAuthenticated && isUser && complaint.status !== 'closed' && complaint.status !== 'rejected' && (
                      <Button className="w-full" variant="outline" onClick={() => setShowChat(true)}>
                        <MessageSquare className="h-4 w-4 mr-2" />Chat with Department
                      </Button>
                    )}
                    <Button className="w-full" variant="outline" asChild>
                      <Link href="/"><ChevronLeft className="h-4 w-4 mr-2" />Back to Home</Link>
                    </Button>
                    {isAuthenticated && isUser && (
                      <Button className="w-full" variant="outline" asChild>
                        <Link href="/complaint/history">View All Complaints</Link>
                      </Button>
                    )}
                    {!isAuthenticated && (
                      <Button className="w-full" variant="secondary" asChild>
                        <Link href="/login"><User className="h-4 w-4 mr-2" />Login for More</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Existing Feedback Display */}
                {complaint.userFeedback?.rating && (
                  <Card className="border-0 shadow-xl overflow-hidden">
                    <CardHeader className="pb-3 bg-yellow-50">
                      <CardTitle className="text-sm font-medium text-yellow-900">Your Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`h-5 w-5 ${star <= complaint.userFeedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      {complaint.userFeedback.comment && (
                        <p className="text-sm text-gray-500">{complaint.userFeedback.comment}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">Submitted: {formatDate(complaint.userFeedback.submittedAt)}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Tracking Timeline */}
            <Card className="mb-6 border-0 shadow-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
                <CardTitle className="text-lg text-white">Tracking Timeline</CardTitle>
                <CardDescription className="text-blue-200">Complete history of your complaint</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-6">
                    {trackingHistory.length > 0 ? (
                      trackingHistory.map((entry, idx) => (
                        <div key={idx} className="relative flex gap-4 items-start">
                          <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs shrink-0 ${getTimelineDotColor(entry.status)}`}>
                            {entry.updatedByType === 'system' ? '⚙' : entry.updatedByType === 'department' ? '🏛' : '👤'}
                          </div>
                          <div className="flex-1 bg-white border rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-semibold text-gray-800">{entry.message}</h4>
                              <Badge variant="outline" className={`text-xs ${getStatusColor(entry.status)}`}>
                                {getStatusLabel(entry.status)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{formatDate(entry.timestamp)}</span>
                              {entry.department && <span>by {entry.department} Dept</span>}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      /* Fallback timeline from timestamps */
                      <>
                        <div className="relative flex gap-4 items-start">
                          <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs shrink-0 bg-amber-500">⚙</div>
                          <div className="flex-1 bg-white border rounded-lg p-4 shadow-sm">
                            <h4 className="text-sm font-semibold text-gray-800">Complaint Registered</h4>
                            <p className="text-xs text-gray-500">{formatDate(complaint.createdAt)}</p>
                          </div>
                        </div>
                        {complaint.status !== 'open' && (
                          <div className="relative flex gap-4 items-start">
                            <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs shrink-0 bg-blue-500">🏛</div>
                            <div className="flex-1 bg-white border rounded-lg p-4 shadow-sm">
                              <h4 className="text-sm font-semibold text-gray-800">Processing Started</h4>
                              <p className="text-xs text-gray-500">{formatDate(complaint.updatedAt)}</p>
                            </div>
                          </div>
                        )}
                        {['resolved', 'closed'].includes(complaint.status) && (
                          <div className="relative flex gap-4 items-start">
                            <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs shrink-0 bg-green-500">✓</div>
                            <div className="flex-1 bg-white border rounded-lg p-4 shadow-sm">
                              <h4 className="text-sm font-semibold text-gray-800">Complaint {complaint.status === 'resolved' ? 'Resolved' : 'Closed'}</h4>
                              <p className="text-xs text-gray-500">{formatDate(complaint.actualResolutionDate || complaint.updatedAt)}</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Department Feedback / Messages */}
            {complaint.feedback && complaint.feedback.length > 0 && (
              <Card className="mb-6 border-0 shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
                  <CardTitle className="text-lg text-white">Department Responses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {complaint.feedback.map((fb, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border text-sm ${fb.type === 'department' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{fb.author} {fb.type === 'department' ? 'Department' : ''}</span>
                          <span className="text-xs text-gray-500">{formatDate(fb.timestamp)}</span>
                        </div>
                        <p>{fb.message}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* User Feedback Form */}
            {canGiveFeedback && (
              <Card className="mb-6 border-0 shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
                  <CardTitle className="text-lg text-white">Rate Your Experience</CardTitle>
                  <CardDescription className="text-blue-200">Help us improve by sharing your feedback</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">How would you rate the resolution?</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setFeedbackRating(star)}
                            onMouseEnter={() => setFeedbackHover(star)}
                            onMouseLeave={() => setFeedbackHover(0)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star className={`h-8 w-8 ${star <= (feedbackHover || feedbackRating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                        {feedbackRating > 0 && (
                          <span className="ml-3 text-sm font-medium text-gray-600">
                            {feedbackRating === 1 ? 'Poor' : feedbackRating === 2 ? 'Fair' : feedbackRating === 3 ? 'Good' : feedbackRating === 4 ? 'Very Good' : 'Excellent'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Comments (optional)</p>
                      <Textarea
                        placeholder="Share your experience..."
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleSubmitFeedback} disabled={isSubmittingFeedback || feedbackRating === 0}>
                      {isSubmittingFeedback ? (
                        <span className="flex items-center gap-2"><div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>Submitting...</span>
                      ) : (
                        <span className="flex items-center gap-2"><Send className="h-4 w-4" />Submit Feedback</span>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

          </motion.div>
        </div>
      </div>

      {/* Chat Room Modal */}
      {showChat && (
        <ChatRoom
          complaintNumber={complaintNumber}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}