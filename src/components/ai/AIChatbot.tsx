import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  RefreshCw, 
  Database, 
  Building2, 
  Minimize2,
  Maximize2,
  Paperclip,
  ImageIcon,
  Camera,
  Layers,
  Clock,
  ShieldCheck,
  Mic,
  Square,
  Loader2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useSession } from '@/lib/auth-client';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  imageUrl?: string;
  imageName?: string;
  timestamp: string;
  source?: string;
  note?: string;
}

const QUICK_PROMPTS = [
  'What projects are currently active?',
  'Are any projects at risk or delayed?',
  'Show NH-48 progress and budget',
  'Summarize national infrastructure status',
];

export default function AIChatbot() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Image attachment state for the chatbot
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedImageName, setAttachedImageName] = useState<string | null>(null);
  const [attachedImageSize, setAttachedImageSize] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio recording state for Whisper speech-to-text
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [transcribingAudio, setTranscribingAudio] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceSuccess, setVoiceSuccess] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Auto-clear voice feedback banners after 4s
  useEffect(() => {
    if (voiceError || voiceSuccess) {
      const t = setTimeout(() => {
        setVoiceError(null);
        setVoiceSuccess(false);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [voiceError, voiceSuccess]);

  // Audio playback state for OpenAI Text-to-Speech (TTS)
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [loadingTtsMessageId, setLoadingTtsMessageId] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const autoSpeakRef = useRef(autoSpeak);
  useEffect(() => {
    autoSpeakRef.current = autoSpeak;
  }, [autoSpeak]);

  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsAudioCacheRef = useRef<Map<string, string>>(new Map());

  const stopAudio = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
    }
    setPlayingMessageId(null);
    setLoadingTtsMessageId(null);
  };

  const playAudioFromBase64 = (messageId: string, base64: string) => {
    try {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      const audio = new Audio(`data:audio/mpeg;base64,${base64}`);
      activeAudioRef.current = audio;
      setPlayingMessageId(messageId);
      setLoadingTtsMessageId(null);

      audio.onended = () => {
        setPlayingMessageId(null);
        activeAudioRef.current = null;
      };

      audio.onerror = () => {
        setPlayingMessageId(null);
        setLoadingTtsMessageId(null);
        activeAudioRef.current = null;
      };

      audio.play().catch((err) => {
        console.warn('Audio play was interrupted or blocked by browser policy:', err);
        setPlayingMessageId(null);
        setLoadingTtsMessageId(null);
        activeAudioRef.current = null;
      });
    } catch (err) {
      console.error('Failed to initialize Audio playback:', err);
      setPlayingMessageId(null);
      setLoadingTtsMessageId(null);
    }
  };

  const handlePlayTTS = async (messageId: string, text: string) => {
    // If this message is already playing, clicking stops it
    if (playingMessageId === messageId) {
      stopAudio();
      return;
    }

    // Stop whatever else is currently speaking
    stopAudio();

    // Check in-memory cache to avoid duplicate OpenAI API bills/latency
    const cachedBase64 = ttsAudioCacheRef.current.get(messageId);
    if (cachedBase64) {
      playAudioFromBase64(messageId, cachedBase64);
      return;
    }

    setLoadingTtsMessageId(messageId);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiBase}/api/ai/text-to-speech`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          text: text.slice(0, 4000),
          voice: 'nova',
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.message || 'Failed to synthesize speech');
      }

      const data = await res.json();
      if (data?.audioBase64) {
        ttsAudioCacheRef.current.set(messageId, data.audioBase64);
        playAudioFromBase64(messageId, data.audioBase64);
      } else {
        throw new Error('No audio data received from OpenAI TTS');
      }
    } catch (err: any) {
      console.error('Text-to-speech error:', err);
      setLoadingTtsMessageId(null);
      setPlayingMessageId(null);
    }
  };

  // Stop audio when chat is closed or minimized
  useEffect(() => {
    if (!isOpen || isMinimized) {
      stopAudio();
    }
    return () => {
      stopAudio();
    };
  }, [isOpen, isMinimized]);


  const toggleAudioRecording = async () => {
    if (!isRecordingAudio) {
      setVoiceError(null);
      setVoiceSuccess(false);
      try {
        if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setVoiceError('Microphone access is not supported in this browser.');
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: recorder.mimeType || 'audio/webm',
          });
          stream.getTracks().forEach((track) => track.stop());

          setTranscribingAudio(true);
          try {
            const reader = new FileReader();
            reader.onload = async () => {
              try {
                const base64Data = (reader.result as string).split(',')[1];
                if (!base64Data) throw new Error('Failed to encode audio data.');

                const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                const res = await fetch(`${apiBase}/api/ai/audio-transcribe`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    audioBase64: base64Data,
                    audioMime: audioBlob.type || 'audio/webm',
                  }),
                });

                if (!res.ok) {
                  const errJson = await res.json().catch(() => ({}));
                  const errMsg = errJson.error || `Server error (${res.status})`;
                  throw new Error(errMsg);
                }

                const data = await res.json();
                if (data.text && data.text.trim()) {
                  setInputMessage((prev) => (prev ? `${prev} ${data.text.trim()}` : data.text.trim()));
                  setVoiceSuccess(true);
                } else {
                  setVoiceError('No speech detected. Please try again in a quieter environment.');
                }
              } catch (innerErr: any) {
                const msg = innerErr?.message || 'Transcription failed';
                setVoiceError(
                  msg.includes('OpenAI')
                    ? 'OpenAI Whisper unavailable. Check backend OPENAI_API_KEY.'
                    : msg.includes('network') || msg.includes('fetch')
                    ? 'Cannot reach backend. Ensure the server is running on port 4000.'
                    : `Voice error: ${msg}`
                );
              } finally {
                setTranscribingAudio(false);
              }
            };
            reader.readAsDataURL(audioBlob);
          } catch (err: any) {
            setVoiceError(`Recording error: ${err?.message || 'Unknown error'}`);
            setTranscribingAudio(false);
          }
        };

        recorder.start();
        setIsRecordingAudio(true);
      } catch (err: any) {
        const msg = err?.message || '';
        setVoiceError(
          msg.includes('denied') || msg.includes('NotAllowed')
            ? 'Microphone permission denied. Allow microphone access in browser settings.'
            : `Microphone error: ${msg}`
        );
      }
    } else {
      setIsRecordingAudio(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am **InfraTrack AI**, connected directly to the live National Infrastructure PostgreSQL database and OpenAI.\n\nYou can ask me about project metrics, or **upload an on-site / drone photo** using the camera button below to get an instant AI structural inspection of pending work, estimated completion time, and safety telemetry.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'realtime-database-engine',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized, messages]);

  // Handle image selection
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (PNG, JPG, JPEG, WEBP).');
        return;
      }
      setAttachedImageName(file.name);
      setAttachedImageSize(`${(file.size / 1024).toFixed(1)} KB`);

      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target?.result === 'string') {
          setAttachedImage(ev.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
    // reset input value so re-uploading same file triggers change
    e.target.value = '';
  };

  const removeAttachedImage = () => {
    setAttachedImage(null);
    setAttachedImageName(null);
    setAttachedImageSize(null);
  };

  const handleSendMessage = async (userText?: string) => {
    const textToSend = userText || inputMessage;
    if ((!textToSend.trim() && !attachedImage) || loading) return;

    const currentImage = attachedImage;
    const currentImageName = attachedImageName;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim() || 'Please inspect this uploaded site photo against live infrastructure telemetry.',
      imageUrl: currentImage || undefined,
      imageName: currentImageName || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!userText) setInputMessage('');
    removeAttachedImage();
    setLoading(true);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiBase}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: textToSend.trim(),
          imageBase64: currentImage || undefined,
          history: messages.slice(-6).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || errJson.error || 'Failed to get response from AI service');
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'I processed your query against live project telemetry.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
        note: data.note,
      };

      setMessages((prev) => [...prev, botMsg]);

      // If Auto-Read Aloud is active, speak the new response immediately
      if (autoSpeakRef.current && botMsg.text) {
        handlePlayTTS(botMsg.id, botMsg.text);
      }
    } catch (err: unknown) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **AI Service Notice**: ${err instanceof Error ? err.message : 'Unable to connect to AI engine'}.\n\nEnsure your \`OPENAI_API_KEY\` is configured in \`backend/.env\` and the backend server is running on port 4000.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    stopAudio();
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: 'Session refreshed. Ready to inspect live national projects database or analyze uploaded site photos.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'realtime-database-engine',
      },
    ]);
  };

  return (
    <aside aria-label="AI Assistant" className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none font-sans">
      {/* Expanded Chat Window */}
      {isOpen && (
        <div
          className={`pointer-events-auto w-[92vw] sm:w-[440px] mb-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
            isMinimized ? 'h-14' : 'h-[600px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white flex items-center justify-between flex-shrink-0 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center ring-1 ring-white/30">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold tracking-tight">InfraTrack AI</h3>
                  <span className="flex items-center gap-1 text-[10px] font-medium bg-white/20 px-1.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    Live DB & Vision
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/90 font-medium">OpenAI Real-Time Telemetry & Photo Analysis</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  const next = !autoSpeak;
                  setAutoSpeak(next);
                  if (!next) stopAudio();
                }}
                title={autoSpeak ? 'Auto Read Aloud (OpenAI Voice): Active (Click to mute)' : 'Auto Read Aloud (OpenAI Voice): Off (Click to activate)'}
                className={`px-2 py-1 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-medium ${
                  autoSpeak
                    ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                    : 'text-white/80 hover:text-white hover:bg-white/20'
                }`}
              >
                {autoSpeak ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{autoSpeak ? 'TTS On' : 'TTS Off'}</span>
              </button>
              <button
                onClick={clearChat}
                title="Clear conversation"
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Maximize' : 'Minimize'}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body when not minimized */}
          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl p-3 sm:p-3.5 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-white rounded-tr-xs shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-xs'
                      }`}
                    >
                      {/* If user attached an image, render it inside the message bubble */}
                      {msg.imageUrl && (
                        <div className="mb-2.5 rounded-xl overflow-hidden border border-white/20 shadow-sm bg-black/20">
                          <img
                            src={msg.imageUrl}
                            alt="Uploaded Inspection"
                            className="max-h-52 w-full object-cover object-center"
                          />
                          {msg.imageName && (
                            <div className="px-2 py-1 text-[10px] bg-black/40 text-emerald-100 font-mono truncate">
                              📸 {msg.imageName}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Formatted Markdown-like rendering */}
                      <div className="whitespace-pre-wrap font-sans space-y-1">
                        {msg.text.split('\n').map((line, lIdx) => {
                          if (line.startsWith('### ')) {
                            return <p key={lIdx} className="font-bold text-sm text-emerald-700 dark:text-emerald-400 mt-1">{line.replace('### ', '')}</p>;
                          }
                          // Simple bold replacement for **text**
                          const parts = line.split(/(\*\*.*?\*\*)/g);
                          return (
                            <p key={lIdx}>
                              {parts.map((part, pIdx) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return <strong key={pIdx} className="font-semibold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
                                }
                                return part;
                              })}
                            </p>
                          );
                        })}
                      </div>

                      {msg.note && (
                        <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-500 dark:text-slate-400 italic">
                          💡 {msg.note}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-slate-400 dark:text-slate-500">
                      <span>{msg.timestamp}</span>
                      {msg.source && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            {msg.source.includes('openai') ? 'OpenAI GPT-4o' : 'Live DB'}
                          </span>
                        </>
                      )}
                      {msg.sender === 'assistant' && (
                        <>
                          <span>•</span>
                          <button
                            onClick={() => handlePlayTTS(msg.id, msg.text)}
                            disabled={loadingTtsMessageId === msg.id}
                            title={
                              playingMessageId === msg.id
                                ? 'Stop reading'
                                : loadingTtsMessageId === msg.id
                                ? 'Synthesizing voice with OpenAI...'
                                : 'Read aloud with OpenAI Voice'
                            }
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                              playingMessageId === msg.id
                                ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 animate-pulse ring-1 ring-rose-400/50'
                                : loadingTtsMessageId === msg.id
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                                : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400'
                            }`}
                          >
                            {loadingTtsMessageId === msg.id ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-emerald-600 dark:text-emerald-400" />
                                <span>Voicing...</span>
                              </>
                            ) : playingMessageId === msg.id ? (
                              <>
                                <Square className="w-2.5 h-2.5 fill-current text-rose-600 dark:text-rose-400" />
                                <span>Stop</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3" />
                                <span>Read Aloud</span>
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-start gap-2">
                    <div className="bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-xs p-3 flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {attachedImage ? 'OpenAI inspecting image & live database telemetry...' : 'Querying OpenAI with live project telemetry...'}
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts */}
              <div className="px-3 py-2 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto flex gap-1.5 no-scrollbar flex-shrink-0">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    disabled={loading}
                    onClick={() => handleSendMessage(prompt)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-medium bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700/80 transition-colors flex-shrink-0"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Image Preview Banner when user has chosen a file */}
              {attachedImage && (
                <div className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 border-t border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between gap-3 flex-shrink-0">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <img
                      src={attachedImage}
                      alt="Thumbnail"
                      className="w-9 h-9 object-cover rounded-lg border border-emerald-300 dark:border-emerald-700 flex-shrink-0"
                    />
                    <div className="text-left overflow-hidden">
                      <p className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-200 truncate">
                        {attachedImageName}
                      </p>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                        {attachedImageSize} • Ready for OpenAI Vision
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeAttachedImage}
                    title="Remove attached image"
                    className="p-1 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Voice Error / Success Feedback Banner */}
              {voiceError && (
                <div className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-800/50 flex items-center gap-2 flex-shrink-0">
                  <span className="text-rose-600 dark:text-rose-400 text-[11px] font-semibold flex-1">
                    🎙️ {voiceError}
                  </span>
                  <button
                    onClick={() => setVoiceError(null)}
                    className="p-0.5 rounded text-rose-400 hover:text-rose-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {voiceSuccess && (
                <div className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border-t border-emerald-200 dark:border-emerald-800/50 flex items-center gap-2 flex-shrink-0">
                  <span className="text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
                    ✅ Voice transcribed — ready to send!
                  </span>
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 flex-shrink-0">
                {/* Hidden File Input for Image Upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {/* Upload Image Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || isRecordingAudio}
                  title="Attach site photo for AI Vision analysis"
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                    attachedImage
                      ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 ring-2 ring-emerald-500'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                </button>

                {/* Voice Input Button (OpenAI Whisper) */}
                <button
                  type="button"
                  onClick={toggleAudioRecording}
                  disabled={loading}
                  title={isRecordingAudio ? "Stop recording and transcribe with Whisper" : "Record voice query (OpenAI Whisper)"}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                    isRecordingAudio
                      ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-500/50'
                      : transcribingAudio
                      ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {transcribingAudio ? (
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600 dark:text-purple-400" />
                  ) : isRecordingAudio ? (
                    <Square className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    attachedImage
                      ? 'Ask about this photo, or press Enter to analyze...'
                      : 'Ask about live projects, or upload a photo...'
                  }
                  disabled={loading}
                  className="flex-1 bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-emerald-500 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
                />

                <button
                  onClick={() => handleSendMessage()}
                  disabled={(!inputMessage.trim() && !attachedImage) || loading}
                  className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-md shadow-emerald-600/20 transition-all flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Action Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (isMinimized) setIsMinimized(false);
        }}
        className="pointer-events-auto relative group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xl shadow-emerald-900/30 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full border-2 border-emerald-700 animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full border-2 border-emerald-700" />
        </div>
        <span className="text-xs font-bold tracking-wide">
          {isOpen ? 'Close AI Assistant' : 'InfraTrack AI'}
        </span>
      </button>
    </aside>
  );
}
