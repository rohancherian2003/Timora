export type TicketRole = 'buyer' | 'seller' | 'carpenter' | 'mill_owner';
export type TicketStatus = 'open' | 'in_progress' | 'resolved';

export interface SupportTicket {
  id: string;
  name: string;
  phone: string;
  role: TicketRole;
  category: string;
  categoryMl: string;
  description: string;
  descriptionMl?: string;
  priority: 'normal' | 'urgent';
  status: TicketStatus;
  createdAt: string;
  resolutionReply?: string;
  resolutionReplyMl?: string;
  resolvedAt?: string;
}

const STORAGE_KEY = 'timora_support_tickets';

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'TKT-2026-7842',
    name: 'Suresh Kumar',
    phone: '9847987654',
    role: 'buyer',
    category: 'Timber Quality & Measurement Issue',
    categoryMl: 'തടിയുടെ ഗുണനിലവാരം & സി.എഫ്.ടി അളവ്',
    description: 'Nilambur Teak logs delivered had mid-girth slightly less than specified in yard invoice (32 inches instead of 36 inches). Need measurement verification.',
    descriptionMl: 'ഡെലിവറി ചെയ്ത നിലമ്പൂർ തേക്ക് ലോഗുകളുടെ വണ്ണം ഇൻവോയ്സിൽ പറഞ്ഞതിനേക്കാൾ കുറവായിരുന്നു (36 ഇഞ്ചിന് പകരം 32 ഇഞ്ച്). അളവ് പരിശോധന ആവശ്യമാണ്.',
    priority: 'urgent',
    status: 'resolved',
    createdAt: '2026-10-25 11:20',
    resolutionReply: 'Admin contacted the depot management directly. The merchant verified the 8 CFT variance and agreed to issue a refund for the price difference. The refund will reflect within 24 hours.',
    resolutionReplyMl: 'അഡ്മിൻ ഡിപ്പോയുമായി നേരിട്ട് സംസാരിച്ചു. വ്യത്യാസം വന്ന 8 CFT തുക തിരികെ അക്കൗണ്ടിലേക്ക് നൽകാൻ വ്യാപാരി സമ്മതിച്ചിട്ടുണ്ട്. റീഫണ്ട് 24 മണിക്കൂറിനുള്ളിൽ ലഭിക്കും.',
    resolvedAt: '2026-10-25 15:45',
  },
  {
    id: 'TKT-2026-8901',
    name: 'Nilambur Wood Mart',
    phone: '9847120001',
    role: 'seller',
    category: 'Forest Form IV Transit Pass Logistics',
    categoryMl: 'ഫോറസ്റ്റ് ഫോം IV ട്രാൻസിറ്റ് പാസ്സ് സംബന്ധിച്ച്',
    description: 'Inter-district timber transit checkpost delay near Chalakudy. Need verification certificate for Anjili squared beams.',
    descriptionMl: 'ചാലക്കുടിക്ക് സമീപമുള്ള ഫോറസ്റ്റ് ചെക്ക്പോസ്റ്റിൽ കാലതാമസം. ആഞ്ഞിലി തടികൾക്കുള്ള വേരിഫിക്കേഷൻ സർട്ടിഫിക്കറ്റ് വേഗത്തിൽ ലഭ്യമാക്കണം.',
    priority: 'urgent',
    status: 'open',
    createdAt: '2026-10-26 09:15',
  },
  {
    id: 'TKT-2026-9114',
    name: 'K. R. Mohanan Achari',
    phone: '9447300101',
    role: 'carpenter',
    category: 'Carpenter Profile & Verification',
    categoryMl: 'ആശാരി പ്രൊഫൈൽ വെരിഫിക്കേഷൻ',
    description: 'Updated joinery workshop address in Kottayam Changanassery. Need profile badge refreshed.',
    descriptionMl: 'ചങ്ങനാശ്ശേരിയിലെ പുതിയ വർക്ക്ഷോപ്പ് വിലാസം അപ്ഡേറ്റ് ചെയ്തു. പ്രൊഫൈൽ ബാഡ്ജ് പുതുക്കണം.',
    priority: 'normal',
    status: 'open',
    createdAt: '2026-10-26 10:30',
  },
];

export function getStoredTickets(): SupportTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TICKETS));
      return INITIAL_TICKETS;
    }
    const parsed: SupportTicket[] = JSON.parse(raw);
    
    // Auto-migrate: ensure initial tickets have English resolution replies
    let updated = false;
    const migrated = parsed.map((t) => {
      if (t.id === 'TKT-2026-7842' && (!t.resolutionReplyMl || !t.resolutionReply || t.resolutionReply.startsWith('അഡ്മിൻ'))) {
        updated = true;
        return {
          ...t,
          resolutionReply: 'Admin contacted the depot management directly. The merchant verified the 8 CFT variance and agreed to issue a refund for the price difference. The refund will reflect within 24 hours.',
          resolutionReplyMl: 'അഡ്മിൻ ഡിപ്പോയുമായി നേരിട്ട് സംസാരിച്ചു. വ്യത്യാസം വന്ന 8 CFT തുക തിരികെ അക്കൗണ്ടിലേക്ക് നൽകാൻ വ്യാപാരി സമ്മതിച്ചിട്ടുണ്ട്. റീഫണ്ട് 24 മണിക്കൂറിനുള്ളിൽ ലഭിക്കും.',
        };
      }
      return t;
    });

    if (updated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }

    return parsed;
  } catch {
    return INITIAL_TICKETS;
  }
}

export function saveStoredTickets(tickets: SupportTicket[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    window.dispatchEvent(new Event('timora_tickets_updated'));
  } catch (err) {
    console.error('Failed to save tickets:', err);
  }
}

export function createTicket(ticketData: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>): SupportTicket {
  const tickets = getStoredTickets();
  const idNumber = Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newTicket: SupportTicket = {
    ...ticketData,
    id: `TKT-${now.getFullYear()}-${idNumber}`,
    status: 'open',
    createdAt: dateStr,
  };

  const updated = [newTicket, ...tickets];
  saveStoredTickets(updated);
  return newTicket;
}

export function resolveTicket(ticketId: string, replyMessage: string, replyMessageMl?: string): SupportTicket | null {
  const tickets = getStoredTickets();
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  let resolvedTicket: SupportTicket | null = null;
  const updated = tickets.map((t) => {
    if (t.id === ticketId) {
      resolvedTicket = {
        ...t,
        status: 'resolved' as TicketStatus,
        resolutionReply: replyMessage,
        resolutionReplyMl: replyMessageMl || replyMessage,
        resolvedAt: dateStr,
      };
      return resolvedTicket;
    }
    return t;
  });

  saveStoredTickets(updated);
  return resolvedTicket;
}

export function getTicketsForUser(phone?: string, role?: string): SupportTicket[] {
  const tickets = getStoredTickets();
  if (!phone && !role) return tickets;
  return tickets.filter((t) => {
    if (phone && t.phone.replace(/\D/g, '').includes(phone.replace(/\D/g, ''))) return true;
    if (role && t.role === role) return true;
    return false;
  });
}
