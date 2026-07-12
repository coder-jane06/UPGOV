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

function CarbonTracker() {
  const { t } = useTranslation();
  return (
    <div className="view-stage">
      <PageHeader title={t('admin.carbonTitle')} subtitle={t('admin.carbonDesc')} />
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="rounded-[40px] bg-white p-10 shadow-sm border border-slate-100 overflow-hidden group">
          <div className="mb-10 flex items-center justify-between">
             <h3 className="manrope text-[20px] font-black tracking-tight text-slate-900">{t('admin.highImpact')}</h3>
             <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-green-50 text-green-600">
                <Leaf className="h-5 w-5" />
             </div>
          </div>
          <div className="overflow-x-auto">
            <div className="overflow-x-auto w-full"><table className="w-full text-left">
              <thead>
                <tr className="bg-[#eff4ff] rounded-[20px]">
                  <th className="px-6 py-4 rounded-l-[20px] text-[11px] font-black uppercase tracking-[2px] text-[#003f77]">{t('admin.actions')}</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[2px] text-[#003f77]">{t('citizen.topic')}</th>
                  <th className="px-6 py-4 rounded-r-[20px] text-[11px] font-black uppercase tracking-[2px] text-[#003f77]">{t('admin.offset')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {CARBON_DATA.map(item => (
                  <tr key={item.ticketId} className="group/row hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-6 manrope text-[#003f77] text-[14px] font-black tracking-tight">{item.ticketId}</td>
                    <td className="px-6 py-6 text-[14px] font-bold text-slate-600">{item.issue}</td>
                    <td className="px-6 py-6">
                       <div className="flex items-center gap-2 font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100 w-fit">
                          <Leaf className="h-3.5 w-3.5" /> {item.carbonScore}kg
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
        </div>

        <div className="rounded-[40px] bg-white p-10 shadow-sm border border-slate-100 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:scale-110 transition-transform">
             <TrendingUp className="h-48 w-48 text-green-600" />
          </div>
          <h3 className="mb-10 manrope text-[20px] font-black tracking-tight text-slate-900">{t('admin.greenTrend')}</h3>
          <div className="h-[340px]">
             <ResponsiveContainer height="100%" width="100%">
               <BarChart data={CARBON_MONTHLY}>
                 <CartesianGrid stroke="#F8FAFC" strokeDasharray="0 0" vertical={false} />
                 <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: '800', fill: '#94A3B8' }} axisLine={false} tickLine={false} dy={10} />
                 <YAxis tick={{ fontSize: 11, fontWeight: '800', fill: '#94A3B8' }} axisLine={false} tickLine={false} dx={-10} />
                 <Tooltip 
                   cursor={{ fill: 'rgba(21, 128, 61, 0.03)' }} 
                   contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }} 
                 />
                 <Bar dataKey="actions" fill="#15803D" radius={[12, 12, 12, 12]} barSize={40} />
                 <Bar dataKey="co2" fill="#86EFAC" radius={[12, 12, 12, 12]} barSize={16} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}


export default CarbonTracker;
