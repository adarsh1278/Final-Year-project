'use client';

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, AlertCircle, CheckCircle, X, MessageSquare, User, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"; export default function ChatRoom({ complaintNumber, onClose }) {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [closeRequest, setCloseRequest] = useState(null);
    const [showCloseDialog, setShowCloseDialog] = useState(false);
    const [closeResponse, setCloseResponse] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const [showCloseRequestDialog, setShowCloseRequestDialog] = useState(false);
    const [closeReason, setCloseReason] = useState('');

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const { user, department, isDepartment, isUser } = useAuth();
    const { toast } = useToast();
    const { t } = useTranslation();

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize Socket.IO connection
    useEffect(() => {
        const newSocket = io('http://localhost:5000', {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            setIsConnected(true);
            console.log('Connected to chat server');

            // Join complaint room
            newSocket.emit('join-complaint-room', {
                complaintNumber,
                userType: isDepartment ? 'department' : 'user',
                userId: user?._id || department?._id,
                departmentName: department?.name
            });
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
            console.log('Disconnected from chat server');
        });

        // Handle existing messages
        newSocket.on('existing-messages', (existingMessages) => {
            setMessages(existingMessages);
        });

        // Handle new messages
        newSocket.on('new-message', (message) => {
            setMessages(prev => [...prev, message]);
        });

        // Handle close request
        newSocket.on('close-request', (request) => {
            setCloseRequest(request);
            if (isUser) {
                setShowCloseDialog(true);
                toast({
                    title: 'Close Request',
                    description: `${request.departmentName} Department wants to close this complaint`,
                    variant: 'warning'
                });
            }
        });

        // Handle close response
        newSocket.on('close-response', (response) => {
            if (response.accepted) {
                toast({
                    title: 'Complaint Closed',
                    description: 'The complaint has been closed with user consent',
                    variant: 'success'
                });
            } else {
                toast({
                    title: 'Close Request Rejected',
                    description: 'User has rejected the closure request',
                    variant: 'destructive'
                });
            }
        });

        // Handle complaint closed
        newSocket.on('complaint-closed', (data) => {
            toast({
                title: 'Complaint Closed',
                description: data.message,
                variant: 'success'
            });
        });

        // Handle user joined/left
        newSocket.on('user-joined', (data) => {
            toast({
                title: 'User Joined',
                description: data.message,
                variant: 'info'
            });
        });

        newSocket.on('user-left', (data) => {
            toast({
                title: 'User Left',
                description: data.message,
                variant: 'info'
            });
        });

        // Handle typing indicator
        newSocket.on('user-typing', (data) => {
            if (data.isTyping) {
                setOtherUserTyping(true);
            } else {
                setOtherUserTyping(false);
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [complaintNumber, isDepartment, user, department, toast, isUser]);

    // Send message
    const sendMessage = () => {
        if (!inputMessage.trim() || !socket) return;

        const messageData = {
            complaintNumber,
            message: inputMessage.trim(),
            userType: isDepartment ? 'department' : 'user',
            userId: user?._id,
            departmentName: department?.name
        };

        socket.emit('send-message', messageData);
        setInputMessage('');

        // Stop typing indicator
        socket.emit('typing', {
            complaintNumber,
            userType: isDepartment ? 'department' : 'user',
            isTyping: false
        });
    };

    // Handle typing
    const handleInputChange = (e) => {
        setInputMessage(e.target.value);

        if (!socket) return;

        // Send typing indicator
        if (!isTyping) {
            setIsTyping(true);
            socket.emit('typing', {
                complaintNumber,
                userType: isDepartment ? 'department' : 'user',
                isTyping: true
            });
        }

        // Clear previous timeout and set new one
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socket.emit('typing', {
                complaintNumber,
                userType: isDepartment ? 'department' : 'user',
                isTyping: false
            });
        }, 1000);
    };

    // Request close complaint (department only)
    const requestClose = async () => {
        if (!isDepartment) return;

        try {
            // Call API to request close
            const response = await fetch(`http://localhost:5000/api/departments/complaints/${complaintNumber}/request-close`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    reason: closeReason || 'Complaint resolved, requesting closure'
                })
            });

            if (response.ok) {
                // Also emit socket event
                if (socket) {
                    socket.emit('request-close-complaint', {
                        complaintNumber,
                        reason: closeReason || 'Complaint resolved, requesting closure',
                        departmentName: department?.name
                    });
                }

                setShowCloseRequestDialog(false);
                setCloseReason('');

                toast({
                    title: 'Close Request Sent',
                    description: 'Waiting for user response',
                    variant: 'success'
                });
            } else {
                const errorData = await response.json();
                toast({
                    title: 'Error',
                    description: errorData.message || 'Failed to send close request',
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error('Error requesting close:', error);
            toast({
                title: 'Error',
                description: 'Failed to send close request',
                variant: 'destructive'
            });
        }
    };

    // Respond to close request (user only)
    const respondToClose = async (accepted) => {
        if (!isUser) return;

        try {
            // Call API to respond to close request
            const response = await fetch(`http://localhost:5000/api/complaints/${complaintNumber}/close-response`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    accepted,
                    responseMessage: closeResponse
                })
            });

            if (response.ok) {
                // Also emit socket event
                if (socket) {
                    socket.emit('respond-close-request', {
                        complaintNumber,
                        accepted,
                        response: closeResponse
                    });
                }

                setShowCloseDialog(false);
                setCloseResponse('');
                setCloseRequest(null);

                toast({
                    title: accepted ? 'Complaint Closed' : 'Close Request Rejected',
                    description: accepted ? 'Thank you for your response' : 'Your response has been sent',
                    variant: 'success'
                });
            } else {
                const errorData = await response.json();
                toast({
                    title: 'Error',
                    description: errorData.message || 'Failed to respond to close request',
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error('Error responding to close request:', error);
            toast({
                title: 'Error',
                description: 'Failed to respond to close request',
                variant: 'destructive'
            });
        }
    };

    // Format message timestamp
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <>
            {/* Chat Modal Overlay */}
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="w-full max-w-4xl h-[80vh] bg-white rounded-lg shadow-xl">
                    <Card className="h-full flex flex-col border-0">
                        <CardHeader className="pb-3 border-b bg-white">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    {t('chat.title')} - {complaintNumber}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Badge variant={isConnected ? 'default' : 'destructive'}>
                                        {isConnected ? t('chat.connected') : t('chat.disconnected')}
                                    </Badge>
                                    {isDepartment && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setShowCloseRequestDialog(true)}
                                        >
                                            {t('chat.requestClose')}
                                        </Button>
                                    )}
                                    <Button size="sm" variant="ghost" onClick={onClose}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 flex flex-col p-0">
                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                {messages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        <div className="text-center">
                                            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>No messages yet. Start the conversation!</p>
                                        </div>
                                    </div>
                                ) : (
                                    messages.map((message) => (
                                        <div
                                            key={message.id || message.timestamp}
                                            className={`flex ${(message.userType === 'department' && isDepartment) || (message.userType === 'user' && !isDepartment)
                                                ? 'justify-end'
                                                : 'justify-start'
                                                }`}
                                        >
                                            <div
                                                className={`max-w-[70%] p-3 rounded-lg shadow-sm ${(message.userType === 'department' && isDepartment) || (message.userType === 'user' && !isDepartment)
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-white border'
                                                    } ${message.type === 'close_request' || message.type === 'close_response'
                                                        ? 'border-2 border-orange-200 bg-orange-50 text-orange-900'
                                                        : ''
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    {message.userType === 'department' ? (
                                                        <Building2 className="h-3 w-3" />
                                                    ) : (
                                                        <User className="h-3 w-3" />
                                                    )}
                                                    <span className="text-xs font-medium">
                                                        {message.senderName || (message.userType === 'department' ? 'Department' : 'User')}
                                                    </span>
                                                    <span className="text-xs opacity-70">
                                                        {formatTime(message.timestamp)}
                                                    </span>
                                                </div>

                                                <p className="text-sm">{message.message || message.reason || message.response}</p>

                                                {message.type === 'close_request' && (
                                                    <div className="mt-2">
                                                        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                                            Close Request
                                                        </Badge>
                                                    </div>
                                                )}

                                                {message.type === 'close_response' && (
                                                    <div className="mt-2">
                                                        <Badge
                                                            variant="secondary"
                                                            className={`text-xs ${message.accepted
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                                }`}
                                                        >
                                                            {message.accepted ? 'Accepted' : 'Rejected'}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}

                                {/* Typing indicator */}
                                {otherUserTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border p-3 rounded-lg shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                </div>
                                                <span className="text-xs text-muted-foreground">{t('common.typing')}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="border-t p-4 bg-white">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder={t('chat.placeholder')}
                                        value={inputMessage}
                                        onChange={handleInputChange}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        disabled={!isConnected}
                                        className="flex-1"
                                    />
                                    <Button
                                        onClick={sendMessage}
                                        disabled={!isConnected || !inputMessage.trim()}
                                        className="shrink-0"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Close Request Dialog (for users) */}
            <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-orange-500" />
                            Close Request
                        </DialogTitle>
                        <DialogDescription>
                            The department has requested to close this complaint. Do you agree?
                        </DialogDescription>
                    </DialogHeader>

                    {closeRequest && (
                        <div className="py-4">
                            <p className="text-sm text-muted-foreground mb-2">Reason:</p>
                            <p className="text-sm border p-2 rounded bg-muted">
                                {closeRequest.reason}
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Your response (optional):</label>
                        <Textarea
                            placeholder="Add your comments..."
                            value={closeResponse}
                            onChange={(e) => setCloseResponse(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => respondToClose(false)}>
                            <X className="h-4 w-4 mr-2" />
                            Reject
                        </Button>
                        <Button onClick={() => respondToClose(true)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept & Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Request Close Dialog (for departments) */}
            <Dialog open={showCloseRequestDialog} onOpenChange={setShowCloseRequestDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Request Complaint Closure</DialogTitle>
                        <DialogDescription>
                            Send a request to the user to close this complaint.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Reason for closure:</label>
                        <Textarea
                            placeholder="Explain why this complaint should be closed..."
                            value={closeReason}
                            onChange={(e) => setCloseReason(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCloseRequestDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={requestClose}>
                            Send Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
