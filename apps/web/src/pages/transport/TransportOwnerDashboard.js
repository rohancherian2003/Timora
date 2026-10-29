import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Truck, Plus, MapPin, Phone, LifeBuoy, FileCheck, MessageSquare, User, } from 'lucide-react';
import { formatINR } from '@timora/shared';
import { useAuth } from '../../context/AuthContext';
import { VerificationStatusBanner } from '../../components/VerificationStatusBanner';
import { RaiseTicketModal } from '../../components/RaiseTicketModal';
import { EditProfileModal } from '../../components/EditProfileModal';
const INITIAL_FLEET = [
    {
        id: 'veh-1',
        regNumber: 'KL-11-BH-4890',
        model: 'Tata 1618 LPK 10-Wheel Heavy Timber Lorry',
        capacityTonnes: 16.0,
        hasCrane: true,
        formIvPermitted: true,
        status: 'available',
    },
    {
        id: 'veh-2',
        regNumber: 'KL-11-AM-2104',
        model: 'Ashok Leyland 1616 6-Wheel Timber Carrier',
        capacityTonnes: 10.5,
        hasCrane: false,
        formIvPermitted: true,
        status: 'on_trip',
    },
];
const INITIAL_BOOKINGS = [
    {
        id: 'tr-bk-1',
        clientName: 'Perumbavoor Modern Sawmills',
        clientPhone: '+91 9847120002',
        pickupLocation: 'Nilambur Forest Depot (Malappuram)',
        dropLocation: 'Perumbavoor Mill Yard (Ernakulam)',
        timberSpecies: 'Teak Round Logs',
        cftVolume: 220,
        rateQuoted: 14500,
        status: 'confirmed',
    },
    {
        id: 'tr-bk-2',
        clientName: 'Suresh Kumar',
        clientPhone: '+91 9847987654',
        pickupLocation: 'Kottayam Depot',
        dropLocation: 'Pala Residential Site',
        timberSpecies: 'Anjili Squared Beams',
        cftVolume: 65,
        rateQuoted: 4200,
        status: 'requested',
    },
];
export function TransportOwnerDashboard({ lang = 'en' }) {
    const { user } = useAuth();
    const [fleet, setFleet] = useState(INITIAL_FLEET);
    const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
    const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [showAddVehicle, setShowAddVehicle] = useState(false);
    // Form states
    const [regNumber, setRegNumber] = useState('');
    const [model, setModel] = useState('');
    const [capacity, setCapacity] = useState(12);
    const handleAddVehicle = (e) => {
        e.preventDefault();
        if (!regNumber.trim())
            return;
        const newVeh = {
            id: `veh-${Date.now()}`,
            regNumber: regNumber.trim().toUpperCase(),
            model: model.trim() || 'Heavy Timber Transit Truck',
            capacityTonnes: capacity,
            hasCrane: true,
            formIvPermitted: true,
            status: 'available',
        };
        setFleet([...fleet, newVeh]);
        setRegNumber('');
        setModel('');
        setShowAddVehicle(false);
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-fadeIn", children: [_jsx(VerificationStatusBanner, { status: user?.approvalStatus || 'APPROVED', role: "transport", entityName: user?.businessName || user?.name, note: user?.approvalNote, lang: lang, onRaiseTicket: () => setIsRaiseModalOpen(true) }), _jsxs("div", { className: "p-6 sm:p-8 bg-gradient-to-br from-[#E7E1D6] via-[#d5cfc4] to-[#c4bdb0] rounded-3xl border border-[#c4bdb0] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsxs("span", { className: "px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5B6147] text-white uppercase tracking-wider flex items-center gap-1", children: [_jsx(Truck, { className: "w-3 h-3" }), _jsx("span", { children: lang === 'en' ? 'Verified Timber Logistics' : 'അംഗീകൃത തടി ട്രാൻസ്പോർട്ട്' })] }), _jsxs("span", { className: "text-xs text-emerald-800 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-md flex items-center gap-1", children: [_jsx(FileCheck, { className: "w-3 h-3" }), _jsx("span", { children: lang === 'en' ? 'Form IV Forest Clearance Active' : 'ഫോറസ്റ്റ് പാസ്സ് ക്ലിയറൻസ്' })] })] }), _jsx("h1", { className: "text-2xl sm:text-3xl font-extrabold font-serif text-[#4A3626]", children: user?.businessName || 'Malabar Timber Heavy Transit Haulage' }), _jsxs("div", { className: "text-xs sm:text-sm text-[#7A5A3A] font-medium flex items-center gap-2 flex-wrap", children: [_jsxs("span", { className: "font-semibold text-[#4A3626]", children: [lang === 'en' ? 'Fleet Operator: ' : 'ഉടമ: ', user?.name || 'K. Sukumaran'] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Phone, { className: "w-3.5 h-3.5 text-[#5B6147]" }), _jsxs("span", { children: ["+91 ", user?.phone || '9847440001'] })] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-[#5B6147]" }), _jsx("span", { children: user?.district || 'Kozhikode (കോഴിക്കോട്)' })] })] })] }), _jsxs("div", { className: "flex items-center gap-2.5 flex-wrap", children: [_jsxs("button", { type: "button", onClick: () => setIsEditProfileOpen(true), className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-300 text-[#4A3626] hover:bg-stone-100 text-xs sm:text-sm font-bold shadow-xs transition", children: [_jsx(User, { className: "w-4 h-4 text-[#5B6147]" }), _jsx("span", { children: lang === 'en' ? 'Edit Profile' : 'പ്രൊഫൈൽ മാറ്റങ്ങൾ' })] }), _jsxs("button", { type: "button", onClick: () => setIsRaiseModalOpen(true), className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-300 text-[#4A3626] hover:bg-stone-100 text-xs sm:text-sm font-bold shadow-xs transition", children: [_jsx(LifeBuoy, { className: "w-4 h-4 text-[#5B6147]" }), _jsx("span", { children: lang === 'en' ? 'Support Desk' : 'സഹായം' })] }), _jsxs("button", { type: "button", onClick: () => setShowAddVehicle(!showAddVehicle), className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#5B6147] hover:bg-[#3F452F] text-white text-xs sm:text-sm font-bold shadow-md transition", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: lang === 'en' ? 'Add Lorry to Fleet' : 'വാഹനം ചേർക്കുക' })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4", children: [_jsxs("div", { className: "p-4 rounded-2xl bg-white border border-[#8E7F6B]/30 shadow-xs space-y-1", children: [_jsx("span", { className: "text-[11px] font-bold text-[#8E7F6B] uppercase tracking-wider block", children: lang === 'en' ? 'Total Active Lorries' : 'വാഹനങ്ങളുടെ എണ്ണം' }), _jsxs("div", { className: "text-2xl font-black font-serif text-[#4A3626]", children: [fleet.length, " ", _jsx("span", { className: "text-xs font-normal text-stone-500", children: "Vehicles" })] }), _jsx("p", { className: "text-[10px] text-emerald-700 font-semibold", children: "All GPS & Crane equipped" })] }), _jsxs("div", { className: "p-4 rounded-2xl bg-white border border-[#8E7F6B]/30 shadow-xs space-y-1", children: [_jsx("span", { className: "text-[11px] font-bold text-[#8E7F6B] uppercase tracking-wider block", children: lang === 'en' ? 'Total Fleet Capacity' : 'മൊത്തം ശേഷി' }), _jsxs("div", { className: "text-2xl font-black font-serif text-[#4A3626]", children: [fleet.reduce((acc, v) => acc + v.capacityTonnes, 0), ' ', _jsx("span", { className: "text-xs font-normal text-stone-500", children: "Tonnes" })] }), _jsx("p", { className: "text-[10px] text-stone-500", children: "Up to 600 CFT per trip" })] }), _jsxs("div", { className: "p-4 rounded-2xl bg-white border border-[#8E7F6B]/30 shadow-xs space-y-1", children: [_jsx("span", { className: "text-[11px] font-bold text-[#8E7F6B] uppercase tracking-wider block", children: lang === 'en' ? 'Active Transit Trips' : 'സജീവ ഓട്ടങ്ങൾ' }), _jsxs("div", { className: "text-2xl font-black font-serif text-amber-700", children: ["1 ", _jsx("span", { className: "text-xs font-normal text-stone-500", children: "On Trip" })] }), _jsx("p", { className: "text-[10px] text-stone-500", children: "Nilambur \u2192 Perumbavoor" })] }), _jsxs("div", { className: "p-4 rounded-2xl bg-white border border-[#8E7F6B]/30 shadow-xs space-y-1", children: [_jsx("span", { className: "text-[11px] font-bold text-[#8E7F6B] uppercase tracking-wider block", children: lang === 'en' ? 'Pending Transit Quotes' : 'അന്വേഷണങ്ങൾ' }), _jsxs("div", { className: "text-2xl font-black font-serif text-[#4A3626]", children: [bookings.filter((b) => b.status === 'requested').length, ' ', _jsx("span", { className: "text-xs font-normal text-stone-500", children: "Requests" })] }), _jsx("p", { className: "text-[10px] text-emerald-700 font-semibold", children: "Direct Mill & Buyer Bookings" })] })] }), showAddVehicle && (_jsxs("div", { className: "p-6 bg-white rounded-3xl border border-[#8E7F6B]/30 shadow-md space-y-4 animate-scaleUp", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-stone-200 pb-3", children: [_jsx("h3", { className: "font-serif font-bold text-[#4A3626] text-base", children: lang === 'en' ? 'Register New Timber Transit Vehicle' : 'പുതിയ വാഹനം രജിസ്റ്റർ ചെയ്യുക' }), _jsx("button", { onClick: () => setShowAddVehicle(false), className: "text-stone-400 hover:text-stone-700 font-bold", children: "\u2715" })] }), _jsxs("form", { onSubmit: handleAddVehicle, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-stone-700 mb-1", children: lang === 'en' ? 'Registration Number (e.g. KL-11-BH-4890)' : 'വാഹന രജിസ്ട്രേഷൻ നമ്പർ' }), _jsx("input", { type: "text", placeholder: "KL-XX-XX-XXXX", value: regNumber, onChange: (e) => setRegNumber(e.target.value), className: "w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm font-semibold uppercase", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-stone-700 mb-1", children: lang === 'en' ? 'Vehicle Make & Model' : 'വാഹന മോഡൽ' }), _jsx("input", { type: "text", placeholder: "e.g. Tata 1618 LPK 10-Wheel", value: model, onChange: (e) => setModel(e.target.value), className: "w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm font-semibold", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-stone-700 mb-1", children: lang === 'en' ? 'Max Haulage Capacity (Tonnes)' : 'ശേഷി (ടൺ)' }), _jsx("input", { type: "number", value: capacity, onChange: (e) => setCapacity(Number(e.target.value)), className: "w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm font-semibold", min: 1, required: true })] })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [_jsx("button", { type: "button", onClick: () => setShowAddVehicle(false), className: "px-4 py-2.5 rounded-xl bg-stone-200 text-stone-700 font-bold text-xs", children: lang === 'en' ? 'Cancel' : 'റദ്ദാക്കുക' }), _jsx("button", { type: "submit", className: "px-5 py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs shadow-xs", children: lang === 'en' ? 'Add to Registered Fleet' : 'ഫ്ലീറ്റിൽ ചേർക്കുക' })] })] })] })), _jsxs("div", { className: "bg-white rounded-3xl border border-stone-300 overflow-hidden shadow-xs", children: [_jsxs("div", { className: "p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Truck, { className: "w-5 h-5 text-[#5B6147]" }), _jsx("h3", { className: "font-extrabold font-serif text-[#4A3626] text-base", children: lang === 'en' ? 'Registered Timber Haulage Fleet' : 'രജിസ്റ്റർ ചെയ്ത തടി ലോറികൾ' })] }), _jsxs("span", { className: "text-xs font-bold text-[#5B6147]", children: [fleet.length, " ", lang === 'en' ? 'Vehicles' : 'എണ്ണം'] })] }), _jsx("div", { className: "divide-y divide-stone-200", children: fleet.map((veh) => (_jsxs("div", { className: "p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#E7E1D6]/40 transition", children: [_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("span", { className: "font-mono font-extrabold text-[#4A3626] text-base px-2.5 py-1 rounded-xl bg-stone-100 border border-stone-300", children: veh.regNumber }), _jsx("span", { className: "font-bold text-[#4A3626] text-xs sm:text-sm", children: veh.model }), veh.hasCrane && (_jsx("span", { className: "px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold", children: "Crane Equipped (\u0D39\u0D48\u0D21\u0D4D\u0D30\u0D4B\u0D33\u0D3F\u0D15\u0D4D \u0D15\u0D4D\u0D30\u0D46\u0D2F\u0D3F\u0D7B)" })), veh.formIvPermitted && (_jsx("span", { className: "px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold", children: "Form IV Forest Cleared" }))] }), _jsxs("div", { className: "text-xs text-stone-500", children: ["Capacity: ", _jsxs("b", { children: [veh.capacityTonnes, " Tonnes"] }), " (approx. ", Math.round(veh.capacityTonnes * 35), " CFT Round Logs)"] })] }), _jsx("span", { className: `px-3 py-1 rounded-full text-xs font-bold ${veh.status === 'available'
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : 'bg-amber-100 text-amber-900 border border-amber-300'}`, children: veh.status === 'available'
                                        ? (lang === 'en' ? 'Available for Transit' : 'ലഭ്യമാണ്')
                                        : (lang === 'en' ? 'Currently on Road' : 'യാത്രയിൽ') })] }, veh.id))) })] }), _jsxs("div", { className: "bg-white rounded-3xl border border-stone-300 overflow-hidden shadow-xs", children: [_jsxs("div", { className: "p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MessageSquare, { className: "w-5 h-5 text-[#5B6147]" }), _jsx("h3", { className: "font-extrabold font-serif text-[#4A3626] text-base", children: lang === 'en' ? 'Transit Load Enquiries & Mill Bookings' : 'ലോഡ് ബുക്കിംഗുകൾ' })] }), _jsxs("span", { className: "text-xs font-bold text-[#5B6147]", children: [bookings.length, " ", lang === 'en' ? 'Consignments' : 'എണ്ണം'] })] }), _jsx("div", { className: "divide-y divide-stone-200", children: bookings.map((b) => (_jsxs("div", { className: "p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#E7E1D6]/40 transition", children: [_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsxs("span", { className: "font-bold text-[#4A3626] text-sm sm:text-base", children: [b.pickupLocation, " \u2192 ", b.dropLocation] }), _jsxs("span", { className: "px-2 py-0.5 rounded-md bg-[#E7E1D6] text-[#4A3626] text-[10px] font-bold", children: [b.timberSpecies, " (", b.cftVolume, " CFT)"] })] }), _jsxs("div", { className: "text-xs text-stone-500 flex items-center gap-2", children: [_jsxs("span", { children: ["Client: ", _jsx("b", { children: b.clientName })] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Quote: ", _jsx("b", { className: "font-mono text-[#4A3626]", children: formatINR(b.rateQuoted) })] })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: `px-3 py-1 rounded-full text-xs font-bold ${b.status === 'confirmed'
                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                : 'bg-amber-100 text-amber-900 border border-amber-300'}`, children: b.status === 'confirmed'
                                                ? (lang === 'en' ? 'Confirmed Load' : 'ഉറപ്പിച്ചു')
                                                : (lang === 'en' ? 'Quote Requested' : 'ആവശ്യപ്പെട്ടു') }), _jsxs("a", { href: `tel:${b.clientPhone}`, className: "px-3 py-1.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs transition flex items-center gap-1", children: [_jsx(Phone, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en' ? 'Call' : 'വിളിക്കുക' })] })] })] }, b.id))) })] }), _jsx(RaiseTicketModal, { isOpen: isRaiseModalOpen, onClose: () => setIsRaiseModalOpen(false), lang: lang }), _jsx(EditProfileModal, { isOpen: isEditProfileOpen, onClose: () => setIsEditProfileOpen(false), lang: lang })] }));
}
