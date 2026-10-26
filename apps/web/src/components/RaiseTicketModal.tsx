import React, { useState } from 'react';
import {
  LifeBuoy,
  X,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Phone,
  User,
  FileQuestion,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createTicket, SupportTicket, TicketRole } from '../utils/ticketService';

interface RaiseTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'en' | 'ml';
}

const CATEGORIES = [
  {
    key: 'quality',
    en: 'Timber Quality & CFT Measurement Issue',
    ml: 'തടിയുടെ ഗുണനിലവാരം & സി.എഫ്.ടി അളവ് പ്രശ്നം',
  },
  {
    key: 'mill_delay',
    en: 'Sawmill / Sizing Delivery Delay',
    ml: 'തടി അറുക്കൽ / ഡെലിവറി കാലതാമസം',
  },
  {
    key: 'payment',
    en: 'Payment & Advance Escrow Dispute',
    ml: 'പണമിടപാട് / അഡ്വാൻസ് തർക്കം',
  },
  {
    key: 'transit_pass',
    en: 'Forest Form IV Transit Pass Assistance',
    ml: 'ഫോറസ്റ്റ് ട്രാൻസിറ്റ് പാസ്സ് സംബന്ധിച്ച്',
  },
  {
    key: 'other',
    en: 'General Platform Support & Help',
    ml: 'മറ്റു പരാതികൾ / പൊതുവായ സഹായം',
  },
];

