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

function WhatsAppBot() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: t('citizen.chatBot.greeting'),
      time: '09:00',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([
    {
      role: 'assistant',
      content: t('citizen.chatBot.greeting'),
    },
  ]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setInput('');

    const newHistory = [...history, { role: 'user', content: userMessage }];
    setMessages(prev => [...prev, { role: 'user', text: userMessage, time: now }]);
    setHistory(newHistory);
    setLoading(true);

    const systemPrompt = 'You are IndiaBot for UPGOV. Keep responses concise. Assist with filing complaint, tracking, and required details.';
    try {
      const reply = await callClaude(systemPrompt, userMessage, history);
      const replyTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { role: 'bot', text: reply, time: replyTime }]);
      setHistory(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: t('citizen.chatBot.error'), time: now }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-stage mx-auto max-w-[760px]">
      <PageHeader title={t('citizen.chat')} subtitle={t('citizen.chatBot.subtitle')} />
      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center gap-4 bg-[var(--primary)] px-8 py-5 text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 shadow-inner">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[16px] font-black tracking-tight">{t('citizen.chatBot.botName')}</p>
            <p className="text-[11px] font-bold uppercase tracking-[1px] text-white/60">{t('citizen.chatBot.botRole')}</p>
          </div>
        </div>

        <div className="scrollbar-hide h-[480px] overflow-y-auto bg-slate-50 px-6 py-8">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-[20px] px-5 py-4 text-[14px] leading-relaxed shadow-sm ${
                    message.role === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'border border-slate-100 bg-white text-slate-900 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  <p className={`mt-2 text-right text-[10px] font-bold ${message.role === 'user' ? 'text-white/40' : 'text-slate-400'}`}>
                    {message.time}
                  </p>
                </div>
              </div>
            ))}

            {loading ? (
              <div className="flex justify-start">
                <div className="rounded-[20px] border border-slate-100 bg-white px-5 py-4 shadow-sm">
                   <InlineSpinner />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-100 bg-white p-6">
          <input
            className="field-input h-[60px] flex-1 px-6 shadow-sm"
            onChange={event => setInput(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') sendMessage();
            }}
            placeholder={t('citizen.chatBot.placeholder')}
            value={input}
          />
          <button
            aria-label={t('citizen.chatBot.send')}
            className="button-primary h-[60px] w-[60px] rounded-full p-0 flex items-center justify-center"
            disabled={loading}
            onClick={sendMessage}
            
          >
            {loading ? <InlineSpinner /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}


export default WhatsAppBot;
