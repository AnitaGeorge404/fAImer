import React, { useEffect, useState, useRef } from "react";
import {
  Send,
  Bot,
  User,
  Languages,
  ArrowLeft,
  Mic,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { marked } from "marked";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { routeFromTranscript } from "@/lib/voiceNavigation";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

interface AssistantProps {
  initialQuestion?: string;
  onExit?: () => void;
  onFeatureClick?: (featureId: string) => void;
}

const FarmerAssistantScreen: React.FC<AssistantProps> = ({
  initialQuestion,
  onExit,
  onFeatureClick,
}) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI farming assistant powered by Gemini. I can help you with crop management, pest control, weather advice, and general farming questions. How can I assist you today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  const [language, setLanguage] = useState("english");
  const [lastRequestTime, setLastRequestTime] = useState(0);

  // Voice recognition state
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Input focus and animation state
  const [isFocused, setIsFocused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const inputContainerRef = useRef<HTMLDivElement>(null);

  // Text-to-Speech state
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
    null
  );
  const [speechSynthesis, setSpeechSynthesis] =
    useState<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechQueueRef = useRef<Array<{ messageId: string; text: string }>>([]);
  const isProcessingSpeechRef = useRef(false);
  const [isSpeechReady, setIsSpeechReady] = useState(false);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Configure marked for better formatting
  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  // Handle mouse movement for dynamic glow effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (inputContainerRef.current) {
        const rect = inputContainerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Initialize speech synthesis
  useEffect(() => {
    if ("speechSynthesis" in window) {
      setSpeechSynthesis(window.speechSynthesis);

      // Load voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log(
          "Available TTS voices:",
          voices.map((v) => ({ name: v.name, lang: v.lang }))
        );
        if (voices.length > 0) {
          setIsSpeechReady(true);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    } else {
      toast({
        title: language === "malayalam" ? "പിന്തുണയില്ല" : "Not supported",
        description:
          language === "malayalam"
            ? "ഈ ബ്രൗസറിൽ ടെക്സ്റ്റ്-ടു-സ്പീച്ച് പിന്തുണയില്ല"
            : "Text-to-speech is not supported in this browser",
        variant: "destructive",
      });
    }

    return () => {
      cleanupAllSpeech();
    };
  }, []);

  // Cleanup function
  const cleanupAllSpeech = () => {
    isProcessingSpeechRef.current = false;
    speechQueueRef.current = [];
    setSpeakingMessageId(null);
    currentUtteranceRef.current = null;

    if (speechSynthesis) {
      speechSynthesis.cancel();
    }
  };

  // Process speech queue
  const processNextSpeech = () => {
    if (isProcessingSpeechRef.current || speechQueueRef.current.length === 0) {
      return;
    }

    const { messageId, text } = speechQueueRef.current.shift()!;
    isProcessingSpeechRef.current = true;

    performSpeech(messageId, text);
  };

  // Perform actual speech
  const performSpeech = (messageId: string, text: string) => {
    if (!speechSynthesis || !isSpeechReady) {
      toast({
        title: language === "malayalam" ? "പിന്തുണയില്ല" : "Not supported",
        description:
          language === "malayalam"
            ? "ഈ ബ്രൗസറിൽ ടെക്സ്റ്റ്-ടു-സ്പീച്ച് പിന്തുണയില്ല"
            : "Text-to-speech is not supported in this browser",
        variant: "destructive",
      });
      isProcessingSpeechRef.current = false;
      processNextSpeech();
      return;
    }

    try {
      const cleanText = stripMarkdown(text);
      if (!cleanText || cleanText.trim().length < 2) {
        isProcessingSpeechRef.current = false;
        processNextSpeech();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voices = speechSynthesis.getVoices();

      // Prioritize Malayalam voice, fallback to English only for English language
      let selectedVoice;
      if (language === "malayalam") {
        selectedVoice = voices.find((v) => v.lang.includes("ml")) || null;
        if (!selectedVoice) {
          toast({
            title:
              language === "malayalam"
                ? "മലയാളം ശബ്ദം ലഭ്യമല്ല"
                : "Malayalam Voice Unavailable",
            description:
              language === "malayalam"
                ? "മലയാളം ടെക്സ്റ്റ്-ടു-സ്പീച്ച് ശബ്ദം ലഭ്യമല്ല. ദയവായി Google TTS-ൽ മലയാളം ശബ്ദം ഇൻസ്റ്റാൾ ചെയ്യുക അല്ലെങ്കിൽ മറ്റൊരു ബ്രൗസർ/ഉപകരണം പരീക്ഷിക്കുക."
                : "No Malayalam TTS voice found. Please install a Malayalam voice in Google TTS or try a different browser/device.",
            variant: "destructive",
          });
          isProcessingSpeechRef.current = false;
          processNextSpeech();
          return;
        }
      } else {
        selectedVoice =
          voices.find(
            (v) => v.lang.includes("en-IN") || v.lang.includes("en-US")
          ) ||
          voices.find((v) => v.lang.includes("en")) ||
          voices[0];
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = language === "malayalam" ? "ml-IN" : "en-US";
      }

      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        setSpeakingMessageId(messageId);
        currentUtteranceRef.current = utterance;
      };

      utterance.onend = () => {
        setSpeakingMessageId(null);
        currentUtteranceRef.current = null;
        isProcessingSpeechRef.current = false;
        setTimeout(() => processNextSpeech(), 100);
      };

      utterance.onerror = (event) => {
        console.warn("Speech error:", event.error);
        setSpeakingMessageId(null);
        currentUtteranceRef.current = null;
        isProcessingSpeechRef.current = false;
        if (event.error !== "interrupted" && event.error !== "canceled") {
          toast({
            title: language === "malayalam" ? "പിശക്" : "Speech Error",
            description: `Speech failed: ${event.error}`,
            variant: "destructive",
          });
        }
        setTimeout(() => processNextSpeech(), 200);
      };

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Speech creation error:", error);
      isProcessingSpeechRef.current = false;
      processNextSpeech();
    }
  };

  // Text-to-Speech functions
  const stripMarkdown = (text: string): string => {
    if (language === "malayalam") {
      return text.replace(/\n+/g, " ").trim(); // Minimal processing for Malayalam
    }
    return text
      .replace(/#{1,6}\s+/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")
      .replace(/\n+/g, " ")
      .trim();
  };

  const handleTextToSpeech = (messageId: string, text: string) => {
    if (!speechSynthesis || !isSpeechReady) {
      toast({
        title: language === "malayalam" ? "പിന്തുണയില്ല" : "Not supported",
        description:
          language === "malayalam"
            ? "ഈ ബ്രൗസറിൽ ടെക്സ്റ്റ്-ടു-സ്പീച്ച് പിന്തുണയില്ല"
            : "Text-to-speech is not supported in this browser",
        variant: "destructive",
      });
      return;
    }

    if (speakingMessageId === messageId) {
      cleanupAllSpeech();
      return;
    }

    cleanupAllSpeech();
    speechQueueRef.current = [{ messageId, text }];
    processNextSpeech();
  };

  useEffect(() => {
    return () => {
      cleanupAllSpeech();
    };
  }, [speechSynthesis]);

  useEffect(() => {
    if (speechSynthesis && speakingMessageId) {
      cleanupAllSpeech();
    }
  }, [language]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const formatMessageText = (text: string) => {
    if (language === "malayalam") {
      return { __html: text.replace(/\n/g, "<br />") };
    }
    const html = marked(text);
    return { __html: html };
  };

  // Voice recognition functions
  const ensureRecognition = () => {
    const SR: any =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return null;
    const r: any = new SR();
    r.lang = language === "malayalam" ? "ml-IN" : "en-IN";
    r.interimResults = true;
    r.maxAlternatives = 1;
    r.continuous = false;
    return r;
  };

  const handleMicClick = () => {
    if (listening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setListening(false);
      setInterimText("");
      return;
    }
    const rec = ensureRecognition();
    if (!rec) {
      toast({
        title:
          language === "malayalam" ? "വോയ്സ് ലഭ്യമല്ല" : "Voice not available",
        description:
          language === "malayalam"
            ? "ഈ ബ്രൗസറിൽ മൈക്ക് പിന്തുണയില്ല."
            : "Microphone support is not available in this browser.",
        variant: "destructive",
      });
      return;
    }
    recognitionRef.current = rec;
    rec.onstart = () => {
      setListening(true);
      setInterimText("");
      setIsProcessing(false);
    };
    rec.onresult = async (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      setInterimText(interimTranscript);
      if (finalTranscript) {
        setListening(false);
        setInterimText("");
        setIsProcessing(true);
        toast({
          title: language === "malayalam" ? "കേട്ടത്" : "Processing",
          description: `"${finalTranscript}"`,
        });
        try {
          const decision = await routeFromTranscript(finalTranscript);
          if (
            decision.action === "navigate" &&
            decision.targetId &&
            onFeatureClick
          ) {
            onFeatureClick(decision.targetId);
            toast({
              title: language === "malayalam" ? "പോകുന്നു" : "Navigating",
              description: `${decision.targetId} • ${(decision.confidence * 100).toFixed(0)}%`,
            });
          } else {
            setInputMessage(finalTranscript);
            setTimeout(() => {
              handleSendMessage();
            }, 100);
          }
        } catch (error) {
          console.error("Voice routing error:", error);
          setInputMessage(finalTranscript);
          setTimeout(() => {
            handleSendMessage();
          }, 100);
        } finally {
          setIsProcessing(false);
        }
      }
    };
    rec.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
      setInterimText("");
      setIsProcessing(false);
      toast({
        title: language === "malayalam" ? "പിശക്" : "Error",
        description:
          language === "malayalam"
            ? "വോയ്സ് തിരിച്ചറിയാൻ കഴിഞ്ഞില്ല"
            : "Voice recognition failed. Please try again.",
        variant: "destructive",
      });
    };
    rec.onend = () => {
      setListening(false);
      setInterimText("");
    };
    try {
      rec.start();
    } catch (e) {
      console.error("Failed to start voice recognition:", e);
      setListening(false);
      setInterimText("");
      toast({
        title: "Error",
        description: "Failed to start voice recognition",
        variant: "destructive",
      });
    }
  };

  // Input focus handlers
  const handleInputFocus = () => {
    setIsFocused(true);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const now = Date.now();
    if (now - lastRequestTime < 3000) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Please wait a moment before sending another message to avoid rate limits.",
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    if (!apiKey) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "API key not found. Please check your environment configuration.",
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    setLastRequestTime(now);
    setHasUserSentMessage(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const farmingPrompt = `You are a helpful farming assistant for Indian farmers. Provide practical, actionable advice on farming topics. Keep responses concise and well-structured. Respond in Malayalam language if the user selects Malayalam. User question: ${userMessage.text}`;

      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(farmingPrompt);
        const response = await result.response;
        const assistantResponse = response.text();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: assistantResponse,
          sender: "assistant",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (sdkError) {
        console.log("SDK failed, trying direct API call...");
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: farmingPrompt,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `API call failed: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        const assistantResponse =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Sorry, I could not generate a response.";
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: assistantResponse,
          sender: "assistant",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      let errorText = "Sorry, I encountered an error. Please try again.";
      if (error instanceof Error) {
        if (
          error.message.includes("API_KEY_INVALID") ||
          error.message.includes("API key")
        ) {
          errorText =
            "Invalid API key. Please check your Gemini API key configuration.";
        } else if (
          error.message.includes("QUOTA_EXCEEDED") ||
          error.message.includes("quota") ||
          error.message.includes("429")
        ) {
          errorText =
            "API quota exceeded. Please wait a moment and try again, or try asking a shorter question.";
        } else if (
          error.message.includes("RATE_LIMIT_EXCEEDED") ||
          error.message.includes("rate limit")
        ) {
          errorText =
            "Rate limit exceeded. Please wait a minute before sending another message.";
        } else if (
          error.message.includes("404") ||
          error.message.includes("not found") ||
          error.message.includes("model")
        ) {
          errorText =
            "Model not available. The AI service might be temporarily unavailable or the model version has changed.";
        } else if (
          error.message.includes("fetch") ||
          error.message.includes("network")
        ) {
          errorText =
            "Network error. Please check your internet connection and try again.";
        }
      }
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuestion) {
      setInputMessage(initialQuestion);
      const t = setTimeout(() => {
        void handleSendMessage();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [initialQuestion]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .chat-wrapper {
          position: relative;
          flex: 1;
          border-radius: 16px;
          transition: transform 0.3s ease;
          display: flex;
          flex-direction: row;
          gap:10px;
          align-items: center;
        }

        .chat-wrapper.active {
          transform: scale(1.01);
        }

        .liquid-glow {
          position: absolute;
          inset: -3px;
          z-index: 1;
          height: calc(100% + 5px);
          border-radius: 16px;
          background: linear-gradient(
            135deg,
            #ff2d55 0%,
            #ff9500 20%,
            #ffcc00 30%,
            #34c759 50%,
            #00b4ff 70%,
            #af52de 90%,
            #ff2d55 100%
          );
          background-size: 300% 300%;
          opacity: 0;
          filter: blur(18px);
          transition: opacity 0.3s ease;
        }

        .chat-wrapper.active .liquid-glow {
          opacity: 1;
          animation: liquidGlow 3s ease infinite, moveGradient 15s linear infinite;
        }

        @keyframes liquidGlow {
          0%, 100% { filter: blur(8px); }
          50% { filter: blur(12px); }
        }

        @keyframes moveGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .chat-input {
          width:80%;
          padding: 12px 16px;
          border-radius: 16px;
          border: 1px solid green;
          background-color: rgba(255, 255, 255, 0.9);
          position: relative;
          z-index: 2;
          backdrop-filter: blur(8px);
          transition: all 0.3s ease;
          font-size: 16px;
          outline: none;
          color:black;

        }

        .chat-input::placeholder {
          color: rgba(69, 69, 69, 0.6);
        }

        .chat-wrapper.active .chat-input {
          background-color: rgba(255, 255, 255, 1);
          border:none;
        }

        .chat-wrapper::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
            circle at var(--mouse-x) var(--mouse-y),
            rgba(255, 255, 255, 0.1) 0%,
            transparent 80%
          );
          opacity: 0;
          z-index: 2;
          pointer-events: none;
          transition: opacity 0.3s ease;
          border-radius: 16px;
        }

        .chat-wrapper.active::after {
          opacity: 1;
        }

        @media (hover: hover) {
          .chat-wrapper.active .liquid-glow {
            animation: liquidGlow 3s ease infinite, moveGradient 15s linear infinite, positionGlow 8s ease-in-out infinite;
          }

          @keyframes positionGlow {
            0% { clip-path: ellipse(150% 150% at 0% 0%); }
            25% { clip-path: ellipse(150% 150% at 100% 0%); }
            50% { clip-path: ellipse(150% 150% at 100% 100%); }
            75% { clip-path: ellipse(150% 150% at 0% 100%); }
            100% { clip-path: ellipse(150% 150% at 0% 0%); }
          }
        }
        `,
        }}
      />
      <div className="flex-shrink-0 p-4 border-b border-border bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onExit && (
              <Button variant="ghost" size="sm" onClick={onExit}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h1 className="text-lg font-semibold text-foreground whitespace-nowrap">
              Farming Assistant
            </h1>
          </div>
          <div className="ml-4">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="malayalam">Malayalam</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
      >
        <div className="p-4 space-y-4 pb-32">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}

              <div
                className={`max-w-[70%] p-3 rounded-lg ${message.sender === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted text-muted-foreground"}`}
                style={{
                  fontFamily:
                    language === "malayalam"
                      ? "'Noto Sans Malayalam', sans-serif"
                      : "inherit",
                }}
              >
                {message.sender === "assistant" ? (
                  <div
                    className="text-sm prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground"
                    dangerouslySetInnerHTML={formatMessageText(message.text)}
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {message.sender === "assistant" && speechSynthesis && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleTextToSpeech(message.id, message.text)
                      }
                      className="p-1 h-6 w-6 hover:bg-background/50"
                      title={
                        speakingMessageId === message.id
                          ? language === "malayalam"
                            ? "നിർത്തുക"
                            : "Stop speaking"
                          : language === "malayalam"
                            ? "ഉച്ചത്തിൽ വായിക്കുക"
                            : "Read aloud"
                      }
                    >
                      {speakingMessageId === message.id ? (
                        <VolumeX className="h-3 w-3" />
                      ) : (
                        <Volume2 className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {message.sender === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted text-muted-foreground max-w-[70%] p-3 rounded-lg">
                <p className="text-sm">Thinking...</p>
                <div className="flex items-center space-x-1 mt-2">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.1s]"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {!hasUserSentMessage && (
        <div className="fixed inset-0 flex items-center justify-center mt-16 pointer-events-none">
          <img
            src="/lovable-uploads/87bc0776-6ff4-4209-a8b5-8b0c47dc938a.png"
            alt="Farming Assistant Robot"
            className="w-80 h-80 object-contain"
          />
        </div>
      )}

      <div className="fixed bottom-16 left-0 right-0 bg-background p-4 border-t border-border backdrop-blur-sm z-10">
        {(listening || interimText) && (
          <div className="mb-3 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
            <div className="text-xs text-muted-foreground mb-1">
              {language === "malayalam" ? "കേൾക്കുന്നു..." : "Listening..."}
            </div>
            <div className="text-sm text-foreground font-medium">
              {interimText ||
                (language === "malayalam" ? "സംസാരിക്കുക..." : "Speak now...")}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <div
            className={`chat-wrapper ${isFocused ? "active" : ""}`}
            ref={inputContainerRef}
            style={
              {
                "--mouse-x": `${mousePosition.x}px`,
                "--mouse-y": `${mousePosition.y}px`,
              } as React.CSSProperties
            }
          >
            <div className="liquid-glow"></div>
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about farming..."
              onKeyPress={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSendMessage()
              }
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              disabled={isLoading}
              className="chat-input"
              style={{
                fontFamily:
                  language === "malayalam"
                    ? "'Noto Sans Malayalam', sans-serif"
                    : "inherit",
              }}
            />
            <Button
              variant={listening || isProcessing ? "secondary" : "outline"}
              onClick={handleMicClick}
              disabled={isProcessing}
              size="icon"
              title={
                listening
                  ? language === "malayalam"
                    ? "കേൾക്കുന്നു…"
                    : "Listening…"
                  : isProcessing
                    ? language === "malayalam"
                      ? "പ്രോസസ്സിംഗ്..."
                      : "Processing..."
                    : language === "malayalam"
                      ? "വോയ്സ് ഇൻപുട്ട്"
                      : "Voice input"
              }
              style={{ zIndex: 10 }}
            >
              <Mic
                className={`h-4 w-4 ${
                  listening
                    ? "animate-pulse text-red-500"
                    : isProcessing
                      ? "animate-spin text-blue-500"
                      : ""
                }`}
              />
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              size="icon"
              style={{ zIndex: 100, backgroundColor: "green" }}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerAssistantScreen;
