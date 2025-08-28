'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, ChevronLeft, User, CalendarDays, Mail, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { trackComplaint } from '@/services/complaintService';
import ChatRoom from '@/components/ChatRoom';
import Link from 'next/link';

// Generate static paths for complaint tracking


export default function TrackComplaintPage() {
  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const params = useParams();
  const complaintNumber = params.complaintNumber;
  const { toast } = useToast();
  const { isAuthenticated, isUser } = useAuth();

  // Fetch complaint data
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

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'inProgress':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'closed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };

  // Status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'inProgress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'closed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Complaint Not Found</CardTitle>
              <CardDescription>
                The complaint number {complaintNumber} could not be found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Please check the complaint number and try again
              </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant="outline"
                asChild
              >
                <Link href="/">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Complaint Details</CardTitle>
                  <CardDescription>
                    Tracking complaint #{complaint.complaintNumber}
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className={getStatusColor(complaint.status)}
                >
                  <span className="flex items-center gap-1">
                    {getStatusIcon(complaint.status)}
                    <span className="capitalize">{complaint.status}</span>
                  </span>
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{complaint.title}</h3>
                <p className="text-muted-foreground mb-4">{complaint.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Department: <span className="font-medium">{complaint.department}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Filed: <span className="font-medium">{formatDate(complaint.createdAt)}</span></span>
                  </div>
                </div>
              </div>

              <Separator />

              {complaint.responseFromDept && (
                <div>
                  <h4 className="font-medium mb-2">Response from Department:</h4>
                  <div className="bg-muted p-4 rounded-md text-sm">
                    {complaint.responseFromDept}
                  </div>
                </div>
              )}

              {complaint.additionalDetails && Object.keys(complaint.additionalDetails).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Additional Details:</h4>
                  <div className="bg-muted p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {Object.entries(complaint.additionalDetails).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-sm text-muted-foreground capitalize">{key}:</span>
                          <div className="font-medium">{String(value)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-primary/5 rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Timeline</h4>
                  <span className="text-xs text-muted-foreground">Latest update</span>
                </div>

                <ol className="relative border-l border-muted-foreground/20 pt-2">
                  <li className="mb-4 ml-4">
                    <div className="absolute w-3 h-3 bg-primary rounded-full -left-1.5 border border-background"></div>
                    <time className="mb-1 text-xs font-normal leading-none text-muted-foreground">
                      {formatDate(complaint.createdAt)}
                    </time>
                    <h3 className="text-sm font-semibold">Complaint Filed</h3>
                    <p className="text-xs text-muted-foreground">
                      Complaint was registered in the system
                    </p>
                  </li>
                  {complaint.status !== 'open' && (
                    <li className="mb-4 ml-4">
                      <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-1.5 border border-background"></div>
                      <time className="mb-1 text-xs font-normal leading-none text-muted-foreground">
                        {/* Mock date for demonstration */}
                        {formatDate(new Date(new Date(complaint.createdAt).getTime() + 86400000).toISOString())}
                      </time>
                      <h3 className="text-sm font-semibold">Processing Started</h3>
                      <p className="text-xs text-muted-foreground">
                        Department has started processing your complaint
                      </p>
                    </li>
                  )}
                  {complaint.status === 'closed' && (
                    <li className="ml-4">
                      <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-1.5 border border-background"></div>
                      <time className="mb-1 text-xs font-normal leading-none text-muted-foreground">
                        {/* Mock date for demonstration */}
                        {formatDate(new Date(new Date(complaint.createdAt).getTime() + 172800000).toISOString())}
                      </time>
                      <h3 className="text-sm font-semibold">Complaint Resolved</h3>
                      <p className="text-xs text-muted-foreground">
                        Your complaint has been successfully resolved
                      </p>
                    </li>
                  )}
                </ol>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link href="/">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>

              <div className="flex gap-2">
                {isAuthenticated && isUser && complaint.status !== 'closed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowChat(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat with Department
                  </Button>
                )}

                {!isAuthenticated && (
                  <Button
                    variant="secondary"
                    size="sm"
                    asChild
                  >
                    <Link href="/login">
                      <User className="h-4 w-4 mr-2" />
                      Login for More Features
                    </Link>
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Chat Room Modal */}
        {showChat && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-4xl">
              <ChatRoom
                complaintNumber={complaintNumber}
                onClose={() => setShowChat(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}