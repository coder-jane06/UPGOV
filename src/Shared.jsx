import React, { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, CircleAlert, LogOut, Menu, UserRound, Globe, ChevronDown, CheckCircle2, PhoneCall, Mail, Linkedin, Instagram, Twitter, Facebook, Camera, AlertTriangle, TrendingUp, Star, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { translatePriority, translateStatus } from './i18n/helpers.js';

const ROLE_META = {
  citizen: { badge: '#003366', avatar: '#003366' },
  officer: { badge: '#15803D', avatar: '#15803D' },
  admin: { badge: '#003366', avatar: '#002244' },
};

function getInitials(name) {
  return String(name || 'User').split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('');
}

export function GovSeal({ size = 28, className = '' }) {
  return (
    <svg aria-hidden="true" className={`origin-center animate-[spin_15s_linear_infinite] ${className}`} fill="none" height={size} viewBox="0 0 64 64" width={size}>
      <circle cx="32" cy="32" r="29" stroke="currentColor" strokeOpacity="0.9" strokeWidth="2.8" />
      <circle cx="32" cy="32" r="22" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.8" />
      <circle cx="32" cy="32" r="4" fill="currentColor" />
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i * 15 * Math.PI) / 180;
        return <line key={i} stroke="currentColor" strokeLinecap="round" strokeOpacity="0.8" strokeWidth="1.5" x1="32" x2={32 + Math.cos(a) * 22} y1="32" y2={32 + Math.sin(a) * 22} />;
      })}
    </svg>
  );
}

export function AshokaChakra({ className = '' }) {
  return (
    <svg aria-hidden="true" className={`origin-center animate-[spin_12s_linear_infinite] ${className}`} fill="none" viewBox="0 0 240 240">
      <circle cx="120" cy="120" r="78" stroke="currentColor" strokeWidth="4.5" />
      <circle cx="120" cy="120" r="8" fill="currentColor" />
      {Array.from({ length: 24 }).map((_, index) => {
        const angle = (index * 15 * Math.PI) / 180;
        const x = 120 + Math.cos(angle) * 78;
        const y = 120 + Math.sin(angle) * 78;
        return <line key={index} stroke="currentColor" strokeWidth="2.2" x1="120" x2={x} y1="120" y2={y} />;
      })}
    </svg>
  );
}

const BRAND_MARK_SIZES = {
  sm: { shell: 'h-9 w-9', seal: 32 },
  md: { shell: 'h-10 w-10', seal: 37 },
  lg: { shell: 'h-14 w-14', seal: 50 },
};

export function BrandMark({ light = false, size = 'md', className = '' }) {
  const cfg = BRAND_MARK_SIZES[size] || BRAND_MARK_SIZES.md;
  return (
    <div className={`flex shrink-0 items-center justify-center ${cfg.shell} ${className}`}>
      <GovSeal className={light ? 'text-white' : 'text-[var(--primary)]'} size={cfg.seal} />
    </div>
  );
}

