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

function ErrorSummary({ errors }) {
  const { t } = useTranslation();
  const summaryRef = useRef(null);
  const entries = Object.entries(errors).filter(([, message]) => Boolean(message));

  useEffect(() => {
    if (entries.length > 0) {
      summaryRef.current?.focus();
    }
  }, [entries.length]);

  if (entries.length === 0) return null;

  return (
    <div
      ref={summaryRef}
      aria-live="assertive"
      className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
      role="alert"
      tabIndex={-1}
    >
      <p className="mb-2 text-[11px] font-black uppercase tracking-[1px] text-red-700">{t('citizen.formErrors')}</p>
      <ul className="list-disc pl-5 space-y-1">
        {entries.map(([key, message]) => (
          <li key={key}>
            <button type="button" 
              className="text-left font-bold underline hover:no-underline"
              onClick={() => document.getElementById(FIELD_IDS[key])?.focus()}
              
            >
              {message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}


export default ErrorSummary;
