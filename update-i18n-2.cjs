const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'i18n');
const languages = ['en.json', 'hi.json', 'pa.json', 'ur.json'];

const newCitizenKeys = {
  en: {
    "trackSubtitle": "Enter a ticket ID to view timeline progress and SLA usage.",
    "trackPlaceholder": "Example: GN 284731",
    "ticketLabel": "TICKET",
    "slaUsage": "SLA USAGE",
    "ratePrompt": "Rate this Resolution",
    "ai": {
      "notSupported": "Microphone/Voice Assistant is not supported in this browser. Please use Google Chrome.",
      "title": "Voice Assistant & Groq AI",
      "subtitle": "Speak your issue and Llama-3 will instantly route it.",
      "tapSpeak": "Tap to Speak",
      "stopListen": "Stop Listening",
      "listening": "Listening intently... Speak now.",
      "placeholder": "Click 'Tap to Speak' or type your issue manually here...",
      "thinking": "Thinking with Llama-3...",
      "categorizeBtn": "Auto-Categorize with Groq"
    },
    "chatBot": {
      "subtitle": "Chat with IndiaBot to file complaints or ask for tracking help.",
      "greeting": "Namaste! I'm IndiaBot. Share your issue and I will help file or track your complaint.",
      "botName": "IndiaBot",
      "botRole": "Official Support Assistant",
      "error": "Connection issue. Please try again.",
      "placeholder": "Type your message...",
      "send": "Send"
    }
  },
  hi: {
    "trackSubtitle": "समयरेखा प्रगति और SLA उपयोग देखने के लिए टिकट आईडी दर्ज करें।",
    "trackPlaceholder": "उदाहरण: GN 284731",
    "ticketLabel": "टिकट",
    "slaUsage": "SLA उपयोग",
    "ratePrompt": "इस समाधान का मूल्यांकन करें",
    "ai": {
      "notSupported": "माइक्रोफोन/वॉयस असिस्टेंट इस ब्राउज़र में समर्थित नहीं है। कृपया गूगल क्रोम का उपयोग करें।",
      "title": "वॉयस असिस्टेंट और Groq एआई",
      "subtitle": "अपनी समस्या बोलें और Llama-3 इसे तुरंत रूट करेगा।",
      "tapSpeak": "बोलने के लिए टैप करें",
      "stopListen": "सुनना बंद करें",
      "listening": "ध्यान से सुन रहा हूँ... अब बोलें।",
      "placeholder": "'बोलने के लिए टैप करें' पर क्लिक करें या अपना मुद्दा यहां मैन्युअल रूप से टाइप करें...",
      "thinking": "Llama-3 विचार कर रहा है...",
      "categorizeBtn": "Groq के साथ स्वतः-वर्गीकृत करें"
    },
    "chatBot": {
      "subtitle": "शिकायत दर्ज करने या ट्रैकिंग मदद के लिए इंडियाबॉट के साथ चैट करें।",
      "greeting": "नमस्ते! मैं इंडियाबॉट हूं। अपनी समस्या साझा करें और मैं आपकी शिकायत दर्ज करने या ट्रैक करने में मदद करूंगा।",
      "botName": "इंडियाबॉट",
      "botRole": "आधिकारिक सहायता सहायक",
      "error": "कनेक्शन समस्या। कृपया पुनः प्रयास करें।",
      "placeholder": "अपना संदेश टाइप करें...",
      "send": "भेजें"
    }
  },
  pa: {
    "trackSubtitle": "ਸਮਾਂਰੇਖਾ ਪ੍ਰਗਤੀ ਅਤੇ SLA ਵਰਤੋਂ ਦੇਖਣ ਲਈ ਇੱਕ ਟਿਕਟ ਆਈਡੀ ਦਰਜ ਕਰੋ।",
    "trackPlaceholder": "ਉਦਾਹਰਨ: GN 284731",
    "ticketLabel": "ਟਿਕਟ",
    "slaUsage": "SLA ਵਰਤੋਂ",
    "ratePrompt": "ਇਸ ਹੱਲ ਦਾ ਮੁਲਾਂਕਣ ਕਰੋ",
    "ai": {
      "notSupported": "ਮਾਈਕ੍ਰੋਫੋਨ/ਵੌਇਸ ਅਸਿਸਟੈਂਟ ਇਸ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਸਮਰਥਿਤ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਗੂਗਲ ਕਰੋਮ ਦੀ ਵਰਤੋਂ ਕਰੋ।",
      "title": "ਵੌਇਸ ਅਸਿਸਟੈਂਟ ਅਤੇ Groq AI",
      "subtitle": "ਆਪਣੀ ਸਮੱਸਿਆ ਬੋਲੋ ਅਤੇ Llama-3 ਇਸਨੂੰ ਤੁਰੰਤ ਰੂਟ ਕਰੇਗਾ।",
      "tapSpeak": "ਬੋਲਣ ਲਈ ਟੈਪ ਕਰੋ",
      "stopListen": "ਸੁਣਨਾ ਬੰਦ ਕਰੋ",
      "listening": "ਧਿਆਨ ਨਾਲ ਸੁਣ ਰਿਹਾ ਹਾਂ... ਹੁਣ ਬੋਲੋ।",
      "placeholder": "'ਬੋਲਣ ਲਈ ਟੈਪ ਕਰੋ' 'ਤੇ ਕਲਿੱਕ ਕਰੋ ਜਾਂ ਇੱਥੇ ਹੱਥੀਂ ਆਪਣੀ ਸਮੱਸਿਆ ਟਾਈਪ ਕਰੋ...",
      "thinking": "Llama-3 ਸੋਚ ਰਿਹਾ ਹੈ...",
      "categorizeBtn": "Groq ਨਾਲ ਸਵੈ-ਵਰਗੀਕ੍ਰਿਤ ਕਰੋ"
    },
    "chatBot": {
      "subtitle": "ਸ਼ਿਕਾਇਤਾਂ ਦਰਜ ਕਰਨ ਜਾਂ ਟ੍ਰੈਕਿੰਗ ਮਦਦ ਲਈ ਇੰਡੀਆਬੋਟ ਨਾਲ ਚੈਟ ਕਰੋ।",
      "greeting": "ਨਮਸਤੇ! ਮੈਂ ਇੰਡੀਆਬੋਟ ਹਾਂ। ਆਪਣੀ ਸਮੱਸਿਆ ਸਾਂਝੀ ਕਰੋ ਅਤੇ ਮੈਂ ਤੁਹਾਡੀ ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰਨ ਜਾਂ ਟ੍ਰੈਕ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰਾਂਗਾ।",
      "botName": "ਇੰਡੀਆਬੋਟ",
      "botRole": "ਅਧਿਕਾਰਤ ਸਹਾਇਤਾ ਸਹਾਇਕ",
      "error": "ਕੁਨੈਕਸ਼ਨ ਸਮੱਸਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
      "placeholder": "ਆਪਣਾ ਸੁਨੇਹਾ ਟਾਈਪ ਕਰੋ...",
      "send": "ਭੇਜੋ"
    }
  },
  ur: {
    "trackSubtitle": "ٹائم لائن کی پیشرفت اور SLA کا استعمال دیکھنے کے لیے ٹکٹ ID درج کریں۔",
    "trackPlaceholder": "مثال: GN 284731",
    "ticketLabel": "ٹکٹ",
    "slaUsage": "SLA استعمال",
    "ratePrompt": "اس کے حل کی درجہ بندی کریں",
    "ai": {
      "notSupported": "اس براؤزر میں مائیکروفون/وائس اسسٹنٹ تعاون یافتہ نہیں ہے۔ براہ کرم گوگل کروم استعمال کریں۔",
      "title": "وائس اسسٹنٹ اور Groq AI",
      "subtitle": "اپنی بات کہیں اور Llama-3 فوری طور پر اس کی درجہ بندی کرے گا۔",
      "tapSpeak": "بولنے کے لیے ٹیپ کریں",
      "stopListen": "سننا بند کریں",
      "listening": "غور سے سن رہا ہوں... اب بولیں۔",
      "placeholder": "'بولنے کے لیے ٹیپ کریں' پر کلک کریں یا یہاں دستی طور پر اپنا مسئلہ ٹائپ کریں...",
      "thinking": "Llama-3 سوچ رہا ہے...",
      "categorizeBtn": "Groq کے ساتھ خودکار درجہ بندی کریں"
    },
    "chatBot": {
      "subtitle": "شکایات درج کرنے یا ٹریکنگ میں مدد کے لیے انڈیابوٹ کے ساتھ چیٹ کریں۔",
      "greeting": "نمستے! میں انڈیابوٹ ہوں۔ اپنا مسئلہ بتائیں اور میں آپ کی شکایت درج کرنے یا ٹریک کرنے میں مدد کروں گا۔",
      "botName": "انڈیا بوٹ",
      "botRole": "آفیشل سپورٹ اسسٹنٹ",
      "error": "رابطے کا مسئلہ۔ براہ کرم دوبارہ کوشش کریں۔",
      "placeholder": "اپنا پیغام ٹائپ کریں...",
      "send": "بھیجیں"
    }
  }
};

languages.forEach(langFile => {
  const langCode = langFile.split('.')[0];
  const filePath = path.join(localesDir, langFile);
  
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (data.citizen) {
        data.citizen = {
          ...data.citizen,
          ...newCitizenKeys[langCode]
        };
      }
      
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`Updated ${langFile} successfully`);
    } catch (err) {
      console.error(`Error processing ${langFile}:`, err);
    }
  }
});
