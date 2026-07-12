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

function MyHistory({ tickets }) {
  const { t, i18n } = useTranslation();

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' };
      case 'In Progress': return { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' };
      case 'Assigned': return { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' };
      case 'Filed': return { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' };
      case 'Verified':
      case 'Verified On-Site': return { bg: 'bg-teal-100', text: 'text-teal-700', dot: 'bg-teal-500' };
      default: return { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-blue-100 text-blue-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="view-stage mx-auto max-w-[1200px]">
      <PageHeader title={t('citizen.historyTitle')} subtitle={t('citizen.historySubtitle')} />
      <div className="space-y-4 md:hidden">
        {tickets.map(ticket => (
          <div key={ticket.ticketId} className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[2px] text-slate-400">{t('citizen.ticketId')}</p>
                <p className="mt-1 text-[17px] font-black tracking-tight text-[var(--primary)]">{ticket.ticketId}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[10px] font-black uppercase tracking-[2px] text-slate-400">{t('citizen.filedLabel')}</p>
                <p className="mt-1 text-[13px] font-medium text-slate-500">{ticket.date || 'N/A'}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-[13px]">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                <span className="text-[11px] font-black uppercase tracking-[1px] text-slate-400">{t('citizen.category')}</span>
                <span className="text-right font-medium text-slate-700">{translateCategory(t, i18n, ticket.category)}</span>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                <span className="text-[11px] font-black uppercase tracking-[1px] text-slate-400">{t('citizen.locationLabel')}</span>
                <span className="text-right font-medium text-slate-700">{translateSectorName(i18n, ticket.location || ticket.sector || 'N/A')}</span>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                <span className="text-[11px] font-black uppercase tracking-[1px] text-slate-400">{t('citizen.mergedLabel')}</span>
                <span className="text-right font-medium text-slate-700">
                  {ticket.duplicateCount ? t('citizen.mergedReports', { count: ticket.duplicateCount }) : t('citizen.originalReport')}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-[24px] border border-slate-100 bg-white shadow-xl md:block">
        <div className="overflow-x-auto w-full"><table className="min-w-[900px] w-full text-left whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-50 bg-slate-50/50">
              <th className="px-5 py-6 text-[11px] font-black uppercase tracking-[2px] text-slate-400 lg:px-8">{t('citizen.ticketId')}</th>
              <th className="px-5 py-6 text-[11px] font-black uppercase tracking-[2px] text-slate-400 lg:px-8">{t('citizen.date')}</th>
              <th className="px-5 py-6 text-[11px] font-black uppercase tracking-[2px] text-slate-400 lg:px-8">{t('citizen.category')}</th>
              <th className="px-5 py-6 text-[11px] font-black uppercase tracking-[2px] text-slate-400 lg:px-8">{t('citizen.locationLabel')}</th>
              <th className="px-5 py-6 text-[11px] font-black uppercase tracking-[2px] text-slate-400 lg:px-8">{t('citizen.status')}</th>
              <th className="px-5 py-6 text-[11px] font-black uppercase tracking-[2px] text-slate-400 lg:px-8">{t('citizen.priority')}</th>
              <th className="px-5 py-6 text-[11px] font-black uppercase tracking-[2px] text-slate-400 lg:px-8">{t('citizen.mergedLabel')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tickets.map(ticket => {
              const statusStyle = getStatusColor(ticket.status);
              return (
                <tr key={ticket.ticketId} className="transition-colors hover:bg-slate-50/50">
                  <td className="px-5 py-6 lg:px-8">
                    <span className="text-[14px] font-black tracking-tight text-slate-700">{ticket.ticketId}</span>
                  </td>
                  <td className="px-5 py-6 lg:px-8">
                    <span className="text-[13px] font-medium text-slate-500">{ticket.date}</span>
                  </td>
                  <td className="px-5 py-6 lg:px-8">
                    <span className="text-[13px] font-medium text-slate-500">{translateCategory(t, i18n, ticket.category)}</span>
                  </td>
                  <td className="px-5 py-6 lg:px-8">
                    <span className="text-[13px] font-medium text-slate-500">{translateSectorName(i18n, ticket.location || ticket.sector || 'N/A')}</span>
                  </td>
                  <td className="px-5 py-6 lg:px-8">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-black ${statusStyle.bg} ${statusStyle.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                      {translateStatus(t, i18n, ticket.status)}
                    </span>
                  </td>
                  <td className="px-5 py-6 lg:px-8">
                    <span className={`inline-flex rounded-md px-2.5 py-1 text-[10px] font-black uppercase tracking-[1px] ${getPriorityColor(ticket.priority)}`}>
                      {translatePriority(t, i18n, ticket.priority)}
                    </span>
                  </td>
                  <td className="px-5 py-6 lg:px-8">
                    <span className="text-[13px] font-medium text-slate-500">
                      {ticket.duplicateCount ? t('citizen.mergedReports', { count: ticket.duplicateCount }) : t('citizen.originalReport')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}


export default MyHistory;
