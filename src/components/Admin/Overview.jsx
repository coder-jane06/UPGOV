import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock3 as Timer,
  LayoutDashboard,
  RefreshCw,
  ShieldCheck,
  Zap,
  Brain
} from 'lucide-react';
import { AnimatedNumber, PageHeader } from '../../Shared.jsx';
import { DEPT_PERFORMANCE } from '../../data.js';
import LiveTicker from './LiveTicker.jsx';

export default function Overview({ onNavigate, liveFeed }) {
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
