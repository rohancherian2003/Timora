import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Factory,
  MapPin,
  Phone,
  Star,
  CheckCircle,
  ShieldCheck,
  Search,
  MessageSquare,
  Sparkles,
  Send,
  Lock,
  LogIn,
  Layers,
  Wrench,
  Clock,
  UserCheck,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface TimberMillReview {
  id: string;
  author: string;
  role: string;
  rating: number;
  date: string;
  comment: string;
  commentMl: string;
}

export interface TimberMill {
  id: string;
  name: string;
  nameMl: string;
  ownerName: string;
  ownerNameMl: string;
  licenseNo: string;
  district: string;
  locality: string;
  phone: string;
  whatsapp: string;
  established: number;
  rating: number;
  ratingCount: number;
  isVerified: boolean;
  availableSpecies: string[];
  services: { en: string; ml: string }[];
  sawingRatePerCft: string;
  seasoningAvailable: boolean;
  reviews: TimberMillReview[];
}

const DEMO_TIMBER_MILLS: TimberMill[] = [
  {
    id: 'mill-ekm-1',
    name: 'Periyar Sawmills & Wood Processing Industries',
    nameMl: 'പെരിയാർ സോമിൽ & വുഡ് പ്രോസസ്സിംഗ് ഇൻഡസ്ട്രീസ്',
    ownerName: 'Mathew Varghese & Brothers',
    ownerNameMl: 'മാത്യു വർഗീസ് & ബ്രദേഴ്സ്',
    licenseNo: 'KL-SAW-EKM-4402/2012',
    district: 'Ernakulam (എറണാകുളം)',
    locality: 'Perumbavoor Timber Zone (പെരുമ്പാവൂർ)',
    phone: '+919447101234',
    whatsapp: '919447101234',
    established: 1994,
    rating: 4.9,
    ratingCount: 64,
    isVerified: true,
    availableSpecies: ['Nilambur Teak (തേക്ക്)', 'Anjili Wild Jack (ആഞ്ഞിലി)', 'African Mahogany (മഹാഗണി)', 'Rubberwood (റബർ)'],
    services: [
      { en: 'Horizontal Bandsaw Heavy Log Resawing', ml: 'ഹൊറിസോണ്ടൽ ബാൻഡ്‌സോ തടി അറുക്കൽ' },
      { en: 'Roof Truss & Rafter Precision Sizing', ml: 'മേൽക്കൂര കഴുക്കോൽ കൃത്യമായ അളവിൽ അറുക്കൽ' },
      { en: 'Plank Thickness Planing & Sanding', ml: 'പലക മിനുക്കൽ & പ്ലാനിംഗ്' },
      { en: 'Govt Form IV Transit Pass Logistics', ml: 'ഫോറസ്റ്റ് ഫോം IV ട്രാൻസിറ്റ് പാസ്സ് സൗകര്യം' },
    ],
    sawingRatePerCft: '₹65 - ₹80 / CFT',
    seasoningAvailable: true,
    reviews: [
      {
        id: 'rev-1',
        author: 'Saji K. George',
        role: 'House Owner, Kakkanad Kochi',
        rating: 5,
        date: '10 days ago',
        comment: 'Got 420 CFT of Anjili and Teak sawed for my new 2-storey house roofing. Zero wood wastage, sharp blades and Mathew chettan personally guided us on the grain cuts.',
        commentMl: 'കാക്കനാട് പുതിയ വീടിന്റെ മേൽക്കൂരയ്ക്ക് 420 CFT ആഞ്ഞിലിയും തേക്കും അറുത്തെടുത്തു. ഒരു തടിയും വേസ്റ്റ് ആയില്ല, വളരെ മാന്യമായ പെരുമാറ്റം.',
      },
      {
        id: 'rev-2',
        author: 'Anoop Thomas (Civil Contractor)',
        role: 'Building Contractor',
        rating: 4.8,
        date: '3 weeks ago',
        comment: 'Fast processing for large commercial timber batches. Their crane log lifting setup saves tons of loading time.',
        commentMl: 'വലിയ ഓർഡറുകൾ കൃത്യസമയത്ത് അറുത്തു നൽകുന്നു. ക്രെയിൻ സൗകര്യം ഉള്ളതിനാൽ ലോഡിംഗ് വേഗത്തിൽ നടക്കും.',
      },
    ],
  },
  {
    id: 'mill-pta-1',
    name: 'Pathanamthitta Central Timber Mills & Sawing Complex',
    nameMl: 'പത്തനംതിട്ട സെൻട്രൽ ടിംബർ മിൽസ് & സോയിംഗ് കോംപ്ലക്സ്',
    ownerName: 'K. R. Radhakrishnan Achari',
    ownerNameMl: 'കെ. ആർ. രാധാകൃഷ്ണൻ ആശാരി',
    licenseNo: 'KL-SAW-PTA-1820/2008',
    district: 'Pathanamthitta (പത്തനംതിട്ട)',
    locality: 'Adoor Bypass Junction (അടൂർ ബൈപ്പാസ്)',
    phone: '+919447202345',
    whatsapp: '919447202345',
    established: 1998,
    rating: 4.8,
    ratingCount: 47,
    isVerified: true,
    availableSpecies: ['Heritage Teak (തേക്ക്)', 'Anjili (ആഞ്ഞിലി)', 'Jackfruit Tree Wood (പ്ലാവ്)', 'Rosewood (ഈട്ടി)'],
    services: [
      { en: 'Traditional Temple & House Timber Sawing', ml: 'പരമ്പരാഗത വീട് / അമ്പല ആവശ്യങ്ങൾക്കുള്ള തടി അറുക്കൽ' },
      { en: 'Custom Door Frame & Window Beam Sizing', ml: 'കട്ടിള, ജനൽ ഫ്രെയിം ബീമുകൾ' },
      { en: 'Teak Log Girth Verification & Sorting', ml: 'തേക്ക് തടി വണ്ണം തിരിച്ച് സി.എഫ്.ടി കണക്കാക്കൽ' },
    ],
    sawingRatePerCft: '₹70 - ₹85 / CFT',
    seasoningAvailable: false,
    reviews: [
      {
        id: 'rev-3',
        author: 'Adv. Suresh Nair',
        role: 'House Builder, Thiruvalla',
        rating: 5,
        date: '2 weeks ago',
        comment: 'Very honest measurements in CFT. Radhakrishnan chettan gives genuine advice on which timber to use for door frames vs roof purlins.',
        commentMl: 'കണക്കിൽ ഒരു കൃത്രിമവുമില്ലാത്ത നല്ല മില്ല്. വാതിലുകൾക്കും ജനലുകൾക്കും ഏറ്റവും നല്ല തടികൾ തെരഞ്ഞെടുക്കാൻ സഹായിച്ചു.',
      },
    ],
  },
  {
    id: 'mill-pta-2',
    name: 'Konni Forest Valley Sawmill & Wood Seasoning Plant',
    nameMl: 'കോന്നി ഫോറസ്റ്റ് വാലി സോമിൽ & വുഡ് പ്ലാന്റ്',
    ownerName: 'Shaji V. Koshy',
    ownerNameMl: 'ഷാജി വി. കോശി',
    licenseNo: 'KL-SAW-PTA-2104/2015',
    district: 'Pathanamthitta (പത്തനംതിട്ട)',
    locality: 'Konni Depot Road (കോന്നി)',
    phone: '+919447303456',
    whatsapp: '919447303456',
    established: 2004,
    rating: 4.9,
    ratingCount: 38,
    isVerified: true,
    availableSpecies: ['Konni Teak Logs (കോന്നി തേക്ക്)', 'Anjili (ആഞ്ഞിലി)', 'Mahogany (മഹാഗണി)'],
    services: [
      { en: 'Kiln Seasoning & Wood Moisture Reduction', ml: 'തടി ഈർപ്പം കുറയ്ക്കാനുള്ള കിൽൻ സീസണിംഗ്' },
      { en: 'Square Purlin & Rafter Resawing', ml: 'കഴുക്കോലുകളും പലകകളും' },
      { en: 'Forest Timber Auction Transit Escort', ml: 'ഫോറസ്റ്റ് ഡിപ്പോ ലേലം തടികൾ എത്തിച്ചു നൽകൽ' },
    ],
    sawingRatePerCft: '₹75 - ₹90 / CFT',
    seasoningAvailable: true,
    reviews: [
      {
        id: 'rev-4',
        author: 'Dr. Renjith Philip',
        role: 'House Owner, Kozhencherry',
        rating: 5,
        date: '1 month ago',
        comment: 'Their kiln drying prevented any warping in my teak doors during the rainy season. Excellent facility in Pathanamthitta.',
        commentMl: 'തടി കൃത്യമായി ഉണക്കി തന്നതിനാൽ മഴക്കാലത്തും വാതിലുകൾക്ക് യാതൊരു വളവോ വിള്ളലോ വന്നില്ല. കോന്നിയിലെ മികച്ച മിൽ.',
      },
    ],
  },
  {
    id: 'mill-ekm-2',
    name: 'Muvattupuzha River Valley Wood Industries & Sawing',
    nameMl: 'മൂവാറ്റുപുഴ റിവർ വാലി വുഡ് ഇൻഡസ്ട്രീസ് & സോയിംഗ്',
    ownerName: 'C. P. Eldho & Sons',
    ownerNameMl: 'സി. പി. എൽദോ & സൺസ്',
    licenseNo: 'KL-SAW-EKM-3981/2005',
    district: 'Ernakulam (എറണാകുളം)',
    locality: 'Muvattupuzha Industrial Area (മൂവാറ്റുപുഴ)',
    phone: '+919447404567',
    whatsapp: '919447404567',
    established: 1991,
    rating: 4.7,
    ratingCount: 52,
    isVerified: true,
    availableSpecies: ['Rubberwood Hardwood (റബർ)', 'Anjili (ആഞ്ഞിലി)', 'Mahogany (മഹാഗണി)', 'Teak (തേക്ക്)'],
    services: [
      { en: 'Heavy Timber Planing & Dressing', ml: 'തടി പ്ലാനിംഗ് & ഡ്രെസ്സിംഗ്' },
      { en: 'Rubberwood Chemical Treatment & Sizing', ml: 'റബർ തടി പ്രിസർവേറ്റീവ് ട്രീറ്റ്മെന്റ്' },
      { en: 'Bulk Sawing for Residential Housing', ml: 'ഭവനനിർമ്മാണത്തിനുള്ള തടി അറുക്കൽ' },
    ],
    sawingRatePerCft: '₹60 - ₹75 / CFT',
    seasoningAvailable: true,
    reviews: [
      {
        id: 'rev-5',
        author: 'Binu Jacob',
        role: 'Architectural Joiner, Piravom',
        rating: 4.7,
        date: '2 months ago',
        comment: 'Very competitive sawing rates and great handling of Rubberwood and Anjili logs.',
        commentMl: 'മിതമായ നിരക്കിൽ കൃത്യമായി അറുത്തു തരുന്ന മികച്ച മില്ല്.',
      },
    ],
  },
  {
    id: 'mill-ktm-1',
    name: 'Meenachil Timber Mart & High-Tech Sawmills',
    nameMl: 'മീനച്ചിൽ ടിംബർ മാർട്ട് & ഹൈ-ടെക് സോമിൽസ്',
    ownerName: 'P. J. Joseph (Babychan)',
    ownerNameMl: 'പി. ജെ. ജോസഫ് (ബേബിച്ചൻ)',
    licenseNo: 'KL-SAW-KTM-5012/2010',
    district: 'Kottayam (കോട്ടയം)',
    locality: 'Pala Bypass (പാലാ ബൈപ്പാസ്)',
    phone: '+919447505678',
    whatsapp: '919447505678',
    established: 1996,
    rating: 4.9,
    ratingCount: 71,
    isVerified: true,
    availableSpecies: ['Pala Anjili (ആഞ്ഞിലി)', 'Teak Planks (തേക്ക്)', 'Mahogany Beams (മഹാഗണി)'],
    services: [
      { en: 'Precision Computerized Band Sawing', ml: 'കൃത്യതയുള്ള ബാൻഡ്‌സോ അറുക്കൽ' },
      { en: 'Home Construction Wood Lot Bundling', ml: 'വീടുപണിക്കുള്ള തടികൾ ക്രമപ്പെടുത്തി നൽകൽ' },
      { en: 'Direct Forest Form IV Logistics', ml: 'ഫോറസ്റ്റ് പാസ്സ് അനുബന്ധ സേവനങ്ങൾ' },
    ],
    sawingRatePerCft: '₹65 - ₹80 / CFT',
    seasoningAvailable: true,
    reviews: [
      {
        id: 'rev-6',
        author: 'Thomas Kurian',
        role: 'House Builder, Pala',
        rating: 5,
        date: '3 weeks ago',
        comment: 'Best sawmill in Kottayam district. Babychan gave us clear calculations and our carpenter was very happy with the smooth cuts.',
        commentMl: 'കോട്ടയം ജില്ലയിലെ ഏറ്റവും വിശ്വസനീയമായ തടി മില്ല്. തടി ആശാരിമാർക്ക് പണി ചെയ്യാൻ പാകത്തിൽ വളരെ വൃത്തിയായി അറുത്തു തന്നു.',
      },
    ],
  },
  {
    id: 'mill-tsr-1',
    name: 'Chalakudy River Basin Sawmill & Timber Depot',
    nameMl: 'ചാലക്കുടി റിവർ ബേസിൻ സോമിൽ & ടിംബർ ഡിപ്പോ',
    ownerName: 'V. S. Jayaprakash',
    ownerNameMl: 'വി. എസ്. ജയപ്രകാശ്',
    licenseNo: 'KL-SAW-TSR-2890/2003',
    district: 'Thrissur (തൃശ്ശൂർ)',
    locality: 'Chalakudy Main Road (ചാലക്കുടി)',
    phone: '+919447606789',
    whatsapp: '919447606789',
    established: 2001,
    rating: 4.8,
    ratingCount: 43,
    isVerified: true,
    availableSpecies: ['Teak (തേക്ക്)', 'Mahogany (മഹാഗണി)', 'Anjili (ആഞ്ഞിലി)', 'Jackfruit (പ്ലാവ്)'],
    services: [
      { en: 'Heavy Round Log Sawing', ml: 'വലിയ ഉരുണ്ട തടികൾ അറുക്കൽ' },
      { en: 'Door & Window Plank Ready Sizing', ml: 'വാതിൽ, ജനൽ പലകകൾ' },
    ],
    sawingRatePerCft: '₹68 - ₹82 / CFT',
    seasoningAvailable: false,
    reviews: [
      {
        id: 'rev-7',
        author: 'Mani Menon',
        role: 'House Owner, Irinjalakuda',
        rating: 4.8,
        date: '1 month ago',
        comment: 'Reliable service and experienced saw operators. Handled our old-growth teak logs with immense care.',
        commentMl: 'വർഷങ്ങളുടെ പരിചയമുള്ള തടി അറുപ്പുകാർ. പഴയ തേക്ക് തടികൾ യാതൊരു കേടുപാടും കൂടാതെ അറുത്തെടുത്തു.',
      },
    ],
  },
  {
    id: 'mill-clt-1',
    name: 'Kallai Heritage Timber Processing Mills',
    nameMl: 'കല്ലായി ഹെറിറ്റേജ് ടിംബർ പ്രോസസ്സിംഗ് മിൽസ്',
    ownerName: 'M. P. Abdul Razak',
    ownerNameMl: 'എം. പി. അബ്ദുൾ റസാഖ്',
    licenseNo: 'KL-SAW-CLT-1102/1986',
    district: 'Kozhikode (കോഴിക്കോട്)',
    locality: 'Kallai Timber Basin (കല്ലായി)',
    phone: '+919447707890',
    whatsapp: '919447707890',
    established: 1986,
    rating: 5.0,
    ratingCount: 89,
    isVerified: true,
    availableSpecies: ['Nilambur Teak (നിലമ്പൂർ തേക്ക്)', 'Rosewood / Veetti (ഈട്ടി)', 'Mahogany (മഹാഗണി)'],
    services: [
      { en: 'Heritage Kallai Log Sawing Legacy', ml: 'പ്രശസ്തമായ കല്ലായി തടി അറുക്കൽ' },
      { en: 'Export-Grade Timber Sizing & Seasoning', ml: 'ഉയർന്ന ഗ്രേഡ് തടി സീസണിംഗ്' },
      { en: 'Transit Pass & Forest Documentation', ml: 'ഫോറസ്റ്റ് ഡോക്യുമെന്റേഷൻ' },
    ],
    sawingRatePerCft: '₹75 - ₹95 / CFT',
    seasoningAvailable: true,
    reviews: [
      {
        id: 'rev-8',
        author: 'Farook C. K.',
        role: 'Architect, Kozhikode',
        rating: 5,
        date: '2 weeks ago',
        comment: 'The legendary Kallai woodcraft precision. Razakikka provides the finest seasoned Teak and Rosewood for high-end luxury villas.',
        commentMl: 'കല്ലായിയുടെ തനിമയുള്ള തടി അറുക്കൽ കേന്ദ്രം. വീടുകൾക്ക് ആവശ്യമായ ഏറ്റവും മികച്ച തടി ലഭിക്കുന്നു.',
      },
    ],
  },
];

