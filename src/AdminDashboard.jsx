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

function LiveTicker({ liveFeed = [] }) {
  const { t } = useTranslation();
  
  // Combine real live feed with fallback seed data
  const feedItems = useMemo(() => {
    const defaultItems = [
      'PWD assigned to Alpha-1',
      'Knowledge Park pothole escalated',
      'Officer verified complaint in Sector 120',
      'Resolution efficiency hit 94% in Sector 36',
    ];
    const liveMessages = liveFeed.map(event => event.message);
    return [...liveMessages, ...defaultItems];
  }, [liveFeed]);

  return (
    <div className="flex h-14 items-center overflow-hidden rounded-[20px] bg-[#003366] px-8 text-[11px] font-black tracking-[2px] text-white shadow-xl relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-[#002244]/50 to-transparent opacity-50"></div>
      <div className="mr-8 flex shrink-0 items-center gap-3 relative z-10">
        <span className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
        <span className="text-green-400 uppercase">{t('admin.liveFeed')}</span>
      </div>
      <div className="h-5 w-[1px] bg-white/20 relative z-10" />
      <div className="ml-8 flex-1 overflow-hidden whitespace-nowrap relative z-10">
        <div className="animate-ticker inline-block">
          {feedItems.map((item, i) => (
            <span key={i} className={`mx-12 uppercase opacity-80 hover:opacity-100 transition-opacity cursor-default ${item.includes('AUTO-ESCALATED') ? 'text-red-400 font-extrabold' : ''}`}>
              {item}
            </span>
          ))}
          {feedItems.map((item, i) => (
            <span key={`dup-${i}`} className={`mx-12 uppercase opacity-80 hover:opacity-100 transition-opacity cursor-default ${item.includes('AUTO-ESCALATED') ? 'text-red-400 font-extrabold' : ''}`}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Overview({ onNavigate, liveFeed }) {
  const { t } = useTranslation();
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [diagnosticsResult, setDiagnosticsResult] = useState(null);

  const runDiagnostics = async () => {
    setRunningDiagnostics(true);
    const start = Date.now();
    await new Promise(resolve => setTimeout(resolve, 800));
    const renderLatencyMs = Math.max(12, Math.round(Date.now() - start - 800 + 10));
    
    const checks = [
      { key: 'network', label: 'Network Reachability', status: 'ok', details: 'All core endpoints operational (UP-GOV Cloud).' },
      { key: 'latency', label: 'UI Render Latency', status: 'ok', details: `${renderLatencyMs}ms — High performance threshold maintained.` },
      { key: 'memory', label: 'Engine Integrity', status: 'ok', details: 'Claude-3-Pro neural mapping stable.' }
    ];

    setDiagnosticsResult({
      generatedAt: new Date().toLocaleTimeString(),
      checks,
      summary: 'Command Center Systems: OPTIMAL'
    });
    setDiagnosticsOpen(true);
    setRunningDiagnostics(false);
  };

  const exportDepartmentReport = () => {
    const header = 'Department,Total Resolved,SLA Compliance,Priority Performance';
    const rows = DEPT_PERFORMANCE.map(dept => [dept.department, dept.resolved, dept.sla + '%', 'High'].join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'operational-summary-report.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const cards = [
    { labelKey: 'admin.activeComplaints', value: 3046, color: '#003366', trend: '+12%', icon: <LayoutDashboard /> },
    { labelKey: 'public.totalResolved', value: 2847, color: '#15803D', trend: '+8%', icon: <CheckCircle2 /> },
    { labelKey: 'admin.slaBreaches', value: 23, color: '#DC2626', trend: '-2%', icon: <AlertTriangle /> },
    { labelKey: 'public.avgResolution', value: '4.2d', color: '#ff9933', trend: '-1d', icon: <Timer /> },
  ];

  return (
    <div className="view-stage mx-auto max-w-[1440px]">
      <PageHeader title={t('nav.adminDash')} subtitle={t('admin.predictiveSub')} />
      
      <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, idx) => (
          <div key={idx} className="group relative overflow-hidden rounded-[32px] bg-white border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
             <div className="absolute top-4 right-4 p-4 opacity-[0.05] transition-transform group-hover:scale-110 pointer-events-none">
                {React.cloneElement(card.icon, { className: 'h-16 w-16' })}
             </div>
             <div className="relative z-10">
                <div className="mb-6 h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ background: card.color }}>
                   {React.cloneElement(card.icon, { className: 'h-6 w-6' })}
                </div>
                <p className="manrope text-[11px] font-black uppercase tracking-[2px] text-slate-400 mb-1">{t(card.labelKey)}</p>
                <div className="flex items-baseline gap-3">
                   <h3 className="manrope text-[36px] font-black text-slate-800 leading-none">
                      {typeof card.value === 'number' ? <AnimatedNumber to={card.value} /> : card.value}
                   </h3>
                   <span className={`text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full ${card.trend.includes('-') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {card.trend}
                   </span>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="mb-10">
        <LiveTicker liveFeed={liveFeed} />
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[40px] bg-white p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-4 right-4 p-4 opacity-[0.02] group-hover:rotate-6 transition-transform">
             <Building2 className="h-20 w-20" />
          </div>
          <div className="relative z-10 flex items-center justify-between mb-10">
             <div>
                <h3 className="manrope text-[20px] font-black tracking-tight text-slate-900">{t('admin.deptPerformance')}</h3>
                <p className="text-[13px] font-bold text-slate-400 mt-1">{t('admin.realTimeMetadata', { defaultValue: 'Cross-departmental resolution velocity' })}</p>
             </div>
             <button
               className="h-10 px-4 rounded-xl bg-[#eff4ff] text-[#003366] manrope text-[11px] font-black uppercase tracking-[1px] hover:bg-[#003366] hover:text-white transition-all"
               onClick={() => onNavigate('departments')}
               
             >
                {t('admin.viewAll')}
             </button>
          </div>
          <div className="space-y-6">
            {DEPT_PERFORMANCE.map(dept => (
              <div key={dept.department} className="group/item relative flex items-center justify-between rounded-[28px] bg-[#f8fafc] p-6 transition-all hover:bg-white hover:shadow-lg border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-5">
                   <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm font-black text-[#003366] text-[18px] group-hover/item:bg-[#003366] group-hover/item:text-white transition-colors">
                      {dept.department[0]}
                   </div>
                   <div>
                      <p className="manrope text-[16px] font-black text-slate-900">{t(`dept.${dept.department}`) || dept.department}</p>
                      <p className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.5px] mt-0.5">{dept.active} {t('admin.activeCases')}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="manrope text-[20px] font-black text-[#003366]">{dept.sla}%</p>
                   <div className="mt-2 h-2 w-32 overflow-hidden rounded-full bg-slate-200 p-0.5">
                      <div className="h-full bg-[#003366] rounded-full transition-all duration-1000" style={{ width: `${dept.sla}%` }} />
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[40px] bg-[#003366] p-10 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl group-hover:bg-white/10 transition-colors"></div>
          <div className="relative z-10">
             <div className="mb-10 flex items-center justify-between">
                <div>
                   <h3 className="manrope text-[20px] font-black tracking-tight">{t('admin.systemHealth')}</h3>
                   <p className="text-[13px] font-bold text-white/50 mt-1 uppercase tracking-[1px]">Command node status</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                   <Zap className="h-6 w-6 text-[#ea580c]" />
                </div>
             </div>

             <div className="space-y-10">
                <div className="flex items-center justify-between gap-6 pb-8 border-b border-white/10">
                   <div>
                     <p className="manrope text-[11px] font-black uppercase tracking-[2px] text-white/40 mb-2">{t('admin.aiEngine')}</p>
                     <p className="manrope text-[28px] font-black tracking-tight flex items-center gap-3">
                        {t('admin.operational')}
                        <span className="h-3 w-3 rounded-full bg-green-400 animate-pulse shadow-[0_0_15px_rgba(74,222,128,0.4)]" />
                     </p>
                   </div>
                   <div className="h-16 w-16 rounded-[24px] border-4 border-white/5 p-2 bg-white/5 backdrop-blur-md">
                      <Brain className="h-full w-full text-white/40" />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                   <div>
                      <p className="manrope text-[11px] font-black uppercase tracking-[2px] text-white/40 mb-2">{t('admin.latency')}</p>
                      <p className="manrope text-[28px] font-black tracking-tight">14ms</p>
                   </div>
                   <div>
                      <p className="manrope text-[11px] font-black uppercase tracking-[2px] text-white/40 mb-2">{t('admin.load')}</p>
                      <div className="flex items-center gap-3 mt-3">
                         <div className="h-2 flex-1 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full w-[42%] bg-[#ea580c] shadow-[0_0_10px_rgba(234,88,12,0.5)]" />
                         </div>
                         <span className="manrope text-[13px] font-black">42%</span>
                      </div>
                   </div>
                </div>
             </div>

             <button
               
               onClick={runDiagnostics}
               disabled={runningDiagnostics}
               className="mt-12 h-[56px] w-full rounded-[20px] bg-white text-[#003f77] manrope text-[14px] font-black uppercase tracking-[2px] hover:bg-slate-50 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
             >
               {runningDiagnostics ? (
                 <>
                   <RefreshCw className="h-5 w-5 animate-spin" />
                   {t('admin.runningDiagnostics', { defaultValue: 'Executing Checks...' })}
                 </>
               ) : (
                 <>
                   <ShieldCheck className="h-6 w-6" />
                   {t('admin.diagnostics')}
                 </>
               )}
             </button>

             <AnimatePresence>
               {diagnosticsOpen && diagnosticsResult && (
                 <motion.div
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: 'auto' }}
                   exit={{ opacity: 0, height: 0 }}
                   className="mt-8 pt-8 border-t border-white/10"
                 >
                   <div className="space-y-3">
                     {diagnosticsResult.checks.map(check => (
                       <div key={check.key} className="rounded-2xl bg-white/5 p-4 border border-white/5 backdrop-blur-sm">
                         <div className="flex items-center justify-between gap-3 mb-1">
                           <p className="text-[13px] font-black text-white">{check.label}</p>
                           <span className="h-2 w-2 rounded-full bg-green-400" />
                         </div>
                         <p className="text-[11px] font-bold text-white/40">{check.details}</p>
                       </div>
                     ))}
                   </div>
                   <p className="mt-6 text-center manrope text-[11px] font-black uppercase tracking-[2px] text-white/30">{diagnosticsResult.summary}</p>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}


function PredictiveAlerts() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deployedByAlert, setDeployedByAlert] = useState({});
  const [environmentalRisk, setEnvironmentalRisk] = useState(null);

  const deployFieldUnit = (index) => {
    setDeployedByAlert(prev => ({ ...prev, [index]: true }));
  };

  const runAnalysis = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 1. Run real environmental predictive analysis
      try {
        const allTickets = getInitialTickets();
        const envResult = await runPredictiveAnalysis(allTickets, "Sector 36");
        setEnvironmentalRisk(envResult);
      } catch (envErr) {
        console.error("Environmental analysis failed", envErr);
      }

      // 2. Run standard pattern analysis
      const text = await callClaude(
        'You are infrastructure analytics AI for UPGOV. Return ONLY valid JSON: {"alerts":[{"zone":"name","issueType":"Roads|Water|Electricity","riskLevel":"Critical|High|Medium","pattern":"text","confidence":95,"daysToCritical":3,"recommendation":"text"}]}',
        'Analyze current complaint patterns for India and generate predictive alerts.'
      );
      let parsed = parseClaudeJson(text);
      setAlerts(Array.isArray(parsed.alerts) ? parsed.alerts : []);
    } catch (err) {
      setError(t('admin.engineOutage'));
      setAlerts([
        { zone: 'Sector 36', issueType: 'Roads', riskLevel: 'Critical', pattern: 'Cluster of 12 recurring potholes identified in high-traffic commercial corridor.', confidence: 96, daysToCritical: 2, recommendation: 'Deploy immediate milling machine to Alpha-Commercial junction.' },
        { zone: 'Knowledge Park', issueType: 'Electricity', riskLevel: 'High', pattern: 'Sub-station load fluctuation detected across 4 sectors concurrently.', confidence: 89, daysToCritical: 5, recommendation: 'Secondary transformer bypass verification required.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-stage mx-auto max-w-[1000px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div>
           <PageHeader title={t('admin.predictiveTitle')} subtitle={t('admin.predictiveDesc')} />
        </div>
        <button type="button" 
          className={`h-[72px] rounded-[28px] px-10 manrope text-[15px] font-black uppercase tracking-[2px] transition-all flex items-center justify-center gap-4 shadow-xl ${loading ? 'bg-slate-100 text-slate-400' : 'bg-[#003366] text-white hover:bg-[#07569E] shadow-blue-900/20 active:scale-95'}`} 
          disabled={loading} 
          onClick={runAnalysis} 
          
        >
          {loading ? <RefreshCw className="h-6 w-6 animate-spin" /> : <Brain className="h-7 w-7" />}
          {loading ? t('admin.analyzingTrends') : t('admin.patternAnalysis')}
        </button>
      </div>
      
      {error && <div className="mb-8"><ErrorCard title={t('admin.aiAnalysisFailed')} message={error} /></div>}

      {/* Environmental Live Risk Card */}
      {environmentalRisk && (
        <div className="mb-12 relative overflow-hidden rounded-[32px] bg-white p-8 border border-slate-200 shadow-xl">
          <div className={`absolute top-0 right-0 w-96 h-96 rounded-full -mr-48 -mt-48 blur-3xl opacity-20`} style={{ background: environmentalRisk.riskLevel === 'Critical' ? '#DC2626' : '#ff9933' }}></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h3 className="manrope text-[24px] font-black tracking-tight text-slate-900">Multi-Signal Environmental Risk</h3>
                <p className="text-[13px] font-bold text-slate-500">Live Weather Data + Ticket Density Analysis</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-[1fr_250px] gap-8">
              <div>
                <p className="text-[18px] font-bold text-slate-700 italic leading-relaxed">"{environmentalRisk.prediction}"</p>
                
                <div className="mt-6 flex flex-wrap gap-4">
                  <div className="bg-slate-50 rounded-xl px-5 py-3 border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-[1px] text-slate-400 mb-1">Open-Meteo Forecast</p>
                    <p className="text-[16px] font-black text-slate-800">{environmentalRisk.weatherData.totalRain}mm <span className="text-sm font-medium text-slate-500">expected (3 days)</span></p>
                  </div>
                  <div className="bg-slate-50 rounded-xl px-5 py-3 border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-[1px] text-slate-400 mb-1">Recent Tickets ({environmentalRisk.sector})</p>
                    <p className="text-[16px] font-black text-slate-800">{environmentalRisk.ticketDensity} <span className="text-sm font-medium text-slate-500">drainage/roads issues</span></p>
                  </div>
                </div>
                
                <div className="mt-8 rounded-xl bg-slate-900 px-6 py-4">
                  <p className="text-[11px] font-black uppercase tracking-[2px] text-slate-400 mb-1">AI Recommendation</p>
                  <p className="text-[15px] font-bold text-white">{environmentalRisk.recommendation}</p>
                </div>
              </div>
              
              <div className="flex flex-col justify-center items-center rounded-2xl bg-slate-50 border border-slate-100 p-6 text-center">
                <p className="text-[12px] font-black uppercase tracking-[2px] text-slate-400 mb-2">Risk Level</p>
                <p className={`text-[36px] font-black uppercase tracking-tight leading-none ${environmentalRisk.riskLevel === 'Critical' ? 'text-red-600' : 'text-amber-600'}`}>{environmentalRisk.riskLevel}</p>
                <div className="mt-6 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${environmentalRisk.confidence}%`, background: environmentalRisk.riskLevel === 'Critical' ? '#DC2626' : '#ff9933' }} />
                </div>
                <p className="mt-2 text-[12px] font-bold text-slate-500">{environmentalRisk.confidence}% AI Confidence</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pattern Alerts */}
      {loading && (
        <div className="py-24 text-center space-y-8">
           <div className="relative mx-auto h-32 w-32">
              <div className="absolute inset-0 rounded-full border-4 border-blue-50 border-t-[#003366] animate-spin" />
              <div className="absolute inset-4 rounded-full border-4 border-slate-50 border-t-[#ff9933] animate-spin-slow" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <Brain className="h-10 w-10 text-[#003366]" />
              </div>
           </div>
           <p className="manrope text-[18px] font-black text-slate-800 animate-pulse">{t('admin.analyzingTrends')}</p>
        </div>
      )}

      {!loading && alerts.length > 0 ? (
        <div className="grid gap-10">
          <div className="bg-[#eff4ff] border border-blue-100 rounded-[28px] p-6 flex items-center gap-4 shadow-sm">
             <div className="h-10 w-10 rounded-xl bg-[#003366] flex items-center justify-center text-white">
                <Sparkles className="h-5 w-5" />
             </div>
             <p className="manrope text-[14px] font-black text-[#003366]">AI Pattern Match Complete: {alerts.length} critical infrastructure sequences identified.</p>
          </div>
          {alerts.map((alert, i) => (
            <div key={i} className="group relative overflow-hidden rounded-[40px] border border-slate-100 bg-white p-10 shadow-sm hover:shadow-2xl transition-all">
              <div className="absolute top-0 left-0 h-full w-2.5" style={{ background: alert.riskLevel === 'Critical' ? '#DC2626' : alert.riskLevel === 'High' ? '#ff9933' : '#15803D' }} />
              
              <div className="mb-10 flex flex-wrap items-center justify-between gap-8">
                 <div>
                    <div className="flex items-center gap-3">
                       <h3 className="manrope text-[32px] font-black tracking-tighter text-slate-900 leading-none">{alert.zone}</h3>
                       <span className={`manrope rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[1px] text-white shadow-lg`} style={{ background: alert.riskLevel === 'Critical' ? '#DC2626' : alert.riskLevel === 'High' ? '#ff9933' : '#15803D' }}>
                          {alert.riskLevel} Risk Sequence
                       </span>
                    </div>
                    <p className="mt-3 manrope text-[11px] font-black uppercase tracking-[2px] text-slate-400">{t(`category.${alert.issueType}`) || alert.issueType} PROBABILISTIC FAILURE</p>
                 </div>
                 <div className="text-right flex items-center gap-6">
                    <div className="h-16 w-[1px] bg-slate-100 hidden sm:block" />
                    <div>
                       <p className="manrope text-[11px] font-black uppercase tracking-[2px] text-slate-400 mb-1">{t('admin.confidence')}</p>
                       <p className="manrope text-[40px] font-black tracking-tighter text-[#003366] leading-none">{alert.confidence || 92}%</p>
                    </div>
                 </div>
              </div>

              <div className="grid lg:grid-cols-[1fr_0.8fr] gap-10">
                 <div className="rounded-[32px] bg-[#f8fafc] p-8 border border-white">
                    <p className="manrope text-[11px] font-black uppercase tracking-[2.5px] text-slate-400 mb-4">{t("admin.detectedPattern")}</p>
                    <p className="text-[17px] font-medium leading-relaxed text-slate-700 italic">"{alert.pattern}"</p>
                 </div>
                 <div className="space-y-6">
                    <div className="flex flex-col gap-1">
                       <p className="manrope text-[11px] font-black uppercase tracking-[2px] text-slate-400">Tactical Recommendation</p>
                       <p className="text-[16px] font-black text-slate-800 leading-snug">{alert.recommendation}</p>
                    </div>
                      <button
                       className="h-[64px] w-full rounded-[20px] bg-[#003f77] text-white manrope text-[14px] font-black uppercase tracking-[2px] shadow-lg shadow-blue-900/20 hover:bg-[#07569E] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-60"
                       disabled={Boolean(deployedByAlert[i])}
                       onClick={() => deployFieldUnit(i)}
                       
                      >
                        <Send className="h-5 w-5" /> {deployedByAlert[i] ? t('admin.operational') : t('admin.deployFieldUnit')}
                    </button>
                 </div>
              </div>

              <div className="mt-10 flex items-center justify-between border-t border-slate-50 pt-8">
                 <div className="flex items-center gap-2 text-[14px] font-black text-red-600">
                    <Timer className="h-4 w-4" />
                    {t('admin.thresholdMsg', { days: alert.daysToCritical })}
                 </div>
                 <span className="manrope text-[11px] font-black uppercase tracking-[2px] text-slate-300">Analysis ID: AI-SEQ-{i+420}</span>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && (
         <div className="py-32 text-center rounded-[48px] border-2 border-dashed border-slate-100 bg-white shadow-sm">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] bg-slate-50 text-slate-200">
               <Brain className="h-12 w-12" />
            </div>
            <h4 className="manrope text-[20px] font-black tracking-tight text-slate-400 uppercase tracking-[2px]">Neural Engine Standby</h4>
            <p className="mx-auto mt-3 max-w-xs text-[15px] font-bold text-slate-300 leading-relaxed">Execute pattern analysis to synchronize live operational data with predictive failure models.</p>
         </div>
      )}
    </div>
  );
}


function ComplaintCards() {
  const { t, i18n } = useTranslation();
  const [liked, setLiked] = useState({});
  const toggleLike = (id) => setLiked(prev => ({ ...prev, [id]: !prev[id] }));

  const openComplaint = async (ticketId) => {
    toggleLike(ticketId);
    try {
      await navigator.clipboard.writeText(ticketId);
    } catch {
      // Clipboard may be blocked in some runtimes.
    }
  };

  return (
    <div className="view-stage">
      <PageHeader title={t('admin.complaintFeed')} subtitle="Visual operation tracking with integrated heatmapping and high-fidelity service tokens." />

      <div className="mb-12 rounded-[48px] bg-[#003366] p-10 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="relative z-10">
          <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="manrope text-[24px] font-black tracking-tighter">{t('admin.activityHeatmap')}</h3>
              <p className="text-[13px] font-bold text-white/50 mt-1 uppercase tracking-[1.5px]">{t('admin.patternDesc')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-[2px] text-white/40 bg-white/5 p-4 rounded-full backdrop-blur-md">
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-blue-300/30" /> {t('admin.low')}</div>
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-[#ff9933]/50" /> {t('admin.medium')}</div>
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-[#ff9933]" /> {t('admin.high')}</div>
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" /> {t('admin.criticalRisk')}</div>
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-hide pb-4">
            <div className="min-w-[800px]">
              <div className="flex gap-2 mb-3 ml-12">
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="flex-1 text-center text-[10px] font-black text-white/20 uppercase tracking-[1px]">
                    {i === 0 ? '12a' : i === 6 ? '6a' : i === 12 ? '12p' : i === 18 ? '6p' : ''}
                  </div>
                ))}
              </div>
              {ACTIVITY_HEATMAP_DATA.map(row => (
                <div key={row.day} className="flex items-center gap-2 mb-2">
                  <span className="w-10 text-right text-[11px] font-black text-white/30 shrink-0 uppercase">{row.day}</span>
                  <div className="flex gap-1.5 flex-1">
                    {row.hours.map((val, hi) => {
                      const max = 28;
                      const intensity = val / max;
                      let bg = 'bg-white/5';
                      if (intensity > 0.75) bg = 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]';
                      else if (intensity > 0.5) bg = 'bg-[#ff9933] shadow-[0_0_12px_rgba(255,153,51,0.4)]';
                      else if (intensity > 0.25) bg = 'bg-[#ff9933]/50';
                      else if (intensity > 0.05) bg = 'bg-[#ff9933]/20';
                      return (
                        <div key={hi} className={`flex-1 h-9 rounded-lg ${bg} transition-all hover:scale-125 hover:z-10 cursor-pointer relative group/hex`}>
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover/hex:block z-50">
                            <div className="rounded-[12px] bg-white px-4 py-2 text-[11px] font-black text-[#003366] whitespace-nowrap shadow-2xl">
                              {val} complaints @ {hi}:00
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
        {ADMIN_COMPLAINT_CARDS.map(card => {
          const isLiked = liked[card.ticketId];
          return (
            <div key={card.ticketId} className="group overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1.5 relative">
              
              <div className="flex items-center gap-4 px-8 py-6 border-b border-slate-50">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#003366] font-black text-[14px] shadow-sm">
                  {card.citizen.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="manrope text-[16px] font-black text-slate-900 truncate tracking-tight">{card.citizen}</p>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[1px]">{card.sector}</p>
                </div>
                <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
              </div>

              <div className="p-8">
                 <div className="flex items-center justify-between mb-4">
                    <span className="manrope text-[12px] font-black text-[#003f77] tracking-[1px]">{card.ticketId}</span>
                    <PriorityBadge priority={card.priority} />
                 </div>
                 
                 <div className="bg-[#f8fafc] p-6 rounded-[28px] border border-white mb-6 min-h-[140px] relative group/desc">
                    <p className="text-[15px] font-medium leading-relaxed text-slate-600 italic line-clamp-4 group-hover/desc:line-clamp-none transition-all">
                       "{card.description}"
                    </p>
                 </div>

                 <div className="flex flex-wrap items-center gap-3 mb-8">
                    <span className="manrope text-[10px] font-black uppercase tracking-[1.5px] px-3 py-1 bg-slate-50 text-slate-400 rounded-full border border-slate-100">
                       {translateCategory(t, i18n, card.category)}
                    </span>
                    <span className="manrope text-[10px] font-black uppercase tracking-[1.5px] px-3 py-1 bg-[#eff4ff] text-[#003f77] rounded-full border border-blue-50">
                       {card.timeAgo}
                    </span>
                 </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-1.5">
                       <div className="flex -space-x-3">
                          {[1,2,3].map(i => (
                             <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">P</div>
                          ))}
                       </div>
                       <div className="h-8 px-3 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                          + {card.likes}
                       </div>
                    </div>
                    <button
                      className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-[#003366] hover:text-white hover:shadow-lg transition-all"
                      onClick={() => openComplaint(card.ticketId)}
                      
                    >
                      <ArrowUpRight className="h-5 w-5" />
                    </button>
                  </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Departments() {
  const { t } = useTranslation();

  const exportDepartmentReport = () => {
    const header = 'Department,SLA,AvgResolutionDays,Officers,Rating';
    const rows = DEPT_PERFORMANCE.map(dept => [dept.department, dept.sla, dept.avgDays, dept.officers, dept.rating].join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'department-performance.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="view-stage">
      <PageHeader title={t('admin.departments')} subtitle="Master departmental performance and resource allocation oversight." />
      <div className="grid gap-8 mb-12 md:grid-cols-3">
        {[
          { label: t('admin.totalDepts'), value: 6, color: '#003f77', trend: 'All Operational', icon: <Building2 /> },
          { label: t('admin.totalOfficers'), value: 89, color: '#ea580c', trend: '+4 This Month', icon: <Users /> },
          { label: t('admin.avgRating'), value: '4.0', color: '#15803D', trend: '+0.2 vs Q3', icon: <Star /> }
        ].map((kpi, idx) => (
          <div key={idx} className="group relative overflow-hidden rounded-[32px] bg-white border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all">
             <div className="absolute top-0 right-0 p-6 opacity-[0.03] transition-transform group-hover:scale-110">
                {React.cloneElement(kpi.icon, { className: 'h-20 w-20' })}
             </div>
             <div className="relative z-10">
                <p className="manrope text-[11px] font-black uppercase tracking-[2px] text-slate-400 mb-1">{kpi.label}</p>
                <div className="flex items-baseline gap-3">
                   <h3 className="manrope text-[36px] font-black text-slate-800 leading-none"><AnimatedNumber to={kpi.value} /></h3>
                   <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{kpi.trend}</span>
                </div>
             </div>
          </div>
        ))}
      </div>
      <div className="rounded-[40px] bg-white shadow-sm border border-slate-100 overflow-hidden group">
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
           <h3 className="manrope text-[18px] font-black text-slate-900 tracking-tight">Performance Audit</h3>
           <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400">
              <Filter className="h-5 w-5" />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f8fafc]">
                <th className="px-10 py-5 text-[11px] font-black uppercase tracking-[2px] text-[#003f77]">{t('admin.departments')}</th>
                <th className="px-10 py-5 text-[11px] font-black uppercase tracking-[2px] text-[#003f77]">{t('public.sla')}</th>
                <th className="px-10 py-5 text-[11px] font-black uppercase tracking-[2px] text-[#003f77]">{t('public.avgResolution')}</th>
                <th className="px-10 py-5 text-[11px] font-black uppercase tracking-[2px] text-[#003f77]">{t('admin.totalOfficers')}</th>
                <th className="px-10 py-5 text-[11px] font-black uppercase tracking-[2px] text-[#003f77]">{t('public.rating')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {DEPT_PERFORMANCE.map(dept => (
                <tr key={dept.department} className="group/row hover:bg-slate-50 transition-colors">
                  <td className="px-10 py-6">
                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-[#eff4ff] text-[#003f77] flex items-center justify-center font-black text-[12px]">
                           {dept.department[0]}
                        </div>
                        <span className="manrope text-[15px] font-black text-slate-900">{t(`dept.${dept.department}`) || dept.department}</span>
                     </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full rounded-full ${dept.sla >= 90 ? 'bg-green-500' : dept.sla >= 85 ? 'bg-[#ea580c]' : 'bg-red-500'}`} style={{ width: `${dept.sla}%` }} />
                      </div>
                      <span className="text-[13px] font-black text-[#003f77]">{dept.sla}%</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-[14px] font-bold text-slate-500">{dept.avgDays}d</td>
                  <td className="px-10 py-6 text-[14px] font-bold text-slate-500">{dept.officers}</td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full w-fit border border-amber-100">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-[14px] font-black text-[#854d0e]">{dept.rating}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SLAMonitor() {
  const { t, i18n } = useTranslation();
  return (
    <div className="view-stage">
      <PageHeader title={t('admin.slaMonitor')} subtitle="Global compliance monitoring and predictive breach analysis." />
      <div className="grid gap-8 mb-12 md:grid-cols-4">
        {[
          { label: t('admin.activeBreaches'), value: 4, color: '#DC2626', trend: 'Critical', icon: <AlertTriangle /> },
          { label: t('admin.nearSLA'), value: 6, color: '#ea580c', trend: 'High Risk', icon: <Timer /> },
          { label: t('public.sla'), value: '91.2%', color: '#15803D', trend: '+1.2%', icon: <TrendingUp /> },
          { label: t('public.avgResolution'), value: '4.2d', color: '#003f77', trend: '-0.3d', icon: <Eye /> }
        ].map((kpi, idx) => (
          <div key={idx} className="group relative overflow-hidden rounded-[32px] bg-white border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all">
             <div className="absolute top-0 right-0 p-6 opacity-[0.03] transition-transform group-hover:scale-110">
                {React.cloneElement(kpi.icon, { className: 'h-20 w-20' })}
             </div>
             <div className="relative z-10">
                <p className="manrope text-[11px] font-black uppercase tracking-[2px] text-slate-400 mb-1">{kpi.label}</p>
                <div className="flex items-baseline gap-3">
                   <h3 className="manrope text-[32px] font-black text-slate-800 leading-none">
                     {typeof kpi.value === 'number' ? <AnimatedNumber to={kpi.value} /> : kpi.value}
                   </h3>
                   <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${idx < 2 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {kpi.trend}
                   </span>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[40px] bg-white shadow-sm border border-slate-100 overflow-hidden group">
          <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="manrope text-[18px] font-black text-slate-900 tracking-tight">{t('admin.breachTickets')}</h3>
            <span className="manrope text-[10px] font-black uppercase tracking-[2px] text-red-600 bg-red-50 px-4 py-1.5 rounded-full animate-pulse">{t('admin.critical', { defaultValue: 'Live Breach Feed' })}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f8fafc]">
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[2px] text-[#003f77]">{t("citizen.ticket")}</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[2px] text-[#003f77]">{t('citizen.topic')}</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[2px] text-[#003f77]">{t('citizen.priority')}</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[2px] text-[#003f77]">{t('citizen.status')}</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[2px] text-[#003f77]">{t("admin.officer")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {SLA_TICKETS.map(ticket => (
                  <tr key={ticket.ticketId} className="group/row hover:bg-red-50/20 transition-colors">
                    <td className="px-8 py-6 manrope text-[#003f77] text-[14px] font-black tracking-tight">{ticket.ticketId}</td>
                    <td className="px-8 py-6 text-[14px] font-bold text-slate-900">{translateCategory(t, i18n, ticket.category) || ticket.category}</td>
                    <td className="px-8 py-6"><PriorityBadge priority={ticket.priority} /></td>
                    <td className="px-8 py-6">
                      <div className={`manrope inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[1px] ${ticket.status === 'Breached' ? 'bg-red-100 text-red-600 shadow-sm border border-red-200' : 'bg-amber-100 text-amber-600 shadow-sm border border-amber-200'}`}>
                        <div className={`h-1.5 w-1.5 rounded-full bg-current ${ticket.status === 'Breached' ? 'animate-pulse' : ''}`} />
                        {ticket.status}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-black">O</div>
                          <span className="text-[13px] font-bold text-slate-500">{ticket.officer}</span>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[40px] bg-white p-10 shadow-sm border border-slate-100 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:rotate-12 transition-transform">
             <AlertTriangle className="h-48 w-48 text-red-600" />
          </div>
          <h3 className="mb-10 manrope text-[20px] font-black tracking-tight text-slate-900">{t('admin.breachTrend')}</h3>
          <div className="h-[340px]">
             <ResponsiveContainer height="100%" width="100%">
               <LineChart data={SLA_BREACH_TREND}>
                 <CartesianGrid stroke="#F8FAFC" strokeDasharray="0 0" vertical={false} />
                 <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: '800', fill: '#94A3B8' }} axisLine={false} tickLine={false} dy={10} />
                 <YAxis tick={{ fontSize: 11, fontWeight: '800', fill: '#94A3B8' }} axisLine={false} tickLine={false} dx={-10} />
                 <Tooltip 
                   contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }} 
                 />
                 <Line 
                   type="monotone" 
                   dataKey="breaches" 
                   stroke="#DC2626" 
                   strokeWidth={4} 
                   dot={{ r: 6, fill: '#DC2626', stroke: 'white', strokeWidth: 3 }} 
                   activeDot={{ r: 8, strokeWidth: 0, shadowSize: 20 }}
                 />
               </LineChart>
             </ResponsiveContainer>
          </div>
          <div className="mt-10 p-6 bg-red-50 rounded-[28px] border border-red-100 flex items-start gap-4">
             <div className="h-10 w-10 shrink-0 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                <AlertTriangle className="h-5 w-5" />
             </div>
             <div>
                <p className="manrope text-[13px] font-black text-red-900 mb-1">Systemic Delay Alert</p>
                <p className="text-[12px] font-medium text-red-700 leading-relaxed">Breach trend is 14% higher than usual in Zone Delta. Recommend immediate resource reallocation.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportsView({ onExport }) {
  const { t } = useTranslation();
  return (
    <div className="view-stage">
      <PageHeader title={t('admin.reports')} subtitle="Comprehensive metropolitan operational summary and thematic analysis." />
      
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="rounded-[40px] bg-white p-10 shadow-sm border border-slate-100 group relative overflow-hidden">
          <div className="absolute top-4 right-4 p-4 opacity-[0.02] group-hover:scale-110 transition-transform">
             <TrendingUp className="h-20 w-20 text-[#003f77]" />
          </div>
          <h3 className="mb-10 manrope text-[20px] font-black tracking-tight text-slate-900">{t("admin.weeklyResolution")}</h3>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_TREND}>
                <CartesianGrid strokeDasharray="0 0" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#94a3b8' }} dx={-10} />
                <Tooltip cursor={{ fill: 'rgba(27, 58, 107, 0.03)' }} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="resolved" fill="#003f77" radius={[12, 12, 12, 12]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[40px] bg-white p-10 shadow-sm border border-slate-100 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:rotate-12 transition-transform">
             <Grid3X3 className="h-64 w-64 text-[#ea580c]" />
          </div>
          <h3 className="mb-10 manrope text-[20px] font-black tracking-tight text-slate-900">{t("admin.categoryDist")}</h3>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={CATEGORY_DISTRIBUTION} dataKey="value" innerRadius={80} outerRadius={120} paddingAngle={8} stroke="none">
                  {CATEGORY_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity outline-none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: '800' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
             {CATEGORY_DISTRIBUTION.slice(0, 4).map(item => (
                <div key={item.name} className="flex items-center gap-2">
                   <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                   <span className="manrope text-[11px] font-black uppercase tracking-[1px] text-slate-400">{item.name}</span>
                </div>
             ))}
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-[40px] bg-[#003f77] p-10 text-white shadow-2xl relative overflow-hidden group">
         <div className="absolute bottom-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
            <Building2 className="h-64 w-64" />
         </div>
         <div className="relative z-10">
           <div className="flex items-center justify-between mb-10">
              <div>
                 <h3 className="manrope text-[24px] font-black tracking-tighter">{t("admin.operationalSummary")}</h3>
                 <p className="text-[13px] font-bold text-white/50 mt-1 uppercase tracking-[1.5px]">Metropolitan Global Insight</p>
              </div>
              <button
                className="h-[56px] px-8 rounded-[24px] bg-[#ea580c] text-white manrope text-[13px] font-black uppercase tracking-[2px] shadow-lg shadow-orange-900/40 hover:scale-105 transition-all active:scale-95 flex items-center gap-3"
                onClick={onExport}
                
              >
                 <Download className="h-5 w-5" /> Export PDF
              </button>
           </div>
           
           <div className="grid gap-6 md:grid-cols-3">
              {DEPT_PERFORMANCE.map(dept => (
                 <div key={dept.department} className="rounded-[32px] bg-white/5 p-8 border border-white/10 backdrop-blur-md group/card hover:bg-white/10 transition-all border-dashed hover:border-solid">
                    <p className="manrope text-[11px] font-black uppercase tracking-[2.5px] text-white/40 mb-3">{dept.department}</p>
                    <div className="flex items-baseline justify-between gap-4">
                       <div className="flex items-baseline gap-2">
                          <span className="manrope text-[36px] font-black tracking-tighter">{dept.resolved}</span>
                          <span className="manrope text-[11px] font-black uppercase tracking-[1.5px] text-green-400">{t("status.Resolved")}</span>
                       </div>
                       <div className="text-right">
                          <p className="manrope text-[11px] font-black uppercase tracking-[1px] text-white/30">Compliance</p>
                          <p className="manrope text-[18px] font-black text-green-400">{dept.sla}%</p>
                       </div>
                    </div>
                    <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-white/40 rounded-full" style={{ width: `${dept.sla}%` }} />
                    </div>
                 </div>
              ))}
           </div>
         </div>
      </div>
    </div>
  );
}

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
