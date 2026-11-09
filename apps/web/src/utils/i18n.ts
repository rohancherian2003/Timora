import enTranslations from '../locales/en.json';
import mlTranslations from '../locales/ml.json';

export type Language = 'en' | 'ml';

const translations: Record<Language, any> = {
  en: enTranslations,
  ml: mlTranslations,
};

/**
 * Access a nested key in the translation dictionary, e.g., t('common.resolved', lang)
 */
export function t(path: string, lang: Language = 'en'): string {
  const parts = path.split('.');
  let current = translations[lang] || translations.en;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      // Fallback to english if missing in ml
      let fallback = translations.en;
      for (const fPart of parts) {
        if (fallback && typeof fallback === 'object' && fPart in fallback) {
          fallback = fallback[fPart];
        } else {
          return path;
        }
      }
      return typeof fallback === 'string' ? fallback : path;
    }
  }
  return typeof current === 'string' ? current : path;
}

/**
 * Translate timber lot / wood batch titles
 */
export function translateWoodTitle(title: string, lang: Language = 'en'): string {
  if (!title) return '';
  if (lang === 'en') return title;

  const direct = translations.ml?.wood_titles?.[title];
  if (direct) return direct;

  // Fuzzy or partial checks for common wood title patterns
  if (title.includes('Nilambur Teak Planks') || title.includes('Teak Planks')) {
    if (title.includes('Kiln') || title.includes('Seasoned')) {
      return 'ഉണക്കിയ നിലമ്പൂർ തേക്ക് പലാകകൾ';
    }
    return 'ഒന്നാം തരം നിലമ്പൂർ തേക്ക് പലാകകൾ';
  }
  if (title.includes('Anjili') && (title.includes('Beams') || title.includes('Sawn Beams'))) {
    return 'ആഞ്ഞിലി തടി ഉത്തരങ്ങൾ';
  }
  if (title.includes('Mahogany') && title.includes('Beams')) {
    return 'മഹാഗണി തടി ഉത്തരങ്ങൾ';
  }
  if (title.includes('Anjili') && (title.includes('Joists') || title.includes('Rafters'))) {
    return 'ആഞ്ഞിലി കഴുക്കോലുകൾ';
  }
  if (title.includes('Mahogany') && title.includes('Framing')) {
    return 'മഹാഗണി അട്ടളങ്ങൾ';
  }
  if (title.includes('Heavy Joinery')) {
    return 'ആഞ്ഞിലി ചതുര കഴുക്കോലുകൾ (തച്ചുശാസ്ത്രം)';
  }

  return title;
}

/**
 * Translate order status codes from backend
 */
