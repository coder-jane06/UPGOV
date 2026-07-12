import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export default function LiveTicker({ liveFeed = [] }) {
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
