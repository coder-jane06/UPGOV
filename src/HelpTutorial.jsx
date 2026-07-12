import React, { useMemo, useState } from 'react';
import { CircleHelp, X, ChevronRight, Play, Info, MessageCircle, History } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function HelpTutorial() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [videoLang, setVideoLang] = useState('en');

  // Auto-set initial video language based on current app language
  React.useEffect(() => {
    if (isOpen) {
      setVideoLang(i18n.language === 'hi' ? 'hi' : 'en');
    }
  }, [isOpen, i18n.language]);

  const steps = useMemo(() => [
    { icon: <MessageCircle className="h-6 w-6 text-[#003f77]" />, label: t('help.step1'), desc: t('help.step1Desc') },
    { icon: <History className="h-6 w-6 text-[#15803D]" />, label: t('help.step2'), desc: t('help.step2Desc') },
    { icon: <Info className="h-6 w-6 text-[#ea580c]" />, label: t('help.step3'), desc: t('help.step3Desc') }
  ], [t]);

  return (
    <>
      {/* Floating Button */}
      <button 
        aria-label={t('help.btn')}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-3 right-3 z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-[#ea580c] font-black text-white shadow-[0_12px_32px_rgba(232,135,42,0.35)] transition-all hover:scale-110 hover:bg-[#c2410c] active:scale-95 sm:bottom-6 sm:right-6 sm:h-14 sm:w-auto sm:gap-3 sm:px-6 ltr:right-3 sm:ltr:right-6 rtl:left-3 sm:rtl:left-6"
      >
        <CircleHelp className="h-4.5 w-4.5 sm:h-6 sm:w-6" />
        <span className="hidden text-[15px] sm:inline">{t('help.btn')}</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsOpen(false)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative flex w-full max-w-[500px] max-h-[calc(100svh-2rem)] flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl"
            >
              <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-100 px-5 sm:px-8">
                 <h3 className="text-lg manrope font-black text-[#003f77]">{t('help.title')}</h3>
                 <button onClick={() => setIsOpen(false)} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900">
                    <X className="h-5 w-5" />
                 </button>
              </div>

              <div className="overflow-y-auto p-5 sm:p-8" style={{ maxHeight: 'calc(100svh - 8rem)' }}>
                 <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-[14px] font-bold text-slate-700">{t('help.videoTitle', 'Video Tutorial')}</h4>
                    <div className="flex bg-slate-100 rounded-lg p-1">
                       <button 
                         onClick={() => setVideoLang('en')} 
                         className={`px-3 py-1 rounded-md text-[12px] font-bold transition-all ${videoLang === 'en' ? 'bg-white text-[#003f77] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                       >
                         English
                       </button>
                       <button 
                         onClick={() => setVideoLang('hi')} 
                         className={`px-3 py-1 rounded-md text-[12px] font-bold transition-all ${videoLang === 'hi' ? 'bg-white text-[#003f77] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                       >
                         हिंदी
                       </button>
                    </div>
                 </div>
                 <div className="mb-8 overflow-hidden rounded-2xl border border-slate-100 bg-slate-900 shadow-md">
                    <video 
                      key={videoLang}
                      controls 
                      controlsList="nodownload"
                      className="w-full aspect-video outline-none"
                      preload="metadata"
                    >
                      <source src={videoLang === 'hi' ? "/UPGOV/tutorial-hi.mp4" : "/UPGOV/tutorial.mp4"} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                 </div>

                 <div className="space-y-6">
                    {steps.map((step, i) => (
                      <div key={i} className="flex gap-4">
                         <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-50">
                            {step.icon}
                         </div>
                         <div>
                            <h4 className="text-[16px] font-bold text-slate-900">{step.label}</h4>
                            <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{step.desc}</p>
                         </div>
                      </div>
                    ))}
                 </div>

                 <div className="mt-10 grid gap-3">
                    <button onClick={() => setIsOpen(false)} className="flex h-[56px] w-full items-center justify-center rounded-xl bg-slate-100 text-[15px] font-bold text-slate-600 transition-colors hover:bg-slate-200">
                       {t('help.close')}
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
