import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Brain,
  Building2,
  Download,
  FileBarChart,
  LayoutDashboard,
  Leaf,
  Map as MapIcon,
  Clock3 as Timer,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Search,
  Filter,
  Zap,
  Droplets,
  Wrench,
  Trash2,
  Volume2,
  Building,
  RefreshCw,
  Info,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  Grid3X3,
  Star,
  Users,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  Sparkles,
  Send
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { translateCategory, translatePriority, translateSectorName, translateStatus } from './i18n/helpers.js';
import {
  AnimatedNumber,
  DashboardShell,
  ErrorCard,
  InlineSpinner,
  KPICard,
  PageHeader,
  PriorityBadge,
  StatusBadge,
  SectionSkeleton,
  DepartmentBadge
} from './Shared.jsx';
import { callClaude, parseClaudeJson } from './ai.js';
import { runPredictiveAnalysis } from './predictiveAgent.js';
import {
  ACTIVITY_FEED,
  ACTIVITY_HEATMAP_DATA,
  ADMIN_COMPLAINT_CARDS,
  CARBON_DATA,
  CARBON_MONTHLY,
  CATEGORY_DISTRIBUTION,
  DEPT_PERFORMANCE,
  HEATMAP_SECTORS,
  MONTHLY_TREND,
  SLA_BREACH_TREND,
  SLA_TICKETS,
  getInitialTickets,
} from './data.js';

const SIDEBAR_ITEMS = [
  { id: 'overview', labelKey: 'admin.overview', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'complaints', labelKey: 'admin.complaintFeed', icon: <Grid3X3 className="h-4 w-4" /> },
  { id: 'departments', labelKey: 'admin.departments', icon: <Building2 className="h-4 w-4" /> },
  { id: 'sla', labelKey: 'admin.slaMonitor', icon: <Timer className="h-4 w-4" /> },
  { id: 'alerts', labelKey: 'admin.predictiveAlerts', icon: <Brain className="h-4 w-4" /> },
  { id: 'reports', labelKey: 'admin.reports', icon: <FileBarChart className="h-4 w-4" /> },
];

import LiveTicker from './components/Admin/LiveTicker.jsx';
import Overview from './components/Admin/Overview.jsx';
import PredictiveAlerts from './components/Admin/PredictiveAlerts.jsx';
import ComplaintCards from './components/Admin/ComplaintCards.jsx';
import Departments from './components/Admin/Departments.jsx';
import SLAMonitor from './components/Admin/SLAMonitor.jsx';
import ReportsView from './components/Admin/ReportsView.jsx';

export default function AdminDashboard({ onLogout, onNavigate, page, onBack, liveFeed = [] }) {
  const { t } = useTranslation();
  const VALID_PAGES = ['overview', 'alerts', 'complaints', 'departments', 'sla', 'reports'];
  const currentPage = VALID_PAGES.includes(page) ? page : 'overview';

  let content = null;
  if (currentPage === 'overview') content = <Overview onNavigate={onNavigate} liveFeed={liveFeed} />;
  else if (currentPage === 'alerts') content = <PredictiveAlerts />;
  else if (currentPage === 'complaints') content = <ComplaintCards />;
  else if (currentPage === 'departments') content = <Departments />;
  else if (currentPage === 'sla') content = <SLAMonitor />;
  else if (currentPage === 'reports') content = <ReportsView onExport={exportDepartmentReport} />;

  return (
    <DashboardShell
      activePage={currentPage}
      items={SIDEBAR_ITEMS}
      onLogout={onLogout}
      onPageChange={onNavigate}
      onBack={onBack}
      role="admin"
      userName="Admin"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </DashboardShell>
  );
}
