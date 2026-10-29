import React, { useState, useEffect } from 'react';
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
  Bell,
  BellOff,
  Phone,
  MapPin,
  Award
} from 'lucide-react';
import { useAuth, UserProfile } from '../context/AuthContext';
import { usePushNotifications } from '../hooks/usePushNotifications';

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
  const { user, updateProfile } = useAuth();
  const pushNotifications = usePushNotifications();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg(lang === 'en' ? 'Personal name is required.' : 'പേര് നൽകേണ്ടതാണ്.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedFields: Partial<UserProfile> = {
        name: name.trim(),
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
        updatedFields.experience = Number(experience) || 1;
      } else if (user.role === 'transport') {
        updatedFields.vehicleDetails = vehicleDetails.trim();
        updatedFields.tonnageCapacity = Number(tonnageCapacity) || 1;
      }

      await updateProfile(updatedFields);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
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
              <h3 className="font-extrabold font-serif text-[#4A3626] text-lg">
                {lang === 'en' ? 'Edit Profile & Settings' : 'പ്രൊഫൈൽ മാറ്റങ്ങൾ വരുത്തുക'}
              </h3>
              <p className="text-[11px] text-[#7A5A3A]">
                {lang === 'en' ? 'Manage your verified Timber Marketplace identity' : 'ടിമോറ അക്കൗണ്ട് വിവരങ്ങൾ'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition"
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

          {/* Phone Number (Verified, non-tamperable) */}
          <div>
            <label className="block font-bold text-[#4A3626] mb-1">
              {lang === 'en' ? 'Registered Mobile Number (PIN-Protected)' : 'രജിസ്റ്റർ ചെയ്ത മൊബൈൽ നമ്പർ'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={`+91 ${user.phone}`}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-600 text-xs font-mono font-semibold cursor-not-allowed"
              />
            </div>
            <span className="text-[10px] text-stone-400 mt-0.5 block">
              {lang === 'en'
                ? 'Phone numbers are verified via PIN. Contact admin cell to transfer numbers.'
                : 'സുരക്ഷാ കാരണങ്ങളാൽ ഫോൺ നമ്പർ മാറ്റാൻ അഡ്മിനുമായി ബന്ധപ്പെടുക.'}
            </span>
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

          {/* Web Push Notification Preference Section */}
          <div className="pt-3 border-t border-stone-200">
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${pushNotifications.isSubscribed ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                  {pushNotifications.isSubscribed ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                </div>
                <div>
                  <span className="font-bold text-[#4A3626] text-xs block">
                    {lang === 'en' ? 'Web Push Notifications' : 'ബ്രൗസർ പുഷ് അറിയിപ്പുകൾ'}
                  </span>
                  <span className="text-[10px] text-stone-500">
                    {pushNotifications.isSubscribed
                      ? (lang === 'en' ? 'Subscribed on this device' : 'ഈ ഡിവൈസിൽ സജീവമാണ്')
                      : (lang === 'en' ? 'Receive real-time timber enquiries & updates' : 'തത്സമയ അറിയിപ്പുകൾ ലഭിക്കാൻ ഓൺ ചെയ്യുക')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={pushNotifications.isSubscribed ? pushNotifications.unsubscribe : pushNotifications.subscribe}
                disabled={pushNotifications.loading}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                  pushNotifications.isSubscribed
                    ? 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
                    : 'bg-[#5B6147] text-white hover:bg-[#3F452F]'
                }`}
              >
                {pushNotifications.loading
                  ? '...'
                  : pushNotifications.isSubscribed
                  ? (lang === 'en' ? 'Disable' : 'ഓഫ് ചെയ്യുക')
                  : (lang === 'en' ? 'Enable' : 'ഓൺ ചെയ്യുക')}
              </button>
            </div>
          </div>

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
