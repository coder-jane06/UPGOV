import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';
import { PageHeader, PriorityBadge } from '../../Shared.jsx';
import { translateCategory } from '../../i18n/helpers.js';
import { ACTIVITY_HEATMAP_DATA, ADMIN_COMPLAINT_CARDS } from '../../data.js';

export default function ComplaintCards() {
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
