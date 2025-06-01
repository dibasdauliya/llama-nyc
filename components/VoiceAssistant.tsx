"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2, X, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

interface VoiceAssistantProps {}

export default function VoiceAssistant({}: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const router = useRouter();

  // Navigation detection function
  const detectNavigation = (text: string): string | null => {
    const lowerText = text.toLowerCase().trim();
    
    // Navigation patterns
    const navigationPhrases = [
      'navigate', 'take me', 'go to', 'open', 'show me', 'bring me to', 'redirect'
    ];
    
    // Check if this is a navigation command
    const isNavigationCommand = navigationPhrases.some(phrase => 
      lowerText.includes(phrase)
    );
    
    if (!isNavigationCommand) return null;
    
    // Page mapping with various ways users might refer to them
    const pageMap = {
      '/emails': [
        'email', 'emails', 'email page', 'emails page', 'email section',
        'mail', 'mails', 'messages', 'inbox'
      ],
      '/visa-interview': [
        'visa', 'visa interview', 'visa page', 'visa interview page',
        'visa section', 'visa practice', 'visa preparation', 'student visa',
        'tourist visa', 'work visa', 'embassy interview'
      ],
      '/job-interview': [
        'job', 'job interview', 'job page', 'job interview page',
        'job section', 'job practice', 'career', 'employment interview',
        'work interview', 'hr interview', 'technical interview'
      ],
      '/dashboard': [
        'dashboard', 'home', 'main page', 'dashboard page', 'profile',
        'account', 'my account', 'user dashboard'
      ]
    };
    
    // Find the best match
    for (const [route, keywords] of Object.entries(pageMap)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          return route;
        }
      }
    }
    
    return null;
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
          setInterimTranscript(""); // Clear interim when we get final
        } else {
          setInterimTranscript(interimTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript(""); // Clear interim when recognition ends
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    setError("");
    setTranscript("");
    setInterimTranscript("");
    setResponse("");
    setIsNavigating(false); // Reset navigation flag
    
    if (recognitionRef.current) {
      setIsListening(true);
      setIsExpanded(true);
      recognitionRef.current.start();
    } else {
      setError("Speech recognition not supported in this browser");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      
      // Process the transcript if we have one (including interim text)
      const finalText = (transcript + " " + interimTranscript).trim();
      if (finalText) {
        // Clear the interim transcript since we're processing it
        setInterimTranscript("");
        sendToLlama(finalText);
      } else {
        // If no text was captured, show a helpful message
        setError("No speech detected. Please try speaking and then stop recording.");
      }
    }
  };

  const sendToLlama = async (text: string) => {
    setIsProcessing(true);
    setError("");
    
    try {
      // First, check if this is a navigation command
      const navigationRoute = detectNavigation(text);
      
      if (navigationRoute && !isNavigating) {
        // Set navigation flag to prevent multiple attempts
        setIsNavigating(true);
        
        // Handle navigation
        setResponse(`Navigating to ${navigationRoute.replace('/', '').replace('-', ' ')} page...`);
        
        // Speak the navigation confirmation
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(`Taking you to the ${navigationRoute.replace('/', '').replace('-', ' ')} page`);
          utterance.rate = 0.9;
          utterance.pitch = 1;
          utterance.volume = 0.8;
          speechSynthesis.speak(utterance);
        }
        
        // Navigate after a short delay to allow the user to see/hear the confirmation
        setTimeout(() => {
          // router.push(navigationRoute);
          window.location.href = navigationRoute;
          closeAssistant(); // Close the assistant after navigation
        }, 1500);
        
        setIsProcessing(false);
        return;
      }
      
      // If already navigating, don't process again
      if (isNavigating) {
        setIsProcessing(false);
        return;
      }
      
      // If not a navigation command, proceed with normal AI processing
      const response = await fetch("/api/llama-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: {
            messages: [
              {
                role: "system",
                content: "You are a helpful voice assistant. Provide concise, friendly responses to user questions. Keep responses under 100 words unless specifically asked for more detail."
              },
              {
                role: "user",
                content: text
              }
            ],
            model: "Llama-4-Maverick-17B-128E-Instruct-FP8",
            temperature: 0.7,
            max_completion_tokens: 200,
            stream: false
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to get response from AI");
      }

      const data = await response.json();
      const aiResponse = data.completion_message?.content || data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
      
      setResponse(aiResponse);
      
      // Speak the response
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(aiResponse);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        speechSynthesis.speak(utterance);
      }
      
    } catch (error) {
      console.error("Error sending to Llama:", error);
      setError(error instanceof Error ? error.message : "Failed to process your request");
    } finally {
      setIsProcessing(false);
    }
  };

  const closeAssistant = () => {
    setIsExpanded(false);
    setTranscript("");
    setResponse("");
    setError("");
    setIsNavigating(false); // Reset navigation flag
    if (isListening) {
      stopListening();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isExpanded && (
          <button
            onClick={startListening}
            className={`group relative w-16 h-16 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${
              isListening
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            }`}
            disabled={isProcessing}
          >
            {isListening ? (
              <MicOff className="h-8 w-8 text-white mx-auto" />
            ) : (
              <Mic className="h-8 w-8 text-white mx-auto" />
            )}
            
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Speak with AI
            </div>
          </button>
        )}

        {/* Expanded Interface */}
        {isExpanded && (
          <div className="absolute bottom-0 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-white" />
                  <span className="text-white font-semibold">Voice Assistant</span>
                </div>
                <button
                  onClick={closeAssistant}
                  className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {/* Status */}
              <div className="mb-4">
                {isListening && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Listening...</span>
                  </div>
                )}
                {isProcessing && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Processing...</span>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Transcript */}
              {(transcript || interimTranscript) && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {isListening ? "You're saying:" : "You said:"}
                  </h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-800 text-sm">
                      <span className="text-gray-900">{transcript}</span>
                      {interimTranscript && (
                        <span className="text-gray-500 italic">
                          {transcript && " "}
                          {interimTranscript}
                          <span className="animate-pulse">|</span>
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Interim Transcript */}
              {interimTranscript && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Interim:</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-800 text-sm">{interimTranscript}</p>
                  </div>
                </div>
              )}

              {/* Response */}
              {response && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">AI Response:</h4>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-gray-800 text-sm">{response}</p>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex space-x-2">
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isProcessing}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                    isListening
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-4 w-4" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      <span>Speak</span>
                    </>
                  )}
                </button>
              </div>

              {/* Instructions */}
              {!transcript && !response && !error && (
                <div className="mt-4 text-center">
                  <p className="text-gray-500 text-xs">
                    Click "Speak" and ask me anything!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
} 