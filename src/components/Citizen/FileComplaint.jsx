import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3, Brain, Building2, CheckCircle2, ChevronRight, CircleHelp,
  ClipboardCheck, ClipboardList, Copy, Droplets, Eye, FileText, History,
  Leaf, Lightbulb, MapIcon, MapPin, MessageCircle, Search, Send,
  RefreshCw, Star, Trash2, TrendingUp, UserCheck, Volume2, Wrench, Zap,
  ChevronDown, ChevronUp, UploadCloud, X, Mic, MicOff, Globe, Bot, Sparkles, Camera
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import ARScanner from '../../ARScanner.jsx';
import { DashboardShell, DepartmentBadge, ErrorCard, InlineSpinner, PageHeader, PriorityBadge, SectionSkeleton, StatusBadge } from '../../Shared.jsx';
import { callClaude, parseClaudeJson, runAgentLoop } from '../../ai.js';
import AgentTrace from '../AgentTrace.jsx';
import { useTickets, saveTicketToSupabase } from '../../hooks/useTickets.js';
import { translateCategory, translateDepartment, translatePriority, translateSectorName, translateStatus, translateSubcategory } from '../../i18n/helpers.js';
import { CATEGORIES, MOCK_CITIZEN_COMPLAINTS, OFFICER_BY_SECTOR, SECTORS, SLA_WINDOWS, SUBCATEGORIES, TRACK_STEPS, getInitialTickets, saveTickets, HEATMAP_SECTORS, CARBON_DATA, CARBON_MONTHLY, DEPT_PERFORMANCE } from '../../data.js';
import { SECTOR_OFFICER_MAP, SIDEBAR_ITEMS, INITIAL_FORM, FIELD_IDS, CATEGORY_META, MAX_MEDIA_FILES, GROQ_API_KEY, inferCategoryFromText, fileToDataUrl } from './sharedUtils.jsx';

import { getCountdown } from './sharedUtils.jsx';

