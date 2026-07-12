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

function TrackComplaint({ tickets, selectedTicket }) {
  const { t, i18n } = useTranslation();
  const [ticketId, setTicketId] = useState(selectedTicket || '');
  const [rating, setRating] = useState(0);

  const tracking = useMemo(() => {
    const inputClean = ticketId.replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
    if (inputClean.length < 3) return null;
    
    // Find matching ticket by looking for digit intersection or complete inclusion
    const target = tickets.find(ticket => {
      const dbClean = ticket.ticketId.replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
      // If user typed 'gn284731' and db is 'ind284731', the numbers '284731' match.
      const inputNums = ticketId.replace(/[^0-9]/g, '');
      const dbNums = ticket.ticketId.replace(/[^0-9]/g, '');
      if (inputNums && inputNums.length >= 4 && dbNums.includes(inputNums)) return true;
      return dbClean.includes(inputClean);
    });

    if (!target) return null;

    const statusToStep = {
      Filed: 1,
      'AI Classified': 2,
      Assigned: 3,
      'Verified On-Site': 4,
      'In Progress': 5,
      Resolved: 6,
      Feedback: 7,
    };

    const step = statusToStep[target.status] || 2;
    const sla = getCountdown(target, t);
    return { ...target, currentStep: step, sla };
  }, [ticketId, tickets, t]);

  const icons = [FileText, Brain, UserCheck, ClipboardCheck, Wrench, CheckCircle2, Star];

  return (
    <div className="view-stage mx-auto max-w-[880px]">
      <PageHeader title={t('citizen.track')} subtitle={t('citizen.trackSubtitle')} />
      <div className="app-card rounded-[24px] p-6 lg:p-10 border border-slate-200 bg-white shadow-xl">
        <div className="mb-10 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
             <input
               className="h-[56px] w-full rounded-xl border border-slate-200 bg-white px-5 text-[15px] font-bold text-slate-700 shadow-sm outline-none transition-all focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 placeholder-slate-300"
               onChange={event => setTicketId(event.target.value)}
               placeholder={t('citizen.trackPlaceholder')}
               value={ticketId}
             />
          </div>
        </div>

        {tracking ? (
          <div>
            <div className="mb-10 border-b border-slate-100 pb-8">
              <p className="text-[11px] font-black uppercase tracking-[2px] text-slate-400 mb-1">{t('citizen.ticketLabel')}</p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="text-[36px] font-black tracking-tight text-[#1e293b]">
                  {tracking.ticketId}
                </div>
                <div className="flex items-center gap-3">
                  {tracking.category === 'Environmental/Green' && (
                    <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-[11px] font-black uppercase text-green-700">
                      <Leaf className="h-4 w-4" /> {t('citizen.ecoTracked')}
                    </span>
                  )}
                  <span className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.5px] text-blue-700">
                    {translatePriority(t, i18n, tracking.priority)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr]">
              <div className="space-y-6">
                {TRACK_STEPS.map((step, index) => {
                  const Icon = icons[index] || CheckCircle2;
                  const isDone = index < tracking.currentStep;
                  const isActive = index === tracking.currentStep - 1;

                  return (
                    <div key={step.label} className="flex items-start gap-6 group">
                      <div className="flex flex-col items-center">
                        <div
                          className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                            isDone
                              ? 'bg-[#1e3a8a] text-white shadow-lg shadow-blue-900/20'
                              : 'border-2 border-slate-100 bg-slate-50 text-slate-300'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {isActive && (
                            <span className="absolute inset-[-6px] rounded-full border-2 border-[#1e3a8a] opacity-40 animate-ping-slow" />
                          )}
                        </div>
                        {index < TRACK_STEPS.length - 1 && (
                          <div
                            className={`mt-2 h-16 w-[2px] rounded-full transition-colors ${
                              isDone ? 'bg-[#1e3a8a]' : 'bg-slate-100'
                            }`}
                          />
                        )}
                      </div>
                      <div className="pt-2">
                        <p className={`text-[15px] font-black ${isDone ? 'text-slate-900' : 'text-slate-300'}`}>
                          {translateStatus(t, i18n, step.label)}
                        </p>
                        <p className="text-[12px] font-bold text-slate-400 mt-0.5">{tracking.date} 10:00 AM</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-6">
                <div className="rounded-[20px] border border-slate-100 bg-slate-50 p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between text-[11px] font-black uppercase tracking-[1.5px]">
                    <span className="text-slate-500">{t('citizen.slaUsage')}</span>
                    <span
                      className={
                        tracking.sla.breached || tracking.sla.progress > 80
                          ? 'text-red-700 font-black normal-case'
                          : 'text-slate-600 font-bold normal-case'
                      }
                    >
                      {tracking.sla.label}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/80">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        tracking.sla.breached 
                          ? 'bg-red-600' 
                          : tracking.sla.progress > 80 ? 'bg-amber-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(tracking.sla.progress, 100)}%` }}
                    />
                  </div>
                </div>

                {tracking.currentStep >= 1 && (
                  <div className="rounded-[20px] bg-white p-6 border border-slate-100 shadow-sm">
                    <p className="mb-4 text-[14px] font-black tracking-tight text-slate-900">{t('citizen.ratePrompt')}</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(value => (
                        <button type="button" 
                          key={value}
                          className={`transition-all hover:scale-125 ${value <= rating ? 'text-[#1e3a8a]' : 'text-slate-200'}`}
                          onClick={() => setRating(value)}
                          
                        >
                          <Star className="h-8 w-8" fill={value <= rating ? 'currentColor' : 'none'} color="currentColor" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          null
        )}
      </div>
    </div>
  );
}


export default TrackComplaint;
