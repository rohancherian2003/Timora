import React, { useState } from 'react';
import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  XCircle,
  Ban,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  LifeBuoy
} from 'lucide-react';
import type { ApprovalStatus, UserRole } from '@timora/shared';

interface VerificationStatusBannerProps {
  status?: ApprovalStatus | string;
  role?: UserRole | string;
  entityName?: string;
  note?: string;
  lang?: 'en' | 'ml';
  onRaiseTicket?: () => void;
}

export function VerificationStatusBanner({
  status = 'PENDING_APPROVAL',
  role = 'seller',
  entityName,
  note,
  lang = 'en',
  onRaiseTicket,
}: VerificationStatusBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  // Normalize status key
  const normalizedStatus = (status || 'PENDING_APPROVAL').toUpperCase();

  if (normalizedStatus === 'APPROVED') {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/90 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-600 text-white flex-shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-emerald-900">
                {lang === 'en' ? 'Verified & Approved Account' : 'അംഗീകൃത ബിസിനസ്സ് അക്കൗണ്ട്'}
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 uppercase tracking-wider">
                {lang === 'en' ? 'Active' : 'സജീവം'}
              </span>
            </div>
            <p className="text-xs text-emerald-800 mt-0.5">
              {lang === 'en'
                ? 'Your business profile and listings are publicly visible across Kerala.'
                : 'നിങ്ങളുടെ വിവരങ്ങളും തടി ലിസ്റ്റിംഗുകളും കേരളത്തിലുടനീളം കാണാൻ സാധിക്കും.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (normalizedStatus === 'ACTION_REQUIRED') {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/95 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-600 text-white flex-shrink-0 shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-amber-950">
                {lang === 'en' ? 'Action Required: Additional Details Needed' : 'ശ്രദ്ധിക്കുക: കൂടുതൽ വിവരങ്ങൾ ആവശ്യമാണ്'}
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 uppercase tracking-wider">
                {lang === 'en' ? 'Action Required' : 'പരിശോധനയിൽ'}
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-0.5">
              {note ||
                (lang === 'en'
                  ? 'Please update your sawmill/depot license or transit permit records to complete verification.'
                  : 'അംഗീകാരം പൂർത്തിയാക്കാൻ ഡിപ്പോ/മിൽ ലൈസൻസ് വിവരങ്ങൾ നൽകുക.')}
            </p>
          </div>
        </div>
        {onRaiseTicket && (
          <button
            type="button"
            onClick={onRaiseTicket}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition flex-shrink-0"
          >
            {lang === 'en' ? 'Submit Documents' : 'രേഖകൾ സമർപ്പിക്കുക'}
          </button>
        )}
      </div>
    );
  }

  if (normalizedStatus === 'REJECTED') {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/95 border border-rose-300 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-600 text-white flex-shrink-0 shadow-xs">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-rose-950">
                {lang === 'en' ? 'Registration Application Not Approved' : 'അപേക്ഷ നിരസിക്കപ്പെട്ടു'}
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 uppercase tracking-wider">
                {lang === 'en' ? 'Rejected' : 'നിരസിച്ചു'}
              </span>
            </div>
            <p className="text-xs text-rose-800 mt-0.5">
              {note
                ? `${lang === 'en' ? 'Reason: ' : 'കാരണം: '}${note}`
                : lang === 'en'
                ? 'Your registration details could not be verified by the admin cell.'
                : 'നൽകിയ വിവരങ്ങൾ സ്ഥിരീകരിക്കാൻ സാധിച്ചില്ല.'}
            </p>
          </div>
        </div>
        {onRaiseTicket && (
          <button
            type="button"
            onClick={onRaiseTicket}
            className="px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-xs transition flex-shrink-0"
          >
            {lang === 'en' ? 'Request Re-Review' : 'പുനഃപരിശോധന'}
          </button>
        )}
      </div>
    );
  }

  if (normalizedStatus === 'SUSPENDED') {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-stone-100 border border-stone-300 text-stone-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-xl bg-stone-700 text-white flex-shrink-0">
            <Ban className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-stone-900">
                {lang === 'en' ? 'Account Suspended' : 'അക്കൗണ്ട് താൽക്കാലികമായി നിർത്തിവെച്ചിരിക്കുന്നു'}
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              {note ||
                (lang === 'en'
                  ? 'Your business operations on Timora have been paused. Please contact administration.'
                  : 'ടിമോറയിലെ നിങ്ങളുടെ സേവനങ്ങൾ നിർത്തിവെച്ചിരിക്കുന്നു. അഡ്മിനുമായി ബന്ധപ്പെടുക.')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default: PENDING_APPROVAL
  return (
    <div className="rounded-2xl bg-amber-50/90 border border-amber-300/80 text-amber-950 shadow-xs overflow-hidden transition-all">
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500 text-white flex-shrink-0 shadow-xs">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-amber-950">
                {lang === 'en' ? 'Verification Status: Pending Admin Review' : 'സ്ഥിരീകരണം: അഡ്മിൻ പരിശോധനയിൽ'}
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 uppercase tracking-wider">
                {lang === 'en' ? 'Pending' : 'പെൻഡിംഗ്'}
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-0.5">
              {lang === 'en'
                ? 'Your account is under verification. Public timber listings and contact visibility will activate upon approval.'
                : 'നിങ്ങളുടെ അക്കൗണ്ട് അഡ്മിൻ പരിശോധനയിലാണ്. അംഗീകാരം ലഭിച്ച ശേഷം ലിസ്റ്റിംഗുകൾ പബ്ലിക് ആയി ദൃശ്യമാകും.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3.5 py-2 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 font-bold text-xs shadow-xs transition flex items-center gap-1.5 flex-shrink-0"
        >
          <span>{isExpanded ? (lang === 'en' ? 'Hide Details' : 'വിവരങ്ങൾ മറയ്ക്കുക') : (lang === 'en' ? 'Check Status' : 'വിവരങ്ങൾ അറിയാൻ')}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Inline Expanded Verification Details (Corrected behavior: expands inline, does not open ticket modal) */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-2 border-t border-amber-200/80 bg-white/70 space-y-4 animate-fadeIn text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">
                {lang === 'en' ? 'Review Stage' : 'പരിശോധനാ ഘട്ടം'}
              </span>
              <span className="font-bold text-amber-900 text-xs flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{lang === 'en' ? 'Document Verification' : 'രേഖകളുടെ പരിശോധന'}</span>
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">
                {lang === 'en' ? 'Assigned Cell' : 'നിർവ്വഹണ വിഭാഗം'}
              </span>
              <span className="font-bold text-stone-800 text-xs">
                {lang === 'en' ? 'Kerala Timber Admin Cell' : 'കേരള ടിംബർ അഡ്മിൻ സെൽ'}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">
                {lang === 'en' ? 'Next Action' : 'അടുത്ത ഘട്ടം'}
              </span>
              <span className="font-bold text-emerald-800 text-xs">
                {lang === 'en' ? 'Wait for SMS / Push Notification' : 'അറിയിപ്പിനായി കാത്തിരിക്കുക'}
              </span>
            </div>
          </div>

          {note && (
            <div className="p-3.5 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-950 space-y-1">
              <span className="font-bold text-[11px] block">
                {lang === 'en' ? 'Admin Feedback / Review Note:' : 'അഡ്മിൻ നൽകിയ കുറിപ്പ്:'}
              </span>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">{note}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-amber-200/60">
            <span className="text-[11px] text-stone-500">
              {lang === 'en'
                ? 'Need priority clearance or facing verification issues?'
                : 'അടിയന്തിര സഹായം ആവശ്യമുണ്ടോ?'}
            </span>
            {onRaiseTicket && (
              <button
                type="button"
                onClick={onRaiseTicket}
                className="px-3.5 py-1.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
              >
                <LifeBuoy className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Contact Support Desk' : 'സഹായത്തിന് ബന്ധപ്പെടുക'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
