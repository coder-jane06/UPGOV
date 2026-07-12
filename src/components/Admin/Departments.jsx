import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Users, Star, Filter } from 'lucide-react';
import { PageHeader, AnimatedNumber } from '../../Shared.jsx';
import { DEPT_PERFORMANCE } from '../../data.js';

export default function Departments() {
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
