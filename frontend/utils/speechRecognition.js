'use client';

// Check if SpeechRecognition is available
let SpeechRecognition = null;
if (typeof window !== 'undefined') {
  SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export const isVoiceRecognitionSupported = () => {
  return SpeechRecognition !== null;
};

export const useSpeechRecognition = (onTranscript, onStart, onEnd, onError) => {
  if (!isVoiceRecognitionSupported()) {
    return {
      start: () => {
        if (onError) onError(new Error('Speech recognition not supported in this browser'));
      },
      stop: () => {},
      isSupported: false
    };
  }

  const recognition = new SpeechRecognition();
  
  recognition.continuous = false; // Get all results, not just the first
  recognition.interimResults = true; // Get interim results
  recognition.lang = 'auto'; // Auto-detect language (or specify like 'en-US', 'hi-IN', etc)
  
  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map(result => result[0])
      .map(result => result.transcript)
      .join('');
    
    if (onTranscript) onTranscript(transcript);
  };
  
  recognition.onstart = () => {
    if (onStart) onStart();
  };
  
  recognition.onend = () => {
    if (onEnd) onEnd();
  };
  
  recognition.onerror = (event) => {
    if (onError) onError(new Error(`Speech recognition error: ${event.error}`));
  };
  
  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
    isSupported: true
  };
};

export default useSpeechRecognition;