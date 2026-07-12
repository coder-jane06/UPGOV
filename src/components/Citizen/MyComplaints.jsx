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

function MyComplaints({ tickets, onViewTrack }) {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('All');
  const [sortParam, setSortParam] = useState('Newest');

  const STATUS_ORDER = { Filed: 1, 'AI Classified': 2, Assigned: 3, 'Verified On-Site': 4, 'In Progress': 5, Resolved: 6, Feedback: 7 };
  const stepIcons = [FileText, Brain, UserCheck, ClipboardCheck, Wrench, CheckCircle2, Star];

  const filteredTickets = useMemo(() => {
    let result = tickets;
    if (filter === 'Active') {
      result = tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Feedback' && t.status !== 'समाधान');
    } else if (filter === 'Resolved') {
      result = tickets.filter(t => t.status === 'Resolved' || t.status === 'Feedback' || t.status === 'समाधान');
    }
    
    if (sortParam === 'Oldest') {
      result = [...result].sort((a, b) => new Date(a.filedAt || a.date).getTime() - new Date(b.filedAt || b.date).getTime());
    } else if (sortParam === 'Newest') {
      result = [...result].sort((a, b) => new Date(b.filedAt || b.date).getTime() - new Date(a.filedAt || a.date).getTime());
    } else if (sortParam === 'Priority') {
      const pLevel = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      result = [...result].sort((a, b) => (pLevel[b.priority] || 0) - (pLevel[a.priority] || 0));
    }
    return result;
  }, [tickets, filter, sortParam]);

  return (
    <div className="view-stage">
      <PageHeader title={t('citizen.myComplaints')} subtitle={t('citizen.viewAllFiled')} />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 rounded-2xl bg-white p-1.5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-200">
          {['All', 'Active', 'Resolved'].map(tab => (
            <button type="button" 
              key={tab}
              onClick={() => { setFilter(tab); setExpanded(null); }}
              className={`px-5 py-2.5 text-[13px] font-bold rounded-xl transition-all ${filter === tab ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              {t(`citizen.filters.${tab.toLowerCase()}`)}
            </button>
          ))}
        </div>
        <div className="relative">
          <select
            value={sortParam}
            onChange={(e) => { setSortParam(e.target.value); setExpanded(null); }}
            className="h-11 appearance-none rounded-xl border border-slate-200 bg-white px-5 pr-10 text-[13px] font-bold text-slate-700 shadow-sm outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 cursor-pointer hover:border-slate-300"
          >
            <option value="Newest">{t('citizen.sort.newest')}</option>
            <option value="Oldest">{t('citizen.sort.oldest')}</option>
            <option value="Priority">{t('citizen.sort.priority')}</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="rounded-[32px] border-2 border-dashed border-slate-200 bg-white px-10 py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
            <ClipboardList className="h-8 w-8 text-slate-300" />
          </div>
          <p className="text-[15px] font-bold text-slate-400">{t('citizen.noComplaintsView')}</p>
        </div>
      ) : (
        <motion.div layout className="space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredTickets.map(ticket => {
              const isOpen = expanded === ticket.ticketId;
              const currentStep = STATUS_ORDER[ticket.status] || 1;
              const sla = getCountdown(ticket, t);
              const meta = CATEGORY_META[ticket.category] || CATEGORY_META.Other;
              const Icon = meta.Icon;

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
                  key={ticket.ticketId} 
                  className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-0.5"
                >
                  {/* Card Header */}
                  <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center cursor-pointer group" onClick={() => setExpanded(isOpen ? null : ticket.ticketId)}>
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] shadow-sm transition-transform group-hover:scale-105" style={{ background: meta.circle, color: meta.color }}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-1.5">
                        <span className="text-[18px] font-black tracking-tight text-[var(--primary)]">{ticket.ticketId}</span>
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-slate-500">
                        <span className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5 opacity-50" /> {translateCategory(t, i18n, ticket.category)}</span>
                        <span className="text-slate-300 hidden sm:inline">•</span>
                        <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 opacity-50" /> {translateSectorName(i18n, ticket.location)}</span>
                        <span className="text-slate-300 hidden sm:inline">•</span>
                        <span>{ticket.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:gap-4 mt-4 sm:mt-0">
                      {/* SLA indicator */}
                      <div className="text-left sm:text-right">
                        <div className={`text-[11px] font-black uppercase tracking-[1px] ${sla.breached ? 'text-red-600' : sla.progress > 80 ? 'text-amber-600' : 'text-green-600'}`}>
                          {sla.label}
                        </div>
                        <div className="mt-1.5 h-1.5 w-32 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                          <div className={`h-full transition-all duration-1000 ${sla.breached ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : sla.progress > 80 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-green-500'}`} style={{ width: `${Math.min(sla.progress, 100)}%` }} />
                        </div>
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors group-hover:bg-slate-100 group-hover:text-slate-600">
                        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded: Resolution Timeline */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100 bg-slate-50/50"
                      >
                       <div className="p-6 sm:p-8">
                        <div className="grid gap-8 lg:grid-cols-[1fr_0.6fr]">
                          {/* Timeline */}
                          <div>
                            <h4 className="mb-6 text-[13px] font-black uppercase tracking-[2px] text-slate-400">{t('citizen.timeline')}</h4>
                            <div className="space-y-1">
                              {TRACK_STEPS.map((step, index) => {
                                const StepIcon = stepIcons[index] || CheckCircle2;
                                const isDone = index < currentStep;
                                const isActive = index === currentStep - 1;

                                return (
                                  <div key={step.label} className="flex items-start gap-4 group/step">
                                    <div className="flex flex-col items-center">
                                      <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500 ${isDone ? 'bg-[var(--primary)] text-white shadow-md shadow-blue-900/20' : 'border-2 border-slate-200 bg-white text-slate-300'}`}>
                                        <StepIcon className="h-4 w-4" />
                                        {isActive && <span className="absolute inset-[-4px] rounded-full border-2 border-[var(--primary)] opacity-40 animate-ping" style={{ position: 'absolute' }} />}
                                      </div>
                                      {index < TRACK_STEPS.length - 1 && (
                                        <div className={`mt-1 h-8 w-[2px] rounded-full transition-colors duration-500 ${isDone ? 'bg-[var(--primary)]' : 'bg-slate-200'}`} />
                                      )}
                                    </div>
                                    <div className="pt-2">
                                      <p className={`text-[14px] font-black transition-colors ${isDone ? 'text-slate-900' : 'text-slate-300'}`}>{translateStatus(t, i18n, step.label)}</p>
                                      {isDone && <p className="text-[11px] font-bold text-slate-400 mt-0.5">{ticket.date}</p>}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Info Panel */}
                          <div className="space-y-4">
                            <div className="rounded-[24px] bg-white p-6 border border-slate-100 shadow-[0_2px_15px_-5px_rgba(0,0,0,0.05)]">
                              <p className="mb-4 text-[10px] font-black uppercase tracking-[2px] text-slate-400">{t('citizen.complaintDetails')}</p>
                              <div className="space-y-4 text-[13px]">
                                <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                                  <span className="font-bold text-slate-400">{t('citizen.category')}</span>
                                  <span className="font-black text-slate-900">{translateCategory(t, i18n, ticket.category)}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                                  <span className="font-bold text-slate-400">{t('citizen.locationLabel')}</span>
                                  <span className="font-black text-slate-900">{translateSectorName(i18n, ticket.location)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-slate-400">{t('citizen.filedOn')}</span>
                                  <span className="font-black text-slate-900">{ticket.date}</span>
                                </div>
                                {ticket.rating && (
                                  <div className="flex justify-between items-center pt-3 border-t border-slate-50 mt-1">
                                    <span className="font-bold text-slate-400">{t('citizen.yourRating')}</span>
                                    <div className="flex gap-0.5">
                                      {[1,2,3,4,5].map(s => (
                                        <Star key={s} className={`h-4 w-4 ${s <= ticket.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {ticket.status === 'Resolved' && (
                              <div className="rounded-[24px] bg-green-50 p-6 border border-green-100 shadow-sm relative overflow-hidden">
                                <div className="absolute right-0 top-0 opacity-[0.03] scale-150 -translate-y-4 translate-x-4"><CheckCircle2 className="h-32 w-32 text-green-600" /></div>
                                <div className="relative z-10">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="h-6 w-6 rounded-full bg-green-200 flex items-center justify-center"><CheckCircle2 className="h-4 w-4 text-green-700" /></div>
                                    <p className="text-[12px] font-black uppercase tracking-[1px] text-green-800">{t('public.resolved')}</p>
                                  </div>
                                  <p className="text-[13px] font-medium text-green-800/80 leading-relaxed">{t('citizen.resolvedMessage')}</p>
                                </div>
                              </div>
                            )}

                            <button type="button"  onClick={() => onViewTrack(ticket.ticketId)} className="button-secondary w-full h-[52px] text-[13px] mt-2 group shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                              <Eye className="h-4 w-4 transition-transform group-hover:scale-110" /> {t('citizen.viewFullTracking')}
                            </button>
                          </div>
                        </div>
                       </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}


export default MyComplaints;
