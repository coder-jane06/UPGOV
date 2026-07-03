import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Building2,
  ClipboardList,
  Droplets,
  Flag,
  Hammer,
  Leaf,
  Lightbulb,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Star,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  Volume2,
  Wrench,
  Zap,
  ChevronRight,
  X,
  Plus,
  ChevronDown,
  Search,
  CheckCircle2,
  Send,
  Camera,
  FileText,
  Copy,
  Clock,
  Sparkles,
  Brain,
  Info,
  BarChart3,
  MessageCircle
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTranslation } from 'react-i18next';
import {
  DashboardShell,
  KPICard,
  PageHeader,
  PriorityBadge,
  SectionSkeleton,
} from './Shared.jsx';
import AgentTrace from './components/AgentTrace.jsx';
import { callClaude } from './ai.js';
import { MOCK_OFFICER_TICKETS, SLA_WINDOWS, WEEKLY_RESOLUTION, getInitialTickets, saveTickets } from './data.js';
import { translateCategory, translatePriority, translateSectorName, translateStatus } from './i18n/helpers.js';

const SIDEBAR_ITEMS = [
  { id: 'assignments', labelKey: 'officer.assignments', icon: <ClipboardList className="h-4 w-4" /> },
  { id: 'verify', labelKey: 'officer.verification', icon: <ShieldCheck className="h-4 w-4" /> },
  { id: 'update', labelKey: 'officer.reports', icon: <RefreshCw className="h-4 w-4" /> },
  { id: 'performance', labelKey: 'public.avgResolution', icon: <TrendingUp className="h-4 w-4" /> },
];

const COLS = [
  { id: 'new', labelKey: 'status.New', color: '#003366' },
  { id: 'verified', labelKey: 'status.Verified', color: '#0D9488' },
  { id: 'inprogress', labelKey: 'status.In Progress', color: '#ff9933' },
  { id: 'resolved', labelKey: 'status.Resolved', color: '#15803D' },
];

const NEXT_STATUS = {
  new: 'verified',
  verified: 'inprogress',
  inprogress: 'resolved',
};

const NEXT_LABEL_KEY = {
  new: 'officer.moveToVerified',
  verified: 'officer.moveToInProgress',
  inprogress: 'officer.moveToResolved',
};

const CATEGORY_ICON = {
  'Roads & Potholes': Wrench,
  'Water Supply': Droplets,
  Electricity: Zap,
  Sanitation: Trash2,
  'Public Lighting': Lightbulb,
  Encroachment: Building2,
  'Environmental/Green': Leaf,
  'Noise Pollution': Volume2,
};

function getSlaRemaining(ticket, t) {
  const filedAt = ticket.filedAt || ticket.filed || new Date().toISOString();
  const start = new Date(filedAt).getTime();
  const days = SLA_WINDOWS[ticket.category] || SLA_WINDOWS.default;
  const end = start + days * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const remain = end - now;

  if (isNaN(remain) || remain <= 0) return { textKey: 'officer.slaBreached', danger: true, tone: '#DC2626' };
  const hours = Math.floor(remain / (1000 * 60 * 60));
  if (hours < 24) return { text: t('officer.slaRemainingHours', { count: hours }), danger: true, tone: '#ff9933' };
  if (hours >= 48) return { text: t('officer.slaRemainingDays', { count: Math.floor(hours / 24) }), danger: false, tone: '#15803D' };
  return { text: t('officer.slaRemainingShort', { days: Math.floor(hours / 24), hours: hours % 24 }), danger: false, tone: '#7C2D12' };
}

function ResourceModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const options = [
    { key: 'manpower', labelKey: 'officer.manpower', icon: <Users className="h-6 w-6" /> },
    { key: 'equipment', labelKey: 'officer.equipment', icon: <Hammer className="h-6 w-6" /> },
    { key: 'authority', labelKey: 'officer.authority', icon: <ShieldCheck className="h-6 w-6" /> },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
      <div className="w-full max-w-xl overflow-hidden rounded-[40px] bg-white shadow-2xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ea580c]/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

        <div className="flex items-center justify-between border-b border-slate-50 px-10 py-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-[#ea580c] flex items-center justify-center text-white shadow-lg shadow-orange-900/20">
              <Flag className="h-6 w-6" />
            </div>
            <div>
              <h3 className="manrope text-[20px] font-black text-slate-900">{t('officer.flagResource')}</h3>
              <p className="text-[13px] font-bold text-slate-400">{t('officer.requestUrgentSupport', { defaultValue: 'Request immediate operational support' })}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-10 relative z-10">
          <div className="mb-10 grid gap-6 sm:grid-cols-3">
            {options.map(option => (
              <button
                key={option.key}
                className={`group flex flex-col items-center rounded-[28px] border-2 p-6 transition-all ${type === option.key
                    ? 'border-[#ea580c] bg-[#ea580c]/5 shadow-sm'
                    : 'border-transparent bg-[#eff4ff] hover:bg-white hover:border-slate-200'
                  }`}
                onClick={() => setType(option.key)}
                
              >
                <div className={`mb-4 h-14 w-14 rounded-2xl flex items-center justify-center transition-all ${type === option.key ? 'bg-[#ea580c] text-white shadow-lg' : 'bg-white text-slate-400 group-hover:text-[#ea580c]'}`}>
                  {option.icon}
                </div>
                <span className={`manrope text-[11px] font-black uppercase tracking-[1.5px] transition-colors ${type === option.key ? 'text-[#ea580c]' : 'text-slate-500'}`}>{t(option.labelKey)}</span>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <label className="manrope text-[11px] font-black uppercase tracking-[2px] text-slate-400 ml-1">{t('officer.justification', { defaultValue: 'JUSTIFICATION/REMARK' })}</label>
            <textarea
              className="w-full rounded-[24px] border-2 border-slate-50 bg-[#f8fafc] p-6 text-[15px] font-medium text-slate-700 outline-none transition-all focus:bg-white focus:border-[#ea580c] focus:ring-4 focus:ring-[#ea580c]/5 min-h-[140px]"
              onChange={event => setDescription(event.target.value)}
              placeholder={t('officer.verificationPlaceholder')}
              value={description}
            />
          </div>

          <div className="mt-10 flex gap-4">
            <button type="button" className="h-[64px] flex-1 rounded-[20px] bg-white border border-slate-200 text-slate-600 font-black text-[16px] hover:bg-slate-50 transition-all active:scale-95" onClick={onClose} >
              {t('help.close')}
            </button>
            <button type="button" className="h-[64px] flex-1 rounded-[20px] bg-[#ea580c] text-white font-black text-[16px] hover:bg-[#c2410c] transition-all shadow-lg shadow-orange-900/20 active:scale-95 flex items-center justify-center gap-3" onClick={onClose} >
              <Send className="h-5 w-5" />
              {t('citizen.submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OfficerHeader({ tickets }) {
  const { t } = useTranslation();
  const stats = useMemo(() => {
    const active = tickets.filter(ticket => ticket.status !== 'resolved').length;
    const pendingVerification = tickets.filter(ticket => ticket.status === 'new').length;
    const overdue = tickets.filter(ticket => getSlaRemaining(ticket, t).danger).length;
    return { active, pendingVerification, overdue };
  }, [tickets, t]);

  return (
    <div className="mb-12 relative overflow-hidden rounded-[32px] bg-white p-10 border border-slate-100 shadow-sm">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#003f77]/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-8">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#003f77] px-4 py-1.5 text-[11px] font-black uppercase tracking-[2px] text-white shadow-sm shadow-blue-900/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t('officer.subtitle')}
          </div>
          <h1 className="manrope text-[40px] md:text-[52px] font-black tracking-tight text-slate-900 leading-none">{t('officer.greeting')}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2.5 text-[14px] font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-full">
              <MapPin className="h-4.5 w-4.5 text-[#003f77]" />
              {t('officer.zoneAlpha')}
            </div>
            <div className="flex items-center gap-4 py-2">
              <div className="flex items-center gap-2 text-[14px] font-black text-[#003f77]">
                <span className="h-2 w-2 rounded-full bg-current" />
                {stats.active} {t('officer.assignments')}
              </div>
              <div className="h-4 w-[1px] bg-slate-200" />
              <div className="flex items-center gap-2 text-[14px] font-black text-[#ea580c]">
                <span className="h-2 w-2 rounded-full bg-current" />
                {stats.pendingVerification} {t('officer.verification')}
              </div>
              <div className="h-4 w-[1px] bg-slate-200" />
              <div className="flex items-center gap-2 text-[14px] font-black text-red-600">
                <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                {stats.overdue} {t('officer.overdue')}
              </div>
            </div>
          </div>
        </div>
        <div className="hidden lg:block">
           <ShieldCheck className="h-28 w-28 text-[#003f77] opacity-10" />
        </div>
      </div>
    </div>
  );
}

function Assignments({ tickets, setTickets }) {
  const { t, i18n } = useTranslation();
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);

  const moveTicket = (ticketId, status) => {
    setTickets(prev => prev.map(ticket => (ticket.ticketId === ticketId ? { ...ticket, status } : ticket)));
  };

  return (
    <div className="view-stage">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {COLS.map(column => {
          const items = tickets.filter(ticket => ticket.status === column.id);
          return (
            <div key={column.id} className="flex flex-col gap-6">
              <div className="flex items-center justify-between px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full animate-pulse" style={{ background: column.color }} />
                  <h3 className="manrope text-[11px] font-black uppercase tracking-[2px] text-slate-900">{t(column.labelKey)}</h3>
                </div>
                <span className="flex h-6 w-8 items-center justify-center rounded-lg bg-slate-50 text-[11px] font-black text-[#003f77]">
                  {items.length}
                </span>
              </div>

              <div className="space-y-6">
                {items.length === 0 ? (
                  <div className="rounded-[32px] border-2 border-dashed border-slate-100 bg-white/40 px-6 py-16 text-center">
                    <p className="manrope text-[10px] font-black uppercase tracking-[2px] text-slate-300">{t('officer.noActiveCases')}</p>
                  </div>
                ) : null}
                {items.map(ticket => {
                  const sla = getSlaRemaining(ticket, t);
                  const nextStatus = NEXT_STATUS[column.id];
                  const CategoryIcon = CATEGORY_ICON[ticket.category] || ClipboardList;
                  const isBreached = sla.danger && ticket.status !== 'resolved';

                  return (
                    <motion.div
                      key={ticket.ticketId}
                      layout
                      initial={{ opacity: 0, scale: 0.98, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className={`group relative overflow-hidden rounded-[32px] bg-white border border-slate-100 p-8 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1 ${isBreached ? 'ring-2 ring-red-500/20' : ''}`}
                    >
                      <div className="absolute top-0 left-0 w-1.5 h-full" style={{ background: isBreached ? '#DC2626' : column.color }} />

                      <div className="mb-6 flex items-start justify-between">
                        <div>
                          <span className="manrope text-[10px] font-black uppercase tracking-[2px] text-slate-400">{ticket.ticketId}</span>
                          <h4 className="manrope text-[16px] font-black text-slate-800 tracking-tight mt-1 line-clamp-1">{translateCategory(t, i18n, ticket.category)}</h4>
                        </div>
                        <div className={`flex h-12 w-12 items-center justify-center rounded-[18px] transition-all bg-[#eff4ff] text-[#003f77] group-hover:bg-[#003f77] group-hover:text-white group-hover:shadow-lg shadow-blue-900/10`}>
                          <CategoryIcon className="h-6 w-6" />
                        </div>
                      </div>

                      <p className="text-[14px] font-medium leading-relaxed text-slate-500 mb-6 line-clamp-2">
                        {ticket.description}
                      </p>

                      <div className="mb-8 flex flex-wrap items-center gap-3">
                        <span className={`manrope text-[9px] font-black uppercase tracking-[1px] px-3 py-1 rounded-full ${ticket.priority === 'Critical' ? 'bg-red-500 text-white shadow-lg shadow-red-900/20' : 'bg-slate-50 text-slate-400'}`}>
                          {translatePriority(t, i18n, ticket.priority)}
                        </span>
                        <span className="manrope text-[9px] font-black uppercase tracking-[1px] bg-slate-50 text-slate-400 px-3 py-1 rounded-full">
                          {translateSectorName(i18n, ticket.sector)}
                        </span>
                      </div>

                      <div className="pt-6 border-t border-slate-50 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-bold text-slate-300 flex items-center gap-2">
                            <Clock className="h-4 w-4" /> {sla.textKey ? t(sla.textKey) : sla.text}
                          </span>
                        </div>

                        {nextStatus ? (
                          <button
                            className="w-full h-[52px] rounded-[18px] bg-[#003f77] hover:bg-[#07569E] text-white manrope text-[12px] font-black uppercase tracking-[2px] transition-all shadow-md shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2"
                            onClick={() => moveTicket(ticket.ticketId, nextStatus)}
                            
                          >
                            {t(NEXT_LABEL_KEY[column.id])} <ChevronRight className="h-4 w-4" />
                          </button>
                        ) : (
                          <div className="flex h-[52px] items-center justify-center gap-2 rounded-[18px] bg-green-500/10 text-[13px] font-black text-green-600">
                            <CheckCircle2 className="h-5 w-5" />
                            {t('officer.physicallyVerified')}
                          </div>
                        )}

                        {column.id !== 'resolved' && (
                          <button
                            onClick={() => setIsFlagModalOpen(true)}
                            className="w-full h-[40px] flex items-center justify-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-[2px] text-slate-400 hover:text-[#ea580c] hover:bg-[#ea580c]/5 transition-all"
                          >
                            <Flag className="h-4 w-4" /> {t('officer.flagResource')}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <ResourceModal isOpen={isFlagModalOpen} onClose={() => setIsFlagModalOpen(false)} />
    </div>
  );
}

function VerifyComplaint({ tickets, setTickets }) {
  const { t, i18n } = useTranslation();
  const [ticketId, setTicketId] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const ticket = tickets.find(item => item.ticketId === ticketId.trim());

  const updateVerificationStatus = (status) => {
    if (!ticket) return;
    setTickets(prev => prev.map(item => (item.ticketId === ticket.ticketId ? { ...item, status } : item)));
    setActionMessage(status === 'verified' ? t('officer.physicallyVerified') : t('officer.markFalse'));
  };

  return (
    <div className="view-stage mx-auto max-w-[920px]">
      <PageHeader title={t('officer.verification')} subtitle={t('officer.verifySubtitle')} />
      <div className="overflow-hidden rounded-[40px] border border-slate-100 bg-white shadow-xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#003f77]/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

        <div className="bg-[#eff4ff]/50 p-10 md:p-12 border-b border-slate-100">
          <p className="manrope text-[11px] font-black uppercase tracking-[3px] text-[#003f77] mb-4">{t('officer.verifyPlaceholder')}</p>
          <div className="relative group max-w-lg">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#003f77] transition-colors" />
            <input
              className="h-[72px] w-full rounded-[24px] bg-white border-2 border-transparent px-16 text-[18px] font-black text-slate-800 shadow-sm outline-none transition-all focus:border-[#003f77] focus:ring-4 focus:ring-[#003f77]/5 placeholder:text-slate-300"
              onChange={event => setTicketId(event.target.value)}
              placeholder="e.g. GN-284731"
              value={ticketId}
            />
          </div>
        </div>

        {ticket ? (
          <div className="p-10 md:p-16">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
              <div className="flex flex-wrap items-center justify-between gap-6 pb-10 border-b border-slate-100">
                <div>
                  <p className="manrope text-[11px] font-black uppercase tracking-[2px] text-slate-400 mb-2">{t('citizen.ticketLabel')}</p>
                  <h2 className="manrope text-[48px] font-black tracking-tighter text-[#003f77] leading-none">{ticket.ticketId}</h2>
                </div>
                <div className="flex gap-3">
                  <PriorityBadge priority={ticket.priority} />
                  <span className="manrope text-[10px] font-black uppercase tracking-[1px] bg-[#eff4ff] text-[#003f77] px-4 py-2 rounded-full border border-blue-100 flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> {translateSectorName(i18n, ticket.sector)}
                  </span>
                </div>
              </div>

              <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-10">
                  <div>
                    <p className="manrope text-[11px] font-black uppercase tracking-[2px] text-slate-400 mb-4">{t('citizen.description', { defaultValue: 'GRIEVANCE DESCRIPTION' })}</p>
                    <p className="text-[17px] font-medium leading-relaxed text-slate-600 bg-slate-50 p-8 rounded-[32px] border border-slate-100 italic">
                      "{ticket.description}"
                    </p>
                  </div>
                  
                  {/* AI Reasoning Trace */}
                  {ticket.agentTrace && (
                    <div className="mt-6">
                      <AgentTrace trace={ticket.agentTrace} mode="compact" />
                    </div>
                  )}

                  <div className="relative group cursor-pointer overflow-hidden rounded-[40px] border-2 border-dashed border-slate-200 bg-white p-12 text-center transition-all hover:border-[#003f77] hover:bg-[#eff4ff]/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 transition-transform group-hover:scale-105">
                      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] bg-slate-50 text-slate-300 group-hover:bg-[#003f77] group-hover:text-white group-hover:shadow-xl transition-all">
                        <Camera className="h-10 w-10" />
                      </div>
                      <h4 className="manrope text-[16px] font-black text-slate-900 mb-2">{t('officer.uploadPhoto')}</h4>
                      <p className="text-[13px] font-bold text-slate-400 max-w-[200px] mx-auto">{t('officer.uploadInstruction', { defaultValue: 'Capture current site photo for verification' })}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-[40px] bg-[#003f77] p-8 text-white relative overflow-hidden group shadow-2xl shadow-blue-900/40">
                    <div className="absolute top-2 left-2 p-6 opacity-[0.05] group-hover:scale-110 transition-transform pointer-events-none">
                      <ShieldCheck className="h-20 w-20" />
                    </div>
                    <div className="relative z-10">
                      <div className="mb-8 h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                        <AlertTriangle className="h-6 w-6 text-[#ea580c]" />
                      </div>
                      <h5 className="manrope text-[18px] font-black mb-3">{t('officer.responsibilityHeader', { defaultValue: 'Verification Protocol' })}</h5>
                      <p className="text-[14px] font-medium text-white/70 leading-relaxed mb-8">{t('officer.responsibilityDesc', { defaultValue: 'As an authorized officer, your verification confirms the physical state of the grievance for further resolution.' })}</p>

                      <div className="space-y-4">
                        <button
                          className="h-[64px] w-full rounded-[20px] bg-green-500 text-white font-black text-[16px] hover:bg-green-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-900/40 active:scale-95"
                          onClick={() => updateVerificationStatus('verified')}
                          
                        >
                          <CheckCircle2 className="h-6 w-6" /> {t('officer.physicallyVerified')}
                        </button>
                        <button
                          className="h-[64px] w-full rounded-[20px] bg-white/10 hover:bg-red-500 text-white border border-white/20 font-black text-[16px] transition-all flex items-center justify-center gap-3 backdrop-blur-md active:scale-95"
                          onClick={() => updateVerificationStatus('new')}
                          
                        >
                          <X className="h-6 w-6" /> {t('officer.markFalse')}
                        </button>
                      </div>
                      {actionMessage ? (
                        <p className="mt-4 text-[12px] font-bold text-white/80">{actionMessage}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="p-24 text-center">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] bg-slate-50 text-slate-200">
              <Search className="h-12 w-12" />
            </div>
            <h3 className="manrope text-[20px] font-black text-slate-800">{t('officer.trackWaitingTitle', { defaultValue: 'Enter Ticket ID' })}</h3>
            <p className="mx-auto mt-3 max-w-xs text-[15px] font-bold text-slate-400 leading-relaxed">{t('officer.searchAssigned')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Performance() {
  const { t } = useTranslation();
  const [loading] = useState(false);
  const reviews = [
    { citizen: 'Arun Mehta', text: t('officer.review1'), rating: 5, date: '2 hours ago' },
    { citizen: 'Meera Devi', text: t('officer.review2'), rating: 4, date: 'Yesterday' },
    { citizen: 'Suresh Pal', text: t('officer.review3'), rating: 4, date: '3 days ago' },
  ];

  if (loading) return <SectionSkeleton rows={8} />;

  return (
    <div className="view-stage">
      <PageHeader title={t('officer.performanceTitle')} subtitle={t('officer.performanceSub')} />

      <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t('public.totalResolved'), value: '24', icon: <ShieldCheck />, color: '#15803D', trend: t("officer.trend1") },
          { label: t('officer.nearSla'), value: '06', icon: <AlertTriangle />, color: '#D97706', trend: t('officer.flaggedToday') },
          { label: t('public.sla'), value: '94.1%', icon: <TrendingUp />, color: '#003f77', trend: t("officer.trend2") },
          { label: t('public.rating'), value: '4.3 / 5', icon: <Star />, color: '#0F766E', trend: t("officer.trend3") }
        ].map((kpi, idx) => (
          <div key={idx} className="group relative overflow-hidden rounded-[32px] bg-white border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all">
             <div className="absolute top-4 right-4 p-4 opacity-[0.05] transition-transform group-hover:scale-110 pointer-events-none">
                {React.cloneElement(kpi.icon, { className: 'h-16 w-16' })}
             </div>
             <div className="relative z-10">
              <div className="mb-6 h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ background: kpi.color }}>
                {React.cloneElement(kpi.icon, { className: 'h-6 w-6' })}
              </div>
              <p className="manrope text-[11px] font-black uppercase tracking-[2px] text-slate-400 mb-1">{kpi.label}</p>
              <div className="flex items-baseline gap-3">
                <h3 className="manrope text-[36px] font-black text-slate-800 leading-none">{kpi.value}</h3>
                <span className="text-[10px] font-black tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{kpi.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[40px] bg-white p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-4 right-4 p-4 opacity-0.02 group-hover:rotate-6 transition-transform">
            <BarChart3 className="h-20 w-20" />
          </div>
          <div className="relative z-10 flex items-center justify-between mb-10">
            <div>
              <h3 className="manrope text-[20px] font-black tracking-tight text-slate-900">{t('public.monthlyTrend')}</h3>
              <p className="text-[13px] font-bold text-slate-400 mt-1">{t('officer.resolutionTrendDesc', { defaultValue: 'Grievance closure velocity over time' })}</p>
            </div>
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#eff4ff] text-[#003f77]">
              <RefreshCw className="h-5 w-5" />
            </div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={WEEKLY_RESOLUTION}>
                <CartesianGrid stroke="#F8FAFC" strokeDasharray="0 0" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fontWeight: '800', fill: '#94A3B8' }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 11, fontWeight: '800', fill: '#94A3B8' }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  cursor={{ fill: '#003f77', opacity: 0.03 }}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: '800', fontSize: '12px' }}
                />
                <Bar dataKey="resolved" fill="#003f77" radius={[12, 12, 12, 12]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between px-4">
            <h3 className="manrope text-[20px] font-black tracking-tight text-slate-900">{t('officer.liveFeedback')}</h3>
            <span className="text-[11px] font-black uppercase tracking-[2px] text-green-600 bg-green-50 px-3 py-1 rounded-full">{t('officer.highSatisfaction', { defaultValue: '98% Positive' })}</span>
          </div>
          <div className="space-y-6">
            {reviews.map(review => (
              <div key={review.citizen} className="group relative overflow-hidden rounded-[32px] bg-white p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 font-black text-[12px]">
                      {review.citizen.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <span className="manrope text-[15px] font-black text-slate-900 block">{review.citizen}</span>
                      <span className="text-[11px] font-bold text-slate-300">{review.date}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 bg-amber-50 px-3 py-1.5 rounded-full">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-[15px] font-medium leading-relaxed text-slate-500 italic">"{review.text}"</p>
                <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                  <MessageCircle className="h-12 w-12 text-[#003f77]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Reports() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [insight, setInsight] = useState('');

  const copyInsight = async () => {
    if (!insight) return;
    try {
      await navigator.clipboard.writeText(insight);
    } catch {
      // Clipboard may be unavailable in some embedded browsers.
    }
  };

  const generate = async () => {
    setLoading(true);
    setGenerated(false);
    try {
      const summary = await callClaude(
        'You are an AI generating field reports for a UPGOV officer. Return a concise report paragraph.',
        'Generate a field operational summary.'
      );
      setInsight(summary || 'Trend: High closure rate in sector 36. Prioritize remaining legacy tickets in Alpha 1.');
      setGenerated(true);
    } catch {
      setInsight('AI Engine offline. Showing local field summary: Strong performance in infrastructure repairs across Zone Alpha. Sector 42 requires attention for public lighting. High citizen satisfaction in water supply resolutions.');
      setGenerated(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-stage mx-auto max-w-[1000px]">
      <PageHeader title={t('officer.reportsTitle')} subtitle={t('officer.reportsSub')} />
      <div className="space-y-10">
        <div className="rounded-[40px] border border-blue-100 bg-white p-12 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#003f77]/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-[#ea580c]/5 transition-colors"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-[32px] ${loading ? 'bg-[#ea580c] shadow-2xl shadow-orange-900/40 animate-pulse' : 'bg-slate-50 text-[#003f77]'}`}>
              <RefreshCw className={`h-10 w-10 ${loading ? 'animate-spin text-white' : ''}`} />
            </div>
            <div className="text-center md:text-left">
              <h3 className="manrope text-[24px] font-black text-slate-900 mb-2">{t('officer.generateSummary')}</h3>
              <p className="text-[15px] font-medium leading-relaxed text-slate-500 max-w-xl mb-8">
                {t('officer.compileDesc')}
              </p>
              <button
                className={`h-[64px] min-w-[240px] rounded-[24px] font-black text-[16px] uppercase tracking-[2px] transition-all flex items-center justify-center gap-3 shadow-lg ${loading ? 'bg-slate-100 text-slate-400' : 'bg-[#003f77] text-white hover:bg-[#07569E] shadow-blue-900/20 active:scale-95'}`}
                disabled={loading}
                onClick={generate}
                
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                    {t('officer.compilingBtn')}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    {t('officer.generateBtn')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {generated && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[40px] bg-white border border-slate-100 p-12 shadow-2xl relative">
            <div className="absolute top-12 right-12 opacity-5">
              <ShieldCheck className="h-32 w-32 text-[#003f77]" />
            </div>
            <div className="relative z-10">
              <div className="mb-10 flex flex-wrap items-center justify-between gap-6 border-b border-slate-50 pb-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#eff4ff] flex items-center justify-center text-[#003f77]">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="manrope text-[20px] font-black tracking-tight text-slate-900">{t('officer.endOfShift')}</h3>
                    <p className="text-[12px] font-bold text-slate-300 uppercase tracking-[2px]">Field Op Summary • {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="h-10 px-4 rounded-xl bg-slate-50 text-slate-400 hover:text-[#003f77] transition-all flex items-center gap-2 font-black text-[11px] uppercase tracking-[1px]"
                    onClick={copyInsight}
                    
                  >
                    <Copy className="h-3.5 w-3.5" /> {t('public.copy', { defaultValue: 'Copy' })}
                  </button>
                </div>
              </div>

              <div className="bg-[#f8fafc] p-8 rounded-[32px] border border-white min-h-[160px]">
                <p className="text-[17px] leading-relaxed text-slate-700 whitespace-pre-wrap font-medium">{insight}</p>
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <div className="bg-green-50 px-4 py-2 rounded-full border border-green-100 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-[11px] font-black uppercase tracking-[1px] text-green-600">AI Verified Resolution</span>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-full border border-blue-100 flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-blue-600" />
                  <span className="text-[11px] font-black uppercase tracking-[1px] text-blue-600">Audio Transcription Ready</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function OfficerDashboard({ page, onNavigate, onLogout, onBack }) {
  const [tickets, setTickets] = useState(() => getInitialTickets());

  useEffect(() => {
    saveTickets(tickets);
  }, [tickets]);
  const VALID_PAGES = ['assignments', 'verify', 'update', 'performance'];
  const currentPage = VALID_PAGES.includes(page) ? page : 'assignments';

  let content = null;
  if (currentPage === 'assignments') content = <Assignments setTickets={setTickets} tickets={tickets} />;
  else if (currentPage === 'verify') content = <VerifyComplaint setTickets={setTickets} tickets={tickets} />;
  else if (currentPage === 'update') content = <Reports />;
  else if (currentPage === 'performance') content = <Performance />;

  return (
    <DashboardShell
      activePage={currentPage}
      items={SIDEBAR_ITEMS}
      onLogout={onLogout}
      onPageChange={onNavigate}
      onBack={onBack}
      role="officer"
      userName="Officer Sharma"
    >
      <OfficerHeader tickets={tickets} />
      {content}
    </DashboardShell>
  );
}