export function RaiseTicketModal({ isOpen, onClose, lang = 'en' }: RaiseTicketModalProps) {
  const { user } = useAuth();

  const [role, setRole] = useState<TicketRole>(
    (user?.role as TicketRole) || 'buyer'
  );
  const [name, setName] = useState<string>(user?.name || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [categoryKey, setCategoryKey] = useState<string>('quality');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');

  // Success state with created ticket details
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicket | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !description.trim()) return;

    const matchedCat = CATEGORIES.find((c) => c.key === categoryKey) || CATEGORIES[0]!;

    const ticket = createTicket({
      name: name.trim(),
      phone: phone.trim(),
      role,
      category: matchedCat.en,
      categoryMl: matchedCat.ml,
      description: description.trim(),
      priority,
    });

    setSubmittedTicket(ticket);
  };

  const handleResetAndClose = () => {
    setSubmittedTicket(null);
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-amber-300/80 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-[#78350f] flex items-center justify-center font-bold">
              <LifeBuoy className="w-5 h-5 text-[#b45309]" />
            </div>
            <div>
              <h3 className="font-extrabold font-serif text-[#2c160b] text-lg">
                {lang === 'en' ? 'Raise a Support Ticket' : 'പരാതി നൽകുക (Raise a Ticket)'}
              </h3>
              <span className="text-[11px] text-stone-500 font-medium">
                {lang === 'en'
                  ? 'Official Timora Kerala Timber Grievance Cell'
                  : 'ടിമോറ തടി വിപണി പരാതി പരിഹാര കേന്ദ്രം'}
              </span>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="text-stone-400 hover:text-stone-700 font-bold p-1 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Confirmation View */}
        {submittedTicket ? (
          <div className="py-4 space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-[#78350f] border border-amber-300 font-mono text-xs font-bold inline-block">
                Ticket ID: {submittedTicket.id}
              </span>
              <h4 className="font-extrabold font-serif text-[#2c160b] text-lg">
                {lang === 'en' ? 'Ticket Submitted to Admin!' : 'പരാതി അഡ്മിന് ലഭിച്ചിട്ടുണ്ട്!'}
              </h4>
            </div>

            {/* User-requested resolution promise banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#faf6ee] via-[#f4ebe0] to-[#ecdcc8] border border-amber-300 text-left space-y-2.5">
              <div className="flex items-center gap-2 text-[#78350f] text-xs font-bold">
                <Clock className="w-4 h-4 text-[#b45309]" />
                <span>
                  {lang === 'en'
                    ? 'Expected Resolution: Within 2 Business Days'
                    : '2 ദിവസത്തിനുള്ളിൽ പരിഹാരം ഉറപ്പ്'}
                </span>
              </div>
              <p className="text-xs text-[#2c160b] leading-relaxed font-medium">
                {lang === 'en'
                  ? 'Our Super Admin cell will review your issue, inspect the timber depot/mill logs, and post a resolution reply directly to your Dashboard notifications.'
                  : 'അഡ്മിൻ ഈ പരാതി പരിശോധിച്ച്, ബന്ധപ്പെട്ട തടി വ്യാപാരിയുമായോ മില്ലുമായോ സംസാരിച്ച് 2 ദിവസത്തിനുള്ളിൽ ഇതിനുള്ള പരിഹാരം (Resolution Reply) താങ്കളുടെ ഡാഷ്‌ബോർഡിൽ അറിയിക്കുന്നതായിരിക്കും!'}
              </p>
              <div className="text-[11px] text-stone-500 pt-1 border-t border-amber-200/60 flex items-center justify-between">
                <span>Contact: +91 {submittedTicket.phone}</span>
                <span>{submittedTicket.createdAt}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleResetAndClose}
                className="w-full py-3 rounded-2xl bg-[#b45309] hover:bg-[#92400e] text-white font-bold text-xs sm:text-sm shadow-md transition"
              >
                {lang === 'en' ? 'Close & Track Status' : 'ശരി, ട്രാക്ക് ചെയ്യുക'}
              </button>
            </div>
          </div>
        ) : (
          /* Ticket Form */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Role Selection */}
            <div>
              <label className="block font-bold text-stone-700 mb-1.5">
                {lang === 'en' ? 'I am a:' : 'ഞാൻ ഒരു:'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'buyer', en: 'Buyer / House Owner', ml: 'ഉപഭോക്താവ്' },
                  { key: 'seller', en: 'Timber Merchant', ml: 'തടി വ്യാപാരി' },
                  { key: 'carpenter', en: 'Master Carpenter', ml: 'ആശാരി' },
                  { key: 'mill_owner', en: 'Sawmill Owner', ml: 'മില്ല് ഉടമ' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setRole(item.key as TicketRole)}
                    className={`py-2 px-2.5 rounded-xl text-center font-bold text-[11px] border transition ${
                      role === item.key
                        ? 'bg-[#b45309] text-white border-[#b45309] shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {lang === 'en' ? item.en : item.ml}
                  </button>
                ))}
              </div>
            </div>

            {/* Name and Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  {lang === 'en' ? 'Your Full Name' : 'താങ്കളുടെ പേര്'} *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Suresh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-amber-300/80 bg-[#faf6ee]/50 text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#b45309]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  {lang === 'en' ? 'Phone Number' : 'ഫോൺ നമ്പർ'} *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-amber-300/80 bg-[#faf6ee]/50 text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#b45309]"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Issue Category */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {lang === 'en' ? 'Issue Category' : 'പരാതിയുടെ വിഷയം'} *
              </label>
              <select
                value={categoryKey}
                onChange={(e) => setCategoryKey(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-amber-300/80 bg-[#faf6ee]/50 text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#b45309]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {lang === 'en' ? cat.en : cat.ml}
                  </option>
                ))}
              </select>
            </div>

            {/* Issue Description */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {lang === 'en' ? 'Problem / Issue Description' : 'എന്താണ് പ്രശ്നം / പരാതി'} *
              </label>
              <textarea
                rows={4}
                placeholder={
                  lang === 'en'
                    ? 'Describe what happened (e.g. CFT measurement mismatch, quality defect, sawmill delay, unreturned advance)...'
                    : 'പ്രശ്നത്തെക്കുറിച്ച് വിശദമായി എഴുതുക (ഉദാ: തടിയുടെ അളവിൽ വന്ന വ്യത്യാസം, തടിക്ക് കേടുപാടുകൾ, മിൽ കാലതാമസം)...'
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300/80 bg-[#faf6ee]/50 text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#b45309]"
                required
              />
            </div>

            {/* Priority */}
            <div className="flex items-center justify-between pt-1">
              <span className="font-bold text-stone-700 text-xs">
                {lang === 'en' ? 'Urgency Level:' : 'പ്രാധാന്യം:'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPriority('normal')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                    priority === 'normal'
                      ? 'bg-amber-100 text-[#78350f] border border-amber-300'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {lang === 'en' ? 'Normal (സാധാരണ)' : 'സാധാരണ'}
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('urgent')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                    priority === 'urgent'
                      ? 'bg-red-100 text-red-700 border border-red-300'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  ⚡ {lang === 'en' ? 'Urgent (അടിയന്തിരം)' : 'അടിയന്തിരം'}
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition"
              >
                {lang === 'en' ? 'Cancel' : 'റദ്ദാക്കുക'}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-bold flex items-center gap-2 shadow-md shadow-amber-950/10 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Submit to Admin' : 'അഡ്മിന് അയക്കുക'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
