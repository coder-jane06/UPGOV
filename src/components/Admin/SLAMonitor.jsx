import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Clock3 as Timer, TrendingUp, Eye } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader, PriorityBadge, AnimatedNumber } from '../../Shared.jsx';
import { translateCategory } from '../../i18n/helpers.js';
import { SLA_TICKETS, SLA_BREACH_TREND } from '../../data.js';

export default function SLAMonitor() {
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
