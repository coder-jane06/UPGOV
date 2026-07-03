import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Brain,
  Building2,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Users,
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  MessagesSquare,
  Mail,
  PhoneCall,
  MapPin,
  GraduationCap,
  Linkedin,
  Instagram,
  Twitter,
  X,
  ClipboardCheck,
  HardHat,
  GanttChartSquare,
  ArrowLeft,
  Eye,
  EyeOff,
  UserRound
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { HeaderBrand, PublicUtilityBar, BrandMark, GovSeal, AshokaChakra } from './Shared.jsx';
import FlipCard from './components/ui/flip-card.jsx';


function WhatsAppGlyph({ className = '' }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M20 11.65c0 4.59-3.76 8.35-8.35 8.35-1.36 0-2.64-.32-3.79-.95L4 20.15l1.19-3.46a8.27 8.27 0 0 1-1.89-5.04c0-4.59 3.76-8.35 8.35-8.35S20 7.06 20 11.65Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
      <path
        d="M9.25 8.52c-.15-.33-.3-.34-.43-.35h-.37c-.13 0-.35.05-.53.23-.18.18-.67.66-.67 1.6 0 .94.69 1.84.79 1.98.09.13 1.34 2.16 3.27 2.92 1.6.63 1.92.5 2.27.47.35-.03 1.12-.44 1.26-.9.15-.44.15-.81.11-.89-.04-.08-.17-.13-.37-.23-.19-.09-1.12-.56-1.29-.63-.17-.06-.29-.09-.43.11-.13.19-.49.62-.61.75-.11.13-.22.15-.41.05-.19-.1-.8-.29-1.52-.92-.56-.5-.94-1.11-1.05-1.29-.11-.19-.01-.29.08-.39.08-.08.18-.22.28-.33.1-.11.13-.19.19-.31.06-.12.03-.24-.01-.34-.05-.09-.44-1.11-.58-1.52Z"
        fill="currentColor"
      />
    </svg>
  );
}

const TRUST_LOGOS = [
  {
    nameKey: 'landing.trust.upgov.name',
    src: '/official-logos/upgov.png',
    altKey: 'landing.trust.upgov.alt',
    hintKey: 'landing.trust.upgov.hint'
  },
  {
    nameKey: 'landing.trust.pwd.name',
    src: '/official-logos/upgov.png',
    altKey: 'landing.trust.pwd.alt',
    hintKey: 'landing.trust.pwd.hint'
  },
  {
    nameKey: 'landing.trust.igrs.name',
    src: '/official-logos/igrs.png',
    altKey: 'landing.trust.igrs.alt',
    hintKey: 'landing.trust.igrs.hint'
  },
  {
    nameKey: 'landing.trust.cpgrams.name',
    src: '/official-logos/cpgrams.png',
    altKey: 'landing.trust.cpgrams.alt',
    hintKey: 'landing.trust.cpgrams.hint'
  },
  {
    nameKey: 'landing.trust.nic.name',
    src: '/official-logos/nic.jpg',
    altKey: 'landing.trust.nic.alt',
    hintKey: 'landing.trust.nic.hint'
  },
];

const FOOTER_SOCIALS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/', icon: Linkedin },
  { label: 'Instagram', href: 'https://www.instagram.com/', icon: Instagram },
  { label: 'X', href: 'https://x.com/', icon: Twitter },
];

