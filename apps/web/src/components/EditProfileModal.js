import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, X, Save, CheckCircle2, AlertCircle, Bell, BellOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePushNotifications } from '../hooks/usePushNotifications';
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
export function EditProfileModal({ isOpen, onClose, lang = 'en' }) {
    const { user, updateProfile } = useAuth();
    const pushNotifications = usePushNotifications();
    const [name, setName] = useState(user?.name || '');
    const [businessName, setBusinessName] = useState(user?.businessName || '');
    const [millName, setMillName] = useState(user?.millName || '');
    const [district, setDistrict] = useState(user?.district || KERALA_DISTRICTS[0]);
    const [skills, setSkills] = useState(user?.skills?.join(', ') || 'Traditional Joinery, Roof Trusses, Teak Carving');
    const [experience, setExperience] = useState(user?.experience || 10);
    const [vehicleDetails, setVehicleDetails] = useState(user?.vehicleDetails || '10-Wheel Heavy Timber Lorry');
    const [tonnageCapacity, setTonnageCapacity] = useState(user?.tonnageCapacity || 25);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setBusinessName(user.businessName || '');
            setMillName(user.millName || '');
            setDistrict(user.district || KERALA_DISTRICTS[0]);
            setSkills(user.skills?.join(', ') || '');
            setExperience(user.experience || 10);
            setVehicleDetails(user.vehicleDetails || '');
            setTonnageCapacity(user.tonnageCapacity || 25);
        }
    }, [user, isOpen]);
    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen)
                onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);
    if (!isOpen || !user)
        return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);
        if (!name.trim()) {
            setErrorMsg(lang === 'en' ? 'Personal name is required.' : 'പേര് നൽകേണ്ടതാണ്.');
            return;
        }
        setIsSaving(true);
        try {
            const updatedFields = {
                name: name.trim(),
                district,
            };
            if (user.role === 'seller') {
                if (user.sellerSubtype === 'mill_owner') {
                    updatedFields.millName = millName.trim() || businessName.trim();
                    updatedFields.businessName = millName.trim() || businessName.trim();
                }
                else {
                    updatedFields.businessName = businessName.trim();
                }
            }
            else if (user.role === 'carpenter') {
                updatedFields.skills = skills.split(',').map((s) => s.trim()).filter(Boolean);
                updatedFields.experience = Number(experience) || 1;
            }
            else if (user.role === 'transport') {
                updatedFields.vehicleDetails = vehicleDetails.trim();
                updatedFields.tonnageCapacity = Number(tonnageCapacity) || 1;
            }
            await updateProfile(updatedFields);
            setSuccessMsg(lang === 'en' ? 'Profile updated successfully!' : 'വിവരങ്ങൾ വിജയകരമായി സേവ് ചെയ്തു!');
            setIsSaving(false);
            setTimeout(() => {
                onClose();
            }, 1000);
        }
        catch (err) {
            setIsSaving(false);
            setErrorMsg(err?.message || (lang === 'en' ? 'Failed to update profile.' : 'സേവ് ചെയ്യാൻ സാധിച്ചില്ല.'));
        }
    };
    const modalContent = (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn", children: _jsxs("div", { className: "relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-300 max-h-[90vh] overflow-y-auto", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-stone-200 flex items-center justify-between rounded-t-3xl z-10", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "p-2 rounded-xl bg-[#5B6147] text-white", children: _jsx(User, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-extrabold font-serif text-[#4A3626] text-lg", children: lang === 'en' ? 'Edit Profile & Settings' : 'പ്രൊഫൈൽ മാറ്റങ്ങൾ വരുത്തുക' }), _jsx("p", { className: "text-[11px] text-[#7A5A3A]", children: lang === 'en' ? 'Manage your verified Timber Marketplace identity' : 'ടിമോറ അക്കൗണ്ട് വിവരങ്ങൾ' })] })] }), _jsx("button", { onClick: onClose, className: "p-1.5 rounded-xl hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4 text-xs", children: [errorMsg && (_jsxs("div", { className: "p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4 text-rose-600 flex-shrink-0" }), _jsx("span", { children: errorMsg })] })), successMsg && (_jsxs("div", { className: "p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-4 h-4 text-emerald-600 flex-shrink-0" }), _jsx("span", { children: successMsg })] })), _jsxs("div", { className: "p-3 bg-[#E7E1D6]/50 rounded-2xl border border-[#8E7F6B]/30 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[10px] uppercase font-bold text-[#7A5A3A] block", children: lang === 'en' ? 'Registered Account Role' : 'അംഗീകൃത റോൾ' }), _jsxs("span", { className: "font-bold text-[#4A3626] text-xs capitalize", children: [user.role, " ", user.sellerSubtype ? `(${user.sellerSubtype})` : ''] })] }), _jsxs("span", { className: "px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold", children: ["ID: ", user.id] })] }), _jsxs("div", { children: [_jsx("label", { className: "block font-bold text-[#4A3626] mb-1", children: user.role === 'seller' && user.sellerSubtype === 'mill_owner'
                                        ? (lang === 'en' ? 'Mill Owner Personal Name' : 'മില്ല് ഉടമയുടെ പേര്')
                                        : (lang === 'en' ? 'Full Name' : 'മുഴുവൻ പേര്') }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-[#5B6147] focus:outline-none", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block font-bold text-[#4A3626] mb-1", children: lang === 'en' ? 'Registered Mobile Number (PIN-Protected)' : 'രജിസ്റ്റർ ചെയ്ത മൊബൈൽ നമ്പർ' }), _jsx("div", { className: "flex items-center gap-2", children: _jsx("input", { type: "text", value: `+91 ${user.phone}`, disabled: true, className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-600 text-xs font-mono font-semibold cursor-not-allowed" }) }), _jsx("span", { className: "text-[10px] text-stone-400 mt-0.5 block", children: lang === 'en'
                                        ? 'Phone numbers are verified via PIN. Contact admin cell to transfer numbers.'
                                        : 'സുരക്ഷാ കാരണങ്ങളാൽ ഫോൺ നമ്പർ മാറ്റാൻ അഡ്മിനുമായി ബന്ധപ്പെടുക.' })] }), _jsxs("div", { children: [_jsx("label", { className: "block font-bold text-[#4A3626] mb-1", children: lang === 'en' ? 'Base District' : 'പ്രവർത്തന ജില്ല' }), _jsx("select", { value: district, onChange: (e) => setDistrict(e.target.value), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-white", children: KERALA_DISTRICTS.map((d) => (_jsx("option", { value: d, children: d }, d))) })] }), user.role === 'seller' && user.sellerSubtype === 'individual' && (_jsxs("div", { children: [_jsx("label", { className: "block font-bold text-[#4A3626] mb-1", children: lang === 'en' ? 'Farmstead / Depot Trade Name' : 'ഫാം / ട്രേഡ് പേര്' }), _jsx("input", { type: "text", value: businessName, onChange: (e) => setBusinessName(e.target.value), placeholder: "e.g. Madhavan Farmstead Timber", className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-[#5B6147] focus:outline-none" })] })), user.role === 'seller' && user.sellerSubtype === 'mill_owner' && (_jsxs("div", { children: [_jsx("label", { className: "block font-bold text-[#4A3626] mb-1", children: lang === 'en' ? 'Registered Sawmill Enterprise Name' : 'സോമിൽ ബിസിനസ്സ് പേര്' }), _jsx("input", { type: "text", value: millName, onChange: (e) => setMillName(e.target.value), placeholder: "e.g. Perumbavoor Modern Sawmills & Depot", className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-[#5B6147] focus:outline-none" })] })), user.role === 'carpenter' && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { className: "block font-bold text-[#4A3626] mb-1", children: lang === 'en' ? 'Woodworking Specializations (comma separated)' : 'പ്രത്യേക മേഖലകൾ (കോമ നൽകി വേർതിരിക്കുക)' }), _jsx("input", { type: "text", value: skills, onChange: (e) => setSkills(e.target.value), placeholder: "e.g. Roof Trusses, Temple Woodwork, Teak Doors", className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-[#5B6147] focus:outline-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "block font-bold text-[#4A3626] mb-1", children: lang === 'en' ? 'Years of Carpentry Experience' : 'തടിപ്പണി പരിചയം (വർഷം)' }), _jsx("input", { type: "number", min: 1, max: 60, value: experience, onChange: (e) => setExperience(Number(e.target.value)), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-[#5B6147] focus:outline-none" })] })] })), user.role === 'transport' && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { className: "block font-bold text-[#4A3626] mb-1", children: lang === 'en' ? 'Timber Vehicle Type & Model' : 'വാഹനത്തിന്റെ തരം' }), _jsx("input", { type: "text", value: vehicleDetails, onChange: (e) => setVehicleDetails(e.target.value), placeholder: "e.g. 10-Wheel Heavy Timber Lorry, 6-Wheel Tipper", className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-[#5B6147] focus:outline-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "block font-bold text-[#4A3626] mb-1", children: lang === 'en' ? 'Log Hauling Capacity (Tonnes)' : 'ഭാരം വഹിക്കാനുള്ള ശേഷി (ടൺ)' }), _jsx("input", { type: "number", min: 1, max: 60, value: tonnageCapacity, onChange: (e) => setTonnageCapacity(Number(e.target.value)), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-[#5B6147] focus:outline-none" })] })] })), _jsx("div", { className: "pt-3 border-t border-stone-200", children: _jsxs("div", { className: "p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: `p-2 rounded-xl ${pushNotifications.isSubscribed ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`, children: pushNotifications.isSubscribed ? _jsx(Bell, { className: "w-4 h-4" }) : _jsx(BellOff, { className: "w-4 h-4" }) }), _jsxs("div", { children: [_jsx("span", { className: "font-bold text-[#4A3626] text-xs block", children: lang === 'en' ? 'Web Push Notifications' : 'ബ്രൗസർ പുഷ് അറിയിപ്പുകൾ' }), _jsx("span", { className: "text-[10px] text-stone-500", children: pushNotifications.isSubscribed
                                                            ? (lang === 'en' ? 'Subscribed on this device' : 'ഈ ഡിവൈസിൽ സജീവമാണ്')
                                                            : (lang === 'en' ? 'Receive real-time timber enquiries & updates' : 'തത്സമയ അറിയിപ്പുകൾ ലഭിക്കാൻ ഓൺ ചെയ്യുക') })] })] }), _jsx("button", { type: "button", onClick: pushNotifications.isSubscribed ? pushNotifications.unsubscribe : pushNotifications.subscribe, disabled: pushNotifications.loading, className: `px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${pushNotifications.isSubscribed
                                            ? 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
                                            : 'bg-[#5B6147] text-white hover:bg-[#3F452F]'}`, children: pushNotifications.loading
                                            ? '...'
                                            : pushNotifications.isSubscribed
                                                ? (lang === 'en' ? 'Disable' : 'ഓഫ് ചെയ്യുക')
                                                : (lang === 'en' ? 'Enable' : 'ഓൺ ചെയ്യുക') })] }) }), _jsxs("div", { className: "pt-4 flex items-center justify-end gap-2.5 border-t border-stone-200", children: [_jsx("button", { type: "button", onClick: onClose, disabled: isSaving, className: "px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-100 transition text-xs", children: lang === 'en' ? 'Cancel' : 'റദ്ദാക്കുക' }), _jsxs("button", { type: "submit", disabled: isSaving, className: "px-5 py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold transition flex items-center gap-2 shadow-xs text-xs", children: [_jsx(Save, { className: "w-3.5 h-3.5" }), _jsx("span", { children: isSaving ? (lang === 'en' ? 'Saving...' : 'സേവ് ചെയ്യുന്നു...') : (lang === 'en' ? 'Save Profile' : 'സേവ് ചെയ്യുക') })] })] })] })] }) }));
    return createPortal(modalContent, document.body);
}
