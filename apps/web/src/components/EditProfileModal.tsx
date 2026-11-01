import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  User,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  Building2,
  Hammer,
  Truck,
  Phone,
  MapPin,
  Award,
  KeyRound,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useAuth, UserProfile } from '../context/AuthContext';
import { validateIndianPhone } from '@timora/shared';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'en' | 'ml';
}

const KERALA_DISTRICTS = [
  'Alappuzha (ആലപ്പുഴ)',
  'Ernakulam (എറണാകുളം)',
  'Idukki (ഇടുക്കി)',
  'Kannur (കണ്ണൂർ)',
  'Kasaragod (കാസർഗോഡ്)',
  'Kollam (കൊല്ലം)',
  'Kottayam (കോട്ടയം)',
  'Kozhikode (കോഴിക്കോട്)',
  'Malappuram (മലപ്പുറം)',
  'Palakkad (പാലക്കാട്)',
  'Pathanamthitta (പത്തനംതിട്ട)',
  'Thiruvananthapuram (തിരുവനന്തപുരം)',
  'Thrissur (തൃശ്ശൂർ)',
  'Wayanad (വയനാട്)',
];

export function EditProfileModal({ isOpen, onClose, lang = 'en' }: EditProfileModalProps) {
  const { user, updateProfile, refreshUser, setUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [millName, setMillName] = useState(user?.millName || '');
  const [district, setDistrict] = useState(user?.district || KERALA_DISTRICTS[0]!);
  const [skills, setSkills] = useState(user?.skills?.join(', ') || 'Traditional Joinery, Roof Trusses, Teak Carving');
  const [experience, setExperience] = useState(user?.experience || 10);
  const [vehicleDetails, setVehicleDetails] = useState(user?.vehicleDetails || '10-Wheel Heavy Timber Lorry');
  const [tonnageCapacity, setTonnageCapacity] = useState(user?.tonnageCapacity || 25);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Phone Change State
  const [showPhoneChange, setShowPhoneChange] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneUpdating, setPhoneUpdating] = useState(false);
  const [phoneNotice, setPhoneNotice] = useState<{ type: 'error' | 'info' | 'success'; message: string } | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // ─────────────────────────────────────────────────────────────
  // 1. ROCK-SOLID BACKGROUND SCROLL LOCK (DESKTOP & MOBILE SWIPE)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    // Save exact scroll position
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Cache original body styles
    const originalStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      paddingRight: document.body.style.paddingRight,
    };

    // Lock background scrolling completely without page jump
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Touch gesture lock for mobile devices: prevent swipe outside modal
    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-modal-scrollable="true"]')) {
        e.preventDefault();
      }
    };

    // Wheel event lock: prevent background wheel scrolling
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-modal-scrollable="true"]')) {
        e.preventDefault();
      }
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('wheel', handleWheel);

      // Restore original body styles
      document.body.style.overflow = originalStyles.overflow;
      document.body.style.position = originalStyles.position;
      document.body.style.top = originalStyles.top;
      document.body.style.width = originalStyles.width;
      document.body.style.paddingRight = originalStyles.paddingRight;

      // Restore exact previous scroll position
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBusinessName(user.businessName || '');
      setMillName(user.millName || '');
      setDistrict(user.district || KERALA_DISTRICTS[0]!);
      setSkills(user.skills?.join(', ') || '');
      setExperience(user.experience || 10);
      setVehicleDetails(user.vehicleDetails || '');
      setTonnageCapacity(user.tonnageCapacity || 25);
    }
  }, [user, isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  // ─────────────────────────────────────────────────────────────
  // SELF-SERVICE PHONE NUMBER UPDATE HANDLERS
  // ─────────────────────────────────────────────────────────────
  const handleInitiatePhoneChange = async () => {
    setPhoneNotice(null);
    const { valid, normalized, message } = validateIndianPhone(newPhone);
    if (!valid || !normalized) {
      setPhoneNotice({
        type: 'error',
        message: message || (lang === 'en' ? 'Please enter a valid 10-digit mobile number.' : 'ശരിയായ 10-അക്ക മൊബൈൽ നമ്പർ നൽകുക.'),
      });
      return;
    }

    if (normalized === user.phone) {
      setPhoneNotice({
        type: 'error',
        message: lang === 'en' ? 'New number cannot be the same as your current number.' : 'പുതിയ നമ്പർ നിലവിലുള്ള നമ്പറിൽ നിന്ന് വ്യത്യസ്തമായിരിക്കണം.',
      });
      return;
    }

    setPhoneUpdating(true);
    try {
      const { api } = await import('../lib/api');
      const res = await api.post('/auth/phone/initiate-change', { newPhone: normalized });
      if (res.data?.data?.configured) {
        setPhoneOtpSent(true);
        setPhoneNotice({
          type: 'info',
          message: lang === 'en' ? 'Verification OTP dispatched via SMS to your new number.' : 'നിങ്ങളുടെ പുതിയ നമ്പറിലേക്ക് ഒ.ടി.പി അയച്ചിട്ടുണ്ട്.',
        });
      } else {
        // Genuine SMS infrastructure not configured in server environment
        setPhoneNotice({
          type: 'info',
          message: lang === 'en'
            ? 'Live SMS gateway is not configured on this server. To protect your account from takeover, phone number migration requires active SMS delivery credentials. Please contact Timora Administration.'
            : 'ലൈവ് എസ്.എം.എസ് ഗേറ്റ്‌വേ ക്രമീകരിച്ചിട്ടില്ല. അക്കൗണ്ട് സുരക്ഷിതമായി നിലനിർത്താൻ അഡ്മിനുമായി ബന്ധപ്പെടുക.',
        });
      }
    } catch (err: any) {
      setPhoneNotice({
        type: 'error',
        message: err?.response?.data?.error?.message || err?.message || (lang === 'en' ? 'Failed to initiate phone update.' : 'നമ്പർ മാറ്റാൻ സാധിച്ചില്ല.'),
      });
    } finally {
      setPhoneUpdating(false);
    }
  };

  const handleVerifyPhoneChange = async () => {
    if (!phoneOtp || phoneOtp.length < 4) {
      setPhoneNotice({
        type: 'error',
        message: lang === 'en' ? 'Please enter the verification code.' : 'വെരിഫിക്കേഷൻ കോഡ് നൽകുക.',
      });
      return;
    }

    setPhoneUpdating(true);
    try {
      const { api } = await import('../lib/api');
      const res = await api.post('/auth/phone/verify-change', { newPhone: newPhone.trim(), otp: phoneOtp.trim() });
      if (res.data?.success) {
        const updatedUser: UserProfile = { ...user, phone: res.data.data.newPhone };
        setUser(updatedUser);
        localStorage.setItem('timora_auth_user', JSON.stringify(updatedUser));
        setPhoneNotice({
          type: 'success',
          message: lang === 'en' ? 'Mobile number updated successfully!' : 'മൊബൈൽ നമ്പർ വിജയകരമായി മാറ്റി!',
        });
        setShowPhoneChange(false);
        setNewPhone('');
        setPhoneOtp('');
        setPhoneOtpSent(false);
      }
    } catch (err: any) {
      setPhoneNotice({
        type: 'error',
        message: err?.response?.data?.error?.message || err?.message || (lang === 'en' ? 'Verification failed.' : 'വെരിഫിക്കേഷൻ പരാജയപ്പെട്ടു.'),
      });
    } finally {
      setPhoneUpdating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg(lang === 'en' ? 'Personal name must be at least 2 characters.' : 'പേര് കുറഞ്ഞത് 2 അക്ഷരങ്ങൾ ഉണ്ടായിരിക്കണം.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedFields: Partial<UserProfile> = {
        name: trimmedName,
        district,
      };

      if (user.role === 'seller') {
        if (user.sellerSubtype === 'mill_owner') {
          updatedFields.millName = millName.trim() || businessName.trim();
          updatedFields.businessName = millName.trim() || businessName.trim();
        } else {
          updatedFields.businessName = businessName.trim();
        }
      } else if (user.role === 'carpenter') {
        updatedFields.skills = skills.split(',').map((s) => s.trim()).filter(Boolean);
        updatedFields.experience = Math.max(0, Math.min(70, Number(experience) || 0));
        updatedFields.businessName = businessName.trim();
      } else if (user.role === 'transport') {
        updatedFields.vehicleDetails = vehicleDetails.trim();
        updatedFields.tonnageCapacity = Math.max(0.1, Math.min(100, Number(tonnageCapacity) || 1));
        updatedFields.businessName = businessName.trim();
      }

      await updateProfile(updatedFields);
      await refreshUser();

      setSuccessMsg(lang === 'en' ? 'Profile updated successfully!' : 'വിവരങ്ങൾ വിജയകരമായി സേവ് ചെയ്തു!');
      setIsSaving(false);

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setIsSaving(false);
      setErrorMsg(err?.message || (lang === 'en' ? 'Failed to update profile.' : 'സേവ് ചെയ്യാൻ സാധിച്ചില്ല.'));
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-profile-title"
    >
      <div
        ref={modalRef}
        data-modal-scrollable="true"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-300 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-stone-200 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#5B6147] text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 id="modal-profile-title" className="font-extrabold font-serif text-[#4A3626] text-lg">
                {lang === 'en' ? 'Edit Profile & Settings' : 'പ്രൊഫൈൽ മാറ്റങ്ങൾ വരുത്തുക'}
              </h3>
              <p className="text-[11px] text-[#7A5A3A]">
                {lang === 'en' ? 'Manage your verified Timber Marketplace identity' : 'ടിമോറ അക്കൗണ്ട് വിവരങ്ങൾ'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Account Role Badge (Read-only security boundary) */}
          <div className="p-3 bg-[#E7E1D6]/50 rounded-2xl border border-[#8E7F6B]/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#7A5A3A] block">
                {lang === 'en' ? 'Registered Account Role' : 'അംഗീകൃത റോൾ'}
              </span>
              <span className="font-bold text-[#4A3626] text-xs capitalize">
                {user.role} {user.sellerSubtype ? `(${user.sellerSubtype})` : ''}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              ID: {user.id}
            </span>
          </div>

          {/* Personal Name */}
          <div>
            <label className="block font-bold text-[#4A3626] mb-1">
              {user.role === 'seller' && user.sellerSubtype === 'mill_owner'
                ? (lang === 'en' ? 'Mill Owner Personal Name' : 'മില്ല് ഉടമയുടെ പേര്')
                : (lang === 'en' ? 'Full Name' : 'മുഴുവൻ പേര്')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
              required
            />
          </div>

          {/* Phone Number & Self-Service Change */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-[#4A3626]">
                {lang === 'en' ? 'Registered Login Mobile Number' : 'രജിസ്റ്റർ ചെയ്ത മൊബൈൽ നമ്പർ'}
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowPhoneChange(!showPhoneChange);
                  setPhoneNotice(null);
                }}
                className="text-[11px] font-bold text-[#5B6147] hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{showPhoneChange ? (lang === 'en' ? 'Cancel Update' : 'റദ്ദാക്കുക') : (lang === 'en' ? 'Change Number' : 'നമ്പർ മാറ്റുക')}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={`+91 ${user.phone}`}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 text-xs font-mono font-bold cursor-not-allowed"
              />
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>

            {/* Sub-form: Self-Service Phone Number Update */}
            {showPhoneChange && (
              <div className="p-3 mt-2 rounded-xl bg-white border border-stone-300 space-y-2.5 animate-fadeIn">
                <span className="text-[11px] font-bold text-[#4A3626] block">
                  {lang === 'en' ? 'Enter New 10-Digit Mobile Number' : 'പുതിയ 10-അക്ക മൊബൈൽ നമ്പർ നൽകുക'}
                </span>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="e.g. 9847123456"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleInitiatePhoneChange}
                    disabled={phoneUpdating || newPhone.length !== 10}
                    className="px-3 py-2 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-[11px] transition disabled:opacity-50"
                  >
                    {phoneUpdating ? '...' : (lang === 'en' ? 'Send OTP' : 'കോഡ് അയക്കുക')}
                  </button>
                </div>

                {phoneOtpSent && (
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="6-digit OTP"
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyPhoneChange}
                      disabled={phoneUpdating || phoneOtp.length < 4}
                      className="px-3 py-2 rounded-xl bg-[#4A3626] hover:bg-[#36271c] text-white font-bold text-[11px] transition disabled:opacity-50"
                    >
                      {lang === 'en' ? 'Verify & Save' : 'സ്ഥിരീകരിക്കുക'}
                    </button>
                  </div>
                )}

                {phoneNotice && (
                  <div
                    className={`p-2.5 rounded-xl text-[11px] font-medium leading-relaxed ${
                      phoneNotice.type === 'error'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : phoneNotice.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-900 border border-amber-200'
                    }`}
                  >
                    {phoneNotice.message}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* District Selection */}
          <div>
            <label className="block font-bold text-[#4A3626] mb-1">
              {lang === 'en' ? 'Base District' : 'പ്രവർത്തന ജില്ല'}
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-white"
            >
              {KERALA_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Role-Specific Fields */}
          {user.role === 'seller' && user.sellerSubtype === 'individual' && (
            <div>
              <label className="block font-bold text-[#4A3626] mb-1">
                {lang === 'en' ? 'Farmstead / Depot Trade Name' : 'ഫാം / ട്രേഡ് പേര്'}
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Madhavan Farmstead Timber"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
              />
            </div>
          )}

          {user.role === 'seller' && user.sellerSubtype === 'mill_owner' && (
            <div>
              <label className="block font-bold text-[#4A3626] mb-1">
                {lang === 'en' ? 'Registered Sawmill Enterprise Name' : 'സോമിൽ ബിസിനസ്സ് പേര്'}
              </label>
              <input
                type="text"
                value={millName}
                onChange={(e) => setMillName(e.target.value)}
                placeholder="e.g. Perumbavoor Modern Sawmills & Depot"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
              />
            </div>
          )}

          {user.role === 'carpenter' && (
            <>
              <div>
                <label className="block font-bold text-[#4A3626] mb-1">
                  {lang === 'en' ? 'Carpentry Business / Workshop Name' : 'വർക്ക്‌ഷോപ്പ് / ബിസിനസ്സ് പേര്'}
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Binu Traditional Timber Joinery"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-[#4A3626] mb-1">
                  {lang === 'en' ? 'Woodworking Specializations (comma separated)' : 'പ്രത്യേക മേഖലകൾ (കോമ നൽകി വേർതിരിക്കുക)'}
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Roof Trusses, Temple Woodwork, Teak Doors"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-[#4A3626] mb-1">
                  {lang === 'en' ? 'Years of Carpentry Experience' : 'തടിപ്പണി പരിചയം (വർഷം)'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={experience}
                  onChange={(e) => setExperience(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
                />
              </div>
            </>
          )}

          {user.role === 'transport' && (
            <>
              <div>
                <label className="block font-bold text-[#4A3626] mb-1">
                  {lang === 'en' ? 'Transport Agency / Fleet Business Name' : 'ട്രാൻസ്പോർട്ട് ഏജൻസി പേര്'}
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Malabar Timber Heavy Transit Haulage"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-[#4A3626] mb-1">
                  {lang === 'en' ? 'Timber Vehicle Type & Model' : 'വാഹനത്തിന്റെ തരം'}
                </label>
                <input
                  type="text"
                  value={vehicleDetails}
                  onChange={(e) => setVehicleDetails(e.target.value)}
                  placeholder="e.g. 10-Wheel Heavy Timber Lorry, 6-Wheel Tipper"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-[#4A3626] mb-1">
                  {lang === 'en' ? 'Log Hauling Capacity (Tonnes)' : 'ഭാരം വഹിക്കാനുള്ള ശേഷി (ടൺ)'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={tonnageCapacity}
                  onChange={(e) => setTonnageCapacity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
                />
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-100 transition text-xs"
            >
              {lang === 'en' ? 'Cancel' : 'റദ്ദാക്കുക'}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold transition flex items-center gap-2 shadow-xs text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? (lang === 'en' ? 'Saving...' : 'സേവ് ചെയ്യുന്നു...') : (lang === 'en' ? 'Save Profile' : 'സേവ് ചെയ്യുക')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
