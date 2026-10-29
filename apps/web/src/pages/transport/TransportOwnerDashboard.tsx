import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  LifeBuoy,
  ShieldCheck,
  Scale,
  Calendar,
  FileCheck,
  MessageSquare,
  Navigation,
  User,
} from 'lucide-react';
import { formatINR } from '@timora/shared';
import { useAuth } from '../../context/AuthContext';
import { VerificationStatusBanner } from '../../components/VerificationStatusBanner';
import { RaiseTicketModal } from '../../components/RaiseTicketModal';
import { EditProfileModal } from '../../components/EditProfileModal';

interface VehicleItem {
  id: string;
  regNumber: string;
  model: string;
  capacityTonnes: number;
  hasCrane: boolean;
  formIvPermitted: boolean;
  status: 'available' | 'on_trip' | 'maintenance';
}

interface TransitBooking {
  id: string;
  clientName: string;
  clientPhone: string;
  pickupLocation: string;
  dropLocation: string;
  timberSpecies: string;
  cftVolume: number;
  rateQuoted: number;
  status: 'requested' | 'confirmed' | 'delivered';
}

const INITIAL_FLEET: VehicleItem[] = [
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

const INITIAL_BOOKINGS: TransitBooking[] = [
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

export function TransportOwnerDashboard({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const { user } = useAuth();
  const [fleet, setFleet] = useState<VehicleItem[]>(INITIAL_FLEET);
  const [bookings, setBookings] = useState<TransitBooking[]>(INITIAL_BOOKINGS);
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  // Form states
  const [regNumber, setRegNumber] = useState('');
  const [model, setModel] = useState('');
  const [capacity, setCapacity] = useState(12);

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNumber.trim()) return;
    const newVeh: VehicleItem = {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-fadeIn">
      {/* VERIFICATION STATUS BANNER */}
      <VerificationStatusBanner
        status={user?.approvalStatus || 'APPROVED'}
        role="transport"
        entityName={user?.businessName || user?.name}
        note={user?.approvalNote}
        lang={lang}
        onRaiseTicket={() => setIsRaiseModalOpen(true)}
      />

      {/* HEADER CARD */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-[#E7E1D6] via-[#d5cfc4] to-[#c4bdb0] rounded-3xl border border-[#c4bdb0] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5B6147] text-white uppercase tracking-wider flex items-center gap-1">
              <Truck className="w-3 h-3" />
              <span>{lang === 'en' ? 'Verified Timber Logistics' : 'അംഗീകൃത തടി ട്രാൻസ്പോർട്ട്'}</span>
            </span>
            <span className="text-xs text-emerald-800 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <FileCheck className="w-3 h-3" />
              <span>{lang === 'en' ? 'Form IV Forest Clearance Active' : 'ഫോറസ്റ്റ് പാസ്സ് ക്ലിയറൻസ്'}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#4A3626]">
            {user?.businessName || 'Malabar Timber Heavy Transit Haulage'}
          </h1>

          <div className="text-xs sm:text-sm text-[#7A5A3A] font-medium flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[#4A3626]">
              {lang === 'en' ? 'Fleet Operator: ' : 'ഉടമ: '}{user?.name || 'K. Sukumaran'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#5B6147]" />
              <span>+91 {user?.phone || '9847440001'}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#5B6147]" />
              <span>{user?.district || 'Kozhikode (കോഴിക്കോട്)'}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsEditProfileOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-300 text-[#4A3626] hover:bg-stone-100 text-xs sm:text-sm font-bold shadow-xs transition"
          >
            <User className="w-4 h-4 text-[#5B6147]" />
            <span>{lang === 'en' ? 'Edit Profile' : 'പ്രൊഫൈൽ മാറ്റങ്ങൾ'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsRaiseModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-300 text-[#4A3626] hover:bg-stone-100 text-xs sm:text-sm font-bold shadow-xs transition"
          >
            <LifeBuoy className="w-4 h-4 text-[#5B6147]" />
            <span>{lang === 'en' ? 'Support Desk' : 'സഹായം'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddVehicle(!showAddVehicle)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#5B6147] hover:bg-[#3F452F] text-white text-xs sm:text-sm font-bold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'en' ? 'Add Lorry to Fleet' : 'വാഹനം ചേർക്കുക'}</span>
          </button>
        </div>
      </div>

      {/* FLEET METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#8E7F6B]/30 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#8E7F6B] uppercase tracking-wider block">
            {lang === 'en' ? 'Total Active Lorries' : 'വാഹനങ്ങളുടെ എണ്ണം'}
          </span>
          <div className="text-2xl font-black font-serif text-[#4A3626]">
            {fleet.length} <span className="text-xs font-normal text-stone-500">Vehicles</span>
          </div>
          <p className="text-[10px] text-emerald-700 font-semibold">All GPS & Crane equipped</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#8E7F6B]/30 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#8E7F6B] uppercase tracking-wider block">
            {lang === 'en' ? 'Total Fleet Capacity' : 'മൊത്തം ശേഷി'}
          </span>
          <div className="text-2xl font-black font-serif text-[#4A3626]">
            {fleet.reduce((acc, v) => acc + v.capacityTonnes, 0)}{' '}
            <span className="text-xs font-normal text-stone-500">Tonnes</span>
          </div>
          <p className="text-[10px] text-stone-500">Up to 600 CFT per trip</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#8E7F6B]/30 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#8E7F6B] uppercase tracking-wider block">
            {lang === 'en' ? 'Active Transit Trips' : 'സജീവ ഓട്ടങ്ങൾ'}
          </span>
          <div className="text-2xl font-black font-serif text-amber-700">
            1 <span className="text-xs font-normal text-stone-500">On Trip</span>
          </div>
          <p className="text-[10px] text-stone-500">Nilambur &rarr; Perumbavoor</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#8E7F6B]/30 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#8E7F6B] uppercase tracking-wider block">
            {lang === 'en' ? 'Pending Transit Quotes' : 'അന്വേഷണങ്ങൾ'}
          </span>
          <div className="text-2xl font-black font-serif text-[#4A3626]">
            {bookings.filter((b) => b.status === 'requested').length}{' '}
            <span className="text-xs font-normal text-stone-500">Requests</span>
          </div>
          <p className="text-[10px] text-emerald-700 font-semibold">Direct Mill & Buyer Bookings</p>
        </div>
      </div>

      {/* ADD VEHICLE FORM */}
      {showAddVehicle && (
        <div className="p-6 bg-white rounded-3xl border border-[#8E7F6B]/30 shadow-md space-y-4 animate-scaleUp">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h3 className="font-serif font-bold text-[#4A3626] text-base">
              {lang === 'en' ? 'Register New Timber Transit Vehicle' : 'പുതിയ വാഹനം രജിസ്റ്റർ ചെയ്യുക'}
            </h3>
            <button
              onClick={() => setShowAddVehicle(false)}
              className="text-stone-400 hover:text-stone-700 font-bold"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleAddVehicle} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'en' ? 'Registration Number (e.g. KL-11-BH-4890)' : 'വാഹന രജിസ്ട്രേഷൻ നമ്പർ'}
                </label>
                <input
                  type="text"
                  placeholder="KL-XX-XX-XXXX"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm font-semibold uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'en' ? 'Vehicle Make & Model' : 'വാഹന മോഡൽ'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tata 1618 LPK 10-Wheel"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'en' ? 'Max Haulage Capacity (Tonnes)' : 'ശേഷി (ടൺ)'}
                </label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm font-semibold"
                  min={1}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddVehicle(false)}
                className="px-4 py-2.5 rounded-xl bg-stone-200 text-stone-700 font-bold text-xs"
              >
                {lang === 'en' ? 'Cancel' : 'റദ്ദാക്കുക'}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs shadow-xs"
              >
                {lang === 'en' ? 'Add to Registered Fleet' : 'ഫ്ലീറ്റിൽ ചേർക്കുക'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REGISTERED VEHICLES FLEET */}
      <div className="bg-white rounded-3xl border border-stone-300 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#5B6147]" />
            <h3 className="font-extrabold font-serif text-[#4A3626] text-base">
              {lang === 'en' ? 'Registered Timber Haulage Fleet' : 'രജിസ്റ്റർ ചെയ്ത തടി ലോറികൾ'}
            </h3>
          </div>
          <span className="text-xs font-bold text-[#5B6147]">
            {fleet.length} {lang === 'en' ? 'Vehicles' : 'എണ്ണം'}
          </span>
        </div>

        <div className="divide-y divide-stone-200">
          {fleet.map((veh) => (
            <div
              key={veh.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#E7E1D6]/40 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-extrabold text-[#4A3626] text-base px-2.5 py-1 rounded-xl bg-stone-100 border border-stone-300">
                    {veh.regNumber}
                  </span>
                  <span className="font-bold text-[#4A3626] text-xs sm:text-sm">
                    {veh.model}
                  </span>
                  {veh.hasCrane && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                      Crane Equipped (ഹൈഡ്രോളിക് ക്രെയിൻ)
                    </span>
                  )}
                  {veh.formIvPermitted && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Form IV Forest Cleared
                    </span>
                  )}
                </div>
                <div className="text-xs text-stone-500">
                  Capacity: <b>{veh.capacityTonnes} Tonnes</b> (approx. {Math.round(veh.capacityTonnes * 35)} CFT Round Logs)
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  veh.status === 'available'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                {veh.status === 'available'
                  ? (lang === 'en' ? 'Available for Transit' : 'ലഭ്യമാണ്')
                  : (lang === 'en' ? 'Currently on Road' : 'യാത്രയിൽ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* TRANSIT BOOKINGS & ENQUIRIES */}
      <div className="bg-white rounded-3xl border border-stone-300 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#5B6147]" />
            <h3 className="font-extrabold font-serif text-[#4A3626] text-base">
              {lang === 'en' ? 'Transit Load Enquiries & Mill Bookings' : 'ലോഡ് ബുക്കിംഗുകൾ'}
            </h3>
          </div>
          <span className="text-xs font-bold text-[#5B6147]">
            {bookings.length} {lang === 'en' ? 'Consignments' : 'എണ്ണം'}
          </span>
        </div>

        <div className="divide-y divide-stone-200">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#E7E1D6]/40 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[#4A3626] text-sm sm:text-base">
                    {b.pickupLocation} → {b.dropLocation}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#E7E1D6] text-[#4A3626] text-[10px] font-bold">
                    {b.timberSpecies} ({b.cftVolume} CFT)
                  </span>
                </div>
                <div className="text-xs text-stone-500 flex items-center gap-2">
                  <span>Client: <b>{b.clientName}</b></span>
                  <span>•</span>
                  <span>Quote: <b className="font-mono text-[#4A3626]">{formatINR(b.rateQuoted)}</b></span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    b.status === 'confirmed'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {b.status === 'confirmed'
                    ? (lang === 'en' ? 'Confirmed Load' : 'ഉറപ്പിച്ചു')
                    : (lang === 'en' ? 'Quote Requested' : 'ആവശ്യപ്പെട്ടു')}
                </span>
                <a
                  href={`tel:${b.clientPhone}`}
                  className="px-3 py-1.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs transition flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Call' : 'വിളിക്കുക'}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <RaiseTicketModal
        isOpen={isRaiseModalOpen}
        onClose={() => setIsRaiseModalOpen(false)}
        lang={lang}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        lang={lang}
      />
    </div>
  );
}
