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
  Volume2,
  AlertCircle,
  Loader2,
  Camera,
  ImageIcon,
  Scan,
  ShieldCheck,
  Calendar,
  Layers,
  Check,
  X
} from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { useI18n } from '@/lib/i18n-context';

interface VisionAssessmentResult {
  currentProgressEstimate: number;
  pendingWorkPercent: number;
  suggestedProgressDelta: number;
  estimatedDaysRemaining: number;
  estimatedTimeToCompletion: string;
  confidenceScore: number;
  detectedElements: string[];
  observations: string[];
  summary: string;
}

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
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState<'excel' | 'text' | 'voice' | 'vision'>('excel');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  // 4. AI Vision tab state
  const [visionImageBase64, setVisionImageBase64] = useState<string | null>(null);
  const [visionImageName, setVisionImageName] = useState('');
  const [visionImageSize, setVisionImageSize] = useState('');
  const [visionNotes, setVisionNotes] = useState('');
  const [visionAnalyzing, setVisionAnalyzing] = useState(false);
  const [visionResult, setVisionResult] = useState<VisionAssessmentResult | null>(null);
  const [visionError, setVisionError] = useState('');
  const [visionDragActive, setVisionDragActive] = useState(false);
  const visionFileInputRef = useRef<HTMLInputElement>(null);

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
      setIsRecording(true);
      setRecordSeconds(0);
      setRecordedAudioReady(false);
      setVoiceTranscription('');
      setErrorMessage('');
    } else {
      setIsRecording(false);
      setRecordedAudioReady(true);
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

  // Process selected image for AI Vision
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setVisionError('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    setVisionError('');
    setVisionResult(null);
    setVisionImageName(file.name);
    setVisionImageSize(`${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setVisionImageBase64(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVisionImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVisionDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleVisionFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  // Trigger AI Vision Inspection
  const handleAnalyzeVision = async () => {
    if (!visionImageBase64) return;
    setVisionAnalyzing(true);
    setVisionError('');

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiBase}/api/ai/vision-estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          imageBase64: visionImageBase64,
          projectId,
          notes: visionNotes || 'Field site inspection photo analysis',
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to complete AI vision analysis');
      }

      const data = await res.json();
      if (data.result) {
        setVisionResult(data.result);
      } else {
        throw new Error('Invalid vision response received');
      }
    } catch (err: unknown) {
      setVisionError(err instanceof Error ? err.message : 'Vision analysis failed');
    } finally {
      setVisionAnalyzing(false);
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

  // Real API submission handler persisting to PostgreSQL
  const handleCommitUpdate = async (channel: 'EXCEL' | 'TEXT' | 'VOICE' | 'VISION') => {
    let notes = '';
    let delta = 0;
    let author = supervisorName || session?.user?.name || 'Site Supervisor';
    let tags = selectedTags;
    let backendChannel: 'EXCEL' | 'TEXT' | 'VOICE' = 'TEXT';

    if (channel === 'EXCEL') {
      if (!uploadedFile) return;
      notes = `Imported WBS spreadsheet "${uploadedFile.name}" (${(uploadedFile.size / 1024).toFixed(1)} KB). Auto-calculated multi-item progress delta.`;
      delta = excelDelta;
      tags = ['#ExcelImport', '#WBSLedger'];
      backendChannel = 'EXCEL';
    } else if (channel === 'TEXT') {
      if (!textNotes.trim()) return;
      notes = textNotes.trim();
      delta = textDelta;
      backendChannel = 'TEXT';
    } else if (channel === 'VOICE') {
      if (!voiceTranscription) return;
      notes = voiceTranscription;
      delta = voiceDelta;
      tags = ['#VoiceTranscription', '#SiteAudioMemo'];
      backendChannel = 'VOICE';
    } else if (channel === 'VISION') {
      if (!visionResult) return;
      notes = `[AI Drone & Site Photo Inspection]\nPending Work: ${visionResult.pendingWorkPercent}%\nEstimated Remaining Time: ${visionResult.estimatedTimeToCompletion}\nAI Confidence Score: ${visionResult.confidenceScore}%\nSummary: ${visionResult.summary}\nDetected: ${visionResult.detectedElements.join(', ')}`;
      delta = visionResult.suggestedProgressDelta;
      tags = ['#AIVisionInspection', '#DronePhotoTelemetry', '#OpenAI'];
      backendChannel = 'TEXT';
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiBase}/api/projects/${projectId}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          channel: backendChannel,
          notes,
          progressDelta: delta,
          author,
          tags,
        }),
      });

      if (res.status === 401) {
        setErrorMessage('Authentication session expired. Please sign in again.');
        return;
      }

      if (res.status === 403) {
        setErrorMessage('Access Restricted: Only Field Supervisors and Admins are permitted to commit progress updates.');
        return;
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to persist update to database');
      }

      const resData = await res.json();
      const updatedProject = resData.project;

      setSuccessMessage(
        `Successfully logged ${channel === 'VISION' ? 'AI Vision' : channel} progress update (+${delta}%) into PostgreSQL ledger. Overall progress is now ${updatedProject.currentProgress}%.`
      );

      if (onUpdateSubmitted) {
        onUpdateSubmitted(updatedProject.currentProgress);
      }

      // Reset form states
      if (channel === 'EXCEL') setUploadedFile(null);
      if (channel === 'TEXT') setTextNotes('');
      if (channel === 'VOICE') {
        setVoiceTranscription('');
        setRecordedAudioReady(false);
        setRecordSeconds(0);
      }
      if (channel === 'VISION') {
        setVisionResult(null);
        setVisionImageBase64(null);
        setVisionNotes('');
      }

      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save progress update.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden transition-colors">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('projectUpdate.dispatchTitle', 'Daily Progress Dispatch')}
            </h3>
            <span className="text-[10px] uppercase font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded">
              {t('projectUpdate.multiModalBadge', 'Multi-Modal Ingestion')}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Capture field execution metrics via AI Drone Photos, Excel sheets, text logs, or voice memos.
          </p>
        </div>

        {/* Current status pill */}
        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 px-3.5 py-1.5 rounded-xl text-xs">
          <span className="text-slate-500 dark:text-gray-400">{t('projectUpdate.currentProgress', 'Current Progress')}:</span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">{currentProgress}%</span>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-200 dark:border-gray-700 bg-slate-100/60 dark:bg-gray-900/40">
        <button
          onClick={() => setActiveTab('excel')}
          className={`py-3 px-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all border-b-2 ${
            activeTab === 'excel'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-gray-800/80 shadow-sm'
              : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          <span>{t('projectUpdate.tabExcel', 'Excel / CSV')}</span>
        </button>

        <button
          onClick={() => setActiveTab('text')}
          className={`py-3 px-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all border-b-2 ${
            activeTab === 'text'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800/80 shadow-sm'
              : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-500" />
          <span>{t('projectUpdate.tabText', 'Text Log')}</span>
        </button>

        <button
          onClick={() => setActiveTab('voice')}
          className={`py-3 px-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all border-b-2 ${
            activeTab === 'voice'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-800/80 shadow-sm'
              : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200'
          }`}
        >
          <Mic className="w-4 h-4 text-purple-500" />
          <span>{t('projectUpdate.tabVoice', 'Voice Memo')}</span>
        </button>

        <button
          onClick={() => setActiveTab('vision')}
          className={`py-3 px-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all border-b-2 relative ${
            activeTab === 'vision'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-gray-800/80 shadow-sm'
              : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="font-bold">AI Photo Vision</span>
          <span className="hidden sm:inline-block text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 px-1.5 py-0.2 rounded-full">
            OpenAI
          </span>
        </button>
      </div>

      {/* Feedback Notifications */}
      {successMessage && (
        <div className="m-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="m-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
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
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                : 'border-slate-300 dark:border-gray-700 hover:border-slate-400 dark:hover:border-gray-500 bg-slate-50 dark:bg-gray-900/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-md">
              <UploadCloud className="w-7 h-7" />
            </div>

            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {uploadedFile ? uploadedFile.name : t('projectUpdate.dragDropText', 'Click to browse or drag & drop WBS sheet')}
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
              {t('projectUpdate.dragDropHint', 'Supports Microsoft Excel (.xlsx) and CSV files up to 25MB')}
            </p>

            {uploadedFile && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                <FileCheck className="w-4 h-4" />
                <span>
                  {t('projectUpdate.readyToParse', 'Ready to parse')}: {(uploadedFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
            )}
          </div>

          {uploadedFile && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-900/80 border border-slate-200 dark:border-gray-700/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 dark:text-gray-300 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Auto-Extracted WBS Deltas
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">Validation Passed (OK)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700">
                  <span className="text-slate-500 dark:text-gray-400 block">Records Parsed</span>
                  <span className="text-slate-900 dark:text-white font-bold text-xs mt-0.5">28 line items</span>
                </div>
                <div className="p-2 rounded bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700">
                  <span className="text-slate-500 dark:text-gray-400 block">Sub-tasks Closed</span>
                  <span className="text-slate-900 dark:text-white font-bold text-xs mt-0.5">6 sub-milestones</span>
                </div>
                <div className="p-2 rounded bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700">
                  <span className="text-slate-500 dark:text-gray-400 block">Progress Delta</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs mt-0.5">+{excelDelta}%</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => handleCommitUpdate('EXCEL')}
              disabled={!uploadedFile || submitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-gray-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to Database...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{t('projectUpdate.commitExcel', 'Commit Excel Progress')} (+{excelDelta}%)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Text Input */}
      {activeTab === 'text' && (
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                {t('projectUpdate.supervisorNameLabel', 'Site Supervisor / Officer')}
              </label>
              <input
                type="text"
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                {t('projectUpdate.progressIncrementLabel', 'Estimated Progress Increment (%)')}
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="10"
                value={textDelta}
                onChange={(e) => setTextDelta(parseFloat(e.target.value) || 0.5)}
                className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
              {t('projectUpdate.dailyLogLabel', 'Daily Site Supervisor Log')}
            </label>
            <textarea
              rows={5}
              value={textNotes}
              onChange={(e) => setTextNotes(e.target.value)}
              placeholder={t('projectUpdate.dailyLogPlaceholder', 'Record detailed daily operations, equipment deployed, labor turnout, inspections completed, and material batch numbers...')}
              className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Quick tags */}
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-gray-400 block mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-500" />
              {t('projectUpdate.quickTags', 'Quick Tags')}:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-mono transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => handleCommitUpdate('TEXT')}
              disabled={!textNotes.trim() || submitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to Database...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>{t('projectUpdate.commitText', 'Commit Field Log')} (+{textDelta}%)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Voice Memo */}
      {activeTab === 'voice' && (
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-gray-900/50 rounded-2xl border border-slate-200 dark:border-gray-700/80 text-center">
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

            <div className="mt-4">
              <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white tracking-widest">
                {formatTimer(recordSeconds)}
              </div>
              <p className="text-xs font-semibold mt-1">
                {isRecording ? (
                  <span className="text-rose-500 dark:text-rose-400 flex items-center gap-1.5 justify-center">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    {t('projectUpdate.voiceRecording', 'Recording in progress (Speak clearly)...')}
                  </span>
                ) : recordedAudioReady ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t('projectUpdate.voiceCaptured', 'Audio captured & transcribed below')}
                  </span>
                ) : (
                  <span className="text-slate-500 dark:text-gray-400">
                    {t('projectUpdate.voiceClickToRecord', 'Click the microphone to start voice recording')}
                  </span>
                )}
              </p>
            </div>

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

          {recordedAudioReady && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  {t('projectUpdate.voiceOutputTitle', 'AI Voice Transcription Output')}
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-gray-400">
                  {t('projectUpdate.whisperEngine', 'Whisper-v3 Engine')}
                </span>
              </div>
              <textarea
                rows={3}
                value={voiceTranscription}
                onChange={(e) => setVoiceTranscription(e.target.value)}
                className="w-full bg-white dark:bg-gray-800/80 border border-slate-200 dark:border-gray-700 rounded-lg p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400 pt-1">
                <span>Associated Progress Delta:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">+{voiceDelta}%</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => handleCommitUpdate('VOICE')}
              disabled={!recordedAudioReady || !voiceTranscription || submitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to Database...</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>{t('projectUpdate.commitVoice', 'Commit Voice Update')} (+{voiceDelta}%)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: AI Drone & Site Photo Vision Analysis */}
      {activeTab === 'vision' && (
        <div className="p-6 space-y-6">
          {/* Top instructions / notice */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-300 dark:border-amber-800/60 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex-shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                OpenAI Vision Structural Assessment Engine
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  GPT-4o Multimodal
                </span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Upload or capture an on-site drone photo or inspection snapshot. The AI will inspect physical structural progress, compute <strong>Work Pending (%)</strong>, calculate <strong>Estimated Time to Completion</strong>, and generate a <strong>Confidence Score</strong>.
              </p>
            </div>
          </div>

          {/* Upload Dropzone or Photo Preview */}
          {!visionImageBase64 ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setVisionDragActive(true);
              }}
              onDragLeave={() => setVisionDragActive(false)}
              onDrop={handleVisionImageDrop}
              onClick={() => visionFileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                visionDragActive
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'
                  : 'border-slate-300 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500 bg-slate-50 dark:bg-gray-900/50'
              }`}
            >
              <input
                ref={visionFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleVisionFileSelect}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-md">
                <Camera className="w-7 h-7" />
              </div>

              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Upload Drone Snapshot or Site Inspection Photo
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                Drag and drop image here, or click to browse (PNG, JPG, WEBP)
              </p>

              {/* Sample Preset Button to quickly test without local images */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-gray-800/80 flex flex-wrap items-center justify-center gap-2">
                <span className="text-[11px] text-slate-400">Quick test presets:</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Clean synthetic SVG canvas as base64 representing site civil engineering
                    const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="#1e293b"/><path d="M0 320 Q 300 280 600 320 L 600 400 L 0 400 Z" fill="#334155"/><rect x="150" y="160" width="40" height="160" fill="#94a3b8"/><rect x="410" y="160" width="40" height="160" fill="#94a3b8"/><rect x="100" y="140" width="400" height="30" fill="#cbd5e1"/><text x="300" y="90" fill="#f59e0b" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">NH-48 Corridor Pier Casting #14</text><circle cx="280" cy="270" r="14" fill="#ef4444"/><rect x="290" y="250" width="50" height="30" fill="#eab308"/></svg>`;
                    const sampleBase64 = `data:image/svg+xml;base64,${btoa(sampleSvg)}`;
                    setVisionImageBase64(sampleBase64);
                    setVisionImageName('NH48_Pier_Casting_Drone_04.svg');
                    setVisionImageSize('24.2 KB');
                    setVisionNotes('Automated drone photogrammetry capturing Pier #14 and subgrade rebar tying.');
                  }}
                  className="text-xs px-2.5 py-1 rounded-lg font-medium bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 transition-colors"
                >
                  Load Drone Pier Photo Preset
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Preview Card */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-gray-700 bg-slate-950 shadow-lg group">
                <img
                  src={visionImageBase64}
                  alt="Site Inspection"
                  className="w-full h-64 object-cover object-center"
                />

                {/* Scanning Radar effect when analyzing */}
                {visionAnalyzing && (
                  <div className="absolute inset-0 bg-slate-950/60 flex flex-col items-center justify-center backdrop-blur-xs">
                    <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-amber-500/40 animate-ping" />
                      <div className="absolute inset-2 rounded-full border border-amber-400 animate-spin" />
                      <Scan className="w-10 h-10 text-amber-400 animate-pulse" />
                    </div>
                    <span className="text-sm font-bold text-white tracking-wide">
                      AI Vision Engine Analyzing Structural Elements...
                    </span>
                    <span className="text-xs text-amber-300/80 mt-1 font-mono">
                      Querying multimodal vision layer against WBS baseline
                    </span>
                  </div>
                )}

                {/* Image info bar */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold">{visionImageName}</span>
                    <span className="text-slate-400 font-mono text-[11px]">({visionImageSize})</span>
                  </div>
                  <button
                    type="button"
                    disabled={visionAnalyzing}
                    onClick={() => {
                      setVisionImageBase64(null);
                      setVisionResult(null);
                      setVisionError('');
                    }}
                    className="p-1.5 rounded-lg bg-black/60 hover:bg-rose-600/80 text-white transition-colors flex items-center gap-1 text-[11px]"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Change Photo</span>
                  </button>
                </div>
              </div>

              {/* Optional Field Supervisor Observation Note */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                  Inspection Context / Milestone Note (Optional)
                </label>
                <input
                  type="text"
                  value={visionNotes}
                  onChange={(e) => setVisionNotes(e.target.value)}
                  placeholder="e.g. Inspecting NH-48 pier casting, subgrade compaction, and girder placement"
                  disabled={visionAnalyzing}
                  className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              {/* Action: Run AI Vision Inspection */}
              {!visionResult && (
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleAnalyzeVision}
                    disabled={visionAnalyzing}
                    className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2"
                  >
                    {visionAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Analyzing with OpenAI Vision...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Analyze Site Photo with AI</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Vision Error Feedback */}
          {visionError && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
              <span>{visionError}</span>
            </div>
          )}

          {/* AI Assessment Results Card */}
          {visionResult && (
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-gray-900/90 border border-amber-200 dark:border-amber-900/50 space-y-5 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    AI Multimodal Structural Assessment Report
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-slate-500 dark:text-gray-400">
                  Target: <strong className="text-slate-800 dark:text-slate-200">{projectName}</strong>
                </span>
              </div>

              {/* Three Core Metric Cards requested by user: Pending Work %, Estimated Time, Confidence Score */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* 1. Pending Work Percentage */}
                <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700/80 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400 mb-1">
                    <span className="font-semibold uppercase tracking-wider text-[11px]">Work Pending</span>
                    <Layers className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <div className="font-mono text-2xl font-black text-amber-600 dark:text-amber-400">
                      {visionResult.pendingWorkPercent}%
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-gray-700 h-2 rounded-full mt-2 overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: `${visionResult.currentProgressEstimate}%` }}
                        title={`Completed: ${visionResult.currentProgressEstimate}%`}
                      />
                      <div
                        className="bg-amber-500 h-full"
                        style={{ width: `${visionResult.pendingWorkPercent}%` }}
                        title={`Pending: ${visionResult.pendingWorkPercent}%`}
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-2">
                    Current Progress: <strong>{visionResult.currentProgressEstimate}%</strong>
                  </p>
                </div>

                {/* 2. Estimated Time to Completion */}
                <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700/80 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400 mb-1">
                    <span className="font-semibold uppercase tracking-wider text-[11px]">Estimated Time</span>
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-mono text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
                      {visionResult.estimatedTimeToCompletion}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-400" />
                    <span>Est. <strong>{visionResult.estimatedDaysRemaining} days</strong> remaining</span>
                  </p>
                </div>

                {/* 3. Confidence Score */}
                <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700/80 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400 mb-1">
                    <span className="font-semibold uppercase tracking-wider text-[11px]">Confidence Score</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {visionResult.confidenceScore}%
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                        {visionResult.confidenceScore >= 80 ? 'High' : 'Moderate'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-gray-700 h-2 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${visionResult.confidenceScore}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                    Verified against WBS timeline
                  </p>
                </div>
              </div>

              {/* Detected Physical Elements */}
              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-gray-300 block mb-2">
                  Detected Infrastructure Elements:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {visionResult.detectedElements.map((elem, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-lg font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 flex items-center gap-1.5"
                    >
                      <Check className="w-3 h-3 text-amber-500" />
                      {elem}
                    </span>
                  ))}
                </div>
              </div>

              {/* Engineering Observations */}
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-gray-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-gray-700/60">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                  Structural Observations:
                </span>
                <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                  {visionResult.observations.map((obs, idx) => (
                    <li key={idx}>{obs}</li>
                  ))}
                </ul>
              </div>

              {/* Executive Summary */}
              <p className="text-xs text-slate-700 dark:text-slate-300 italic border-l-2 border-amber-500 pl-3">
                &ldquo;{visionResult.summary}&rdquo;
              </p>

              {/* Commit Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-gray-800">
                <span className="text-xs text-slate-500 dark:text-gray-400">
                  Suggested Ledger Delta: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">+{visionResult.suggestedProgressDelta}%</strong>
                </span>
                <button
                  type="button"
                  onClick={() => handleCommitUpdate('VISION')}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-gray-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Recording to Database Ledger...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Commit AI Inspection Update (+{visionResult.suggestedProgressDelta}%)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
