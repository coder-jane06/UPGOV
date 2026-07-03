const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'i18n');
const languages = ['en.json', 'hi.json', 'pa.json', 'ur.json'];

const newCitizenKeys = {
  en: {
    "media": {
      "uploadTitle": "Upload Files",
      "dragDrop": "Drag & drop files or",
      "browse": "Browse",
      "formats": "Supported formats: JPEG, PNG, GIF, MP4",
      "uploadingPrefix": "Uploading - ",
      "uploadingSuffix": "/3 files",
      "uploaded": "Uploaded",
      "uploadBtn": "UPLOAD FILES",
      "maxFiles": "Maximum 3 files allowed."
    },
    "errors": {
      "aiFormat": "We could not read the AI response format. Please retry in a moment.",
      "mediaRequired": "You must upload at least one photo or video evidence."
    },
    "orSelectManually": "Or select manually",
    "mediaEvidenceTitle": "Media Evidence (Required)",
    "mediaEvidenceDesc": "You must upload a picture or video of the problem beforehand or by recording right now so the assigned officer can structurally verify it."
  },
  hi: {
    "media": {
      "uploadTitle": "फ़ाइलें अपलोड करें",
      "dragDrop": "फ़ाइलें खींचें और छोड़ें या",
      "browse": "ब्राउज़ करें",
      "formats": "समर्थित प्रारूप: JPEG, PNG, GIF, MP4",
      "uploadingPrefix": "अपलोड हो रहा है - ",
      "uploadingSuffix": "/3 फ़ाइलें",
      "uploaded": "अपलोड हो गया",
      "uploadBtn": "फ़ाइलें अपलोड करें",
      "maxFiles": "अधिकतम 3 फ़ाइलों की अनुमति है।"
    },
    "errors": {
      "aiFormat": "हम एआई प्रतिक्रिया प्रारूप नहीं पढ़ सके। कृपया एक क्षण में पुनः प्रयास करें।",
      "mediaRequired": "आपको कम से कम एक फोटो या वीडियो साक्ष्य अपलोड करना होगा।"
    },
    "orSelectManually": "या मैन्युअल रूप से चुनें",
    "mediaEvidenceTitle": "मीडिया साक्ष्य (आवश्यक)",
    "mediaEvidenceDesc": "आपको समस्या की तस्वीर या वीडियो पहले से ही या अभी रिकॉर्ड करके अपलोड करनी होगी ताकि नियुक्त अधिकारी संरचनात्मक रूप से इसे सत्यापित कर सके।"
  },
  pa: {
    "media": {
      "uploadTitle": "ਫਾਈਲਾਂ ਅੱਪਲੋਡ ਕਰੋ",
      "dragDrop": "ਫਾਈਲਾਂ ਖਿੱਚੋ ਅਤੇ ਛੱਡੋ ਜਾਂ",
      "browse": "ਬ੍ਰਾਊਜ਼ ਕਰੋ",
      "formats": "ਸਮਰਥਿਤ ਫਾਰਮੈਟ: JPEG, PNG, GIF, MP4",
      "uploadingPrefix": "ਅੱਪਲੋਡ ਹੋ ਰਿਹਾ ਹੈ - ",
      "uploadingSuffix": "/3 ਫਾਈਲਾਂ",
      "uploaded": "ਅੱਪਲੋਡ ਹੋ ਗਿਆ",
      "uploadBtn": "ਫਾਈਲਾਂ ਅੱਪਲੋਡ ਕਰੋ",
      "maxFiles": "ਵੱਧ ਤੋਂ ਵੱਧ 3 ਫਾਈਲਾਂ ਦੀ ਇਜਾਜ਼ਤ ਹੈ।"
    },
    "errors": {
      "aiFormat": "ਅਸੀਂ AI ਜਵਾਬ ਫਾਰਮੈਟ ਨਹੀਂ ਪੜ੍ਹ ਸਕੇ। ਕਿਰਪਾ ਕਰਕੇ ਕੁਝ ਪਲ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
      "mediaRequired": "ਤੁਹਾਨੂੰ ਘੱਟੋ-ਘੱਟ ਇੱਕ ਫੋਟੋ ਜਾਂ ਵੀਡੀਓ ਸਬੂਤ ਅੱਪਲੋਡ ਕਰਨਾ ਪਵੇਗਾ।"
    },
    "orSelectManually": "ਜਾਂ ਮੈਨੂਅਲ ਚੁਣੋ",
    "mediaEvidenceTitle": "ਮੀਡੀਆ ਸਬੂਤ (ਜ਼ਰੂਰੀ)",
    "mediaEvidenceDesc": "ਤੁਹਾਨੂੰ ਸਮੱਸਿਆ ਦੀ ਤਸਵੀਰ ਜਾਂ ਵੀਡੀਓ ਪਹਿਲਾਂ ਤੋਂ ਹੀ ਜਾਂ ਹੁਣ ਰਿਕਾਰਡ ਕਰਕੇ ਅੱਪਲੋਡ ਕਰਨੀ ਪਵੇਗੀ ਤਾਂ ਜੋ ਨਿਯੁਕਤ ਅਧਿਕਾਰੀ ਢਾਂਚਾਗਤ ਤੌਰ 'ਤੇ ਇਸਦੀ ਤਸਦੀਕ ਕਰ ਸਕੇ।"
  },
  ur: {
    "media": {
      "uploadTitle": "فائلیں اپ لوڈ کریں",
      "dragDrop": "فائلیں گھسیٹیں اور چھوڑیں یا",
      "browse": "براؤز کریں",
      "formats": "معاون فارمیٹس: JPEG, PNG, GIF, MP4",
      "uploadingPrefix": "اپ لوڈ ہو رہا ہے - ",
      "uploadingSuffix": "/3 فائلیں",
      "uploaded": "اپ لوڈ ہو گیا",
      "uploadBtn": "فائلیں اپ لوڈ کریں",
      "maxFiles": "زیادہ سے زیادہ 3 فائلوں کی اجازت ہے۔"
    },
    "errors": {
      "aiFormat": "ہم AI جواب کا فارمیٹ نہیں پڑھ سکے۔ براہ کرم ایک لمحے میں دوبارہ کوشش کریں۔",
      "mediaRequired": "آپ کو کم از کم ایک تصویر یا ویڈیو ثبوت اپ لوڈ کرنا ہوگا۔"
    },
    "orSelectManually": "یا دستی طور پر منتخب کریں",
    "mediaEvidenceTitle": "میڈیا ثبوت (درکار)",
    "mediaEvidenceDesc": "آپ کو مسئلہ کی تصویر یا ویڈیو پہلے سے یا ابھی ریکارڈ کر کے اپ لوڈ کرنی ہوگی تاکہ تفویض کردہ افسر اسے ساختی طور پر چیک کر سکے۔"
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