// --- WhatsApp Chat Simulation ---
function WhatsAppModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ type: 'bot', text: t('whatsapp.reply1'), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }
  }, [isOpen, t]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setMessages(prev => [...prev, { type: 'user', text: userMsg, time: now }]);
    setInput('');
    setIsTyping(true);

    // Mock Backend Step Logic
    setTimeout(() => {
      let botResponse = "";
      let nextStep = step;

      if (step === 1) {
        botResponse = t('citizen.selectSector');
        nextStep = 2;
      } else if (step === 2) {
        botResponse = t('citizen.complaintDesc');
        nextStep = 3;
      } else if (step === 3) {
        botResponse = t('whatsapp.askPhoto');
        nextStep = 4;
      } else if (step === 4) {
        botResponse = t('citizen.submittedSub') + " ID: IND-" + Math.floor(100000 + Math.random() * 900000);
        nextStep = 5;
      } else {
        botResponse = t('help.title');
      }

      setMessages(prev => [...prev, { type: 'bot', text: botResponse, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setStep(nextStep);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative flex h-[min(600px,calc(100svh-2rem))] w-full max-w-[400px] flex-col overflow-hidden rounded-[24px] bg-[#E5DDD5] shadow-2xl"
      >
        {/* Header */}
        <div className="flex h-16 items-center bg-[#075E54] px-4 text-white">
          <HeaderBrand
            className="min-w-0 flex-1"
            hideSubtitleOnMobile={false}
            light
            markSize="sm"
            subtitle={t('whatsapp.bot')}
            subtitleClassName="text-white/75"
            title="UPGOV"
            titleClassName="text-[15px] sm:text-[16px]"
          />
          <button onClick={onClose} className="rounded-full p-2 hover:bg-black/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-hide bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: msg.type === 'user' ? 20 : -20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`relative max-w-[85%] rounded-[12px] p-3 text-[13px] shadow-sm ${
                    msg.type === 'user' ? 'bg-[#DCF8C6] rounded-tr-none' : 'bg-white rounded-tl-none'
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
                  <p className="mt-1 text-right text-[9px] opacity-40">{msg.time}</p>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="rounded-[12px] bg-white p-3 text-[11px] font-bold text-slate-400">
                  {t('whatsapp.typing')}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="bg-[#F0F0F0] p-3">
          <form 
            className="flex items-center gap-2"
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          >
            <input 
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t('whatsapp.typeSomething')}
              className="h-11 flex-1 rounded-full border-none bg-white px-5 text-[14px] focus:ring-1 focus:ring-[#075E54]"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#075E54] text-white shadow-md transition-all active:scale-90 disabled:opacity-50"
            >
              <MessagesSquare className="h-5 w-5" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}


// --- Main Pages ---
export function LandingPage({ onSelectRole, onPublicDash }) {
  const { t } = useTranslation();
  const [isWAModalOpen, setIsWAModalOpen] = useState(false);

  const stats = useMemo(() => [
    { value: '2,847', label: t('landing.resolvedMonth') },
    { value: '94.2%', label: t('landing.slaCompliance') },
    { value: '12', label: t('landing.departments') },
    { value: '47', label: t('landing.sectorsCovered') },
  ], [t]);

  const roles = [
    {
      role: 'citizen',
      title: t('roles.citizen.title'),
      tag: t('roles.citizen.tag'),
      desc: t('roles.citizen.desc'),
      bullets: [t('roles.citizen.b1'), t('roles.citizen.b2'), t('roles.citizen.b3'), t('roles.citizen.b4')],
      icon: <Users className="h-10 w-10" />,
      color: '#1B3A6B'
    },
    {
      role: 'officer',
      title: t('roles.officer.title'),
      tag: t('roles.officer.tag'),
      desc: t('roles.officer.desc'),
      bullets: [t('roles.officer.b1'), t('roles.officer.b2'), t('roles.officer.b3'), t('roles.officer.b4')],
      icon: <HardHat className="h-10 w-10" />,
      color: '#15803D'
    },
    {
      role: 'admin',
      title: t('roles.admin.title'),
      tag: t('roles.admin.tag'),
      desc: t('roles.admin.desc'),
      bullets: [t('roles.admin.b1'), t('roles.admin.b2'), t('roles.admin.b3'), t('roles.admin.b4')],
      icon: <GanttChartSquare className="h-10 w-10" />,
      color: '#7C2D12'
    }
  ];

  const publicNoticeItems = [
    t('landing.noticeItems.platform'),
    t('landing.noticeItems.workflow'),
  ];

  const grievanceJourney = [
    {
      step: '01',
      title: t('landing.journey.file.title'),
      desc: t('landing.journey.file.desc'),
      accent: '#0F4C8A',
      icon: <Users className="h-5 w-5" />,
    },
    {
      step: '02',
      title: t('landing.journey.route.title'),
      desc: t('landing.journey.route.desc'),
      accent: '#215A98',
      icon: <ClipboardCheck className="h-5 w-5" />,
    },
    {
      step: '03',
      title: t('landing.journey.verify.title'),
      desc: t('landing.journey.verify.desc'),
      accent: '#1D6F42',
      icon: <HardHat className="h-5 w-5" />,
    },
    {
      step: '04',
      title: t('landing.journey.monitor.title'),
      desc: t('landing.journey.monitor.desc'),
      accent: '#8A3B12',
      icon: <BarChart3 className="h-5 w-5" />,
    },
  ];

  const platformMandate = [
    {
      title: t('landing.mandate.intake.title'),
      desc: t('landing.mandate.intake.desc'),
    },
    {
      title: t('landing.mandate.verification.title'),
      desc: t('landing.mandate.verification.desc'),
    },
    {
      title: t('landing.mandate.oversight.title'),
      desc: t('landing.mandate.oversight.desc'),
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--surface-2)] selection:bg-[var(--primary)] selection:text-white pb-20">
      <div className="fixed inset-x-0 top-0 z-50 shadow-md">
        <PublicUtilityBar />
        <header className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-200/50" style={{ background: 'linear-gradient(90deg, rgba(255, 153, 51, 0.15) 0%, rgba(255, 255, 255, 0.15) 50%, rgba(19, 136, 8, 0.15) 100%)', backgroundColor: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(10px)' }}>
          <div className="flex items-center">
            <HeaderBrand
              className="min-w-0"
              hideSubtitleOnMobile
              title="UPGOV"
              titleClassName="text-[var(--primary)]"
              subtitleClassName="text-slate-600 font-bold"
              subtitle={t('landing.subtitle')}
            />
          </div>
          
          <div className="flex items-center gap-8">
            <nav className="hidden lg:flex items-center gap-8 text-[15px] font-black tracking-tight text-slate-800">
              <a href="#" className="hover:text-[var(--primary)] transition-colors">Home</a>
              <a href="#about" className="hover:text-[var(--primary)] transition-colors">About Us</a>
              <button 
                onClick={onPublicDash}
                className="hover:text-[var(--primary)] transition-colors"
              >
                Dashboard
              </button>
            </nav>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onSelectRole('citizen')}
                className="flex items-center gap-1.5 rounded-full bg-[var(--primary)] px-6 py-2.5 text-[14px] font-bold text-white transition-all hover:bg-[var(--primary-light)] hover:shadow-lg shadow-blue-900/10"
              >
                Login/Register
              </button>
            </div>
          </div>
        </header>

        {/* Stats Strip under Header - UMANG style */}
        <div className="flex h-10 items-center justify-between border-t border-slate-200 bg-white/95 px-4 sm:px-6 lg:px-8 text-[12px] font-bold text-slate-600 backdrop-blur-md overflow-x-auto whitespace-nowrap scrollbar-hide">
           <div className="flex items-center gap-8">
              <span>CENTRAL <strong className="text-[var(--primary)]">192</strong></span>
              <span>STATE <strong className="text-[var(--primary)]">19,531</strong></span>
              <span>UTILITY <strong className="text-[var(--primary)]">23,281</strong></span>
              <span>TOTAL SERVICES <strong className="text-[var(--primary)]">38,103</strong></span>
           </div>
           <div className="flex items-center gap-8 ml-8">
              <span>REGISTERED <strong className="text-[var(--primary)]">6.96 CR.</strong></span>
              <span>TRANSACTIONS <strong className="text-[var(--primary)]">469.75 CR.</strong></span>
           </div>
        </div>
      </div>

      {/* Hero: WhatsApp Bot Focused */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#e3f2fd] to-[#f5f9ff] max-w-[1440px] mx-auto sm:rounded-2xl mt-[176px] mb-8 shadow-md border border-slate-200">
        <div className="absolute inset-0 z-0 select-none pointer-events-none opacity-20 mix-blend-multiply">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="h-full w-full object-cover"
            src="/hero-bg.mp4" 
          />
        </div>

        <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center min-h-[480px] max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 py-16">
          <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
             className="max-w-[600px]"
          >
             <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 mb-6 border border-[#07569E]/30 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-[#07569E] animate-pulse"></span>
                <span className="text-[12px] font-bold text-[#07569E] tracking-wide">24x7 AI ASSISTANT</span>
             </div>
             
             <h1 className="mb-4 text-[clamp(2.5rem,5vw,4.5rem)] font-black leading-[1.05] tracking-tight text-[#003366]">
               Governance at your <span className="text-[#ff9933]">Fingertips.</span>
             </h1>
             <p className="mb-8 text-[18px] leading-relaxed text-slate-600 font-medium max-w-lg">
               No complicated portals. No long queues. Just text us on WhatsApp to file grievances, track status, and access services instantly.
             </p>
             
             <div className="flex flex-col sm:flex-row gap-4">
               <button
                 onClick={() => setIsWAModalOpen(true)}
                 className="flex h-[56px] w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-[#25D366] px-8 text-[16px] font-black tracking-wide text-white shadow-[0_8px_24px_rgba(37,211,102,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(37,211,102,0.35)]"
               >
                 <WhatsAppGlyph className="h-6 w-6" />
                 Message on WhatsApp
               </button>
               <button
                 onClick={onPublicDash}
                 className="flex h-[56px] w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-[#003366]/20 bg-white px-8 text-[15px] font-black tracking-wide text-[#003366] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
               >
                 View Public Dashboard
                 <ChevronRight className="h-4 w-4" />
               </button>
             </div>
          </motion.div>

          {/* Right Side: Simulated Phone/Chat UI */}
          <motion.div 
             initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
             className="hidden lg:flex justify-center"
          >
             <div className="relative w-[300px] h-[500px] bg-white rounded-[40px] border-[12px] border-slate-800 shadow-2xl overflow-hidden flex flex-col">
                <div className="bg-[#075e54] text-white p-4 flex items-center gap-3 shadow-md z-10">
                   <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">
                     <BrandMark size="sm" />
                   </div>
                   <div>
                      <p className="font-bold text-[14px]">UPGOV Sahayak</p>
                      <p className="text-[10px] text-white/80">Online</p>
                   </div>
                </div>
                <div className="flex-1 bg-[#e5ddd5] p-4 flex flex-col gap-3 overflow-hidden" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'cover' }}>
                   {/* Chat Bubbles */}
                   <div className="self-end bg-[#dcf8c6] p-3 rounded-lg rounded-tr-none shadow-sm max-w-[85%] text-[13px] text-slate-800 mt-auto">
                      My street light is broken.
                      <p className="text-[9px] text-right text-slate-500 mt-1">10:41 am ✓✓</p>
                   </div>
                   <div className="self-start bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-[90%] text-[13px] text-slate-800">
                      Namaste! I have registered your grievance for the Street Light. Your ticket number is <strong>#UP-4921</strong>. We will fix it within 48 hours.
                      <p className="text-[9px] text-right text-slate-500 mt-1">10:41 am</p>
                   </div>
                </div>
                <div className="bg-[#f0f0f0] p-3 flex items-center gap-2">
                   <div className="flex-1 bg-white h-10 rounded-full flex items-center px-4 text-slate-400 text-[13px]">Message...</div>
                   <div className="h-10 w-10 bg-[#128c7e] rounded-full flex items-center justify-center text-white"><ChevronRight className="h-5 w-5" /></div>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Action-Oriented Service Blocks (UIDAI Style) */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-10 text-center">
            <h3 className="text-[28px] font-black tracking-tight text-[#003366]">
              Access Services
            </h3>
            <span className="mt-2 block h-1 w-16 bg-[#ff9933] mx-auto rounded"></span>
          </div>
          
          <div className="grid gap-10 md:grid-cols-3 justify-items-center">
            <FlipCard 
              role="citizen"
              title="Citizen Portal"
              subtitle="Grievance Redressal"
              description="Empowering citizens with AI-assisted grievance filing and transparent real-time tracking."
              features={[
                "File grievances in under 90s",
                "Real-time status tracking",
                "AI-powered category matching",
                "Direct officer feedback channel"
              ]}
              color="#003366"
              actionLabel="Access Portal"
              onAction={() => onSelectRole('citizen')}
            />
            <FlipCard 
              role="officer"
              title="Officer Portal"
              subtitle="Field Operations"
              description="Streamlined workflow for field officers to verify, manage, and resolve assigned cases efficiently."
              features={[
                "Dynamic assignment queue",
                "On-ground verification tools",
                "SLA compliance monitoring",
                "Inter-departmental messaging"
              ]}
              color="#138808"
              actionLabel="Enter Workspace"
              onAction={() => onSelectRole('officer')}
            />
            <FlipCard 
              role="admin"
              title="Admin Panel"
              subtitle="Command & Control"
              description="Metropolitan-wide analytics and oversight for predictive governance and resource optimization."
              features={[
                "Predictive impact analytics",
                "Departmental performance core",
                "Automated SLA escalations",
                "System-wide health monitoring"
              ]}
              color="#ea580c"
              actionLabel="Launch Terminal"
              onAction={() => onSelectRole('admin')}
            />
          </div>
        </div>
      </section>
      {/* Trust Rail & Associated Services */}
      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="mx-auto max-w-[1200px]">
           <h3 className="mb-6 text-center text-[20px] font-bold text-slate-800">
             Integrated with Leading Departments
           </h3>
           <div className="flex flex-wrap justify-center gap-6 sm:gap-10 opacity-70 grayscale transition-all hover:grayscale-0">
             {TRUST_LOGOS.map(item => (
               <div key={item.nameKey} className="flex flex-col items-center gap-2 w-24">
                 <img alt={t(item.altKey)} className="h-14 object-contain transition-transform hover:scale-110" loading="lazy" src={item.src} />
                 <span className="text-center text-[11px] font-bold text-slate-600">{t(item.nameKey)}</span>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* Government Network / Official Platforms - Glassmorphism Light Theme */}
      <section className="bg-gradient-to-br from-blue-50/50 via-white to-emerald-50/50 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle background decorative blobs for glassmorphism effect */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

        <div className="mx-auto max-w-[1440px] relative z-10 w-full">
          <div className="mb-12">
            <h2 className="text-slate-900 text-[28px] sm:text-[32px] font-black tracking-tight mb-3">Government Network</h2>
            <p className="text-slate-500 text-[14px] sm:text-[15px] max-w-[600px] leading-relaxed">
              Discover the official platforms relevant to grievance redressal. These services are strictly integrated for faster and more reliable resolution.
            </p>
          </div>
          
          {/* Glassmorphic Platform Cards - Spanned horizontally */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 w-full gap-4 sm:gap-6 lg:gap-8 justify-items-center">
            {[
              { id: '1', title: 'UP State Portal', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Seal_of_Uttar_Pradesh.svg' },
              { id: '2', title: 'UP Public Works', logo: 'https://uppwd.gov.in/images/logo.png' },
              { id: '3', title: 'Jan Sunwai (IGRS)', logo: 'https://jansunwai.up.nic.in/images/cm_logo.png' },
              { id: '4', title: 'CPGRAMS Portal', logo: 'https://pgportal.gov.in/Images/logo.png' },
              { id: '5', title: 'NIC India', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/National_Informatics_Centre_logo.svg' }
            ].map((platform) => (
              <a 
                href="#"
                key={platform.id} 
                className="bg-white/60 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl flex flex-col items-center justify-center text-center group hover:bg-white/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all w-full max-w-[200px] aspect-square relative hover:-translate-y-1"
              >
                 <div className="h-16 w-16 md:h-20 md:w-20 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                    <img 
                      src={platform.logo} 
                      onError={(e) => { e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Seal_of_Uttar_Pradesh.svg' }}
                      alt={platform.title} 
                      className="max-h-full max-w-full object-contain drop-shadow-sm" 
                    />
                 </div>
                 
                 <h4 className="text-slate-800 text-[13px] md:text-[14px] font-bold leading-tight px-2">
                   {platform.title}
                 </h4>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Moving Notice Bar */}
      <section className="border-y border-emerald-300/20 bg-[linear-gradient(90deg,#187943_0%,#23a055_48%,#187943_100%)] text-white">
        <div className="flex items-stretch">
          <div className="flex shrink-0 items-center gap-2 border-r border-white/15 bg-black/10 px-4 sm:px-6">
            <ShieldCheck className="h-4 w-4 text-amber-200" />
            <span className="text-[10px] font-black uppercase tracking-[2.4px] text-white/85 sm:text-[11px]">{t('landing.noticeLabel')}</span>
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="marquee-track flex min-w-max items-center gap-10 py-3">
              {Array.from({ length: 2 }).map((_, loopIndex) => (
                <React.Fragment key={loopIndex}>
                  {publicNoticeItems.map(item => (
                    <div key={`${loopIndex}-${item}`} className="flex items-center gap-10 pr-10">
                      <p className="whitespace-nowrap text-[12px] font-semibold tracking-[0.2px] text-white/95 sm:text-[13px]">
                        {item}
                      </p>
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-200/90" />
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About / Footer */}
      <section id="about" className="bg-[#0e4e8f] text-white">
        <div className="h-1.5 bg-[linear-gradient(90deg,#ff9933_0%,#ff9933_32%,#ffffff_32%,#ffffff_68%,#138808_68%,#138808_100%)]" />

        <div className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.9fr_0.95fr]">
            <div className="lg:pr-8">
              <p className="text-[11px] font-black uppercase tracking-[3px] text-blue-100/75 sm:text-[12px]">{t('landing.aboutEyebrow')}</p>
              <div className="mt-5 max-w-[360px]">
                <HeaderBrand
                  className="min-w-0"
                  hideSubtitleOnMobile={false}
                  light
                  markSize="lg"
                  subtitle={t('landing.subtitle')}
                  subtitleClassName="text-blue-100/78"
                  title="UPGOV"
                />
              </div>
              <p className="mt-5 max-w-[40rem] text-[14px] leading-7 text-blue-50/90">
                {t('landing.aboutText')}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-[13px] text-blue-100/82">
                <span className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 font-semibold">{t('landing.developedBy')}</span>
                <span className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 font-semibold">{t('landing.institutionValue')}</span>
              </div>
            </div>

            <div className="lg:border-l lg:border-white/18 lg:px-8">
              <p className="text-[12px] font-black uppercase tracking-[2.5px] text-white">{t('landing.mandateEyebrow')}</p>
              <div className="mt-5 space-y-3">
                {platformMandate.map((item, index) => (
                  <div
                    key={item.title}
                    className={`rounded-[18px] border border-white/10 bg-white/[0.05] px-4 py-4 ${index < platformMandate.length - 1 ? '' : ''}`}
                  >
                    <p className="text-[15px] font-bold text-white">{item.title}</p>
                    <p className="mt-2 text-[13px] leading-6 text-blue-100/82">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:border-l lg:border-white/18 lg:pl-8">
              <p className="text-[12px] font-black uppercase tracking-[2.5px] text-white">{t('landing.contactEyebrow')}</p>
              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-blue-100">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[1.6px] text-blue-100/65">{t('landing.contact.email')}</p>
                    <a className="mt-1 block text-[15px] font-semibold text-white transition-colors hover:text-blue-100" href="mailto:upgov@gmail.com">upgov@gmail.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-blue-100">
                    <PhoneCall className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[1.6px] text-blue-100/65">{t('landing.contact.tollFree')}</p>
                    <a className="mt-1 block text-[15px] font-semibold text-white transition-colors hover:text-blue-100" href="tel:1800-XXX-XXX">1800-XXX-XXX</a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-blue-100">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[1.6px] text-blue-100/65">{t('landing.contact.location')}</p>
                    <p className="mt-1 text-[15px] font-semibold text-white">{t('landing.contact.locationValue')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-blue-100">
                    <GraduationCap className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[1.6px] text-blue-100/65">{t('landing.contact.institution')}</p>
                    <p className="mt-1 text-[15px] font-semibold text-white">{t('landing.contact.institutionValue')}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                {FOOTER_SOCIALS.map(item => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      aria-label={item.label}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-white/85 transition-all hover:bg-white/[0.12] hover:text-white"
                      href={item.href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/15 pt-5 text-[12px] text-blue-100/78 sm:flex-row sm:items-center sm:justify-between">
            <p>{t('landing.footerCopyright')}</p>
            <p>{t('landing.footerCredit')}</p>
          </div>
        </div>
      </section>

      <WhatsAppModal isOpen={isWAModalOpen} onClose={() => setIsWAModalOpen(false)} />
    </div>
  );
}

export function LoginPage({ role, onBack, onLogin }) {
  const { t } = useTranslation();
  
  const configs = {
    citizen: {
      label: t('roles.citizen.title'),
      tone: '#003366',
      btnColor: '#ff9933',
      fields: [
        { key: 'email', label: t('login.email'), prefill: 'citizen@india.gov.in' },
        { key: 'password', label: t('login.password'), prefill: 'demo123', type: 'password' },
      ],
    },
    officer: {
      label: t('roles.officer.title'),
      tone: '#15803D',
      btnColor: '#ff9933',
      fields: [
        { key: 'officerId', label: t('login.officerId'), prefill: 'OFF-2241' },
        { key: 'password', label: t('login.password'), prefill: 'demo123', type: 'password' },
      ],
    },
    admin: {
      label: t('roles.admin.title'),
      tone: '#003366',
      btnColor: '#ff9933',
      fields: [
        { key: 'email', label: t('login.adminEmail'), prefill: 'admin@india.gov.in' },
        { key: 'password', label: t('login.password'), prefill: 'demo123', type: 'password' },
      ],
    },
  };

  const cfg = configs[role] || configs.citizen;
  const [values, setValues] = useState(
    Object.fromEntries(cfg.fields.map(field => [field.key, field.prefill]))
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-stretch justify-center bg-[#f3f6f9] p-4 sm:items-center lg:p-10">
      <div className="mx-auto flex w-full max-w-6xl min-h-[calc(100svh-2rem)] overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl sm:min-h-[700px]">
        
        {/* Left Side Panel */}
         <div className="relative hidden w-[45%] overflow-hidden bg-[#1f3f6d] p-12 text-white lg:flex lg:flex-col lg:justify-between">
           {/* Center Watermark (As requested: "the ashoka chakra watermark should be in the centre") */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <AshokaChakra className="h-[500px] w-[500px] opacity-[0.25] mix-blend-soft-light" />
            </div>
           
           <div className="relative z-10 space-y-8">
             <button onClick={onBack} className="flex items-center gap-2 text-[13px] font-medium text-blue-200 transition-colors hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                {t('nav.backToLanding')}
             </button>
             
             <div className="mt-8">
                <HeaderBrand
                  className="max-w-[360px]"
                  hideSubtitleOnMobile={false}
                  light
                  markSize="lg"
                  subtitle={t('landing.subtitle')}
                  subtitleClassName="text-blue-100/78"
                  title="UPGOV"
                  titleClassName="font-serif text-[40px] sm:text-[42px] text-white"
                />
                <p className="mt-6 max-w-[85%] text-[15px] font-medium leading-relaxed text-blue-100">
                   {t('login.leftPanelLead')}
                </p>
             </div>
           </div>

           {/* Empty space where boxes were or large chakra placeholder */}
           <div className="flex-1" />

           <div className="relative z-10 w-full">
              {/* Instructions Box at the bottom as previously liked */}
              <div className="rounded-2xl border border-blue-400/30 bg-blue-900/40 p-6 backdrop-blur-md">
                 <h4 className="mb-3 text-[12px] font-black uppercase tracking-[1px] text-blue-200">{t('login.instructionsTitle')}</h4>
                 <ul className="space-y-2.5 text-[11px] font-medium text-blue-100/80">
                    <li className="flex gap-2"><span>•</span>{t('login.instructions1')}</li>
                    <li className="flex gap-2"><span>•</span>{t('login.instructions2')}</li>
                    <li className="flex gap-2"><span>•</span>{t('login.instructions3')}</li>
                 </ul>
              </div>
           </div>
        </div>

        {/* Right Side Login Form */}
        <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-8 lg:px-20 lg:py-16">
           <div className="w-full max-w-[400px]">
             
             <button onClick={onBack} className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-400 lg:hidden">
                <ArrowLeft className="h-4 w-4" />
                {t('nav.backToLanding')}
             </button>

             <div className="mb-8 lg:hidden">
                <HeaderBrand
                  className="max-w-[320px]"
                  hideSubtitleOnMobile={false}
                  markSize="md"
                  subtitle={t('landing.subtitle')}
                  subtitleClassName="text-slate-500/85"
                  title="UPGOV"
                />
             </div>

             <div className="mb-10 text-left">
                <div 
                   className="mb-8 inline-flex items-center rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[1.5px] text-white" 
                   style={{ backgroundColor: cfg.tone }}
                >
                   {cfg.label}
                </div>
                <h2 className="font-serif text-[clamp(2.75rem,12vw,4rem)] font-bold tracking-tight text-slate-900">{t('login.signIn')}</h2>
                <p className="mt-3 text-[13px] font-medium text-slate-500">
                   {t('login.demoNote')}
                </p>
             </div>

             <form className="space-y-6" onSubmit={(e) => { 
                e.preventDefault(); 
                const allFilled = Object.values(values).every(v => v && v.trim() !== '');
                if (!allFilled) {
                   alert(t('login.accessRejected'));
                   return;
                }
                onLogin(role, values); 
             }}>
                {cfg.fields.map(f => (
                  <div key={f.key}>
                    <label className="mb-2 block text-[12px] font-bold text-slate-700">{f.label}</label>
                    <div className="relative">
                       <input 
                         type={f.type === 'password' ? (showPassword ? 'text' : 'password') : 'text'}
                         value={values[f.key]}
                         onChange={e => setValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                         className="h-[52px] w-full rounded-xl border border-slate-200 bg-slate-50 px-5 text-[15px] transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
                       />
                       {f.type === 'password' && (
                         <button 
                           type="button" 
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                         >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                         </button>
                       )}
                    </div>
                  </div>
                ))}
                
                <button 
                  type="submit" 
                  className="mt-6 flex h-[56px] w-full items-center justify-center gap-2 rounded-xl text-[16px] font-bold text-white transition-all hover:brightness-110 active:scale-[0.98] shadow-sm"
                  style={{ backgroundColor: cfg.btnColor }}
                >
                   {t('landing.enterWorkspace')}
                   <ChevronRight className="h-4 w-4" />
                </button>
             </form>

           </div>
        </div>

      </div>
    </div>
  );
}
