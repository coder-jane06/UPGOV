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

function AIVoiceAssistant({ form, setForm, setErrors }) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [language, setLanguage] = useState('hi-IN');
  const [hasSupport, setHasSupport] = useState(true);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
           setText(prev => (prev ? prev + ' ' : '') + finalTranscript.trim());
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setHasSupport(false);
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.lang = language;
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert(t('citizen.voiceRecognitionUnsupported'));
      }
    }
  };

  const categorizeWithGroq = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);

    const applyLocalCategorization = () => {
      const inferred = inferCategoryFromText(text);
      setForm(curr => ({
        ...curr,
        category: inferred.category,
        subcategory: inferred.subcategory,
        description: text,
      }));
      setErrors(curr => ({ ...curr, category: undefined, subcategory: undefined, description: undefined }));

      const grid = document.getElementById('citizen-category-grid');
      if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    if (!GROQ_API_KEY) {
      applyLocalCategorization();
      setIsAnalyzing(false);
      return;
    }
    
    try {
      const systemPrompt = `You are an expert AI categorizer for a public grievance system in India.
Analyze the following citizen complaint and return ONLY a strict JSON object. Do not include markdown or explanations.
The complaint might be in English, Hindi, or a mix. Translate internally if needed.

Available Mapping:
${JSON.stringify(SUBCATEGORIES)}

Output Format Requirements:
{
  "category": "Exact match from keys above",
  "subcategory": "Exact match from arrays above"
}

Fallback to 'Other' and 'Other Complaint' ONLY if nothing else fits.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ],
          response_format: { type: "json_object" },
          temperature: 0.1
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        let resultJson = data.choices[0].message.content;
        resultJson = resultJson.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(resultJson);
        
        setForm(curr => ({ 
          ...curr, 
          category: parsed.category || 'Other', 
          subcategory: parsed.subcategory || 'Other Complaint', 
          description: text 
        }));
        setErrors(curr => ({ ...curr, category: undefined, subcategory: undefined, description: undefined }));
        
        const grid = document.getElementById('citizen-category-grid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (error) {
      console.error("Groq API Error:", error);
      applyLocalCategorization();
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!hasSupport) {
    return (
      <div className="mb-10 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-700 font-medium">
        {t('citizen.ai.notSupported')}
      </div>
    );
  }

  return (
    <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 p-[1px] shadow-2xl">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
      
      {/* Animated glowing orbs when listening */}
      {isListening && (
        <>
          <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-pink-500 blur-[80px] animate-pulse"></div>
          <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-blue-500 blur-[80px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </>
      )}

      <div className="relative h-full w-full rounded-2xl bg-slate-950/50 backdrop-blur-xl p-8 border border-white/10">
        <div className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all shadow-lg ${isListening ? 'bg-pink-500 animate-pulse text-white shadow-pink-500/50' : 'bg-gradient-to-tr from-purple-500 to-blue-500 text-white shadow-purple-500/30'}`}>
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-[18px] font-black text-white tracking-tight">{t('citizen.ai.title')}</h3>
              <p className="text-[13px] font-medium text-slate-300 mt-0.5">{t('citizen.ai.subtitle')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
               <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300 pointer-events-none" />
               <select 
                 value={language} 
                 onChange={(e) => setLanguage(e.target.value)}
                 className="appearance-none bg-white/10 border border-white/20 text-white text-[13px] rounded-lg pl-9 pr-8 py-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer hover:bg-white/20 transition-all font-bold"
               >
                 <option value="hi-IN" className="text-slate-900">{t('citizen.ai.languages.hi')}</option>
                 <option value="en-IN" className="text-slate-900">{t('citizen.ai.languages.en')}</option>
                 <option value="mr-IN" className="text-slate-900">{t('citizen.ai.languages.mr')}</option>
                 <option value="bn-IN" className="text-slate-900">{t('citizen.ai.languages.bn')}</option>
               </select>
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
            </div>
            
            <button type="button" 
              onClick={toggleListen}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-[13px] transition-all shadow-lg ${isListening ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-pink-500/40' : 'bg-white/10 hover:bg-white/20 border border-white/20 text-white'}`}
            >
              {isListening ? (
                <><MicOff className="h-4 w-4 animate-pulse" /> {t('citizen.ai.stopListen')}</>
              ) : (
                <><Mic className="h-4 w-4" /> {t('citizen.ai.tapSpeak')}</>
              )}
            </button>
          </div>
        </div>

        <div className="relative">
          <textarea
            className={`w-full min-h-[120px] rounded-xl border p-5 text-[15px] font-medium text-white transition-all resize-none outline-none focus:ring-2 ${isListening ? 'bg-pink-500/10 border-pink-500/50 focus:ring-pink-500/20' : 'bg-black/20 border-white/10 placeholder:text-slate-500 focus:bg-white/10 focus:border-purple-500/50 focus:ring-purple-500/20'}`}
            placeholder={isListening ? t('citizen.ai.listening') : t('citizen.ai.placeholder')}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isAnalyzing}
          />
        </div>

        <div className="mt-5 flex items-center justify-end">
          <button
            
            disabled={!text.trim() || isAnalyzing || isListening}
            onClick={categorizeWithGroq}
            className={`relative overflow-hidden rounded-lg px-8 py-3.5 text-[14px] font-bold text-white transition-all ${
              (!text.trim() || isAnalyzing || isListening)
                ? 'opacity-50 cursor-not-allowed bg-white/10' 
                : 'bg-gradient-to-r from-[#003366] to-[#07569E] hover:shadow-[0_0_20px_rgba(0,51,102,0.4)] hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20'
            }`}
          >
             {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                {t('citizen.ai.thinking')}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                {t('citizen.ai.categorizeBtn')}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


export default AIVoiceAssistant;
