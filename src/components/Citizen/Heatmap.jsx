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

function Heatmap() {
  const { t } = useTranslation();
  const [mapMode, setMapMode] = useState('density'); 
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = [
    { id: 'All', label: t('category.Other'), icon: <MapIcon className="h-4 w-4" /> },
    { id: 'Roads', label: t('category.Roads'), icon: <Wrench className="h-4 w-4" /> },
    { id: 'Water', label: t('category.Water'), icon: <Droplets className="h-4 w-4" /> },
    { id: 'Electricity', label: t('category.Electricity'), icon: <Zap className="h-4 w-4" /> },
    { id: 'Sanitation', label: t('category.Sanitation'), icon: <Trash2 className="h-4 w-4" /> },
  ];

  const filtered = useMemo(() => {
    if (activeFilter === 'All') return HEATMAP_SECTORS;
    return HEATMAP_SECTORS.filter(s => s.topType.includes(activeFilter));
  }, [activeFilter]);

  const MapLogic = () => {
    const map = useMap();
    useEffect(() => {
      map.flyTo([28.4744, 77.5040], 13);
    }, [map]);
    return null;
  };

  return (
    <div className="view-stage">
      <PageHeader title={t('admin.heatmapTitle')} subtitle={t('admin.heatmapDesc')} />
      
      <div className="mb-10 flex flex-wrap items-center justify-between gap-6">
        <div className="inline-flex gap-1.5 rounded-[24px] bg-[#eff4ff] p-2 shadow-inner">
           <button type="button" 
             onClick={() => setMapMode('density')}
             className={`px-8 py-3 text-[12px] font-black uppercase tracking-[1px] rounded-[18px] transition-all ${mapMode === 'density' ? 'bg-white shadow-lg text-[#003366] scale-[1.05]' : 'text-slate-400 hover:text-[#003366]'}`}
             
           >
             {t('admin.complaintDensity')}
           </button>
           <button type="button" 
             onClick={() => setMapMode('resolution')}
             className={`px-8 py-3 text-[12px] font-black uppercase tracking-[1px] rounded-[18px] transition-all ${mapMode === 'resolution' ? 'bg-white shadow-lg text-[#003366] scale-[1.05]' : 'text-slate-400 hover:text-[#003366]'}`}
             
           >
             {t('admin.resolutionEfficiency')}
           </button>
        </div>

        <div className="flex flex-wrap gap-2">
           {filters.map(f => (
              <button type="button" 
                 key={f.id}
                 onClick={() => setActiveFilter(f.id)}
                 className={`flex items-center gap-2 rounded-[18px] px-5 py-3 text-[12px] font-black transition-all ${activeFilter === f.id ? 'bg-[#003f77] text-white shadow-lg shadow-blue-900/20' : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'}`}
              >
                 {React.cloneElement(f.icon, { className: 'h-4 w-4' })}
                 {f.label || f.id}
              </button>
           ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[48px] border border-slate-100 bg-white shadow-2xl h-[400px] sm:h-[500px] lg:h-[640px]">
        <MapContainer center={[28.4744, 77.5040]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; UP-GOV Metropolitan Services"
          />
          <MapLogic />
          {filtered.map(sector => (
            <CircleMarker
              key={sector.name}
              center={[sector.lat, sector.lng]}
              radius={mapMode === 'density' ? 12 + (sector.complaints / 8) : 20}
              pathOptions={{
                fillColor: mapMode === 'density' 
                  ? (sector.complaints > 80 ? '#DC2626' : sector.complaints > 40 ? '#ea580c' : '#15803D')
                  : (sector.resolved > 90 ? '#15803D' : sector.resolved > 75 ? '#ea580c' : '#DC2626'),
                color: 'white',
                weight: 3,
                fillOpacity: 0.85
              }}
            >
              <Popup className="custom-popup">
                <div className="p-4 min-w-[200px]">
                  <h3 className="manrope text-[16px] font-black text-slate-900 mb-3 border-b border-slate-50 pb-2">{sector.name}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[12px] font-bold">
                      <span className="text-slate-400 uppercase tracking-[1px]">{t('admin.activeComplaints')}</span>
                      <span className="text-[#003f77] font-black text-[14px]">{sector.complaints}</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px] font-bold">
                      <span className="text-slate-400 uppercase tracking-[1px]">{t('public.sla')}</span>
                      <span className="text-green-600 font-black text-[14px]">{sector.resolved}%</span>
                    </div>
                    <div className="pt-3 border-t border-slate-50">
                      <p className="text-[10px] font-black uppercase tracking-[2px] text-slate-300 mb-1">Top Issue</p>
                      <p className="text-[13px] font-black text-[#ea580c]">{t(`category.${sector.topType}`) || sector.topType}</p>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
        
        <div className="absolute bottom-6 left-6 right-6 z-[400] rounded-[32px] border border-white/40 bg-white/80 p-6 shadow-2xl backdrop-blur-xl sm:bottom-10 sm:left-auto sm:right-10 sm:max-w-[260px]">
           <h4 className="mb-5 manrope text-[12px] font-black uppercase tracking-[3px] text-slate-400">{t('admin.legend')}</h4>
           <div className="space-y-4">
              {[
                { label: t('admin.critical'), color: 'bg-red-500' },
                { label: t('admin.moderate'), color: 'bg-[#ea580c]' },
                { label: t('admin.healthy'), color: 'bg-green-500' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                   <div className={`h-3.5 w-3.5 rounded-full ${item.color} shadow-sm`} />
                   <span className="manrope text-[13px] font-bold text-slate-600 tracking-tight">{item.label}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}


export default Heatmap;
