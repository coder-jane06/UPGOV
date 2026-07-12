import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Brain,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  ClipboardList,
  Copy,
  Droplets,
  Eye,
  FileText,
  History,
  Leaf,
  Lightbulb,
  Map as MapIcon,
  MapPin,
  MessageCircle,
  Search,
  Send,
  RefreshCw,
  Star,
  Trash2,
  TrendingUp,
  UserCheck,
  Volume2,
  Wrench,
  Zap,
  ChevronDown,
  ChevronUp,
  UploadCloud,
  X,
  Mic,
  MicOff,
  Globe,
  Bot,
  Sparkles,
  Camera,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import ARScanner from './ARScanner.jsx';
import {
  DashboardShell,
  DepartmentBadge,
  ErrorCard,
  InlineSpinner,
  PageHeader,
  PriorityBadge,
  SectionSkeleton,
  StatusBadge,
} from './Shared.jsx';
import { callClaude, parseClaudeJson, runAgentLoop } from './ai.js';
import AgentTrace from './components/AgentTrace.jsx';
import { useTickets, saveTicketToSupabase } from './hooks/useTickets.js';
import {
  translateCategory,
  translateDepartment,
  translatePriority,
  translateSectorName,
  translateStatus,
  translateSubcategory,
} from './i18n/helpers.js';
import {
  CATEGORIES,
  MOCK_CITIZEN_COMPLAINTS,
  OFFICER_BY_SECTOR,
  SECTORS,
  SLA_WINDOWS,
  SUBCATEGORIES,
  TRACK_STEPS,
  getInitialTickets,
  saveTickets,
  HEATMAP_SECTORS,
  CARBON_DATA,
  CARBON_MONTHLY,
  DEPT_PERFORMANCE,
} from './data.js';

import { SIDEBAR_ITEMS } from './components/Citizen/sharedUtils.jsx';
import GreetingBanner from './components/Citizen/GreetingBanner.jsx';
import ErrorSummary from './components/Citizen/ErrorSummary.jsx';
import AIVoiceAssistant from './components/Citizen/AIVoiceAssistant.jsx';
import MediaUploader from './components/Citizen/MediaUploader.jsx';
import FileComplaint from './components/Citizen/FileComplaint.jsx';
import TrackComplaint from './components/Citizen/TrackComplaint.jsx';
import WhatsAppBot from './components/Citizen/WhatsAppBot.jsx';
import MyComplaints from './components/Citizen/MyComplaints.jsx';
import MyHistory from './components/Citizen/MyHistory.jsx';
import Heatmap from './components/Citizen/Heatmap.jsx';
import CarbonTracker from './components/Citizen/CarbonTracker.jsx';
export default function CitizenPortal({ page, onNavigate, onLogout, onPublicDash, onBack }) {
  const { tickets, loading, error, setTickets } = useTickets();
  const [selectedTicket, setSelectedTicket] = useState('');

  // Handle case where tickets might be empty initially
  useEffect(() => {
    if (tickets.length > 0 && !selectedTicket) {
      setSelectedTicket(tickets[0].ticketId);
    }
  }, [tickets, selectedTicket]);

  const currentPage = page === 'mycomplaints' ? 'history' : (page || 'history');

  const handleSelect = (id) => {
    if (id === 'public') {
      onPublicDash();
      return;
    }
    onNavigate(id);
  };

  const jumpToTrack = (ticketId) => {
    setSelectedTicket(ticketId);
    onNavigate('track');
  };

  let content = null;
  const isTicketId = /^(IND|GN)-\d{6}$/i.test(currentPage || '') || (currentPage?.length === 8 && /^\d+$/.test(currentPage));
  const isTrackView = currentPage === 'track' || isTicketId;

  if (currentPage === 'file') {
    content = (
      <FileComplaint
        onTrackTicket={handleSelect}
        setSelectedTicket={setSelectedTicket}
        setTickets={setTickets}
      />
    );
  } else if (isTrackView) {
    content = <TrackComplaint tickets={tickets} selectedTicket={isTicketId ? currentPage : null} />;
  } else if (currentPage === 'mycomplaints' || currentPage === 'history') {
    content = <MyHistory tickets={tickets} />;
  } else if (currentPage === 'heatmap') {
    content = <Heatmap />;
  } else if (currentPage === 'carbon') {
    content = <CarbonTracker />;
  }

  return (
    <DashboardShell
      activePage={currentPage}
      items={SIDEBAR_ITEMS}
      onLogout={onLogout}
      onPageChange={handleSelect}
      onBack={onBack}
      role="citizen"
      userName="Rahul Singh"
    >
      <div key={currentPage}>{content}</div>
    </DashboardShell>
  );
}
