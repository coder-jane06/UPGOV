import React, { useMemo } from 'react';
import { ArrowLeft, BarChart3, Clock3, Star, TrendingUp, Users, Leaf, Globe, CheckCircle2, ChevronDown, MapPin, Building2, Target } from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { HeaderBrand, PublicUtilityBar, AnimatedNumber } from './Shared.jsx';
import { translateCategory, translateDepartment } from './i18n/helpers.js';
import { CATEGORY_DISTRIBUTION, DEPT_PERFORMANCE, MONTHLY_TREND } from './data.js';
import { motion } from 'framer-motion';

function AshokaChakra() {
  return (
    <svg aria-hidden="true" className="h-[400px] w-[400px] origin-center animate-[spin_60s_linear_infinite] opacity-[0.03]" fill="none" viewBox="0 0 240 240">
      <circle cx="120" cy="120" r="78" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="120" cy="120" r="8" fill="currentColor" />
      {Array.from({ length: 24 }).map((_, index) => {
        const angle = (index * 15 * Math.PI) / 180;
        const x = 120 + Math.cos(angle) * 78;
        const y = 120 + Math.sin(angle) * 78;
        return <line key={index} stroke="currentColor" strokeWidth="0.8" x1="120" x2={x} y1="120" y2={y} />;
      })}
    </svg>
  );
}

