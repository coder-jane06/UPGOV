import React, { createContext, useContext, useState } from 'react';

const TRANSLATIONS = {
  EN: {
    help: '? Help',
    helpTitle: 'How can we help you?',
    step1: 'Step 1: How to file a complaint',
    step2: 'Step 2: How to track your complaint',
    step3: 'Step 3: How to contact your department',
    watchVideo: 'Watch Video Guide',
    fileWhatsapp: 'File via WhatsApp',
    noApp: 'No app. No login. Just WhatsApp.',
    publicDash: 'Public Dashboard',
    citizenPortal: 'Citizen Portal',
    close: 'Close',
  },
  HI: {
    help: '? मदद',
    helpTitle: 'हम आपकी कैसे मदद कर सकते हैं?',
    step1: 'चरण 1: शिकायत कैसे दर्ज करें',
    step2: 'चरण 2: अपनी शिकायत कैसे ट्रैक करें',
    step3: 'चरण 3: अपने विभाग से कैसे संपर्क करें',
    watchVideo: 'वीडियो गाइड देखें',
    fileWhatsapp: 'WhatsApp से दर्ज करें',
    noApp: 'कोई ऐप नहीं। कोई लॉगिन नहीं। सिर्फ WhatsApp।',
    publicDash: 'सार्वजनिक डैशबोर्ड',
    citizenPortal: 'नागरिक पोर्टल',
    close: 'बंद करें',
  },
  PA: {
    help: '? ਮਦਦ',
    helpTitle: 'ਅਸੀਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦੇ ਹਾਂ?',
    step1: 'ਕਦਮ 1: ਸ਼ਿਕਾਇਤ ਕਿਵੇਂ ਦਰਜ ਕਰਨੀ ਹੈ',
    step2: 'ਕਦਮ 2: ਆਪਣੀ ਸ਼ਿਕਾਇਤ ਨੂੰ ਕਿਵੇਂ ਟਰੈਕ ਕਰਨਾ ਹੈ',
    step3: 'ਕਦਮ 3: ਆਪਣੇ ਵਿਭਾਗ ਨਾਲ ਕਿਵੇਂ ਸੰਪਰਕ ਕਰਨਾ ਹੈ',
    watchVideo: 'ਵੀਡੀਓ ਗਾਈਡ ਦੇਖੋ',
    fileWhatsapp: 'WhatsApp ਰਾਹੀਂ ਦਰਜ ਕਰੋ',
    noApp: 'ਕੋਈ ਐਪ ਨਹੀਂ। ਕੋਈ ਲੌਗਿਨ ਨਹੀਂ। ਸਿਰਫ਼ WhatsApp।',
    publicDash: 'ਜਨਤਕ ਡੈਸ਼ਬੋਰਡ',
    citizenPortal: 'ਨਾਗਰਿਕ ਪੋਰਟਲ',
    close: 'ਬੰਦ ਕਰੋ',
  },
  UR: {
    help: '? مدد',
    helpTitle: 'ہم آپ کی کیسے مدد کر سکتے ہیں؟',
    step1: 'مرحلہ 1: شکایت کیسے درج کریں',
    step2: 'مرحلہ 2: اپنی شکایت کو کیسے ٹریک کریں',
    step3: 'مرحلہ 3: اپنے محکمے سے کیسے رابطہ کریں',
    watchVideo: 'ویڈیو گائیڈ دیکھیں',
    fileWhatsapp: 'WhatsApp کے ذریعے فائل کریں',
    noApp: 'کوئی ایپ نہیں۔ کوئی لاگ ان نہیں۔ صرف WhatsApp۔',
    publicDash: 'عوامی ڈیش بورڈ',
    citizenPortal: 'شہری پورٹل',
    close: 'بند کریں',
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('EN');

  const t = (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['EN'][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
