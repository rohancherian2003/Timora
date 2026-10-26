const STORAGE_KEY = 'timora_support_tickets';
const INITIAL_TICKETS = [
    {
        id: 'TKT-2026-7842',
        name: 'Suresh Kumar',
        phone: '9847987654',
        role: 'buyer',
        category: 'Timber Quality & Measurement Issue',
        categoryMl: 'തടിയുടെ ഗുണനിലവാരം & സി.എഫ്.ടി അളവ്',
        description: 'Nilambur Teak logs delivered had mid-girth slightly less than specified in yard invoice (32 inches instead of 36 inches). Need measurement verification.',
        priority: 'urgent',
        status: 'resolved',
        createdAt: '2026-10-25 11:20',
        resolutionReply: 'അഡ്മിൻ ഡിപ്പോയുമായി നേരിട്ട് സംസാരിച്ചു. വ്യത്യാസം വന്ന 8 CFT തുക തിരികെ അക്കൗണ്ടിലേക്ക് നൽകാൻ വ്യാപാരി സമ്മതിച്ചിട്ടുണ്ട്. റീഫണ്ട് 24 മണിക്കൂറിനുള്ളിൽ ലഭിക്കും.',
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
        priority: 'normal',
        status: 'open',
        createdAt: '2026-10-26 10:30',
    },
];
export function getStoredTickets() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TICKETS));
            return INITIAL_TICKETS;
        }
        return JSON.parse(raw);
    }
    catch {
        return INITIAL_TICKETS;
    }
}
export function saveStoredTickets(tickets) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
        window.dispatchEvent(new Event('timora_tickets_updated'));
    }
    catch (err) {
        console.error('Failed to save tickets:', err);
    }
}
export function createTicket(ticketData) {
    const tickets = getStoredTickets();
    const idNumber = Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newTicket = {
        ...ticketData,
        id: `TKT-${now.getFullYear()}-${idNumber}`,
        status: 'open',
        createdAt: dateStr,
    };
    const updated = [newTicket, ...tickets];
    saveStoredTickets(updated);
    return newTicket;
}
export function resolveTicket(ticketId, replyMessage) {
    const tickets = getStoredTickets();
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    let resolvedTicket = null;
    const updated = tickets.map((t) => {
        if (t.id === ticketId) {
            resolvedTicket = {
                ...t,
                status: 'resolved',
                resolutionReply: replyMessage,
                resolvedAt: dateStr,
            };
            return resolvedTicket;
        }
        return t;
    });
    saveStoredTickets(updated);
    return resolvedTicket;
}
export function getTicketsForUser(phone, role) {
    const tickets = getStoredTickets();
    if (!phone && !role)
        return tickets;
    return tickets.filter((t) => {
        if (phone && t.phone.replace(/\D/g, '').includes(phone.replace(/\D/g, '')))
            return true;
        if (role && t.role === role)
            return true;
        return false;
    });
}
