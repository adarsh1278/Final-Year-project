import { useState, useRef, useEffect } from 'react';
import { Mic, Send, PauseCircle, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { registerComplaint } from '@/services/complaintService';
import { useToast } from '@/hooks/use-toast';

export default function GrievanceChatbot({ onComplaintDataChange }) {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Welcome to the Grievance Portal! Please describe your issue.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const [suggestionActions, setSuggestionActions] = useState([]);
  const [complaintData, setComplaintData] = useState(null);
  const [complaintReady, setComplaintReady] = useState(false);

  const chatboxRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const inputRef = useRef(null);
  const router = useRouter();
  const { toast } = useToast();

  // Generate session ID on first render
  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setSession(newSessionId);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        // Stop recording
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      } else {
        // Start recording
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        recordedChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(recordedChunksRef.current);

          // Here you would normally send this blob to a speech-to-text service
          // For demo purposes, we'll simulate receiving text back
          setIsLoading(true);
          setTimeout(() => {
            // Simulated speech-to-text result
            const transcribedText = "No water is coming in friend colony 202903 Noida for 2 days home no 78";
            setInput(transcribedText);
            setIsLoading(false);
          }, 1500);

          // Stop all audio tracks
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      }
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Error",
        description: "Could not access your microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    const userMessage = input;
    setInput('');
    setIsLoading(true);

    try {
      // First, simulate sending to your chatbot backend
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ session_id: session, text: userMessage })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Update the chat with the bot's response
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);

      // Handle suggested actions if present
      if (data.suggested_actions && data.suggested_actions.length > 0) {
        setSuggestionActions(data.suggested_actions);
      } else {
        setSuggestionActions([]);
      }

      // Update complaint data state
      if (data.complaint_data) {
        setComplaintData(data.complaint_data);
        if (onComplaintDataChange) {
          onComplaintDataChange(data.complaint_data, false);
        }
      }

      // Update complaint ready state
      if (data.complaint_ready !== undefined) {
        setComplaintReady(data.complaint_ready);
      }

      // Handle specific actions
      if (data.action === "trigger_registration" && data.complaint_ready) {
        // Auto-submit if triggered by "Confirm all details now"
        if (userMessage === "Confirm all details now") {
          setTimeout(() => {
            submitComplaint();
          }, 1000); // Give time to show the message
        } else {
          setIsDialogOpen(true);
        }
      }

    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: "Sorry, I couldn't connect to the server. Please check if it's running and try again."
      }]);

      toast({
        title: "Connection Error",
        description: "Failed to connect to the chatbot server. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (action) => {
    if (action === "Confirm all details now") {
      // Always send this to chatbot first to prepare data, then auto-submit
      setInput(action);
      setTimeout(() => {
        handleSend();
      }, 100);
    } else if (action === "Yes, submit" && complaintReady) {
      // Direct submission for confirmed ready complaints
      setTimeout(() => {
        submitComplaint();
      }, 100);
    } else {
      // Send as regular message to chatbot
      setInput(action);
      setTimeout(() => {
        handleSend();
      }, 100);
    }
  };

  const submitComplaint = async () => {
    setIsSubmittingComplaint(true);

    try {
      // Submit to your actual backend
      const response = await registerComplaint(complaintData);
      const result = await response;

      // Add success message to chat
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: `Your complaint has been successfully registered with reference number: ${result.complaintNumber}. You can use this number to track your complaint status.`
      }]);

      // Show toast notification
      toast({
        title: "Complaint Registered",
        description: `Your complaint has been successfully registered with number: ${result.complaintNumber}`,
        variant: "success",
      });

      // Pass data to parent component if callback exists
      if (onComplaintDataChange) {
        onComplaintDataChange(complaintData, true);
      }

      // Navigate to history page after short delay
      setTimeout(() => {
        router.push('/complaint/history');
      }, 2000);

    } catch (error) {
      console.error("Error submitting complaint:", error);

      // Add failure message to chat
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: "Sorry, there was an error submitting your complaint. Please try again later."
      }]);

      toast({
        title: "Submission Failed",
        description: "There was an error submitting your complaint. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComplaint(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 mx-auto">
      <div className="bg-[#1a237e] text-white p-4">
        <h2 className="text-lg font-semibold flex items-center">
          <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Grievance Chatbot
        </h2>
      </div>

      <div
        ref={chatboxRef}
        className="p-4 h-96 overflow-y-auto bg-[#f7f9fc]"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 ${msg.sender === 'user' ? 'text-right' : ''}`}
          >
            <div
              className={`inline-block rounded-lg py-2 px-3 max-w-[75%] ${msg.sender === 'user'
                ? 'bg-[#1a237e] text-white'
                : 'bg-[#e8edf5] text-[#3c3f4a]'
                }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center justify-center py-3">
            <div className="flex space-x-1">
              <div className="h-2 w-2 bg-[#1a237e] rounded-full animate-bounce"></div>
              <div className="h-2 w-2 bg-[#1a237e] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="h-2 w-2 bg-[#1a237e] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        )}
      </div>

      {suggestionActions.length > 0 && (
        <div className="px-4 py-2 bg-[#f0f4fa] flex flex-wrap gap-2 border-t border-gray-200">
          {suggestionActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestion(action)}
              className="bg-white text-[#1a237e] border border-[#1a237e] rounded-full px-3 py-1 text-sm hover:bg-[#e8edf5] transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      )}

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <button
            onClick={toggleRecording}
            className={`flex-shrink-0 p-2 rounded-full mr-2 ${isRecording
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-[#e8edf5] text-[#1a237e] hover:bg-[#d9e1f2]'
              }`}
            title={isRecording ? "Stop recording" : "Start voice input"}
          >
            {isRecording ? <PauseCircle size={20} /> : <Mic size={20} />}
          </button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-grow px-4 py-2 bg-[#f7f9fc] border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1a237e]"
            disabled={isLoading}
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 bg-[#1a237e] text-white p-2 rounded-full ml-2 hover:bg-[#0d1545] disabled:bg-[#9fa8da] disabled:cursor-not-allowed transition-colors"
            title="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Grievance</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit this grievance to the authorities?
            </DialogDescription>
          </DialogHeader>

          {complaintData && (
            <div className="p-4 bg-[#f7f9fc] rounded-md text-sm border border-gray-200">
              <p><strong>Title:</strong> {complaintData.title}</p>
              <p><strong>Description:</strong> {complaintData.description}</p>
              {complaintData.department && <p><strong>Department:</strong> {complaintData.department}</p>}
            </div>
          )}

          <DialogFooter className="flex space-x-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmittingComplaint}
              className="border-[#1a237e] text-[#1a237e]"
            >
              Cancel
            </Button>
            <Button
              onClick={submitComplaint}
              disabled={isSubmittingComplaint}
              className="bg-[#1a237e] hover:bg-[#0d1545] text-white"
            >
              {isSubmittingComplaint ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : (
                'Submit Complaint'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}