export function translateOrderStatus(status: string, lang: Language = 'en'): string {
  if (!status) return '';
  const s = status.toLowerCase();
  if (lang === 'en') {
    switch (s) {
      case 'delivered_pending':
        return 'Waiting for Confirmation';
      case 'buyer_confirmed':
        return 'Delivery Confirmed';
      case 'completed':
        return 'Completed & Delivered';
      case 'in_transit':
        return 'In Transit';
      case 'awaiting_confirmation':
        return 'Awaiting Confirmation';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }

  switch (s) {
    case 'delivered_pending':
      return 'ഡെലിവറി കാത്തിരിക്കുന്നു';
    case 'buyer_confirmed':
      return 'ഡെലിവറി സ്ഥിരീകരിച്ചു';
    case 'completed':
      return 'പൂർത്തിയായി';
    case 'in_transit':
      return 'വഴിയിലാണ്';
    case 'awaiting_confirmation':
      return 'സ്ഥിരീകരണം കാക്കുന്നു';
    case 'cancelled':
      return 'റദ്ദാക്കി';
    default:
      return status;
  }
}

/**
 * Translate grievance support ticket status
 */
export function translateTicketStatus(status: string, lang: Language = 'en'): string {
  if (!status) return '';
  const s = status.toLowerCase();
  if (lang === 'en') {
    return s === 'resolved' ? 'RESOLVED' : 'OPEN';
  }
  return s === 'resolved' ? 'പരിഹരിച്ചു' : 'നിലവിലുണ്ട്';
}

/**
 * Translate ticket category strings
 */
export function translateTicketCategory(category: string, lang: Language = 'en'): string {
  if (!category) return '';
  if (lang === 'en') return category;

  const catLower = category.toLowerCase();
  if (catLower.includes('quality') || catLower.includes('measurement') || catLower.includes('cft')) {
    return 'തടിയുടെ ഗുണനിലവാരം & സി.എഫ്.ടി അളവ് പ്രശ്നം';
  }
  if (catLower.includes('delay') || catLower.includes('sizing') || catLower.includes('sawmill')) {
    return 'തടി അറുക്കൽ / ഡെലിവറി കാലതാമസം';
  }
  if (catLower.includes('payment') || catLower.includes('escrow') || catLower.includes('advance')) {
    return 'പണമിടപാട് / അഡ്വാൻസ് തർക്കം';
  }
  if (catLower.includes('transit') || catLower.includes('form iv') || catLower.includes('pass')) {
    return 'ഫോറസ്റ്റ് ട്രാൻസിറ്റ് പാസ്സ് സംബന്ധിച്ച്';
  }
  return 'മറ്റു പരാതികൾ / പൊതുവായ സഹായം';
}

/**
 * Translate cut types / milling types
 */
export function translateCutType(cutType: string, lang: Language = 'en'): string {
  if (!cutType) return '';
  if (lang === 'en') return cutType;

  const ct = cutType.toLowerCase();
  if (ct.includes('plank')) return 'അറുത്ത പലകകൾ';
  if (ct.includes('beam') || ct.includes('squared')) return 'ചതുര കഴുക്കോലുകൾ';
  if (ct.includes('batten') || ct.includes('reaper')) return 'റീപ്പർ';
  if (ct.includes('round') || ct.includes('log')) return 'ഉരുണ്ട തടികൾ';
  if (ct.includes('firewood')) return 'വിറക് തടികൾ';

  return cutType;
}

/**
 * Translate species names
 */
export function translateSpecies(species: string, lang: Language = 'en'): string {
  if (!species) return '';
  if (lang === 'en') {
    return species.replace(/\s*\([^)]*\)/g, '').trim();
  }
  const sp = species.toLowerCase();
  if (sp.includes('teak') || sp.includes('തേക്ക്')) return 'തേക്ക്';
  if (sp.includes('anjili') || sp.includes('ആഞ്ഞിലി')) return 'ആഞ്ഞിലി';
  if (sp.includes('mahogany') || sp.includes('മഹാഗണി')) return 'മഹാഗണി';
  if (sp.includes('rosewood') || sp.includes('ഈട്ടി')) return 'ഈട്ടി';
  if (sp.includes('jackfruit') || sp.includes('പ്ലാവ്')) return 'പ്ലാവ്';
  if (sp.includes('rubber') || sp.includes('റബർ')) return 'റബർ';
  if (sp.includes('firewood') || sp.includes('വിറക്')) return 'വിറക്';
  return species;
}

/**
 * Translate system user roles
 */
export function translateRole(role: string, lang: Language = 'en'): string {
  if (!role) return '';
  const r = role.toLowerCase();
  if (lang === 'en') {
    switch (r) {
      case 'seller':
        return 'Individual Seller';
      case 'mill':
      case 'mill_owner':
        return 'Timber Mill Owner';
      case 'carpenter':
        return 'Master Carpenter';
      case 'transport':
        return 'Transport Owner';
      case 'admin':
        return 'Super Admin';
      case 'buyer':
      default:
        return 'Verified Buyer';
    }
  }

  switch (r) {
    case 'seller':
      return 'തടി കച്ചവടക്കാരൻ';
    case 'mill':
    case 'mill_owner':
      return 'തടി മിൽ ഉടമ';
    case 'carpenter':
      return 'വിദഗ്ദ്ധ ആശാരി';
    case 'transport':
      return 'വാഹന ഉടമ';
    case 'admin':
      return 'സൂപ്പർ അഡ്മിൻ';
    case 'buyer':
    default:
      return 'ഉപഭോക്താവ്';
  }
}

/**
 * Translate common units like CFT, Tonnes
 */
export function translateUnit(unit: string, lang: Language = 'en'): string {
  if (!unit) return '';
  if (lang === 'en') return unit;
  const u = unit.toLowerCase();
  if (u === 'cft') return 'സി.എഫ്.ടി';
  if (u.includes('tonne') || u.includes('ton')) return 'ടൺ';
  return unit;
}