export function TimberMillsPage({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const { user, isAuthenticated, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Login Gate Modal State
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [gateActionName, setGateActionName] = useState<string>('');

  // Quote Request Modal State (for authenticated users)
  const [quoteModalMill, setQuoteModalMill] = useState<TimberMill | null>(null);
  const [quoteSpecies, setQuoteSpecies] = useState<string>('Teak (തേക്ക്)');
  const [quoteService, setQuoteService] = useState<string>('Log Sawing (തടി അറുക്കൽ)');
  const [quoteCft, setQuoteCft] = useState<number>(150);
  const [quoteDeliveryLocation, setQuoteDeliveryLocation] = useState<string>('');
  const [quoteNote, setQuoteNote] = useState<string>('');
  const [quoteSubmitted, setQuoteSubmitted] = useState<boolean>(false);

  // Review Modal State
  const [reviewModalMill, setReviewModalMill] = useState<TimberMill | null>(null);
  const [reviewStars, setReviewStars] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);

  // Filter logic
  const filteredMills = DEMO_TIMBER_MILLS.filter((mill) => {
    if (selectedDistrict !== 'all' && !mill.district.toLowerCase().includes(selectedDistrict.toLowerCase())) {
      return false;
    }
    if (
      selectedSpecies !== 'all' &&
      !mill.availableSpecies.some((sp) => sp.toLowerCase().includes(selectedSpecies.toLowerCase()))
    ) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = mill.name.toLowerCase().includes(q) || mill.nameMl.toLowerCase().includes(q);
      const matchOwner = mill.ownerName.toLowerCase().includes(q) || mill.ownerNameMl.toLowerCase().includes(q);
      const matchLocality = mill.locality.toLowerCase().includes(q);
      const matchSpecies = mill.availableSpecies.some((sp) => sp.toLowerCase().includes(q));
      if (!matchName && !matchOwner && !matchLocality && !matchSpecies) {
        return false;
      }
    }
    return true;
  });

  // Action guard: Requires Login!
  const handleProtectedAction = (actionName: string, mill: TimberMill, callback: () => void) => {
    if (!isAuthenticated) {
      setGateActionName(actionName);
      setShowAuthGate(true);
      return;
    }
    callback();
  };

  // Instant demo login helper for convenience
  const handleQuickDemoLogin = () => {
    loginAsDemo('buyer');
    setShowAuthGate(false);
  };

  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteSubmitted(true);
    setTimeout(() => {
      setQuoteSubmitted(false);
      setQuoteModalMill(null);
      setQuoteDeliveryLocation('');
      setQuoteNote('');
    }, 2400);
  };

  const handleSendReview = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewSubmitted(false);
      setReviewModalMill(null);
      setReviewText('');
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. TOP HERO BANNER (WARM TIMBER PALETTE) */}
      <section className="relative p-6 sm:p-10 bg-gradient-to-br from-[#E7E1D6] via-[#d5cfc4] to-[#c4bdb0] text-[#4A3626] rounded-3xl shadow-md border border-[#c4bdb0] overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-stone-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 text-[#5B6147] text-xs font-semibold backdrop-blur-sm border border-[#5B6147]/30">
            <Factory className="w-3.5 h-3.5 text-[#5B6147]" />
            <span>
              {lang === 'en'
                ? 'Kerala Licensed Timber Sawmills & Sizing Yards'
                : 'കേരളത്തിലെ അംഗീകൃത തടി മില്ലുകൾ & സോയിംഗ് കേന്ദ്രങ്ങൾ'}
            </span>
          </div>

          <h1
            className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#4A3626]"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {lang === 'en' ? (
              <>
                Connect With Timber Mills <br />
                <span className="text-[#5B6147]">For House Construction & Sizing</span>
              </>
            ) : (
              <>
                വീടുപണിക്കും തടി ആവശ്യങ്ങൾക്കും <br />
                <span className="text-[#5B6147]">നേരിട്ട് തടി മില്ലുകളുമായി ബന്ധപ്പെടാം</span>
              </>
            )}
          </h1>

          <p className="text-xs sm:text-sm text-[#7A5A3A] leading-relaxed max-w-2xl font-medium">
            {lang === 'en'
              ? 'Find licensed sawmills across Ernakulam, Pathanamthitta, Kottayam, and all 14 Kerala districts. Check available wood species, verified customer reviews, sawing charges, and contact owners directly.'
              : 'എറണാകുളം, പത്തനംതിട്ട, കോട്ടയം ഉൾപ്പെടെയുള്ള 14 ജില്ലകളിലെ തടി മില്ലുകളുടെ വിവരങ്ങൾ, അവൈലബിൾ ആയ തടികൾ, ഉപഭോക്താക്കളുടെ റിവ്യൂസ് എന്നിവ കണ്ട് ഉടമസ്ഥരെ നേരിട്ട് ബന്ധപ്പെടുക.'}
          </p>

          {/* Value highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white/80 border border-stone-300/80 shadow-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span className="font-bold text-stone-800 text-[11px]">
                {lang === 'en' ? 'Govt Licensed Mills' : 'അംഗീകൃത മില്ലുകൾ'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/80 border border-stone-300/80 shadow-xs flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#5B6147] flex-shrink-0" />
              <span className="font-bold text-stone-800 text-[11px]">
                {lang === 'en' ? 'Precision Bandsawing' : 'കൃത്യമായ അറുക്കൽ'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/80 border border-stone-300/80 shadow-xs flex items-center gap-2">
              <Star className="w-4 h-4 text-stone-1000 fill-stone-1000 flex-shrink-0" />
              <span className="font-bold text-stone-800 text-[11px]">
                {lang === 'en' ? 'House Owner Reviews' : 'യഥാർത്ഥ റിവ്യൂസ്'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/80 border border-stone-300/80 shadow-xs flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-bold text-stone-800 text-[11px]">
                {lang === 'en' ? 'Direct Owner Contact' : 'നേരിട്ട് വിളിക്കാം'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FILTER & SEARCH CONTROLS */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-300/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-grow max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={
                lang === 'en'
                  ? 'Search mill name, locality, owner, or species...'
                  : 'മില്ലിന്റെ പേര്, സ്ഥലം, തടി ഇനം തിരയുക...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300/80 text-xs sm:text-sm font-semibold bg-[#E7E1D6]/50 focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
            />
          </div>

          {/* District & Species Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#5B6147]" />
              <span className="text-xs font-bold text-stone-700">
                {lang === 'en' ? 'District:' : 'ജില്ല:'}
              </span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-3 py-1.5 border border-stone-300/80 rounded-xl text-stone-800 font-semibold text-xs bg-[#E7E1D6]/50 focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
              >
                <option value="all">{lang === 'en' ? 'All Kerala Districts' : 'എല്ലാ ജില്ലകളും'}</option>
                <option value="Ernakulam">Ernakulam (എറണാകുളം - പെരുമ്പാവൂർ)</option>
                <option value="Pathanamthitta">Pathanamthitta (പത്തനംതിട്ട - അടൂർ/കോന്നി)</option>
                <option value="Kottayam">Kottayam (കോട്ടയം - പാലാ)</option>
                <option value="Thrissur">Thrissur (തൃശ്ശൂർ - ചാലക്കുടി)</option>
                <option value="Kozhikode">Kozhikode (കോഴിക്കോട് - കല്ലായി)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-stone-700">
                {lang === 'en' ? 'Wood Species:' : 'തടി ഇനം:'}
              </span>
              <select
                value={selectedSpecies}
                onChange={(e) => setSelectedSpecies(e.target.value)}
                className="px-3 py-1.5 border border-stone-300/80 rounded-xl text-stone-800 font-semibold text-xs bg-[#E7E1D6]/50 focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
              >
                <option value="all">{lang === 'en' ? 'All Wood Species' : 'എല്ലാ തടികളും'}</option>
                <option value="Teak">Teak (തേക്ക്)</option>
                <option value="Anjili">Anjili (ആഞ്ഞിലി)</option>
                <option value="Mahogany">Mahogany (മഹാഗണി)</option>
                <option value="Rubberwood">Rubberwood (റബർ)</option>
                <option value="Jackfruit">Jackfruit (പ്ലാവ്)</option>
                <option value="Rosewood">Rosewood / Veetti (ഈട്ടി)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick District Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-stone-500 whitespace-nowrap">
            {lang === 'en' ? 'Popular Mill Clusters:' : 'പ്രധാന മില്ലുകൾ:'}
          </span>
          <button
            onClick={() => setSelectedDistrict('all')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
              selectedDistrict === 'all'
                ? 'bg-[#5B6147] text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {lang === 'en' ? 'All Kerala' : 'എല്ലാം'}
          </button>
          <button
            onClick={() => setSelectedDistrict('Ernakulam')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
              selectedDistrict === 'Ernakulam'
                ? 'bg-[#5B6147] text-white shadow-xs'
                : 'bg-[#E7E1D6] text-[#4A3626] border border-stone-300 hover:bg-stone-200'
            }`}
          >
            📍 Ernakulam (പെരുമ്പാവൂർ)
          </button>
          <button
            onClick={() => setSelectedDistrict('Pathanamthitta')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
              selectedDistrict === 'Pathanamthitta'
                ? 'bg-[#5B6147] text-white shadow-xs'
                : 'bg-[#E7E1D6] text-[#4A3626] border border-stone-300 hover:bg-stone-200'
            }`}
          >
            📍 Pathanamthitta (അടൂർ / കോന്നി)
          </button>
          <button
            onClick={() => setSelectedDistrict('Kottayam')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
              selectedDistrict === 'Kottayam'
                ? 'bg-[#5B6147] text-white shadow-xs'
                : 'bg-[#E7E1D6] text-[#4A3626] border border-stone-300 hover:bg-stone-200'
            }`}
          >
            📍 Kottayam (പാലാ)
          </button>
          <button
            onClick={() => setSelectedDistrict('Thrissur')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
              selectedDistrict === 'Thrissur'
                ? 'bg-[#5B6147] text-white shadow-xs'
                : 'bg-[#E7E1D6] text-[#4A3626] border border-stone-300 hover:bg-stone-200'
            }`}
          >
            📍 Thrissur (ചാലക്കുടി)
          </button>
          <button
            onClick={() => setSelectedDistrict('Kozhikode')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
              selectedDistrict === 'Kozhikode'
                ? 'bg-[#5B6147] text-white shadow-xs'
                : 'bg-[#E7E1D6] text-[#4A3626] border border-stone-300 hover:bg-stone-200'
            }`}
          >
            📍 Kozhikode (കല്ലായി)
          </button>
        </div>
      </div>

      {/* 3. TIMBER MILLS LISTING CARDS */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold font-serif text-[#4A3626]">
            {filteredMills.length}{' '}
            {lang === 'en'
              ? 'Licensed Timber Mills Found'
              : 'അംഗീകൃത തടി മില്ലുകൾ ലഭ്യമാണ്'}
          </h2>
          {!isAuthenticated && (
            <span className="text-xs text-[#5B6147] font-bold flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-300">
              <Lock className="w-3 h-3" />
              {lang === 'en'
                ? 'Login required to contact mill owners'
                : 'മില്ലുകളെ ബന്ധപ്പെടാൻ ലോഗിൻ ചെയ്യുക'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMills.map((mill) => (
            <div
              key={mill.id}
              className="bg-white rounded-3xl border border-stone-300/80 p-6 shadow-xs hover:border-stone-400 hover:shadow-md transition space-y-5 flex flex-col justify-between"
            >
              {/* Mill Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-700" />
                        {mill.licenseNo}
                      </span>
                      <span className="text-[11px] text-stone-500 font-semibold">
                        Est. {mill.established}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-extrabold font-serif text-[#4A3626] leading-snug">
                      {lang === 'en' ? mill.name : mill.nameMl}
                    </h3>

                    <div className="text-xs text-stone-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#5B6147] flex-shrink-0" />
                      <span className="font-medium">{mill.locality}</span>
                    </div>

                    <div className="text-xs text-[#4A3626] font-semibold flex items-center gap-1 pt-0.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#5B6147]" />
                      <span>
                        {lang === 'en' ? 'Proprietor / Owner:' : 'ഉടമസ്ഥൻ:'}{' '}
                        <strong>{lang === 'en' ? mill.ownerName : mill.ownerNameMl}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Rating Badge */}
                  <div className="flex flex-col items-end flex-shrink-0">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-200 text-[#4A3626] border border-stone-300/80 font-black text-sm">
                      <Star className="w-4 h-4 fill-stone-1000 text-stone-1000" />
                      <span>{mill.rating}</span>
                    </div>
                    <span className="text-[10px] text-stone-400 mt-0.5">
                      {mill.ratingCount} {lang === 'en' ? 'reviews' : 'റിവ്യൂസ്'}
                    </span>
                  </div>
                </div>

                {/* Available Species Pills */}
                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                    {lang === 'en' ? 'Available Timber Species at Mill:' : 'ലഭ്യമായ തടികൾ:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {mill.availableSpecies.map((sp, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-lg bg-[#E7E1D6] text-[#4A3626] border border-stone-300/80 text-[11px] font-semibold"
                      >
                        🪵 {sp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mill Services & Machinery */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                    {lang === 'en' ? 'Services & Processing Facilities:' : 'സേവനങ്ങൾ:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                    {mill.services.map((srv, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-stone-700">
                        <CheckCircle className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                        <span className="text-[11px] leading-tight">
                          {lang === 'en' ? srv.en : srv.ml}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sawing Rate & Seasoning */}
                <div className="p-3 rounded-2xl bg-[#E7E1D6] border border-stone-300/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-500 text-[10px] uppercase font-bold block">
                      {lang === 'en' ? 'Standard Sawing Charge' : 'അറുപ്പ് നിരക്ക്'}
                    </span>
                    <span className="font-extrabold text-[#4A3626] text-sm">
                      {mill.sawingRatePerCft}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 text-[10px] uppercase font-bold block text-right">
                      {lang === 'en' ? 'Kiln Seasoning' : 'കിൽൻ സീസണിംഗ്'}
                    </span>
                    <span
                      className={`font-bold text-xs ${
                        mill.seasoningAvailable ? 'text-emerald-700' : 'text-stone-400'
                      }`}
                    >
                      {mill.seasoningAvailable
                        ? lang === 'en'
                          ? '✓ Available'
                          : '✓ ലഭ്യമാണ്'
                        : lang === 'en'
                        ? 'Not Available'
                        : 'ലഭ്യമല്ല'}
                    </span>
                  </div>
                </div>

                {/* Customer Reviews Spotlight */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-700 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-[#5B6147]" />
                      {lang === 'en' ? 'Recent House Owner Reviews:' : 'ഉപഭോക്താക്കളുടെ അഭിപ്രായങ്ങൾ:'}
                    </span>
                    <button
                      onClick={() =>
                        handleProtectedAction('Write a Review', mill, () => {
                          setReviewModalMill(mill);
                        })
                      }
                      className="text-[11px] text-[#5B6147] hover:underline font-bold"
                    >
                      + {lang === 'en' ? 'Add Review' : 'റിവ്യൂ നൽകുക'}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {mill.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-3 rounded-xl bg-stone-50/70 border border-stone-200/80 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-800">{rev.author}</span>
                          <div className="flex items-center gap-1 text-stone-1000">
                            {'★'.repeat(Math.floor(rev.rating))}
                            <span className="text-[10px] text-stone-400 ml-1">{rev.date}</span>
                          </div>
                        </div>
                        <p className="text-stone-600 text-[11px] leading-relaxed italic">
                          "{lang === 'en' ? rev.comment : rev.commentMl}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Phone & Quote Modal (Protected with Login) */}
              <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* Contact Phone Button */}
                <button
                  onClick={() =>
                    handleProtectedAction('Call Mill Owner', mill, () => {
                      window.location.href = `tel:${mill.phone}`;
                    })
                  }
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>
                    {isAuthenticated
                      ? lang === 'en'
                        ? `Call ${mill.phone}`
                        : `വിളിക്കുക: ${mill.phone}`
                      : lang === 'en'
                      ? 'Call Mill Owner (Login)'
                      : 'വിളിക്കാൻ ലോഗിൻ ചെയ്യുക'}
                  </span>
                </button>

                {/* Direct Quote Request Modal Trigger */}
                <button
                  onClick={() =>
                    handleProtectedAction('Request Sizing Quote', mill, () => {
                      setQuoteModalMill(mill);
                    })
                  }
                  className="py-2.5 px-4 rounded-xl bg-white border border-stone-300 text-[#4A3626] hover:bg-[#E7E1D6] text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5 text-[#5B6147]" />
                  <span>
                    {lang === 'en' ? 'Get Sawing Quote' : 'കോട്ടേഷൻ ആവശ്യപ്പെടുക'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. AUTHENTICATION GATE MODAL (നിർബന്ധമായും ലോഗിൻ ചെയ്യണം എന്ന് ആവശ്യപ്പെടുന്നത്) */}
      {showAuthGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-stone-300/80 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-stone-200 text-[#4A3626] flex items-center justify-center font-bold">
                  <Lock className="w-4 h-4 text-[#5B6147]" />
                </div>
                <h3 className="font-extrabold font-serif text-[#4A3626] text-base">
                  {lang === 'en' ? 'Buyer / House Owner Login Required' : 'ലോഗിൻ ആവശ്യമാണ്'}
                </h3>
              </div>
              <button
                onClick={() => setShowAuthGate(false)}
                className="text-stone-400 hover:text-stone-700 font-bold p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-stone-600">
              <p className="font-semibold text-stone-900 text-sm">
                {lang === 'en'
                  ? `Please sign in to ${gateActionName.toLowerCase()} and interact with timber mills.`
                  : `മില്ലുകളുമായി നേരിട്ട് സംസാരിക്കാനും കോട്ടേഷൻ ചോദിക്കാനും ദയവായി ലോഗിൻ ചെയ്യുക.`}
              </p>
              <p className="text-stone-500">
                {lang === 'en'
                  ? 'To prevent spam and protect timber sawmill owners, direct phone calls and price negotiation quotes are reserved for verified registered buyers and house builders.'
                  : 'തടി മില്ലുകളുടെ സുരക്ഷയ്ക്കും അനാവശ്യ കോളുകൾ തടയുന്നതിനുമായി രജിസ്റ്റർ ചെയ്ത ഉപഭോക്താക്കൾക്കും വീടുപണിയുന്നവർക്കും മാത്രമാണ് ഈ സേവനം ലഭ്യമാക്കിയിട്ടുള്ളത്.'}
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <Link
                to="/login"
                className="w-full py-3 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <LogIn className="w-4 h-4" />
                <span>{lang === 'en' ? 'Sign In As Buyer / House Owner' : 'ഉപഭോക്താവായി ലോഗിൻ ചെയ്യുക'}</span>
              </Link>

              <Link
                to="/register"
                className="w-full py-2.5 rounded-xl border border-stone-300 text-[#4A3626] hover:bg-stone-100 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <UserCheck className="w-4 h-4" />
                <span>{lang === 'en' ? 'Create Free Buyer Account' : 'സൗജന്യ അക്കൗണ്ട് ഉണ്ടാക്കുക'}</span>
              </Link>

              {/* 1-Click Quick Demo Login for instant testing */}
              <div className="pt-2 border-t border-stone-100 text-center">
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="text-xs text-[#5B6147] hover:text-[#3F452F] font-bold underline decoration-stone-400 underline-offset-2"
                >
                  ⚡ {lang === 'en' ? 'Quick Demo Login (Suresh Kumar, Buyer)' : 'ടെസ്റ്റിംഗിനായി ഉടൻ ബയറായി ലോഗിൻ ചെയ്യുക'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. REQUEST SAWING / TIMBER QUOTE MODAL (FOR AUTHENTICATED BUYERS) */}
      {quoteModalMill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-stone-300/80 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6147]">
                  {lang === 'en' ? 'Direct Sizing & Sawing Enquiry' : 'തടി അറുപ്പ് / കോട്ടേഷൻ'}
                </span>
                <h3 className="font-extrabold font-serif text-[#4A3626] text-base">
                  {lang === 'en' ? quoteModalMill.name : quoteModalMill.nameMl}
                </h3>
              </div>
              <button
                onClick={() => setQuoteModalMill(null)}
                className="text-stone-400 hover:text-stone-700 font-bold p-1 text-sm"
              >
                ✕
              </button>
            </div>

            {quoteSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-stone-900 text-base">
                  {lang === 'en' ? 'Quote Request Sent to Mill Owner!' : 'കോട്ടേഷൻ അപേക്ഷ മില്ലിലേക്ക് അയച്ചു!'}
                </h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {lang === 'en'
                    ? `${quoteModalMill.ownerName} will review your requirement and call you at +91 ${user?.phone || ''} shortly.`
                    : `${quoteModalMill.ownerName} ഉടൻ തന്നെ താങ്കളുടെ ഫോണിൽ (+91 ${user?.phone || ''}) ബന്ധപ്പെടുന്നതായിരിക്കും.`}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendQuote} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {lang === 'en' ? 'Required Timber Species' : 'ആവശ്യമുള്ള തടി ഇനം'}
                  </label>
                  <select
                    value={quoteSpecies}
                    onChange={(e) => setQuoteSpecies(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-stone-300/80 rounded-xl bg-[#E7E1D6]/50 text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B6147]"
                  >
                    {quoteModalMill.availableSpecies.map((sp, i) => (
                      <option key={i} value={sp}>
                        {sp}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      {lang === 'en' ? 'Service Needed' : 'ആവശ്യമുള്ള സേവനം'}
                    </label>
                    <select
                      value={quoteService}
                      onChange={(e) => setQuoteService(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-stone-300/80 rounded-xl bg-[#E7E1D6]/50 text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B6147]"
                    >
                      <option value="Log Sawing (തടി അറുക്കൽ)">Log Sawing (തടി അറുക്കൽ)</option>
                      <option value="Roof Truss Sizing (കഴുക്കോൽ)">Roof Truss Sizing (കഴുക്കോൽ)</option>
                      <option value="Door Planks (വാതിൽ പലക)">Door Planks (വാതിൽ പലക)</option>
                      <option value="Kiln Seasoning (ഉണക്കൽ)">Kiln Seasoning (ഉണക്കൽ)</option>
                      <option value="Ready Timber Stock (തടി വാങ്ങാൻ)">Ready Timber Stock (തടി വാങ്ങാൻ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      {lang === 'en' ? 'Approx. Quantity (CFT)' : 'അളവ് (CFT)'}
                    </label>
                    <input
                      type="number"
                      min={10}
                      value={quoteCft}
                      onChange={(e) => setQuoteCft(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 border border-stone-300/80 rounded-xl bg-[#E7E1D6]/50 text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B6147]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {lang === 'en'
                      ? 'House Construction Site / Delivery Town'
                      : 'വീട് പണിയുന്ന സ്ഥലം / ഡെലിവറി സ്ഥലം'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kakkanad, Ernakulam or Adoor, Pathanamthitta"
                    value={quoteDeliveryLocation}
                    onChange={(e) => setQuoteDeliveryLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-stone-300/80 rounded-xl bg-[#E7E1D6]/50 text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B6147]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {lang === 'en' ? 'Special Specifications (Optional)' : 'പ്രത്യേക നിർദ്ദേശങ്ങൾ (ഓപ്ഷണൽ)'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Need 4x3 inch rafters and 1-inch planks without bark"
                    value={quoteNote}
                    onChange={(e) => setQuoteNote(e.target.value)}
                    className="w-full px-3.5 py-2 border border-stone-300/80 rounded-xl bg-[#E7E1D6]/50 text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#5B6147]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setQuoteModalMill(null)}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition"
                  >
                    {lang === 'en' ? 'Cancel' : 'റദ്ദാക്കുക'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Submit Quote Request' : 'കോട്ടേഷൻ അയക്കുക'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 6. WRITE A REVIEW MODAL */}
      {reviewModalMill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-stone-300/80 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-extrabold font-serif text-[#4A3626] text-base">
                {lang === 'en' ? 'Review & Rate Mill' : 'മില്ലിന് റിവ്യൂ നൽകുക'}
              </h3>
              <button
                onClick={() => setReviewModalMill(null)}
                className="text-stone-400 hover:text-stone-700 font-bold p-1 text-sm"
              >
                ✕
              </button>
            </div>

            {reviewSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-stone-900 text-sm">
                  {lang === 'en' ? 'Thank You For Your Review!' : 'താങ്കളുടെ അഭിപ്രായത്തിന് നന്ദി!'}
                </h4>
              </div>
            ) : (
              <form onSubmit={handleSendReview} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {lang === 'en' ? 'Rating' : 'റേറ്റിംഗ്'}
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewStars(star)}
                        className={`text-2xl transition ${
                          star <= reviewStars ? 'text-stone-1000' : 'text-stone-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="font-bold text-stone-700 ml-2">{reviewStars} / 5 Stars</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {lang === 'en' ? 'Your Experience / Feedback' : 'താങ്കളുടെ അനുഭവം'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Excellent sawing precision, minimal wastage, friendly owner..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-stone-300/80 rounded-xl bg-[#E7E1D6]/50 text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#5B6147]"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalMill(null)}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold"
                  >
                    {lang === 'en' ? 'Cancel' : 'റദ്ദാക്കുക'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold"
                  >
                    {lang === 'en' ? 'Post Review' : 'സമർപ്പിക്കുക'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
