import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ClipboardList, ShieldCheck, BarChart3, User, Shield, Layout } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { AshokaChakra } from '../../Shared.jsx';

const FlipCard = ({
  title,
  subtitle,
  description,
  features = [],
  color = '#003366',
  actionLabel = 'Enter Workspace',
  onAction,
  role = 'citizen' // citizen | officer | admin
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cardRef = useRef(null);

  // 3D Tilt Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  // Glare effect values
  const opacity = useTransform(mouseXSpring, [-0.5, 0.5], [0.1, 0.3]);
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = (e) => {
    if (isFlipped || isMobile) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    if (!isMobile) setIsFlipped(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsFlipped(prev => !prev);
    } else if (e.key === 'Escape') {
      setIsFlipped(false);
    }
  };

  const getRoleConfig = () => {
    switch (role) {
      case 'citizen':
        return {
          hue: 'rgba(255, 153, 51, 0.15)',
          glow: 'rgba(255, 153, 51, 0.3)',
          border: 'rgba(255, 153, 51, 0.6)',
          icon: <User className="h-8 w-8 text-[#ff9933]" />,
          motif: <ClipboardList className="h-16 w-16 text-[#ff9933]/20" />
        };
      case 'officer':
        return {
          hue: 'rgba(255, 255, 255, 0.85)',
          glow: 'rgba(0, 51, 102, 0.15)',
          border: 'rgba(0, 51, 102, 0.4)',
          icon: <Shield className="h-8 w-8 text-[#003366]" />,
          motif: <ShieldCheck className="h-16 w-16 text-[#003366]/10" />
        };
      case 'admin':
        return {
          hue: 'rgba(19, 136, 8, 0.15)',
          glow: 'rgba(19, 136, 8, 0.3)',
          border: 'rgba(19, 136, 8, 0.6)',
          icon: <Layout className="h-8 w-8 text-[#138808]" />,
          motif: <BarChart3 className="h-16 w-16 text-[#138808]/20" />
        };
      default:
        return { hue: 'rgba(255, 255, 255, 0.5)', glow: 'rgba(0,0,0,0.05)', border: 'rgba(255, 255, 255, 0.4)', icon: <User className="h-8 w-8" />, motif: <ClipboardList className="h-16 w-16" /> };
    }
  };

  const cfg = getRoleConfig();

  return (
    <div 
      ref={cardRef}
      className="group perspective-1000 w-full max-w-[320px] h-[360px] outline-none cursor-pointer"
      onMouseEnter={() => !isMobile && setIsFlipped(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={() => isMobile && setIsFlipped(!isFlipped)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
    >
      <motion.div 
        className="relative w-full h-full transform-style-3d"
        style={{ 
          rotateX: isFlipped ? 0 : rotateX, 
          rotateY: isFlipped ? 180 : rotateY 
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Front Face - Square Edges */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-none backdrop-blur-[24px] border-4 shadow-2xl flex flex-col p-8 items-start text-left overflow-hidden transition-all duration-500"
          style={{ backgroundColor: cfg.hue, borderColor: cfg.border }}
        >
          {/* Glare/Shimmer Layer */}
          <motion.div 
             className="absolute inset-0 pointer-events-none z-30"
             style={{ 
               background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.4) 0%, transparent 60%)`,
               opacity
             }}
          />

          <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full blur-[80px] opacity-40 group-hover:opacity-70 transition-opacity duration-1000" style={{ backgroundColor: cfg.glow }} />
          
          <div className="relative z-10 w-full mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="manrope text-[11px] font-black uppercase tracking-[3px] text-slate-800/80">{subtitle}</span>
              <div className="h-10 w-10 rounded-none bg-white/60 border border-white/40 shadow-sm flex items-center justify-center backdrop-blur-sm">
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
            <h3 className="manrope text-[30px] font-black text-slate-900 leading-[1.1] tracking-tight">{title}</h3>
          </div>

          <div className="flex-1 w-full flex items-center justify-center relative">
             <div className="h-24 w-24 rounded-none bg-white/40 border-2 border-white/60 shadow-xl backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform duration-500 relative z-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                {cfg.icon}
             </div>
             <div className="absolute inset-0 flex items-center justify-center opacity-40 blur-2xl group-hover:opacity-60 transition-all duration-700">
                {cfg.motif}
             </div>
          </div>

          <div className="relative z-10 mt-auto w-full flex items-center gap-2">
            <div className="h-[2px] flex-1 bg-slate-900/10" />
            <span className="manrope text-[11px] font-black uppercase tracking-[2px] text-slate-900/70 whitespace-nowrap">
              Discover More
            </span>
          </div>
        </div>

        {/* Back Face - Square Edges */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-none backdrop-blur-[32px] border-4 shadow-2xl flex flex-col p-8 items-start text-left rotate-y-180 overflow-hidden"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', borderColor: cfg.border }}
        >
          <div className="w-full mb-6 relative">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 rounded-none bg-slate-50 border border-slate-100" style={{ color }}>
                  {React.cloneElement(cfg.icon, { className: 'h-4 w-4' })}
               </div>
               <h3 className="manrope text-[24px] font-black text-slate-900 tracking-tight">{title}</h3>
            </div>
            <p className="text-[14px] font-bold leading-relaxed text-slate-600 line-clamp-2">
              {description}
            </p>
          </div>

          <div className="flex-1 w-full overflow-y-auto pr-2 mb-8 space-y-4 custom-scrollbar">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="mt-1.5 flex h-2 w-2 items-center justify-center">
                  <div className="h-2 w-2 rounded-none transition-all group-hover:scale-125 shadow-sm" style={{ backgroundColor: color }} />
                </div>
                <span className="text-[15px] font-bold text-slate-800 leading-tight">{feature}</span>
              </div>
            ))}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction?.();
            }}
            className="group/btn relative w-full h-[60px] rounded-none overflow-hidden transition-all hover:brightness-110 active:scale-[0.98] shadow-lg shadow-blue-900/10"
            style={{ backgroundColor: color }}
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-center gap-3 manrope text-[14px] font-black uppercase tracking-[3px] text-white">
              {actionLabel}
              <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </div>
          </button>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-1000 { perspective: 1200px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 0px; }
      `}} />
    </div>
  );
};

export default FlipCard;
