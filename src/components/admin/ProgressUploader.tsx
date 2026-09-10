import React, { useState, useRef, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Mic, 
  Square, 
  UploadCloud, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  FileCheck, 
  Tag, 
  Volume2
} from 'lucide-react';
import { addProjectUpdate } from '@/data/mockProjects';
import { useSession } from '@/lib/auth-client';

interface ProgressUploaderProps {
  projectId: string;
  projectName: string;
  currentProgress: number;
  onUpdateSubmitted?: (updatedProgress: number) => void;
}

export default function ProgressUploader({
  projectId,
  projectName,
  currentProgress,
  onUpdateSubmitted,
}: ProgressUploaderProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'excel' | 'text' | 'voice'>('excel');
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Excel tab state
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [excelDelta, setExcelDelta] = useState(1.5);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2. Text tab state
  const [textNotes, setTextNotes] = useState('');
  const [supervisorName, setSupervisorName] = useState('');

  useEffect(() => {
    if (session?.user?.name && !supervisorName) {
      setSupervisorName(session.user.name);
    }
  }, [session?.user?.name, supervisorName]);
  const [textDelta, setTextDelta] = useState(0.8);
  const [selectedTags, setSelectedTags] = useState<string[]>(['#DailyProgress']);

  // 3. Voice tab state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordedAudioReady, setRecordedAudioReady] = useState(false);
  const [voiceTranscription, setVoiceTranscription] = useState('');
  const [voiceDelta, setVoiceDelta] = useState(1.2);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Quick tags list
  const quickTags = [
    '#ExcavationDone',
    '#ConcretePoured',
    '#WeatherDelay',
    '#MaterialDelivered',
    '#QualityPass',
    '#BridgeGirder',
    '#NightShift',
  ];

  // Voice recording timer effect
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const toggleVoiceRecording = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true);
      setRecordSeconds(0);
      setRecordedAudioReady(false);
      setVoiceTranscription('');
    } else {
      // Stop recording
      setIsRecording(false);
      setRecordedAudioReady(true);
      // Generate simulated high-accuracy transcription
      const simulatedNotes = [
        'Transcribed Voice Memo: Pier segment 14 casting finished at 16:30. Curing compounds applied. Steel reinforcement inspections approved for Pier 15.',
        'Transcribed Voice Memo: High-density asphalt compaction test yielded 98.4% Proctor density. Section 3B open for lane striping.',
        'Transcribed Voice Memo: 45 precast girder blocks transported to site storage yard. Hydraulic cranes setup for tomorrow morning erection schedule.',
      ];
      const randomNote = simulatedNotes[Math.floor(Math.random() * simulatedNotes.length)];
      setVoiceTranscription(randomNote);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Submission handler
  const handleCommitUpdate = (channel: 'EXCEL' | 'TEXT' | 'VOICE') => {
    let notes = '';
    let delta = 0;
    let author = supervisorName || 'Site Supervisor';
    let tags = selectedTags;

    if (channel === 'EXCEL') {
      if (!uploadedFile) return;
      notes = `Imported WBS spreadsheet "${uploadedFile.name}" (${(uploadedFile.size / 1024).toFixed(1)} KB). Auto-calculated multi-item progress delta.`;
      delta = excelDelta;
      tags = ['#ExcelImport', '#WBSLedger'];
    } else if (channel === 'TEXT') {
      if (!textNotes.trim()) return;
      notes = textNotes.trim();
      delta = textDelta;
    } else if (channel === 'VOICE') {
      if (!voiceTranscription) return;
      notes = voiceTranscription;
      delta = voiceDelta;
      tags = ['#VoiceTranscription', '#SiteAudioMemo'];
    }

    const updated = addProjectUpdate(projectId, {
      channel,
      notes,
      progressDelta: delta,
      author,
      tags,
    });

    if (updated) {
      setSuccessMessage(
        `Successfully logged ${channel} progress update (+${delta}%). Overall progress is now ${updated.currentProgress}%.`
      );
      if (onUpdateSubmitted) {
        onUpdateSubmitted(updated.currentProgress);
      }

      // Reset form states
      if (channel === 'EXCEL') setUploadedFile(null);
      if (channel === 'TEXT') setTextNotes('');
      if (channel === 'VOICE') {
        setVoiceTranscription('');
        setRecordedAudioReady(false);
        setRecordSeconds(0);
      }

      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-gray-700 bg-gray-900/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white">Daily Progress Dispatch</h3>
            <span className="text-[10px] uppercase font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
              Multi-Modal Ingestion
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Capture field execution metrics via Excel spreadsheet, text logs, or voice transcription.
          </p>
        </div>

        {/* Current status pill */}
        <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 px-3.5 py-1.5 rounded-xl text-xs">
          <span className="text-gray-400">Current Progress:</span>
          <span className="font-mono font-bold text-emerald-400 text-sm">{currentProgress}%</span>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex border-b border-gray-700 bg-gray-900/40">
        <button
          onClick={() => setActiveTab('excel')}
          className={`flex-1 py-3 px-4 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all border-b-2 ${
            activeTab === 'excel'
              ? 'border-emerald-500 text-emerald-400 bg-gray-800/80'
              : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Excel / CSV Import</span>
        </button>

        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-3 px-4 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all border-b-2 ${
            activeTab === 'text'
              ? 'border-blue-500 text-blue-400 bg-gray-800/80'
              : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-400" />
          <span>Supervisor Text Log</span>
        </button>

        <button
          onClick={() => setActiveTab('voice')}
          className={`flex-1 py-3 px-4 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all border-b-2 ${
            activeTab === 'voice'
              ? 'border-purple-500 text-purple-400 bg-gray-800/80'
              : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
          }`}
        >
          <Mic className="w-4 h-4 text-purple-400" />
          <span>Voice Memo (AI Transcribe)</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="m-4 p-4 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tab 1: Excel Upload */}
      {activeTab === 'excel' && (
        <div className="p-6 space-y-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-emerald-400 bg-emerald-950/20'
                : 'border-gray-700 hover:border-gray-500 bg-gray-900/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-950/50">
              <UploadCloud className="w-7 h-7" />
            </div>

            <p className="text-sm font-semibold text-white">
              {uploadedFile ? uploadedFile.name : 'Click to browse or drag & drop WBS sheet'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports Microsoft Excel (.xlsx) and CSV files up to 25MB
            </p>

            {uploadedFile && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs text-emerald-400 font-mono">
                <FileCheck className="w-4 h-4" />
                <span>
                  Ready to parse: {(uploadedFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
            )}
          </div>

          {/* Parsed spreadsheet preview simulation */}
          {uploadedFile && (
            <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-700/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Auto-Extracted WBS Deltas
                </span>
                <span className="text-emerald-400 font-mono font-medium">Validation Passed (OK)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded bg-gray-800 border border-gray-700">
                  <span className="text-gray-400 block">Records Parsed</span>
                  <span className="text-white font-bold text-xs mt-0.5">28 line items</span>
                </div>
                <div className="p-2 rounded bg-gray-800 border border-gray-700">
                  <span className="text-gray-400 block">Sub-tasks Closed</span>
                  <span className="text-white font-bold text-xs mt-0.5">6 sub-milestones</span>
                </div>
                <div className="p-2 rounded bg-gray-800 border border-gray-700">
                  <span className="text-gray-400 block">Progress Delta</span>
                  <span className="text-emerald-400 font-bold text-xs mt-0.5">+{excelDelta}%</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => handleCommitUpdate('EXCEL')}
              disabled={!uploadedFile}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-gray-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Commit Excel Progress (+{excelDelta}%)</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Text Input */}
      {activeTab === 'text' && (
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Site Supervisor / Officer
              </label>
              <input
                type="text"
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Estimated Progress Increment (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="10"
                value={textDelta}
                onChange={(e) => setTextDelta(parseFloat(e.target.value) || 0.5)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Daily Site Supervisor Log
            </label>
            <textarea
              rows={5}
              value={textNotes}
              onChange={(e) => setTextNotes(e.target.value)}
              placeholder="Record detailed daily operations, equipment deployed, labor turnout, inspections completed, and material batch numbers..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Quick tags */}
          <div>
            <span className="text-xs font-medium text-gray-400 block mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-400" />
              Quick Tags:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickTags.map((tag) => {
                const selected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      selected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-700'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => handleCommitUpdate('TEXT')}
              disabled={!textNotes.trim()}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Save & Publish Log (+{textDelta}%)</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Voice Record */}
      {activeTab === 'voice' && (
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-gray-900/60 border border-gray-700/80 text-center">
            {/* Microphone Toggle Button */}
            <div className="relative">
              {isRecording && (
                <div className="absolute -inset-3 rounded-full bg-rose-500/20 animate-ping" />
              )}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 ${
                  isRecording
                    ? 'bg-rose-600 text-white ring-4 ring-rose-500/40 hover:bg-rose-500 scale-105'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white hover:scale-105 hover:shadow-purple-500/30'
                }`}
              >
                {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
            </div>

            {/* Timer & Status */}
            <div className="mt-4">
              <div className="font-mono text-2xl font-bold text-white tracking-widest">
                {formatTimer(recordSeconds)}
              </div>
              <p className="text-xs font-semibold mt-1">
                {isRecording ? (
                  <span className="text-rose-400 flex items-center gap-1.5 justify-center">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    Recording in progress (Speak clearly)...
                  </span>
                ) : recordedAudioReady ? (
                  <span className="text-emerald-400 flex items-center gap-1.5 justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Audio captured & transcribed below
                  </span>
                ) : (
                  <span className="text-gray-400">Click the microphone to start voice recording</span>
                )}
              </p>
            </div>

            {/* Simulated Animated Audio Waveform */}
            {isRecording && (
              <div className="flex items-center gap-1.5 mt-4 h-8">
                {[12, 28, 44, 20, 36, 48, 24, 40, 16, 32, 44, 20, 28].map((h, idx) => (
                  <div
                    key={idx}
                    className="w-1 bg-gradient-to-t from-rose-500 to-purple-400 rounded-full animate-pulse"
                    style={{
                      height: `${h}px`,
                      animationDuration: `${0.4 + (idx % 4) * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Transcription preview box */}
          {recordedAudioReady && (
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  AI Voice Transcription Output
                </span>
                <span className="text-[11px] font-mono text-gray-400">Whisper-v3 Engine</span>
              </div>
              <textarea
                rows={3}
                value={voiceTranscription}
                onChange={(e) => setVoiceTranscription(e.target.value)}
                className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                <span>Associated Progress Delta:</span>
                <span className="font-mono text-emerald-400 font-bold">+{voiceDelta}%</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => handleCommitUpdate('VOICE')}
              disabled={!recordedAudioReady || !voiceTranscription}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              <span>Commit Voice Update (+{voiceDelta}%)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