function FileComplaint({ setTickets, onTrackTicket, setSelectedTicket }) {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [result, setResult] = useState(null);
  const [errorCard, setErrorCard] = useState('');
  const [showARScanner, setShowARScanner] = useState(false);
  const [intakeMode, setIntakeMode] = useState('manual');
  const [isDictating, setIsDictating] = useState(false);
  const [agentTrace, setAgentTrace] = useState([]);
  const dictationRef = useRef(null);

  const toggleDictation = () => {
    if (isDictating) {
      if (dictationRef.current) dictationRef.current.stop();
      setIsDictating(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = i18n.language || 'hi-IN';
      
      recognition.onresult = (event) => {
        let finalTrans = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTrans += event.results[i][0].transcript;
        }
        if (finalTrans) {
          setForm(curr => ({ ...curr, description: curr.description + (curr.description ? ' ' : '') + finalTrans.trim() }));
          setErrors(curr => ({ ...curr, description: undefined }));
        }
      };
      recognition.onerror = () => setIsDictating(false);
      recognition.onend = () => setIsDictating(false);
      dictationRef.current = recognition;
      recognition.start();
      setIsDictating(true);
    } else {
      alert(t('citizen.dictationUnsupported'));
    }
  };

  const nextFromStep1 = () => {
    let subcategoryFromDom = '';
    try {
      subcategoryFromDom = document.getElementById(FIELD_IDS.subcategory)?.value || '';
    } catch(err) {
      console.warn("DOM read error:", err);
    }
    const selectedSubcategory = form.subcategory || subcategoryFromDom;

    const inferredCategory =
      form.category ||
      Object.keys(SUBCATEGORIES).find(category =>
        (SUBCATEGORIES[category] || []).includes(selectedSubcategory)
      ) ||
      '';

    const nextErrors = {};
    if (!inferredCategory) nextErrors.category = t('citizen.selectCategory');
    if (!selectedSubcategory) nextErrors.subcategory = t('subcategory.Select subcategory...');
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setForm(current => ({
        ...current,
        category: inferredCategory || current.category,
        subcategory: selectedSubcategory || current.subcategory,
      }));
      setStep(2);
    }
  };

  const availableSubcategories = form.category
    ? (SUBCATEGORIES[form.category] || [])
    : Array.from(new Set(Object.values(SUBCATEGORIES).flat()));

  const nextFromStep2 = () => {
    const nextErrors = {};
    if (!form.description.trim()) nextErrors.description = t('citizen.complaintDesc');
    if (!form.location) nextErrors.location = t('citizen.selectSector');
    if (form.mediaFiles.length === 0) nextErrors.media = t('citizen.errors.mediaRequired');
    
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setStep(3);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setErrors({});
    setErrorCard('');
    setResult(null);
    setForm(INITIAL_FORM);
  };

  const withTimeout = (promise, timeoutMs) =>
    Promise.race([
      promise,
      new Promise((_, reject) => {
        window.setTimeout(() => reject(new Error(t('citizen.aiTimeout'))), timeoutMs);
      }),
    ]);

  const buildTicketId = (candidate) => {
    const raw = String(candidate || '').trim();
    const matched = raw.match(/(\d{6})$/);
    if (matched) return `IND-${matched[1]}`;
    return `IND-${Math.floor(100000 + Math.random() * 900000)}`;
  };

  const submitComplaint = async () => {
    setLoading(true);
    setAgentTrace([]);
    setErrorCard('');

    try {
      // Build department stats lookup from DEPT_PERFORMANCE
      const deptStats = {};
      (DEPT_PERFORMANCE || []).forEach(d => { deptStats[d.department] = d; });

      // Get existing tickets for duplicate checking
      const existingTickets = getInitialTickets();

      // Run the real multi-tool agent loop
      const agentResult = await withTimeout(
        runAgentLoop(form, existingTickets, deptStats, setAgentTrace),
        60000 // 60s timeout for multi-step agent
      );

      // Handle duplicate detection
      if (agentResult.isDuplicate) {
        setResult({
          isDuplicate: true,
          matchedId: agentResult.matchedId,
          agentTrace: agentResult.trace,
          toolResults: agentResult.toolResults,
        });
        setLoading(false);
        return;
      }

      // Build ticket from agent tool results
      const classification = agentResult.toolResults?.classify_ticket || {};
      const severity = agentResult.toolResults?.assess_severity || {};
      const officer = SECTOR_OFFICER_MAP[form.location] || SECTOR_OFFICER_MAP.default;

      const ticketBase = {
        ticketId: `GN-${Math.floor(100000 + Math.random() * 900000)}`,
        citizenName: form.name,
        category: classification.category || form.category,
        subcategory: form.subcategory,
        description: form.description,
        location: form.location,
        date: new Date().toISOString().slice(0, 10),
        filedAt: new Date().toISOString(),
        status: 'AI Classified',
        priority: severity.priority || 'Medium',
        duplicateCount: 1,
        assignedOfficerName: officer.name,
        assignedOfficerId: officer.id,
        isDuplicate: false,
        department: classification.department || 'PWD',
        agentTrace: agentResult.trace,
        agentSummary: agentResult.finalText,
        classificationConfidence: classification.confidence,
        classificationReasoning: classification.reasoning,
        severityJustification: severity.justification,
        estimatedResolutionDays: severity.estimatedResolutionDays,
        mediaEvidence: form.mediaFiles.map(media => ({
          id: media.id,
          name: media.name,
          mimeType: media.mimeType,
          size: media.size,
          previewUrl: media.previewUrl,
          url: media.url,
          uploadedAt: media.uploadedAt,
          source: media.source || 'citizen-upload',
        })),
      };
      setTickets(prev => [ticketBase, ...prev]);
      try {
        await saveTicketToSupabase(ticketBase);
      } catch(err) {
        console.error("Failed to save to Supabase", err);
      }
      setResult(ticketBase);
      setSelectedTicket(ticketBase.ticketId);
    } catch (error) {
      setErrorCard(error.message || t('citizen.aiCategorizationFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="view-stage mx-auto max-w-[960px]">
        <PageHeader
          title={t('citizen.file')}
          subtitle={t('citizen.classifying')}
        />
        <div className="flex flex-col items-center justify-center py-12">
           {agentTrace.length > 0 ? (
             <AgentTrace trace={agentTrace} mode="live" />
           ) : (
             <div className="flex flex-col items-center gap-6">
               <div className="relative">
                 <div className="h-20 w-20 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
                 <RefreshCw className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-[var(--primary)]" />
               </div>
               <p className="animate-pulse text-[15px] font-bold text-slate-400">
                 Initializing AI Agent...
               </p>
             </div>
           )}
        </div>
      </div>
    );
  }

  if (result) {
    // Handle duplicate result
    if (result.isDuplicate) {
      return (
        <div className="view-stage mx-auto max-w-[800px] mb-20">
          <div className="mb-8">
            <h1 className="mb-2 text-[32px] font-bold tracking-tight text-[#1e293b]">Duplicate Detected</h1>
            <p className="text-[15px] font-medium text-slate-500">Our AI agent identified this as an existing report.</p>
          </div>
          <div className="space-y-6">
            <div className="rounded-[16px] border-2 border-amber-200 bg-amber-50 p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg">
                  <Search className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[18px] font-black text-amber-900">Matched to Existing Ticket</p>
                  <p className="mt-1 text-[15px] font-bold text-amber-700">
                    Your complaint has been merged with <span className="font-black">{result.matchedId || 'an existing ticket'}</span>.
                    This helps us prioritize faster by combining duplicate reports.
                  </p>
                  {result.toolResults?.find_duplicate?.confidence && (
                    <p className="mt-3 text-[13px] font-bold text-amber-600">
                      Match confidence: {result.toolResults.find_duplicate.confidence}%
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Agent trace for the duplicate check */}
            {result.agentTrace && <AgentTrace trace={result.agentTrace} mode="compact" />}

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button type="button"
                className="flex h-[46px] items-center justify-center gap-2 rounded-md bg-[#ff9933] px-8 text-[14px] font-bold text-white transition-all hover:bg-[#e68a2e] shadow-sm"
                onClick={() => onTrackTicket(result.matchedId || '')}
              >
                Track Original Ticket <ChevronRight className="h-4 w-4" />
              </button>
              <button
                className="flex h-[46px] items-center justify-center rounded-md border border-slate-300 bg-white px-8 text-[14px] font-bold text-slate-700 transition-all hover:bg-slate-50 shadow-sm"
                onClick={resetFlow}
              >
                {t('citizen.fileAnother')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Normal ticket result
    return (
      <div className="view-stage mx-auto max-w-[800px] mb-20">
        <div className="mb-8">
          <h1 className="mb-2 text-[32px] font-bold tracking-tight text-[#1e293b]">{t('citizen.submitted')}</h1>
          <p className="text-[15px] font-medium text-slate-500">{t('citizen.submittedSub')}</p>
        </div>

        <div className="space-y-6">
          {/* Reference card */}
          <div className="rounded-[12px] bg-[#2a5298] px-8 py-6 text-white shadow-sm flex items-center justify-between">
            <div>
              <p className="mb-2 text-[11px] font-black uppercase tracking-[2px] text-white/60">{t('citizen.referenceNumber')}</p>
              <div className="flex items-center gap-3">
                <span className="text-[28px] font-bold tracking-tight">{result.ticketId}</span>
                <button type="button" 
                  className="hover:opacity-70 transition-opacity"
                  onClick={() => navigator.clipboard.writeText(result.ticketId)}
                  title={t('citizen.copyReference')}
                >
                  <Copy className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div>
              <span className="inline-flex rounded bg-white px-3 py-1 text-[11px] font-black uppercase text-[#2a5298]">
                {translatePriority(t, i18n, result.priority || 'High')}
              </span>
            </div>
          </div>

          {/* AI Classification Reasoning */}
          {(result.classificationReasoning || result.severityJustification) && (
            <div className="rounded-[12px] border border-indigo-100 bg-indigo-50/50 p-6">
              <p className="mb-3 text-[11px] font-black uppercase tracking-[1.5px] text-indigo-400">AI Agent Reasoning</p>
              {result.classificationReasoning && (
                <p className="text-[14px] font-medium text-indigo-800 mb-2">
                  <span className="font-black">Classification:</span> {result.classificationReasoning}
                </p>
              )}
              {result.severityJustification && (
                <p className="text-[14px] font-medium text-indigo-800">
                  <span className="font-black">Priority:</span> {result.severityJustification}
                </p>
              )}
              {result.estimatedResolutionDays && (
                <p className="mt-2 text-[13px] font-bold text-indigo-600">
                  Estimated resolution: {result.estimatedResolutionDays} days
                </p>
              )}
            </div>
          )}

          {/* Officers/Department grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[12px] bg-[#f8fafc] p-6">
              <p className="mb-3 text-[11px] font-black uppercase tracking-[1.5px] text-slate-400">{t('citizen.assignedOfficer')}</p>
              <p className="text-[15px] font-bold text-slate-800">
                {result.assignedOfficerName} ({result.assignedOfficerId})
              </p>
            </div>
            <div className="rounded-[12px] bg-[#f8fafc] p-6">
              <p className="mb-3 text-[11px] font-black uppercase tracking-[1.5px] text-slate-400">{t('citizen.department')}</p>
              <div>
                <span className="inline-flex items-center rounded-full bg-[#e2e8f0] px-4 py-1.5 text-[12px] font-bold text-slate-700">
                  {translateDepartment(t, i18n, result.department || 'PWD')}
                </span>
              </div>
            </div>
          </div>

          {/* Agent Trace (expandable) */}
          {result.agentTrace && <AgentTrace trace={result.agentTrace} mode="compact" />}

          {/* What happens next */}
          <div className="rounded-[12px] border border-slate-200 bg-white p-8">
            <h3 className="mb-5 text-[15px] font-bold text-slate-900">{t('citizen.whatNext')}</h3>
            <div className="space-y-4 text-[14px] font-medium text-slate-600">
              <p>1. {t('citizen.step1Desc')}</p>
              <p>2. {t('citizen.step2Desc')}</p>
              <p>3. {t('citizen.step3Desc')}</p>
            </div>
          </div>

          {/* Alert */}
          {result.priority?.toLowerCase() === 'critical' || result.priority?.toLowerCase() === 'high' ? (
            <div className="rounded-[8px] border border-red-100 bg-red-50 p-5">
              <p className="text-[14px] font-medium text-red-600">
                {t('citizen.predictiveSignal')}
              </p>
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button type="button" 
              className="flex h-[46px] items-center justify-center gap-2 rounded-md bg-[#ff9933] px-8 text-[14px] font-bold text-white transition-all hover:bg-[#e68a2e] shadow-sm"
              onClick={() => onTrackTicket(result.ticketId)}
            >
              {t('citizen.track')} <ChevronRight className="h-4 w-4" />
            </button>
            <button
              className="flex h-[46px] items-center justify-center rounded-md border border-slate-300 bg-white px-8 text-[14px] font-bold text-slate-700 transition-all hover:bg-slate-50 shadow-sm"
              onClick={resetFlow}
            >
              {t('citizen.fileAnother')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="view-stage mx-auto max-w-[980px]">
      {showARScanner && (
        <ARScanner 
          onClose={() => setShowARScanner(false)}
          onScanComplete={(data) => {
            setShowARScanner(false);
            setForm(curr => ({
              ...curr,
              category: data.category || curr.category,
              subcategory: data.subcategory || curr.subcategory,
              priority: data.priority || curr.priority,
              description: data.description || '',
              aiGeneratedData: true
            }));
            if (data.photoDataUrl) {
              setForm(curr => ({
                ...curr,
                mediaFiles: [
                  {
                    id: `ai-scan-${Date.now()}`,
                    name: 'ai-scan-evidence.jpg',
                    mimeType: 'image/jpeg',
                    size: 0,
                    previewUrl: data.photoDataUrl,
                    url: data.photoDataUrl,
                    uploadedAt: new Date().toISOString(),
                    source: 'ai-scan',
                  },
                ],
              }));
            }
            setErrors({});
            setStep(2);
          }}
        />
      )}
      <PageHeader title={t('citizen.file')} subtitle={t('citizen.fileSub')} />
      {errorCard ? <ErrorCard message={errorCard} title={t('citizen.submitErrorTitle')} /> : null}
      <ErrorSummary errors={errors} />

      <div className="mb-10 flex items-center gap-4">
        {[1, 2, 3].map((stage, index) => (
          <React.Fragment key={stage}>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full text-[15px] font-black transition-all ${
                step >= stage
                  ? 'bg-[var(--primary)] text-white shadow-lg'
                  : 'border-2 border-slate-200 bg-white text-slate-300'
              }`}
            >
              {stage}
            </div>
            {index < 2 ? (
              <div
                className={`h-[2px] flex-1 rounded-full transition-colors ${
                  step > stage ? 'bg-[var(--primary)]' : 'bg-slate-200'
                }`}
              />
            ) : null}
          </React.Fragment>
        ))}
      </div>

      <div className="app-card overflow-hidden rounded-[32px] p-0 border border-slate-200 bg-white shadow-xl">
        {step === 1 ? (
          <div className="p-8">
            <h3 className="text-[20px] font-black tracking-tight text-slate-900 mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[var(--primary)]" />
              {t('citizen.howToReport', { defaultValue: 'How would you like to report?' })}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
              {/* Option 1: AR Scanner */}
              <button type="button"  
                onClick={() => setShowARScanner(true)}
                className="group relative overflow-hidden p-6 rounded-[24px] border-2 border-transparent bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-400 hover:shadow-lg transition-all text-left flex flex-col items-start"
              >
                <div className="absolute right-2 top-2 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Camera className="w-16 h-16" />
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                   <Camera className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-bold text-slate-900 text-[16px] mb-2 leading-tight">{t('citizen.smartVisualScan')}</h4>
                <p className="text-[13px] font-medium text-slate-500 leading-relaxed">{t('citizen.smartVisualScanDesc')}</p>
                <span className="mt-4 text-[11px] font-black uppercase text-blue-600 tracking-[1px] bg-blue-100/50 px-2 py-1 rounded">{t('citizen.fastest')}</span>
              </button>

              {/* Option 2: Voice */}
              <button type="button"  
                onClick={() => setIntakeMode('voice')}
                className={`group relative overflow-hidden p-6 rounded-[24px] border-2 transition-all text-left flex flex-col items-start ${intakeMode === 'voice' ? 'border-purple-400 bg-purple-50 hover:shadow-lg' : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'}`}
              >
                <div className="absolute right-2 top-2 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Mic className="w-16 h-16" />
                </div>
                <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-4 transition-transform ${intakeMode === 'voice' ? 'bg-purple-200 text-purple-700' : 'bg-slate-100 text-slate-500 group-hover:scale-110'}`}>
                   <Mic className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-[16px] mb-2 leading-tight">{t('citizen.voiceAssistant')}</h4>
                <p className="text-[13px] font-medium text-slate-500 leading-relaxed">{t('citizen.voiceAssistantDesc')}</p>
              </button>

              {/* Option 3: Manual */}
              <button type="button"  
                onClick={() => setIntakeMode('manual')}
                className={`group relative overflow-hidden p-6 rounded-[24px] border-2 transition-all text-left flex flex-col items-start ${intakeMode === 'manual' ? 'border-amber-400 bg-amber-50 hover:shadow-lg' : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'}`}
              >
                <div className="absolute right-2 top-2 opacity-10 group-hover:opacity-20 transition-opacity">
                   <FileText className="w-16 h-16" />
                </div>
                <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-4 transition-transform ${intakeMode === 'manual' ? 'bg-amber-200 text-amber-700' : 'bg-slate-100 text-slate-500 group-hover:scale-110'}`}>
                   <FileText className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-[16px] mb-2 leading-tight">{t('citizen.manualEntry')}</h4>
                <p className="text-[13px] font-medium text-slate-500 leading-relaxed">{t('citizen.manualEntryDesc')}</p>
              </button>
            </div>

            {intakeMode === 'voice' && (
              <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <AIVoiceAssistant form={form} setForm={setForm} setErrors={setErrors} />
              </div>
            )}

            {intakeMode === 'manual' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="mb-6 text-[18px] font-black tracking-tight text-slate-900">
                  {t('citizen.selectCategory')}
                </h3>
                <div className="grid gap-4 md:grid-cols-3" id={FIELD_IDS.category} tabIndex={-1}>
                  {CATEGORIES.map(category => {
                    const meta = CATEGORY_META[category] || CATEGORY_META.Other;
                    const isSelected = form.category === category;
                    const Icon = meta.Icon;

                    return (
                      <button type="button" 
                        key={category}
                        className={`group relative flex flex-col items-center overflow-hidden rounded-2xl border-2 p-6 transition-all ${
                          isSelected
                            ? 'border-[var(--primary)] bg-blue-50/50 shadow-md scale-[1.02]'
                            : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                        onClick={() => {
                          setForm(current => ({ ...current, category, subcategory: '' }));
                          setErrors(current => ({ ...current, category: undefined }));
                        }}
                        
                      >
                        <div
                          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[18px] shadow-sm transition-transform group-hover:scale-110"
                          style={{ background: meta.circle, color: meta.color }}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="text-[13px] font-bold text-slate-900">{translateCategory(t, i18n, category)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {(intakeMode === 'manual' || intakeMode === 'voice') && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <label className="field-label" htmlFor={FIELD_IDS.subcategory}>
                  {t('citizen.subcategory')}
                </label>
                <div className="relative">
                   <select
                     className="field-select h-[56px] appearance-none"
                     id={FIELD_IDS.subcategory}
                     onChange={event => {
                       const selectedSubcategory = event.target.value;
                       setForm(current => {
                         const inferredCategory =
                           current.category ||
                           Object.keys(SUBCATEGORIES).find(category =>
                             (SUBCATEGORIES[category] || []).includes(selectedSubcategory)
                           ) ||
                           '';

                         return {
                           ...current,
                           category: inferredCategory || current.category,
                           subcategory: selectedSubcategory,
                         };
                       });
                       setErrors(current => ({ ...current, subcategory: undefined, category: undefined }));
                     }}
                     value={form.subcategory}
                   >
                     <option value="">{t('subcategory.Select subcategory...')}</option>
                     {availableSubcategories.map(subcategory => (
                       <option key={subcategory} value={subcategory}>
                         {translateSubcategory(t, i18n, subcategory)}
                       </option>
                     ))}
                   </select>
                   <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            )}

            <div className="mt-10 flex justify-end">
              <button type="button" className="button-secondary h-[56px] px-10" onClick={nextFromStep1} >
                {t('citizen.next')}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
        
        {step === 2 && (
          <div className="p-8 space-y-8">
            {form.aiGeneratedData && (
              <div className="rounded-[12px] bg-blue-50 border border-blue-200 p-5 flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 text-[14px]">{t('citizen.aiPrefixAuto')}</h4>
                  <p className="mt-1 text-[14px] text-slate-600">{t('citizen.aiScanExplainer')}</p>
                </div>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="field-label !mb-0" htmlFor={FIELD_IDS.description}>
                  {t('citizen.description')}
                </label>
                <button type="button" 
                   
                  onClick={toggleDictation}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all ${isDictating ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {isDictating ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  {isDictating ? t('citizen.dictating') : t('citizen.speakText')}
                </button>
              </div>
              <textarea
                className="field-textarea min-h-[160px] p-5 text-[15px] leading-relaxed"
                id={FIELD_IDS.description}
                onChange={event => {
                  setForm(current => ({ ...current, description: event.target.value }));
                  setErrors(current => ({ ...current, description: undefined }));
                }}
                placeholder={t('citizen.complaintDesc')}
                value={form.description}
              />
            </div>

            <div>
              <label className="field-label" htmlFor={FIELD_IDS.location}>
                {t('citizen.location')}
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <select
                  className="field-select h-[56px] !pl-12 appearance-none"
                  id={FIELD_IDS.location}
                  onChange={event => {
                    setForm(current => ({ ...current, location: event.target.value }));
                    setErrors(current => ({ ...current, location: undefined }));
                  }}
                  value={form.location}
                >
                  <option value="">{t('citizen.selectSector')}</option>
                  {SECTORS.map(sector => (
                    <option key={sector} value={sector}>
                      {translateSectorName(i18n, sector)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="pt-2">
              <label className="field-label" htmlFor={FIELD_IDS.media}>
                {t('citizen.mediaEvidenceTitle')}
                <p className="font-medium text-slate-500 text-[12px] normal-case tracking-normal mt-1">
                  {t('citizen.mediaEvidenceDesc')}
                </p>
              </label>
              <MediaUploader 
                id={FIELD_IDS.media} 
                files={form.mediaFiles} 
                onChange={files => {
                  setForm(current => ({ ...current, mediaFiles: files }));
                  if (files.length > 0) setErrors(current => ({ ...current, media: undefined }));
                }}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button"  className="button-surface h-[56px] px-8" onClick={() => setStep(1)} >
                {t('citizen.back')}
              </button>
              <button type="button" className="button-secondary h-[56px] flex-1" onClick={nextFromStep2} >
                {t('citizen.next')}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-8 space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="group">
                <label className="field-label opacity-60">{t('citizen.name')}</label>
                <div className="h-[56px] flex items-center rounded-xl bg-slate-50 border border-slate-100 px-5 font-bold text-slate-900">{form.name}</div>
              </div>
              <div>
                <label className="field-label opacity-60">{t('citizen.email')}</label>
                <div className="h-[56px] flex items-center rounded-xl bg-slate-50 border border-slate-100 px-5 font-bold text-slate-900">{form.email}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 space-y-4">
               <div className="flex items-center gap-2 mb-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  <p className="text-[11px] font-black uppercase tracking-[2px] text-blue-600">{t('citizen.reviewSummary')}</p>
               </div>
               <div className="grid gap-4">
                  <div className="flex justify-between items-start gap-4">
                     <span className="text-[13px] font-bold text-slate-400 shrink-0">{t('citizen.topic')}:</span>
                     <span className="text-[14px] font-bold text-slate-900 text-right">{translateCategory(t, i18n, form.category)} - {translateSubcategory(t, i18n, form.subcategory)}</span>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                     <span className="text-[13px] font-bold text-slate-400 shrink-0">{t('citizen.location')}:</span>
                     <span className="text-[14px] font-bold text-slate-900 text-right">{translateSectorName(i18n, form.location)}</span>
                  </div>
               </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button"  className="button-surface h-[56px] px-8" onClick={() => setStep(2)} >
                {t('citizen.back')}
              </button>
              <button type="button" className="button-primary h-[56px] flex-1" onClick={submitComplaint} >
                {t('citizen.submit')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


export default FileComplaint;