export function HeaderBrand({ title = 'UPGOV', subtitle, light = false, className = '', titleClassName = '', subtitleClassName = '', markSize = 'md', hideSubtitleOnMobile = true }) {
  const titleTone = light ? 'text-white' : 'text-[var(--primary)]';
  const subtitleTone = light ? 'text-white/68' : 'text-slate-500';
  return (
    <div className={`flex min-w-0 items-center gap-2 sm:items-start ${className}`}>
      <BrandMark className="-mt-0.5 sm:-mt-1" light={light} size={markSize} />
      <div className="min-w-0">
        <p className={`truncate text-[17px] font-black leading-none tracking-tight sm:text-[20px] ${titleTone} ${titleClassName}`}>{title}</p>
        {subtitle && (
          <p className={`mt-0.5 truncate text-[10px] font-semibold leading-[1.2] sm:text-[11px] ${hideSubtitleOnMobile ? 'hidden sm:block' : ''} ${subtitleTone} ${subtitleClassName}`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export function PublicUtilityBar() {
  const { t, i18n } = useTranslation();
  return (
    <div className="h-10 border-b border-cyan-300/15 bg-[#002244] text-white">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-3 px-3 sm:px-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-4 sm:gap-6 text-[12px] font-medium text-white/90">
           <div className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors">
             <PhoneCall className="h-3.5 w-3.5" />
             <span>1800-XXXX-XXX</span>
           </div>
           <div className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors">
             <Mail className="h-3.5 w-3.5" />
             <span>upgov@gmail.com</span>
           </div>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 border-r border-white/20 pr-4">
             <a href="#" className="text-white/80 hover:text-white transition-colors" aria-label="Facebook"><Facebook className="h-4 w-4" /></a>
             <a href="#" className="text-white/80 hover:text-white transition-colors" aria-label="Twitter"><Twitter className="h-4 w-4" /></a>
             <a href="#" className="text-white/80 hover:text-white transition-colors" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
             <a href="#" className="text-white/80 hover:text-white transition-colors" aria-label="LinkedIn"><Linkedin className="h-4 w-4" /></a>
          </div>
          <div className="flex items-center">
             <select value={i18n.language} onChange={(e) => i18n.changeLanguage(e.target.value)} className="bg-transparent text-[12px] font-bold text-white outline-none cursor-pointer appearance-none pr-4 relative">
               <option value="en" className="text-slate-900">English</option>
               <option value="hi" className="text-slate-900">हिन्दी</option>
             </select>
             <ChevronDown className="h-3 w-3 text-white -ml-3 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Navbar({ role, user, onToggleSidebar, onBack }) {
  const { t, i18n } = useTranslation();
  const meta = ROLE_META[role] || ROLE_META.citizen;
  const languages = [{ code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' }];

  return (
    <header className="fixed inset-x-0 top-0 z-[60] h-14 bg-slate-900 border-b border-white/5 shadow-xl lg:h-16">
      <div className="flex h-full items-center justify-between px-3 sm:px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white shadow-sm transition-colors hover:bg-white/10 lg:hidden" onClick={onToggleSidebar}>
            <Menu className="h-5 w-5" />
          </button>
          <HeaderBrand className="max-w-[210px] sm:max-w-none" hideSubtitleOnMobile light subtitle={t('landing.subtitle')} title="UPGOV" />
          <button onClick={onBack} className="flex h-9 items-center gap-2 rounded-lg bg-white/5 px-3 sm:px-4 text-[12px] sm:text-[13px] font-bold text-slate-300 transition-colors hover:bg-white/10 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t('nav.backToRole')}</span>
            <span className="sm:hidden">{t('nav.back')}</span>
          </button>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
          <div className="group relative">
            <button className="flex h-9 items-center gap-2 rounded-lg bg-white/5 px-3 sm:px-4 text-[12px] font-bold text-slate-300 transition-colors hover:bg-white/10 hover:text-white">
              <Globe className="h-4 w-4" />
              <span className="uppercase">{i18n.language?.split('-')[0] || 'EN'}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-50 transition-transform group-hover:rotate-180" />
            </button>
            <div className="absolute right-0 top-full hidden w-40 pt-2 group-hover:block">
               <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-2xl">
                 {languages.map(l => (
                    <button key={l.code} onClick={() => i18n.changeLanguage(l.code)} className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] font-bold rounded-lg transition-colors ${i18n.language === l.code ? 'bg-slate-100 text-[var(--primary)]' : 'text-slate-600 hover:bg-slate-50'}`}>
                      {l.label}
                      {i18n.language === l.code && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </button>
                 ))}
               </div>
            </div>
          </div>
          <div className="hidden h-8 w-[1px] bg-white/10 sm:block" />
          <div className="flex items-center gap-3">
            <div className="hidden text-right lg:block">
              <p className="text-[12px] font-black text-white">{user}</p>
              <p className="text-[10px] font-bold uppercase tracking-[1px] text-white/50">{t(`roles.${role}.title`)}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full text-white shadow-inner" style={{ background: meta.avatar }}>
               <span className="text-[13px] font-black">{getInitials(user)}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export function Sidebar({ items, active, onSelect, open, onClose, role, userName, onLogout }) {
  const { t } = useTranslation();
  const meta = ROLE_META[role] || ROLE_META.citizen;
  return (
    <>
      <AnimatePresence>
        {open && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[45] bg-black/40 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      </AnimatePresence>
      <aside className={`fixed top-14 bottom-0 z-[50] w-[260px] bg-slate-900/95 backdrop-blur-xl border-r border-white/5 shadow-2xl transition-transform lg:transition-none lg:top-16 lg:bottom-0 overflow-y-auto lg:translate-x-0 group left-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full py-6">
          <p className="mb-4 px-6 text-[10px] font-black uppercase tracking-[2px] text-slate-500">{t('nav.navigation')}</p>
          <nav className="flex-1 space-y-1 px-3">
             {items.map(item => {
               const isActive = active === item.id;
               return (
                 <button key={item.id} onClick={() => { onSelect(item.id); onClose(); }} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-bold transition-all border ${isActive ? 'bg-slate-800/80 text-white shadow-lg border-amber-500/50 shadow-amber-500/10' : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}>
                    {React.cloneElement(item.icon, { className: `h-5 w-5 ${isActive ? 'text-amber-500' : 'text-slate-400'}` })}
                    <span>{t(item.labelKey || `nav.${item.id}`)}</span>
                 </button>
               );
             })}
          </nav>
          <div className="mt-auto px-4 pb-4">
             <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/5 p-4 border border-white/5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-md" style={{ background: meta.avatar }}>
                   <span className="text-[14px] font-bold">{getInitials(userName)}</span>
                </div>
                <div className="min-w-0">
                   <p className="truncate text-[13px] font-black text-white">{userName}</p>
                   <p className="text-[10px] font-bold uppercase text-slate-400">{t(`roles.${role}.title`)}</p>
                </div>
             </div>
             <button onClick={onLogout} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white/5 text-[13px] font-bold text-slate-300 transition-colors hover:bg-red-500/10 hover:text-red-400">
                <LogOut className="h-4 w-4" />
                {t('nav.logout')}
             </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export function DashboardShell({ role, userName, items, activePage, onPageChange, onLogout, onBack, children, mainClassName = '' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#f8fafc]">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-slate-100/30 pointer-events-none" />
      <Navbar role={role} user={userName} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} onBack={onBack} />
      <div className="flex min-w-0 flex-1 pt-14 lg:pt-16 lg:pl-[260px] relative z-10">
        <Sidebar active={activePage} items={items} onClose={() => setSidebarOpen(false)} onLogout={onLogout} onSelect={onPageChange} open={sidebarOpen} role={role} userName={userName} />
        <main className={`min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-10 ${mainClassName}`} id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export function KPICard({ icon, label, value, sub, color = 'var(--primary)', trend, trendTone = 'var(--success)' }) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition-shadow hover:shadow-md">
       <div className="absolute top-4 right-4 h-12 w-12 opacity-[0.05] pointer-events-none" style={{ color }}>{icon}</div>
       <div className="relative z-10">
          <p className="text-[12px] font-bold uppercase tracking-[1px] text-slate-400">{label}</p>
          <div className="mt-1 flex items-baseline gap-2">
             <span className="text-[28px] sm:text-[32px] font-black tracking-tight text-slate-900">{value}</span>
             {trend && <span className="text-[12px] font-bold" style={{ color: trendTone }}>{trend}</span>}
          </div>
          {sub && <p className="mt-1 text-[13px] font-medium text-slate-500">{sub}</p>}
       </div>
    </div>
  );
}

export function PriorityBadge({ priority, className = '' }) {
  const { t, i18n } = useTranslation();
  const tokens = {
    Critical: { bg: '#FEE2E2', text: '#991B1B' },
    High: { bg: '#FFF7ED', text: '#ff9933' },
    Medium: { bg: '#EFF6FF', text: '#003366' },
    Low: { bg: '#F0FDF4', text: '#166534' },
    'गंभीर': { bg: '#FEE2E2', text: '#991B1B' },
    'उच्च': { bg: '#FFF7ED', text: '#ff9933' },
    'मध्यम': { bg: '#EFF6FF', text: '#003366' },
    'निम्न': { bg: '#F0FDF4', text: '#166534' }
  };
  const tone = tokens[priority] || tokens.Medium;
  return (
    <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.5px] ${className}`} style={{ backgroundColor: tone.bg, color: tone.text }}>
      {translatePriority(t, i18n, priority)}
    </span>
  );
}

export function StatusBadge({ status }) {
  const { t, i18n } = useTranslation();
  const tones = {
    Filed: { bg: '#F1F5F9', text: '#475569' },
    'AI Classified': { bg: '#F1F5F9', text: '#475569' },
    Assigned: { bg: '#EFF6FF', text: '#2563EB' },
    Verified: { bg: '#F0FDF4', text: '#15803D' },
    'Verified On-Site': { bg: '#F0FDF4', text: '#15803D' },
    'In Progress': { bg: '#FFF7ED', text: '#C2410C' },
    Resolved: { bg: '#F0FDF4', text: '#166534' },
    'SLA Breached': { bg: '#FEF2F2', text: '#DC2626' },
    'दर्ज': { bg: '#F1F5F9', text: '#475569' },
    'AI वर्गीकृत': { bg: '#F1F5F9', text: '#475569' },
    'नियत': { bg: '#EFF6FF', text: '#2563EB' },
    'ऑन-साइट सत्यापित': { bg: '#F0FDF4', text: '#15803D' },
    'प्रगति में': { bg: '#FFF7ED', text: '#C2410C' },
    'समाधान': { bg: '#F0FDF4', text: '#166534' }
  };
  const tone = tones[status] || tones.Filed;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold" style={{ backgroundColor: tone.bg, color: tone.text }}>
       <span className="h-1.5 w-1.5 rounded-full bg-current" />
       {translateStatus(t, i18n, status)}
    </span>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-[28px] sm:text-[32px] font-black tracking-tight text-slate-900">{title}</h2>
        {subtitle && <p className="mt-1 text-[15px] font-medium text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function DepartmentBadge({ label }) {
  return (
    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[11px] font-black uppercase tracking-[0.5px] text-slate-600">
      {label}
    </span>
  );
}

export function SectionSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-48 animate-pulse rounded-3xl bg-slate-100" />
      ))}
    </div>
  );
}

export function ErrorCard({ title, message }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-red-100 bg-red-50 p-6">
       <CircleAlert className="h-6 w-6 text-red-600" />
       <div className="flex-1">
          <h4 className="text-[17px] font-bold text-red-900">{title}</h4>
          <p className="mt-1 text-[14px] text-red-700">{message}</p>
       </div>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[var(--primary)] border-t-transparent" />
    </div>
  );
}

export function InlineSpinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-transparent" />;
}

export function AnimatedNumber({ to, value }) {
  const target = to ?? value ?? 0;
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (typeof target !== 'number') { setDisplay(target); return; }
    let start = performance.now();
    const duration = 900;
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return <span>{typeof target === 'number' ? display.toLocaleString() : display}</span>;
}
