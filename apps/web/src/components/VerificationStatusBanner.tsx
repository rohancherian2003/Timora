import React from 'react';
import { ShieldCheck, Clock, AlertTriangle, XCircle, Ban, HelpCircle } from 'lucide-react';
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
    <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-300/80 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
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
      {onRaiseTicket && (
        <button
          type="button"
          onClick={onRaiseTicket}
          className="px-3.5 py-2 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 font-bold text-xs shadow-xs transition flex-shrink-0"
        >
          {lang === 'en' ? 'Check Status' : 'വിവരങ്ങൾ അറിയാൻ'}
        </button>
      )}
    </div>
  );
}
