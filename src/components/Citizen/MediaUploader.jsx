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

function MediaUploader({ files, onChange, id }) {
  const { t } = useTranslation();
  const [isDrag, setIsDrag] = useState(false);
  const [uploads, setUploads] = useState(
    files.map(file => ({
      file: null,
      name: file.name,
      mediaRecord: file,
      progress: 100,
      status: 'uploaded',
    }))
  );
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Notify parent on change
    const finished = uploads
      .filter(upload => upload.status === 'uploaded' && upload.mediaRecord)
      .map(upload => upload.mediaRecord);
    if (JSON.stringify(finished) !== JSON.stringify(files)) {
      onChange(finished);
    }
  }, [files, onChange, uploads]);

  const triggerUpload = async (newFiles) => {
    const arr = Array.from(newFiles);
    if (arr.length === 0) return;
    
    // Check if total is more than 3
    if (uploads.length + arr.length > MAX_MEDIA_FILES) {
      alert(t('citizen.media.maxFiles') || "Maximum 3 files allowed.");
      return;
    }
    
    const newItems = arr.map(file => ({
      file,
      name: file.name,
      mediaRecord: null,
      progress: 10,
      status: 'uploading',
    }));
    setUploads(curr => [...curr, ...newItems]);

    for (const item of newItems) {
      try {
        const mediaRecord = await buildMediaRecord(item.file);
        setUploads(curr =>
          curr.map(upload =>
            upload.name === item.name && upload.status === 'uploading'
              ? { ...upload, mediaRecord, progress: 100, status: 'uploaded' }
              : upload
          )
        );
      } catch {
        setUploads(curr =>
          curr.map(upload =>
            upload.name === item.name && upload.status === 'uploading'
              ? { ...upload, progress: 100, status: 'error' }
              : upload
          )
        );
      }
    }
  };

  const removeUpload = (name) => {
    setUploads(curr => curr.filter(u => u.name !== name));
  };

  const active = uploads.filter(u => u.status === 'uploading');
  const finished = uploads.filter(u => u.status === 'uploaded');
  const errored = uploads.filter(u => u.status === 'error');

  return (
    <div id={id} tabIndex={-1} className="w-full flex flex-col items-center p-8 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none">
      <h4 className="text-[16px] font-black text-slate-800 mb-6 tracking-tight">{t('citizen.media.uploadTitle')}</h4>
      
      <div 
        className={`relative w-full border-2 border-dashed rounded-xl py-10 px-6 flex flex-col items-center justify-center transition-all duration-300 ${isDrag ? 'border-[#6366f1] bg-indigo-50/40 scale-[1.02]' : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-400'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDrag(false); }}
        onDrop={(e) => { e.preventDefault(); setIsDrag(false); triggerUpload(e.dataTransfer.files); }}
      >
        <div className="h-14 w-14 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-indigo-500 mb-4 transition-transform hover:scale-105">
           <UploadCloud className="h-6 w-6 stroke-[2.5]" />
        </div>
        <p className="text-[14px] font-bold tracking-tight text-slate-700 mb-2 group">
          {t('citizen.media.dragDrop')} <button type="button"  onClick={() => fileInputRef.current?.click()} className="text-indigo-600 underline decoration-indigo-200 underline-offset-4 hover:decoration-indigo-600 transition-colors">{t('citizen.media.browse')}</button>
          <input type="file" multiple className="hidden" ref={fileInputRef} onChange={e => triggerUpload(e.target.files)} />
        </p>
        <p className="text-[11px] font-bold uppercase tracking-[0.5px] text-slate-400">{t('citizen.media.formats')}</p>
      </div>

      {(active.length > 0 || finished.length > 0) && (
        <div className="w-full mt-6 space-y-6">
          {active.length > 0 && (
            <div>
              <p className="text-[11px] font-black uppercase text-slate-400 tracking-[1px] mb-3">{t('citizen.media.uploadingPrefix')}{active.length}{t('citizen.media.uploadingSuffix')}</p>
              <div className="space-y-3">
                {active.map(up => (
                  <div key={up.name} className="relative w-full h-[40px] bg-slate-100 rounded-lg overflow-hidden flex items-center px-4">
                    <div className="absolute top-0 left-0 h-full bg-indigo-500/10 transition-all duration-300 ease-out" style={{ width: `${up.progress}%` }} />
                    <span className="relative z-10 text-[12px] font-bold text-slate-700 truncate w-[85%]">{up.name}</span>
                    <button type="button"  onClick={() => removeUpload(up.name)} className="relative z-10 ml-auto w-[24px] h-[24px] flex items-center justify-center rounded-full shrink-0 text-slate-400 hover:text-red-500 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {finished.length > 0 && (
            <div>
              <p className="text-[11px] font-black uppercase text-slate-400 tracking-[1px] mb-3">{t('citizen.media.uploaded')}</p>
              <div className="space-y-3">
                {finished.map(up => (
                  <div key={up.name} className="flex justify-between items-center w-full min-h-[44px] px-4 border border-green-500 rounded-lg bg-green-50">
                    <span className="text-[12px] font-bold text-green-700 truncate w-[85%]">{up.name}</span>
                    <button type="button"  onClick={() => removeUpload(up.name)} className="text-red-400 hover:text-red-600 p-1 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {errored.length > 0 && (
            <div>
              <p className="text-[11px] font-black uppercase text-red-500 tracking-[1px] mb-3">{t('citizen.submitErrorTitle')}</p>
              <div className="space-y-3">
                {errored.map(up => (
                  <div key={up.name} className="flex justify-between items-center w-full min-h-[44px] px-4 border border-red-300 rounded-lg bg-red-50">
                    <span className="text-[12px] font-bold text-red-700 truncate w-[85%]">{up.name}</span>
                    <button type="button"  onClick={() => removeUpload(up.name)} className="text-red-500 hover:text-red-700 p-1 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <button type="button"  onClick={() => fileInputRef.current?.click()} className="mt-8 bg-[#003366] hover:bg-[#07569E] text-white font-bold text-[13px] tracking-wide h-[44px] px-8 rounded-lg w-full max-w-full shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0">
         {t('citizen.media.uploadBtn')}
      </button>
    </div>
  );
}


export default MediaUploader;
