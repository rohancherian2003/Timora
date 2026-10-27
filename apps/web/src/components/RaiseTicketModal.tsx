import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  LifeBuoy,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  User,
  ShieldAlert
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

  // Strict Validation Error State
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    description?: string;
  }>({});

  // Success state with created ticket details
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicket | null>(null);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { name?: string; phone?: string; description?: string } = {};

    // Name validation
    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = lang === 'en' ? 'Full Name is required' : 'പേര് നൽകേണ്ടതാണ്';
    } else if (trimmedName.length < 3) {
      newErrors.name = lang === 'en' ? 'Name must be at least 3 characters' : 'പേര് കുറഞ്ഞത് 3 അക്ഷരങ്ങൾ വേണം';
    }

    // Phone validation
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) {
      newErrors.phone = lang === 'en' ? 'Phone number is required' : 'ഫോൺ നമ്പർ നൽകേണ്ടതാണ്';
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      newErrors.phone = lang === 'en'
        ? 'Enter a valid 10-digit Indian mobile number (starting 6-9)'
        : 'സാധുവായ 10-അക്ക മൊബൈൽ നമ്പർ നൽകുക (6-9 ൽ ആരംഭിക്കുന്നത്)';
    }

    // Description validation
    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      newErrors.description = lang === 'en' ? 'Please describe your problem' : 'പ്രശ്നം വിശദീകരിക്കേണ്ടതാണ്';
    } else if (trimmedDesc.length < 15) {
      newErrors.description = lang === 'en'
        ? `Please enter at least 15 characters (${trimmedDesc.length}/15)`
        : `കുറഞ്ഞത് 15 അക്ഷരങ്ങളെങ്കിലും നൽകുക (${trimmedDesc.length}/15)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const matchedCat = CATEGORIES.find((c) => c.key === categoryKey) || CATEGORIES[0]!;

    const ticket = createTicket({
      name: name.trim(),
      phone: phone.replace(/\D/g, ''),
      role,
      category: matchedCat.en,
      categoryMl: matchedCat.ml,
      description: description.trim(),
      priority,
    });

    setSubmittedTicket(ticket);
    setErrors({});
  };

  const handleResetAndClose = () => {
    setSubmittedTicket(null);
    setDescription('');
    setErrors({});
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#2C2218]/70 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn overflow-y-auto"
      onClick={handleResetAndClose}
    >
      <div
        className="bg-[#FDFBF7] rounded-3xl border-2 border-[#8E7F6B]/30 shadow-2xl max-w-lg w-full p-5 sm:p-7 space-y-4 max-h-[92vh] overflow-y-auto my-auto relative transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#8E7F6B]/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E7E1D6] text-[#5B6147] border border-[#8E7F6B]/30 flex items-center justify-center font-bold shadow-xs">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold font-serif text-[#4A3626] text-lg sm:text-xl">
                {lang === 'en' ? 'Raise a Support Ticket' : 'പരാതി നൽകുക (Raise a Ticket)'}
              </h3>
              <span className="text-[11px] text-[#7A5A3A] font-semibold block">
                {lang === 'en'
                  ? 'Official Timora Kerala Timber Grievance Cell'
                  : 'ടിമോറ തടി വിപണി പരാതി പരിഹാര കേന്ദ്രം'}
              </span>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="text-[#8E7F6B] hover:text-[#4A3626] p-1.5 rounded-xl hover:bg-[#E7E1D6]/50 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Confirmation View */}
        {submittedTicket ? (
          <div className="py-4 space-y-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-emerald-700" />
            </div>

            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full bg-[#E7E1D6] text-[#4A3626] border border-[#8E7F6B]/30 font-mono text-xs font-bold inline-block">
                Ticket ID: {submittedTicket.id}
              </span>
              <h4 className="font-extrabold font-serif text-[#4A3626] text-lg">
                {lang === 'en' ? 'Ticket Submitted to Admin!' : 'പരാതി അഡ്മിന് ലഭിച്ചിട്ടുണ്ട്!'}
              </h4>
            </div>

            {/* Resolution promise banner */}
            <div className="p-4 rounded-2xl bg-[#E7E1D6]/70 border border-[#8E7F6B]/30 text-left space-y-2.5">
              <div className="flex items-center gap-2 text-[#4A3626] text-xs font-bold">
                <Clock className="w-4 h-4 text-[#5B6147]" />
                <span>
                  {lang === 'en'
                    ? 'Expected Resolution: Within 2 Business Days'
                    : '2 ദിവസത്തിനുള്ളിൽ പരിഹാരം ഉറപ്പ്'}
                </span>
              </div>
              <p className="text-xs text-[#523F2F] leading-relaxed font-medium">
                {lang === 'en'
                  ? 'Our Super Admin cell will review your issue, inspect the timber depot/mill logs, and post a resolution reply directly to your Dashboard notifications.'
                  : 'അഡ്മിൻ ഈ പരാതി പരിശോധിച്ച്, ബന്ധപ്പെട്ട തടി വ്യാപാരിയുമായോ മില്ലുമായോ സംസാരിച്ച് 2 ദിവസത്തിനുള്ളിൽ ഇതിനുള്ള പരിഹാരം (Resolution Reply) താങ്കളുടെ ഡാഷ്‌ബോർഡിൽ അറിയിക്കുന്നതായിരിക്കും!'}
              </p>
              <div className="text-[11px] text-[#7A5A3A] pt-1.5 border-t border-[#8E7F6B]/20 flex items-center justify-between font-semibold">
                <span>Contact: +91 {submittedTicket.phone}</span>
                <span>{submittedTicket.createdAt}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleResetAndClose}
                className="w-full py-3 rounded-2xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs sm:text-sm shadow-md transition"
              >
                {lang === 'en' ? 'Close & Track Status' : 'ശരി, ട്രാക്ക് ചെയ്യുക'}
              </button>
            </div>
          </div>
        ) : (
          /* Ticket Form */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
            {/* Role Selection */}
            <div>
              <label className="block font-bold text-[#4A3626] mb-1.5">
                {lang === 'en' ? 'I am a:' : 'ഞാൻ ഒരു:'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'buyer', en: 'Buyer', ml: 'ഉപഭോക്താവ്' },
                  { key: 'seller', en: 'Merchant', ml: 'തടി വ്യാപാരി' },
                  { key: 'carpenter', en: 'Carpenter', ml: 'ആശാരി' },
                  { key: 'mill_owner', en: 'Sawmill', ml: 'മില്ല് ഉടമ' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setRole(item.key as TicketRole)}
                    className={`py-2 px-2.5 rounded-xl text-center font-bold text-[11px] border transition ${
                      role === item.key
                        ? 'bg-[#5B6147] text-white border-[#5B6147] shadow-xs'
                        : 'bg-white text-[#4A3626] border-[#8E7F6B]/30 hover:bg-[#E7E1D6]/40'
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
                <label className="block font-bold text-[#4A3626] mb-1">
                  {lang === 'en' ? 'Your Full Name' : 'താങ്കളുടെ പേര്'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[#8E7F6B] absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Suresh Kumar"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold text-[#4A3626] bg-white focus:outline-none focus:ring-2 ${
                      errors.name
                        ? 'border-red-500 focus:ring-red-400 bg-red-50/20'
                        : 'border-[#8E7F6B]/30 focus:ring-[#5B6147] focus:border-[#5B6147]'
                    }`}
                  />
                </div>
                {errors.name && (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-red-600 mt-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>{errors.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-[#4A3626] mb-1">
                  {lang === 'en' ? 'Phone Number' : 'ഫോൺ നമ്പർ'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#8E7F6B] absolute left-3 top-3" />
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9847123456"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPhone(val);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold text-[#4A3626] bg-white focus:outline-none focus:ring-2 ${
                      errors.phone
                        ? 'border-red-500 focus:ring-red-400 bg-red-50/20'
                        : 'border-[#8E7F6B]/30 focus:ring-[#5B6147] focus:border-[#5B6147]'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-red-600 mt-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>{errors.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Issue Category */}
            <div>
              <label className="block font-bold text-[#4A3626] mb-1">
                {lang === 'en' ? 'Issue Category' : 'പരാതിയുടെ വിഷയം'} <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryKey}
                onChange={(e) => setCategoryKey(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#8E7F6B]/30 bg-white text-xs sm:text-sm text-[#4A3626] font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B6147]"
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
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-[#4A3626]">
                  {lang === 'en' ? 'Problem / Issue Description' : 'എന്താണ് പ്രശ്നം / പരാതി'} <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] font-mono text-[#8E7F6B]">
                  {description.length}/1000
                </span>
              </div>
              <textarea
                rows={4}
                maxLength={1000}
                placeholder={
                  lang === 'en'
                    ? 'Describe what happened in detail (e.g. CFT measurement mismatch, quality defect, sawmill delay, unreturned advance)...'
                    : 'പ്രശ്നത്തെക്കുറിച്ച് വിശദമായി എഴുതുക (ഉദാ: തടിയുടെ അളവിൽ വന്ന വ്യത്യാസം, തടിക്ക് കേടുപാടുകൾ, മിൽ കാലതാമസം)...'
                }
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium text-[#4A3626] bg-white focus:outline-none focus:ring-2 ${
                  errors.description
                    ? 'border-red-500 focus:ring-red-400 bg-red-50/20'
                    : 'border-[#8E7F6B]/30 focus:ring-[#5B6147] focus:border-[#5B6147]'
                }`}
              />
              {errors.description && (
                <div className="flex items-center gap-1 text-[11px] font-semibold text-red-600 mt-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{errors.description}</span>
                </div>
              )}
            </div>

            {/* Priority */}
            <div className="flex items-center justify-between pt-1">
              <span className="font-bold text-[#4A3626] text-xs">
                {lang === 'en' ? 'Urgency Level:' : 'പ്രാധാന്യം:'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPriority('normal')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition ${
                    priority === 'normal'
                      ? 'bg-[#E7E1D6] text-[#4A3626] border-[#8E7F6B]/40 shadow-xs'
                      : 'bg-white text-[#7A5A3A] border-[#8E7F6B]/20 hover:bg-[#E7E1D6]/30'
                  }`}
                >
                  {lang === 'en' ? 'Normal' : 'സാധാരണ'}
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('urgent')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition ${
                    priority === 'urgent'
                      ? 'bg-[#8B3A2B] text-white border-[#8B3A2B] shadow-xs'
                      : 'bg-white text-[#8B3A2B] border-[#8B3A2B]/30 hover:bg-[#8B3A2B]/10'
                  }`}
                >
                  ⚡ {lang === 'en' ? 'Urgent' : 'അടിയന്തിരം'}
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3 border-t border-[#8E7F6B]/20 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 rounded-xl border border-[#8E7F6B]/40 text-[#4A3626] font-bold hover:bg-[#E7E1D6]/40 transition"
              >
                {lang === 'en' ? 'Cancel' : 'റദ്ദാക്കുക'}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold flex items-center gap-2 shadow-md shadow-amber-950/10 transition"
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

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
