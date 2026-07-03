const AREA_TRANSLATIONS = {
  hi: {
    sector: 'सेक्टर',
    knowledgePark: 'नॉलेज पार्क',
    alpha: 'अल्फा',
    beta: 'बीटा',
    gamma: 'गामा',
    delta: 'डेल्टा',
    omega: 'ओमेगा',
    mu: 'म्यू',
    chi: 'काई',
    phi: 'फाई',
    pi: 'पाई',
    psi: 'साई',
    pariChowk: 'परी चौक',
    kp: 'केपी',
  },
  pa: {
    sector: 'ਸੈਕਟਰ',
    knowledgePark: 'ਨੋਲੇਜ ਪਾਰਕ',
    alpha: 'ਅਲਫਾ',
    beta: 'ਬੀਟਾ',
    gamma: 'ਗਾਮਾ',
    delta: 'ਡੈਲਟਾ',
    omega: 'ਓਮੇਗਾ',
    mu: 'ਮਿਊ',
    chi: 'ਚਾਈ',
    phi: 'ਫਾਈ',
    pi: 'ਪਾਈ',
    psi: 'ਪਸਾਈ',
    pariChowk: 'ਪਰੀ ਚੌਕ',
    kp: 'ਕੇਪੀ',
  },
  ur: {
    sector: 'سیکٹر',
    knowledgePark: 'نالِج پارک',
    alpha: 'الفا',
    beta: 'بیٹا',
    gamma: 'گاما',
    delta: 'ڈیلٹا',
    omega: 'اومیگا',
    mu: 'میو',
    chi: 'کائی',
    phi: 'فائی',
    pi: 'پائی',
    psi: 'سائی',
    pariChowk: 'پری چوک',
    kp: 'کے پی',
  },
};

const AREA_LABELS = {
  Omega: 'omega',
  Mu: 'mu',
  Chi: 'chi',
  Phi: 'phi',
  Pi: 'pi',
  Psi: 'psi',
  'Pari Chowk': 'pariChowk',
};

export function getBaseLanguage(i18nOrLanguage) {
  const raw = typeof i18nOrLanguage === 'string' ? i18nOrLanguage : i18nOrLanguage?.language;
  return String(raw || 'en').split('-')[0];
}

export function translateKey(t, i18n, key, fallback, options) {
  if (!key) return fallback ?? '';
  return i18n?.exists?.(key) ? t(key, options) : fallback ?? key;
}

export function translateDomainValue(t, i18n, prefix, value) {
  if (!value) return '';
  return translateKey(t, i18n, `${prefix}.${value}`, value);
}

export function translateCategory(t, i18n, value) {
  return translateDomainValue(t, i18n, 'category', value);
}

export function translateSubcategory(t, i18n, value) {
  return translateDomainValue(t, i18n, 'subcategory', value);
}

export function translatePriority(t, i18n, value) {
  return translateDomainValue(t, i18n, 'priority', value);
}

export function translateStatus(t, i18n, value) {
  return translateDomainValue(t, i18n, 'status', value);
}

export function translateDepartment(t, i18n, value) {
  return translateDomainValue(t, i18n, 'dept', value);
}

export function translateTicketDescription(t, i18n, ticketId, fallback) {
  return translateKey(t, i18n, `data.${ticketId}`, fallback || ticketId);
}

export function translateSectorName(i18nOrLanguage, value) {
  if (!value) return '';

  const language = getBaseLanguage(i18nOrLanguage);
  if (language === 'en') return value;

  const dict = AREA_TRANSLATIONS[language];
  if (!dict) return value;

  const sectorMatch = /^Sector\s+(\d+)$/i.exec(value);
  if (sectorMatch) return `${dict.sector} ${sectorMatch[1]}`;

  const knowledgeParkMatch = /^Knowledge Park\s+(.+)$/i.exec(value);
  if (knowledgeParkMatch) return `${dict.knowledgePark} ${knowledgeParkMatch[1]}`;

  const greekBlockMatch = /^(Alpha|Beta|Gamma|Delta)\s+(\d+)$/i.exec(value);
  if (greekBlockMatch) {
    const label = dict[greekBlockMatch[1].toLowerCase()] || greekBlockMatch[1];
    return `${label} ${greekBlockMatch[2]}`;
  }

  const kpMatch = /^KP\s+(.+)$/i.exec(value);
  if (kpMatch) return `${dict.kp} ${kpMatch[1]}`;

  const knownArea = AREA_LABELS[value];
  if (knownArea) return dict[knownArea] || value;

  return value;
}
