const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'i18n');
const languages = ['en.json', 'hi.json', 'pa.json', 'ur.json'];

const officerKeys = {
  en: {
    "zoneAlpha": "Zone: Alpha-1 & Sector 36",
    "searchAssigned": "Search for an assigned ticket to begin on-site verification.",
    "markFalse": "Mark as False Report",
    "uploadPhoto": "Upload Field Photo (Required)",
    "verifySubtitle": "Confirm report validity from on-site inspection.",
    "verifyPlaceholder": "Enter ticket ID (e.g. IND-2410)",
    "performanceTitle": "Command Performance",
    "performanceSub": "Track operational metrics and citizen feedback loops.",
    "nearSla": "Near-SLA Cases",
    "flaggedToday": "6 flagged today",
    "liveFeedback": "Live Feedback Stream",
    "reportsTitle": "Field Reports",
    "reportsSub": "Generate AI-driven operational summaries of your zone.",
    "generateSummary": "Generate Shift Summary",
    "compileDesc": "Compile your completed verifications, unresolved flags, and pending actions into a comprehensive shift report for your superiors.",
    "compilingBtn": "Compiling Report...",
    "generateBtn": "Generate Auto-Report",
    "endOfShift": "End-of-Shift Summary"
  },
  hi: {
    "zoneAlpha": "ज़ोन: अल्फा -1 और सेक्टर 36",
    "searchAssigned": "ऑन-साइट सत्यापन शुरू करने के लिए असाइन किए गए टिकट की खोज करें।",
    "markFalse": "झूठी रिपोर्ट के रूप में चिह्नित करें",
    "uploadPhoto": "फ़ील्ड फ़ोटो अपलोड करें (आवश्यक)",
    "verifySubtitle": "ऑन-साइट निरीक्षण से रिपोर्ट की वैधता की पुष्टि करें।",
    "verifyPlaceholder": "टिकट आईडी दर्ज करें (उदा. IND-2410)",
    "performanceTitle": "कमांड प्रदर्शन",
    "performanceSub": "परिचालन मेट्रिक्स और नागरिक प्रतिक्रिया लूप ट्रैक करें।",
    "nearSla": "SLA के करीब मामले",
    "flaggedToday": "आज 6 चिह्नित",
    "liveFeedback": "लाइव फीडबैक स्ट्रीम",
    "reportsTitle": "फील्ड रिपोर्ट",
    "reportsSub": "अपने ज़ोन के एआई-संचालित परिचालन सारांश उत्पन्न करें।",
    "generateSummary": "शिफ्ट सारांश उत्पन्न करें",
    "compileDesc": "अपने वरिष्ठ अधिकारियों के लिए एक व्यापक शिफ्ट रिपोर्ट में अपने पूर्ण सत्यापन, अनसुलझे झंडे और लंबित कार्यों को संकलित करें।",
    "compilingBtn": "रिपोर्ट संकलित कर रहा है...",
    "generateBtn": "स्वतः-रिपोर्ट उत्पन्न करें",
    "endOfShift": "शिफ्ट के अंत का सारांश"
  },
  pa: {
    "zoneAlpha": "ਜ਼ੋਨ: ਐਲਫਾ-1 ਅਤੇ ਸੈਕਟਰ 36",
    "searchAssigned": "ਆਨ-ਸਾਈਟ ਵੈਰੀਫਿਕੇਸ਼ਨ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਅਸਾਈਨ ਕੀਤੀ ਟਿਕਟ ਦੀ ਖੋਜ ਕਰੋ।",
    "markFalse": "ਝੂਠੀ ਰਿਪੋਰਟ ਵਜੋਂ ਮਾਰਕ ਕਰੋ",
    "uploadPhoto": "ਫੀਲਡ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ (ਲੋੜੀਂਦਾ)",
    "verifySubtitle": "ਆਨ-ਸਾਈਟ ਨਿਰੀਖਣ ਤੋਂ ਰਿਪੋਰਟ ਦੀ ਵੈਧਤਾ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ।",
    "verifyPlaceholder": "ਟਿਕਟ ID ਦਰਜ ਕਰੋ (ਉਦਾਹਰਨ: IND-2410)",
    "performanceTitle": "ਕਮਾਂਡ ਪ੍ਰਦਰਸ਼ਨ",
    "performanceSub": "ਆਪ੍ਰੇਸ਼ਨਲ ਮੈਟ੍ਰਿਕਸ ਅਤੇ ਨਾਗਰਿਕ ਫੀਡਬੈਕ ਲੂਪਸ ਨੂੰ ਟ੍ਰੈਕ ਕਰੋ।",
    "nearSla": "SLA ਦੇ ਨੇੜੇ ਮਾਮਲੇ",
    "flaggedToday": "ਅੱਜ 6 ਫਲੈਗ ਕੀਤੇ ਗਏ",
    "liveFeedback": "ਲਾਈਵ ਫੀਡਬੈਕ ਸਟ੍ਰੀਮ",
    "reportsTitle": "ਫੀਲਡ ਰਿਪੋਰਟਾਂ",
    "reportsSub": "ਆਪਣੇ ਜ਼ੋਨ ਦੇ AI-ਸੰਚਾਲਿਤ ਆਪ੍ਰੇਸ਼ਨਲ ਸੰਖੇਪ ਤਿਆਰ ਕਰੋ।",
    "generateSummary": "ਸ਼ਿਫਟ ਸੰਖੇਪ ਤਿਆਰ ਕਰੋ",
    "compileDesc": "ਆਪਣੇ ਉੱਚ ਅਧਿਕਾਰੀਆਂ ਲਈ ਇੱਕ ਵਿਆਪਕ ਸ਼ਿਫਟ ਰਿਪੋਰਟ ਵਿੱਚ ਆਪਣੇ ਮੁਕੰਮਲ ਵੈਰੀਫਿਕੇਸ਼ਨ, ਅਣਸੁਲਝੇ ਝੰਡੇ, ਅਤੇ ਬਕਾਇਆ ਕਾਰਵਾਈਆਂ ਨੂੰ ਕੰਪਾਇਲ ਕਰੋ।",
    "compilingBtn": "ਰਿਪੋਰਟ ਕੰਪਾਇਲ ਕਰ ਰਿਹਾ ਹੈ...",
    "generateBtn": "ਆਟੋ-ਰਿਪੋਰਟ ਬਣਾਓ",
    "endOfShift": "ਸ਼ਿਫਟ ਦੇ ਅੰਤ ਦਾ ਸੰਖੇਪ"
  },
  ur: {
    "zoneAlpha": "زون: الفا 1 اور سیکٹر 36",
    "searchAssigned": "سائٹ پر تصدیق شروع کرنے کے لیے تفویض کردہ ٹکٹ تلاش کریں۔",
    "markFalse": "جھوٹی رپورٹ کے طور پر نشان زد کریں۔",
    "uploadPhoto": "فیلڈ فوٹو اپ لوڈ کریں (ضروری)",
    "verifySubtitle": "سائٹ پر معائنہ سے رپورٹ کی درستگی کی تصدیق کریں۔",
    "verifyPlaceholder": "ٹکٹ آئی ڈی درج کریں (مثال: IND-2410)",
    "performanceTitle": "کمانڈ کی کارکردگی",
    "performanceSub": "آپریشنل میٹرکس اور شہری آراء کے لوپس کو ٹریک کریں۔",
    "nearSla": "SLA کے قریب کیسز",
    "flaggedToday": "آج 6 کو نشان زد کیا گیا",
    "liveFeedback": "لائیو فیڈ بیک اسٹریم",
    "reportsTitle": "فیلڈ رپورٹس",
    "reportsSub": "اپنے زون کے AI سے چلنے والے آپریشنل خلاصے بنائیں۔",
    "generateSummary": "شفٹ کا خلاصہ بنائیں",
    "compileDesc": "اپنی مکمل شدہ تصدیقات، غیر حل شدہ جھنڈوں، اور زیر التواء کارروائیوں کو اپنے اعلیٰ حکام کے لیے ایک جامع شفٹ رپورٹ میں مرتب کریں۔",
    "compilingBtn": "رپورٹ مرتب ہو رہی ہے...",
    "generateBtn": "آٹو رپورٹ بنائیں",
    "endOfShift": "شفٹ کے اختتام کا خلاصہ"
  }
};

languages.forEach(langFile => {
  const langCode = langFile.split('.')[0];
  const filePath = path.join(localesDir, langFile);
  
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (!data.officer) {
        data.officer = {};
      }
      data.officer = {
        ...data.officer,
        ...officerKeys[langCode]
      };
      
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`Updated ${langFile} successfully`);
    } catch (err) {
      console.error(`Error processing ${langFile}:`, err);
    }
  }
});