export default function PublicDashboard({ onBack }) {
  const { t, i18n } = useTranslation();

  const totalFiled = MONTHLY_TREND.reduce((acc, curr) => acc + curr.filed, 0) + 12450;
  const totalResolved = MONTHLY_TREND.reduce((acc, curr) => acc + curr.resolved, 0) + 11840;
  const avgSLA = (DEPT_PERFORMANCE.reduce((acc, curr) => acc + curr.sla, 0) / DEPT_PERFORMANCE.length).toFixed(1);
  
  const localizedCategoryDistribution = useMemo(
    () => CATEGORY_DISTRIBUTION.map(entry => ({ ...entry, name: translateCategory(t, i18n, entry.name) })),
    [i18n, t]
  );
  
  const localizedDeptPerformance = useMemo(
    () => DEPT_PERFORMANCE.map(entry => ({ ...entry, department: translateDepartment(t, i18n, entry.department) })),
    [i18n, t]
  );

   const exportAuditReport = () => {
      const header = 'Department,Resolved,SLA,Rating';
      const rows = localizedDeptPerformance.map(dept => [dept.department, dept.resolved, dept.sla, dept.rating].join(','));
      const csv = [header, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'public-audit-report.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
   };

  const PUBLIC_STATS = [
    { icon: <Target className="h-6 w-6" />, label: t('public.totalFiled'), value: totalFiled, color: '#003366', trend: '+12% vs LY' },
    { icon: <CheckCircle2 className="h-6 w-6" />, label: t('public.totalResolved'), value: totalResolved, color: '#15803D', trend: 'Efficient' },
    { icon: <Clock3 className="h-6 w-6" />, label: t('public.avgResolution'), value: '4.2d', color: '#ff9933', trend: '-1.1d' },
    { icon: <Star className="h-6 w-6" />, label: t('public.satisfaction'), value: '4.1', color: '#854d0e', trend: '+0.4' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] manrope">
      <div className="fixed inset-x-0 top-0 z-[100] shadow-sm">
        <PublicUtilityBar />
        <header className="flex w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
          <HeaderBrand
            className="min-w-0"
            subtitle={t('landing.subtitle')}
            title="UPGOV"
            titleClassName="text-[#003366]"
          />
          {onBack && (
            <button type="button" 
               onClick={onBack}
               className="flex h-10 items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-4 text-[13px] font-black text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{t('nav.backToLanding')}</span>
            </button>
          )}
        </header>
      </div>

      <section className="relative mt-[112px] min-h-[460px] flex flex-col items-center justify-center overflow-hidden bg-[#002244] px-6 py-20 text-center text-white">
        <div className="absolute inset-0 z-0 select-none overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 text-blue-400">
             <AshokaChakra />
           </div>
           <div className="absolute top-0 right-0 h-64 w-64 bg-cyan-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
           <div className="absolute bottom-0 left-0 h-96 w-96 bg-blue-600/10 rounded-full blur-[120px] -ml-48 -mb-48" />
        </div>

        <motion.div 
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           className="relative z-10 mx-auto max-w-4xl flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2.5 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 mb-8 backdrop-blur-md">
             <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
             <span className="text-[11px] font-black uppercase tracking-[2.5px] text-white/80">{t('public.govLabel')}</span>
          </div>
          <h1 className="text-[clamp(2.5rem,8vw,4.5rem)] font-black leading-[1.05] tracking-tighter text-white mb-6">
            {t('public.title')}
          </h1>
          <p className="mt-4 max-w-2xl text-[18px] font-medium text-blue-100/70 leading-relaxed mb-12">
            {t('public.subtitle')}
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
             {[
               { icon: <Users />, label: '6.96 Cr Registered' },
               { icon: <Building2 />, label: '12 Departments' },
               { icon: <MapPin />, label: 'Zone Operations Live' }
             ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-xl">
                   <div className="text-blue-300 [&>svg]:h-4 [&>svg]:w-4">{item.icon}</div>
                   <span className="text-[13px] font-black tracking-tight text-white">{item.label}</span>
                </div>
             ))}
          </div>
        </motion.div>
      </section>

      <main className="relative z-20 mx-auto -mt-16 max-w-[1400px] px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {PUBLIC_STATS.map((stat, idx) => (
            <motion.div 
               key={idx}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: idx * 0.1 }}
               className="group relative overflow-hidden rounded-[32px] bg-white p-8 shadow-sm border border-slate-100 hover:shadow-2xl transition-all"
            >
               <div className="absolute top-4 right-4 p-4 opacity-[0.03] transition-transform group-hover:scale-110" style={{ color: stat.color }}>
                  {React.cloneElement(stat.icon, { className: 'h-16 w-16' })}
               </div>
               <div className="relative z-10 text-center flex flex-col items-center">
                  <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-slate-200" style={{ background: stat.color, color: 'white' }}>
                    {stat.icon}
                  </div>
                  <h3 className="manrope text-[36px] font-black text-slate-800 leading-none mb-2">
                    <AnimatedNumber to={stat.value} />
                    {typeof stat.value === 'string' && stat.value.includes('.') ? stat.value : ''}
                  </h3>
                  <p className="text-[11px] font-black uppercase tracking-[2px] text-slate-400 mb-4">{stat.label}</p>
                  <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">{stat.trend}</span>
               </div>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] mb-12">
          <div className="rounded-[40px] bg-white shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
               <h3 className="manrope text-[18px] font-black text-slate-900 tracking-tight">{t('public.departmentPerformance')}</h3>
                      <button
                         className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-[11px] font-black uppercase tracking-[1px] text-slate-500 shadow-sm"
                         onClick={exportAuditReport}
                         
                      >
                         Audit Reports
                      </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#f8fafc]">
                    <th className="px-10 py-5 text-[11px] font-black uppercase tracking-[2px] text-[#003366]">{t('public.department')}</th>
                    <th className="px-10 py-5 text-[11px] font-black uppercase tracking-[2px] text-[#003366]">{t('public.resolved')}</th>
                    <th className="px-10 py-5 text-[11px] font-black uppercase tracking-[2px] text-[#003366]">{t('public.slaCompliance')}</th>
                    <th className="px-10 py-5 text-[11px] font-black uppercase tracking-[2px] text-[#003366]">{t('public.rating')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {localizedDeptPerformance.map(dept => (
                    <tr key={dept.department} className="group/row hover:bg-slate-50 transition-colors">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 rounded-xl bg-[#eff4ff] text-[#003366] flex items-center justify-center font-black text-[12px]">
                              {dept.department[0]}
                           </div>
                           <span className="text-[15px] font-black text-slate-800">{dept.department}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className="text-[14px] font-bold text-slate-600">{dept.resolved.toLocaleString()}</span>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                           <div className="h-1.5 w-32 rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full" style={{ width: `${dept.sla}%` }} />
                           </div>
                           <span className="text-[13px] font-black text-[#003366]">{dept.sla}%</span>
                        </div>
                      </td>
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

          <div className="rounded-[40px] bg-white p-10 shadow-sm border border-slate-100 group relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:scale-110 transition-transform">
                <BarChart3 className="h-64 w-64 text-[#ff9933]" />
             </div>
             <h3 className="mb-10 manrope text-[20px] font-black tracking-tight text-slate-900">{t('public.topCategories')}</h3>
             <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie data={localizedCategoryDistribution} dataKey="value" innerRadius={80} outerRadius={120} paddingAngle={8} stroke="none">
                         {localizedCategoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity outline-none" />
                         ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: '800' }} />
                   </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="mt-8 flex flex-wrap justify-center gap-4">
                {localizedCategoryDistribution.slice(0, 4).map(item => (
                   <div key={item.name} className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                      <span className="text-[11px] font-black uppercase tracking-[1px] text-slate-400">{item.name}</span>
                   </div>
                ))}
             </div>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
           <div className="rounded-[40px] bg-white p-10 shadow-sm border border-slate-100 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:rotate-12 transition-transform">
                 <TrendingUp className="h-64 w-64 text-[#003f77]" />
              </div>
              <h3 className="mb-10 manrope text-[20px] font-black tracking-tight text-slate-900">{t('public.resolutionTrend')}</h3>
              <div className="h-[340px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MONTHLY_TREND}>
                       <CartesianGrid stroke="#F8FAFC" vertical={false} strokeDasharray="0 0" />
                       <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: '800', fill: '#94A3B8' }} axisLine={false} tickLine={false} dy={10} />
                       <YAxis tick={{ fontSize: 11, fontWeight: '800', fill: '#94A3B8' }} axisLine={false} tickLine={false} dx={-10} />
                       <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }} />
                       <Line type="monotone" dataKey="filed" name={t('public.received')} stroke="#003f77" strokeWidth={4} dot={{ r: 6, fill: '#003f77', stroke: 'white', strokeWidth: 3 }} activeDot={{ r: 8, strokeWidth: 0, shadowSize: 20 }} />
                       <Line type="monotone" dataKey="resolved" name={t('public.resolved')} stroke="#16a34a" strokeWidth={4} dot={{ r: 6, fill: '#16a34a', stroke: 'white', strokeWidth: 3 }} activeDot={{ r: 8, strokeWidth: 0, shadowSize: 20 }} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="space-y-8">
              <div className="rounded-[40px] bg-[#FFF5F5] p-10 shadow-sm border border-red-100 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform text-red-600">
                    <BarChart3 className="h-48 w-48" />
                 </div>
                 <h3 className="mb-6 text-[14px] font-black uppercase tracking-[2px] text-red-900/50">{t('public.mostComplainedZone')}</h3>
                 <div className="flex items-center gap-6 mb-8">
                    <div className="h-16 w-16 rounded-2xl bg-white shadow-xl flex items-center justify-center text-red-600">
                       <MapPin className="h-8 w-8" />
                    </div>
                    <div>
                       <h4 className="text-[32px] font-black text-red-700 leading-none mb-1">{t('public.hotspotZone')}</h4>
                       <p className="text-[13px] font-bold text-red-500">Regional Monitoring Active</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-[13px] font-bold">
                       <span className="text-red-900/60 uppercase tracking-[1px]">{t('public.activeComplaintsCount', { count: '' })}</span>
                       <span className="text-red-700 text-[18px] font-black">55</span>
                    </div>
                    <div className="h-2 w-full bg-red-200 rounded-full overflow-hidden">
                       <div className="h-full bg-red-600 rounded-full" style={{ width: '75%' }} />
                    </div>
                 </div>
              </div>

              <div className="rounded-[40px] bg-white p-10 shadow-sm border border-slate-100 group relative overflow-hidden">
                 <h3 className="mb-8 manrope text-[18px] font-black text-slate-800 tracking-tight">{t('public.topResolutionUnits')}</h3>
                 <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={localizedDeptPerformance.slice(0, 4)}>
                          <Bar dataKey="resolved" fill="#003f77" radius={[12, 12, 12, 12]} barSize={48} />
                          <Tooltip cursor={{ fill: 'rgba(0, 63, 119, 0.03)' }} contentStyle={{ borderRadius: '24px', border: 'none' }} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-8 py-16 text-center">
         <div className="mx-auto max-w-4xl flex flex-col items-center">
            <HeaderBrand className="mb-8 opacity-40 grayscale" markSize="sm" title="UPGOV" />
            <p className="text-[13px] font-bold text-slate-400 max-w-lg mb-8">{t('public.footerCopyright')}</p>
            <div className="flex flex-wrap justify-center gap-8">
               {[t('public.privacyPolicy'), t('public.terms'), t('public.contactSupport')].map(link => (
                  <a key={link} href="#" className="text-[11px] font-black uppercase tracking-[2px] text-slate-500 hover:text-[#003366] transition-colors">{link}</a>
               ))}
            </div>
         </div>
      </footer>
    </div>
  );
}