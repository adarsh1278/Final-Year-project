'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import useSpeechRecognition from '@/utils/speechRecognition';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const VoiceInput = ({ onTranscriptChange, className, placeholder = "Speak to enter text..." }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  
  // Handle transcript updates
  const handleTranscriptChange = (text) => {
    setTranscript(text);
    if (onTranscriptChange) {
      onTranscriptChange(text);
    }
  };
  
  // Set up speech recognition
  const { start, stop, isSupported } = useSpeechRecognition(
    handleTranscriptChange,
    () => setIsListening(true),
    () => setIsListening(false),
    (err) => setError(err)
  );
  
  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      setError(null);
    };
  }, []);
  
  // Toggle listening
  const toggleListening = () => {
    if (isListening) {
      stop();
    } else {
      setError(null);
      start();
    }
  };
  
  if (!isSupported) {
    return (
      <div className="text-muted-foreground text-sm">
        Voice recognition is not supported in your browser.
      </div>
    );
  }
  
  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <div className="relative">
        <textarea
          className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background"
          placeholder={placeholder}
          value={transcript}
          onChange={(e) => handleTranscriptChange(e.target.value)}
        />
        
        <Button
          type="button"
          variant={isListening ? "destructive" : "outline"}
          size="icon"
          className="absolute bottom-2 right-2"
          onClick={toggleListening}
          disabled={!isSupported}
        >
          {isListening ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <MicOff className="h-4 w-4" />
            </motion.div>
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {isListening && (
        <motion.div 
          className="flex items-center justify-center text-sm text-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Listening...
        </motion.div>
      )}
      
      {error && (
        <div className="text-destructive text-sm">
          Error: {error.message}
        </div>
      )}
    </div>
  );
};

export default VoiceInput;