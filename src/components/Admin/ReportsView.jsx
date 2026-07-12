import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Grid3X3, Building2, Download } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '../../Shared.jsx';
import { DEPT_PERFORMANCE, MONTHLY_TREND, CATEGORY_DISTRIBUTION } from '../../data.js';

export default function ReportsView({ onExport }) {
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
