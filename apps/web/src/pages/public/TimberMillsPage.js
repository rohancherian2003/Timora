import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Factory, MapPin, Phone, Star, CheckCircle, ShieldCheck, Search, MessageSquare, Send, Lock, LogIn, Wrench, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LoginAlertModal } from '../../components/LoginAlertModal';
import { BackButton } from '../../components/BackButton';
const DEMO_TIMBER_MILLS = [
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
export function TimberMillsPage({ lang = 'en' }) {
    const { user, isAuthenticated, loginAsDemo } = useAuth();
    const navigate = useNavigate();
    const [selectedDistrict, setSelectedDistrict] = useState('all');
    const [selectedSpecies, setSelectedSpecies] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    // Login Alert Modal State
    const [loginAlertMill, setLoginAlertMill] = useState(null);
    const [showAuthGate, setShowAuthGate] = useState(false);
    const [gateActionName, setGateActionName] = useState('');
    // Quote Request Modal State (for authenticated users)
    const [quoteModalMill, setQuoteModalMill] = useState(null);
    const [quoteSpecies, setQuoteSpecies] = useState('Teak (തേക്ക്)');
    const [quoteService, setQuoteService] = useState('Log Sawing (തടി അറുക്കൽ)');
    const [quoteCft, setQuoteCft] = useState(150);
    const [quoteDeliveryLocation, setQuoteDeliveryLocation] = useState('');
    const [quoteNote, setQuoteNote] = useState('');
    const [quoteSubmitted, setQuoteSubmitted] = useState(false);
    // Review Modal State
    const [reviewModalMill, setReviewModalMill] = useState(null);
    const [reviewStars, setReviewStars] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [reviewSubmitted, setReviewSubmitted] = useState(false);
    // Filter logic
    const filteredMills = DEMO_TIMBER_MILLS.filter((mill) => {
        if (selectedDistrict !== 'all' && !mill.district.toLowerCase().includes(selectedDistrict.toLowerCase())) {
            return false;
        }
        if (selectedSpecies !== 'all' &&
            !mill.availableSpecies.some((sp) => sp.toLowerCase().includes(selectedSpecies.toLowerCase()))) {
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
    const handleProtectedAction = (actionName, mill, callback) => {
        if (!isAuthenticated) {
            setLoginAlertMill(mill);
            return;
        }
        callback();
    };
    // Instant demo login helper for convenience
    const handleQuickDemoLogin = () => {
        loginAsDemo('buyer');
        setShowAuthGate(false);
    };
    const handleSendQuote = (e) => {
        e.preventDefault();
        setQuoteSubmitted(true);
        setTimeout(() => {
            setQuoteSubmitted(false);
            setQuoteModalMill(null);
            setQuoteDeliveryLocation('');
            setQuoteNote('');
        }, 2400);
    };
    const handleSendReview = (e) => {
        e.preventDefault();
        setReviewSubmitted(true);
        setTimeout(() => {
            setReviewSubmitted(false);
            setReviewModalMill(null);
            setReviewText('');
        }, 2000);
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6", children: [_jsx("div", { className: "flex items-center", children: _jsx(BackButton, { fallbackPath: "/marketplace", lang: lang }) }), _jsxs("section", { className: "relative p-6 sm:p-10 bg-gradient-to-br from-[#E7E1D6] via-[#d5cfc4] to-[#c4bdb0] text-[#4A3626] rounded-3xl shadow-md border border-[#c4bdb0] overflow-hidden", children: [_jsx("div", { className: "absolute top-0 right-0 w-80 h-80 bg-stone-400/15 rounded-full blur-3xl pointer-events-none" }), _jsxs("div", { className: "relative z-10 max-w-3xl space-y-3", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 text-[#5B6147] text-xs font-semibold backdrop-blur-sm border border-[#5B6147]/30", children: [_jsx(Factory, { className: "w-3.5 h-3.5 text-[#5B6147]" }), _jsx("span", { children: lang === 'en'
                                            ? 'Kerala Licensed Timber Sawmills & Sizing Yards'
                                            : 'കേരളത്തിലെ അംഗീകൃത തടി മില്ലുകൾ & സോയിംഗ് കേന്ദ്രങ്ങൾ' })] }), _jsx("h1", { className: "text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#4A3626]", style: { fontFamily: 'Georgia, serif' }, children: lang === 'en' ? (_jsxs(_Fragment, { children: ["Connect With Timber Mills ", _jsx("br", {}), _jsx("span", { className: "text-[#5B6147]", children: "For House Construction & Sizing" })] })) : (_jsxs(_Fragment, { children: ["\u0D35\u0D40\u0D1F\u0D41\u0D2A\u0D23\u0D3F\u0D15\u0D4D\u0D15\u0D41\u0D02 \u0D24\u0D1F\u0D3F \u0D06\u0D35\u0D36\u0D4D\u0D2F\u0D19\u0D4D\u0D19\u0D7E\u0D15\u0D4D\u0D15\u0D41\u0D02 ", _jsx("br", {}), _jsx("span", { className: "text-[#5B6147]", children: "\u0D28\u0D47\u0D30\u0D3F\u0D1F\u0D4D\u0D1F\u0D4D \u0D24\u0D1F\u0D3F \u0D2E\u0D3F\u0D32\u0D4D\u0D32\u0D41\u0D15\u0D33\u0D41\u0D2E\u0D3E\u0D2F\u0D3F \u0D2C\u0D28\u0D4D\u0D27\u0D2A\u0D4D\u0D2A\u0D46\u0D1F\u0D3E\u0D02" })] })) }), _jsx("p", { className: "text-xs sm:text-sm text-[#7A5A3A] leading-relaxed max-w-2xl font-medium", children: lang === 'en'
                                    ? 'Find licensed sawmills across Ernakulam, Pathanamthitta, Kottayam, and all 14 Kerala districts. Check available wood species, verified customer reviews, sawing charges, and contact owners directly.'
                                    : 'എറണാകുളം, പത്തനംതിട്ട, കോട്ടയം ഉൾപ്പെടെയുള്ള 14 ജില്ലകളിലെ തടി മില്ലുകളുടെ വിവരങ്ങൾ, അവൈലബിൾ ആയ തടികൾ, ഉപഭോക്താക്കളുടെ റിവ്യൂസ് എന്നിവ കണ്ട് ഉടമസ്ഥരെ നേരിട്ട് ബന്ധപ്പെടുക.' }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs", children: [_jsxs("div", { className: "p-2.5 rounded-xl bg-white/80 border border-stone-300/80 shadow-xs flex items-center gap-2", children: [_jsx(ShieldCheck, { className: "w-4 h-4 text-emerald-700 flex-shrink-0" }), _jsx("span", { className: "font-bold text-stone-800 text-[11px]", children: lang === 'en' ? 'Govt Licensed Mills' : 'അംഗീകൃത മില്ലുകൾ' })] }), _jsxs("div", { className: "p-2.5 rounded-xl bg-white/80 border border-stone-300/80 shadow-xs flex items-center gap-2", children: [_jsx(Wrench, { className: "w-4 h-4 text-[#5B6147] flex-shrink-0" }), _jsx("span", { className: "font-bold text-stone-800 text-[11px]", children: lang === 'en' ? 'Precision Bandsawing' : 'കൃത്യമായ അറുക്കൽ' })] }), _jsxs("div", { className: "p-2.5 rounded-xl bg-white/80 border border-stone-300/80 shadow-xs flex items-center gap-2", children: [_jsx(Star, { className: "w-4 h-4 text-stone-1000 fill-stone-1000 flex-shrink-0" }), _jsx("span", { className: "font-bold text-stone-800 text-[11px]", children: lang === 'en' ? 'House Owner Reviews' : 'യഥാർത്ഥ റിവ്യൂസ്' })] }), _jsxs("div", { className: "p-2.5 rounded-xl bg-white/80 border border-stone-300/80 shadow-xs flex items-center gap-2", children: [_jsx(Phone, { className: "w-4 h-4 text-emerald-600 flex-shrink-0" }), _jsx("span", { className: "font-bold text-stone-800 text-[11px]", children: lang === 'en' ? 'Direct Owner Contact' : 'നേരിട്ട് വിളിക്കാം' })] })] })] })] }), _jsxs("div", { className: "bg-white p-4 sm:p-5 rounded-3xl border border-stone-300/80 shadow-xs space-y-4", children: [_jsxs("div", { className: "flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3", children: [_jsxs("div", { className: "relative flex-grow max-w-md", children: [_jsx(Search, { className: "w-4 h-4 text-stone-400 absolute left-3.5 top-3" }), _jsx("input", { type: "text", placeholder: lang === 'en'
                                            ? 'Search mill name, locality, owner, or species...'
                                            : 'മില്ലിന്റെ പേര്, സ്ഥലം, തടി ഇനം തിരയുക...', value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300/80 text-xs sm:text-sm font-semibold bg-[#E7E1D6]/50 focus:ring-2 focus:ring-[#5B6147] focus:outline-none" })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-[#5B6147]" }), _jsx("span", { className: "text-xs font-bold text-stone-700", children: lang === 'en' ? 'District:' : 'ജില്ല:' }), _jsxs("select", { value: selectedDistrict, onChange: (e) => setSelectedDistrict(e.target.value), className: "px-3 py-1.5 border border-stone-300/80 rounded-xl text-stone-800 font-semibold text-xs bg-[#E7E1D6]/50 focus:ring-2 focus:ring-[#5B6147] focus:outline-none", children: [_jsx("option", { value: "all", children: lang === 'en' ? 'All Kerala Districts' : 'എല്ലാ ജില്ലകളും' }), _jsx("option", { value: "Ernakulam", children: "Ernakulam (\u0D0E\u0D31\u0D23\u0D3E\u0D15\u0D41\u0D33\u0D02 - \u0D2A\u0D46\u0D30\u0D41\u0D2E\u0D4D\u0D2A\u0D3E\u0D35\u0D42\u0D7C)" }), _jsx("option", { value: "Pathanamthitta", children: "Pathanamthitta (\u0D2A\u0D24\u0D4D\u0D24\u0D28\u0D02\u0D24\u0D3F\u0D1F\u0D4D\u0D1F - \u0D05\u0D1F\u0D42\u0D7C/\u0D15\u0D4B\u0D28\u0D4D\u0D28\u0D3F)" }), _jsx("option", { value: "Kottayam", children: "Kottayam (\u0D15\u0D4B\u0D1F\u0D4D\u0D1F\u0D2F\u0D02 - \u0D2A\u0D3E\u0D32\u0D3E)" }), _jsx("option", { value: "Thrissur", children: "Thrissur (\u0D24\u0D43\u0D36\u0D4D\u0D36\u0D42\u0D7C - \u0D1A\u0D3E\u0D32\u0D15\u0D4D\u0D15\u0D41\u0D1F\u0D3F)" }), _jsx("option", { value: "Kozhikode", children: "Kozhikode (\u0D15\u0D4B\u0D34\u0D3F\u0D15\u0D4D\u0D15\u0D4B\u0D1F\u0D4D - \u0D15\u0D32\u0D4D\u0D32\u0D3E\u0D2F\u0D3F)" })] })] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "text-xs font-bold text-stone-700", children: lang === 'en' ? 'Wood Species:' : 'തടി ഇനം:' }), _jsxs("select", { value: selectedSpecies, onChange: (e) => setSelectedSpecies(e.target.value), className: "px-3 py-1.5 border border-stone-300/80 rounded-xl text-stone-800 font-semibold text-xs bg-[#E7E1D6]/50 focus:ring-2 focus:ring-[#5B6147] focus:outline-none", children: [_jsx("option", { value: "all", children: lang === 'en' ? 'All Wood Species' : 'എല്ലാ തടികളും' }), _jsx("option", { value: "Teak", children: "Teak (\u0D24\u0D47\u0D15\u0D4D\u0D15\u0D4D)" }), _jsx("option", { value: "Anjili", children: "Anjili (\u0D06\u0D1E\u0D4D\u0D1E\u0D3F\u0D32\u0D3F)" }), _jsx("option", { value: "Mahogany", children: "Mahogany (\u0D2E\u0D39\u0D3E\u0D17\u0D23\u0D3F)" }), _jsx("option", { value: "Rubberwood", children: "Rubberwood (\u0D31\u0D2C\u0D7C)" }), _jsx("option", { value: "Jackfruit", children: "Jackfruit (\u0D2A\u0D4D\u0D32\u0D3E\u0D35\u0D4D)" }), _jsx("option", { value: "Rosewood", children: "Rosewood / Veetti (\u0D08\u0D1F\u0D4D\u0D1F\u0D3F)" })] })] })] })] }), _jsxs("div", { className: "flex items-center gap-1.5 overflow-x-auto pb-1 text-xs", children: [_jsx("span", { className: "text-[11px] font-bold text-stone-500 whitespace-nowrap", children: lang === 'en' ? 'Popular Mill Clusters:' : 'പ്രധാന മില്ലുകൾ:' }), _jsx("button", { onClick: () => setSelectedDistrict('all'), className: `px-2.5 py-1 rounded-lg font-bold text-xs transition ${selectedDistrict === 'all'
                                    ? 'bg-[#5B6147] text-white shadow-xs'
                                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`, children: lang === 'en' ? 'All Kerala' : 'എല്ലാം' }), _jsx("button", { onClick: () => setSelectedDistrict('Ernakulam'), className: `px-2.5 py-1 rounded-lg font-bold text-xs transition ${selectedDistrict === 'Ernakulam'
                                    ? 'bg-[#5B6147] text-white shadow-xs'
                                    : 'bg-[#E7E1D6] text-[#4A3626] border border-stone-300 hover:bg-stone-200'}`, children: "\uD83D\uDCCD Ernakulam (\u0D2A\u0D46\u0D30\u0D41\u0D2E\u0D4D\u0D2A\u0D3E\u0D35\u0D42\u0D7C)" }), _jsx("button", { onClick: () => setSelectedDistrict('Pathanamthitta'), className: `px-2.5 py-1 rounded-lg font-bold text-xs transition ${selectedDistrict === 'Pathanamthitta'
                                    ? 'bg-[#5B6147] text-white shadow-xs'
                                    : 'bg-[#E7E1D6] text-[#4A3626] border border-stone-300 hover:bg-stone-200'}`, children: "\uD83D\uDCCD Pathanamthitta (\u0D05\u0D1F\u0D42\u0D7C / \u0D15\u0D4B\u0D28\u0D4D\u0D28\u0D3F)" }), _jsx("button", { onClick: () => setSelectedDistrict('Kottayam'), className: `px-2.5 py-1 rounded-lg font-bold text-xs transition ${selectedDistrict === 'Kottayam'
                                    ? 'bg-[#5B6147] text-white shadow-xs'
                                    : 'bg-[#E7E1D6] text-[#4A3626] border border-stone-300 hover:bg-stone-200'}`, children: "\uD83D\uDCCD Kottayam (\u0D2A\u0D3E\u0D32\u0D3E)" }), _jsx("button", { onClick: () => setSelectedDistrict('Thrissur'), className: `px-2.5 py-1 rounded-lg font-bold text-xs transition ${selectedDistrict === 'Thrissur'
                                    ? 'bg-[#5B6147] text-white shadow-xs'
                                    : 'bg-[#E7E1D6] text-[#4A3626] border border-stone-300 hover:bg-stone-200'}`, children: "\uD83D\uDCCD Thrissur (\u0D1A\u0D3E\u0D32\u0D15\u0D4D\u0D15\u0D41\u0D1F\u0D3F)" }), _jsx("button", { onClick: () => setSelectedDistrict('Kozhikode'), className: `px-2.5 py-1 rounded-lg font-bold text-xs transition ${selectedDistrict === 'Kozhikode'
                                    ? 'bg-[#5B6147] text-white shadow-xs'
                                    : 'bg-[#E7E1D6] text-[#4A3626] border border-stone-300 hover:bg-stone-200'}`, children: "\uD83D\uDCCD Kozhikode (\u0D15\u0D32\u0D4D\u0D32\u0D3E\u0D2F\u0D3F)" })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h2", { className: "text-lg font-extrabold font-serif text-[#4A3626]", children: [filteredMills.length, ' ', lang === 'en'
                                        ? 'Licensed Timber Mills Found'
                                        : 'അംഗീകൃത തടി മില്ലുകൾ ലഭ്യമാണ്'] }), !isAuthenticated && (_jsxs("span", { className: "text-xs text-[#5B6147] font-bold flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-300", children: [_jsx(Lock, { className: "w-3 h-3" }), lang === 'en'
                                        ? 'Login required to contact mill owners'
                                        : 'മില്ലുകളെ ബന്ധപ്പെടാൻ ലോഗിൻ ചെയ്യുക'] }))] }), _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: filteredMills.map((mill) => (_jsxs("div", { className: "bg-white rounded-3xl border border-stone-300/80 p-6 shadow-xs hover:border-stone-400 hover:shadow-md transition space-y-5 flex flex-col justify-between", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsxs("span", { className: "px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1", children: [_jsx(ShieldCheck, { className: "w-3 h-3 text-emerald-700" }), mill.licenseNo] }), _jsxs("span", { className: "text-[11px] text-stone-500 font-semibold", children: ["Est. ", mill.established] })] }), _jsx("h3", { className: "text-lg sm:text-xl font-extrabold font-serif text-[#4A3626] leading-snug", children: lang === 'en' ? mill.name : mill.nameMl }), _jsxs("div", { className: "text-xs text-stone-600 flex items-center gap-1", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-[#5B6147] flex-shrink-0" }), _jsx("span", { className: "font-medium", children: mill.locality })] }), _jsxs("div", { className: "text-xs text-[#4A3626] font-semibold flex items-center gap-1 pt-0.5", children: [_jsx(UserCheck, { className: "w-3.5 h-3.5 text-[#5B6147]" }), _jsxs("span", { children: [lang === 'en' ? 'Proprietor / Owner:' : 'ഉടമസ്ഥൻ:', ' ', _jsx("strong", { children: lang === 'en' ? mill.ownerName : mill.ownerNameMl })] })] })] }), _jsxs("div", { className: "flex flex-col items-end flex-shrink-0", children: [_jsxs("div", { className: "flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-200 text-[#4A3626] border border-stone-300/80 font-black text-sm", children: [_jsx(Star, { className: "w-4 h-4 fill-stone-1000 text-stone-1000" }), _jsx("span", { children: mill.rating })] }), _jsxs("span", { className: "text-[10px] text-stone-400 mt-0.5", children: [mill.ratingCount, " ", lang === 'en' ? 'reviews' : 'റിവ്യൂസ്'] })] })] }), _jsxs("div", { className: "space-y-1.5 pt-2 border-t border-stone-100", children: [_jsx("span", { className: "text-[11px] font-bold text-stone-500 uppercase tracking-wider block", children: lang === 'en' ? 'Available Timber Species at Mill:' : 'ലഭ്യമായ തടികൾ:' }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: mill.availableSpecies.map((sp, idx) => (_jsxs("span", { className: "px-2.5 py-0.5 rounded-lg bg-[#E7E1D6] text-[#4A3626] border border-stone-300/80 text-[11px] font-semibold", children: ["\uD83E\uDEB5 ", sp] }, idx))) })] }), _jsxs("div", { className: "space-y-1.5 pt-2", children: [_jsx("span", { className: "text-[11px] font-bold text-stone-500 uppercase tracking-wider block", children: lang === 'en' ? 'Services & Processing Facilities:' : 'സേവനങ്ങൾ:' }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs", children: mill.services.map((srv, idx) => (_jsxs("div", { className: "flex items-center gap-1.5 text-stone-700", children: [_jsx(CheckCircle, { className: "w-3 h-3 text-emerald-600 flex-shrink-0" }), _jsx("span", { className: "text-[11px] leading-tight", children: lang === 'en' ? srv.en : srv.ml })] }, idx))) })] }), _jsxs("div", { className: "p-3 rounded-2xl bg-[#E7E1D6] border border-stone-300/80 flex items-center justify-between text-xs", children: [_jsxs("div", { children: [_jsx("span", { className: "text-stone-500 text-[10px] uppercase font-bold block", children: lang === 'en' ? 'Standard Sawing Charge' : 'അറുപ്പ് നിരക്ക്' }), _jsx("span", { className: "font-extrabold text-[#4A3626] text-sm", children: mill.sawingRatePerCft })] }), _jsxs("div", { children: [_jsx("span", { className: "text-stone-500 text-[10px] uppercase font-bold block text-right", children: lang === 'en' ? 'Kiln Seasoning' : 'കിൽൻ സീസണിംഗ്' }), _jsx("span", { className: `font-bold text-xs ${mill.seasoningAvailable ? 'text-emerald-700' : 'text-stone-400'}`, children: mill.seasoningAvailable
                                                                ? lang === 'en'
                                                                    ? '✓ Available'
                                                                    : '✓ ലഭ്യമാണ്'
                                                                : lang === 'en'
                                                                    ? 'Not Available'
                                                                    : 'ലഭ്യമല്ല' })] })] }), _jsxs("div", { className: "space-y-2 pt-2 border-t border-stone-100", children: [_jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsxs("span", { className: "font-bold text-stone-700 flex items-center gap-1", children: [_jsx(MessageSquare, { className: "w-3.5 h-3.5 text-[#5B6147]" }), lang === 'en' ? 'Recent House Owner Reviews:' : 'ഉപഭോക്താക്കളുടെ അഭിപ്രായങ്ങൾ:'] }), _jsxs("button", { onClick: () => handleProtectedAction('Write a Review', mill, () => {
                                                                setReviewModalMill(mill);
                                                            }), className: "text-[11px] text-[#5B6147] hover:underline font-bold", children: ["+ ", lang === 'en' ? 'Add Review' : 'റിവ്യൂ നൽകുക'] })] }), _jsx("div", { className: "space-y-2", children: mill.reviews.map((rev) => (_jsxs("div", { className: "p-3 rounded-xl bg-stone-50/70 border border-stone-200/80 text-xs space-y-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "font-bold text-stone-800", children: rev.author }), _jsxs("div", { className: "flex items-center gap-1 text-stone-1000", children: ['★'.repeat(Math.floor(rev.rating)), _jsx("span", { className: "text-[10px] text-stone-400 ml-1", children: rev.date })] })] }), _jsxs("p", { className: "text-stone-600 text-[11px] leading-relaxed italic", children: ["\"", lang === 'en' ? rev.comment : rev.commentMl, "\""] })] }, rev.id))) })] })] }), _jsxs("div", { className: "pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2", children: [_jsxs("button", { onClick: () => handleProtectedAction('Call Mill Owner', mill, () => {
                                                window.location.href = `tel:${mill.phone}`;
                                            }), className: "flex-1 py-2.5 px-4 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition", children: [_jsx(Phone, { className: "w-3.5 h-3.5" }), _jsx("span", { children: isAuthenticated
                                                        ? lang === 'en'
                                                            ? `Call ${mill.phone}`
                                                            : `വിളിക്കുക: ${mill.phone}`
                                                        : lang === 'en'
                                                            ? 'Call Mill Owner (Login)'
                                                            : 'വിളിക്കാൻ ലോഗിൻ ചെയ്യുക' })] }), _jsxs("button", { onClick: () => handleProtectedAction('Request Sizing Quote', mill, () => {
                                                setQuoteModalMill(mill);
                                            }), className: "py-2.5 px-4 rounded-xl bg-white border border-stone-300 text-[#4A3626] hover:bg-[#E7E1D6] text-xs font-bold flex items-center justify-center gap-1.5 transition", children: [_jsx(Send, { className: "w-3.5 h-3.5 text-[#5B6147]" }), _jsx("span", { children: lang === 'en' ? 'Get Sawing Quote' : 'കോട്ടേഷൻ ആവശ്യപ്പെടുക' })] })] })] }, mill.id))) })] }), showAuthGate && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn", children: _jsxs("div", { className: "bg-white rounded-3xl border border-stone-300/80 shadow-2xl max-w-md w-full p-6 space-y-5", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-stone-100 pb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-8 h-8 rounded-xl bg-stone-200 text-[#4A3626] flex items-center justify-center font-bold", children: _jsx(Lock, { className: "w-4 h-4 text-[#5B6147]" }) }), _jsx("h3", { className: "font-extrabold font-serif text-[#4A3626] text-base", children: lang === 'en' ? 'Buyer / House Owner Login Required' : 'ലോഗിൻ ആവശ്യമാണ്' })] }), _jsx("button", { onClick: () => setShowAuthGate(false), className: "text-stone-400 hover:text-stone-700 font-bold p-1 text-sm", children: "\u2715" })] }), _jsxs("div", { className: "space-y-2 text-xs text-stone-600", children: [_jsx("p", { className: "font-semibold text-stone-900 text-sm", children: lang === 'en'
                                        ? `Please sign in to ${gateActionName.toLowerCase()} and interact with timber mills.`
                                        : `മില്ലുകളുമായി നേരിട്ട് സംസാരിക്കാനും കോട്ടേഷൻ ചോദിക്കാനും ദയവായി ലോഗിൻ ചെയ്യുക.` }), _jsx("p", { className: "text-stone-500", children: lang === 'en'
                                        ? 'To prevent spam and protect timber sawmill owners, direct phone calls and price negotiation quotes are reserved for verified registered buyers and house builders.'
                                        : 'തടി മില്ലുകളുടെ സുരക്ഷയ്ക്കും അനാവശ്യ കോളുകൾ തടയുന്നതിനുമായി രജിസ്റ്റർ ചെയ്ത ഉപഭോക്താക്കൾക്കും വീടുപണിയുന്നവർക്കും മാത്രമാണ് ഈ സേവനം ലഭ്യമാക്കിയിട്ടുള്ളത്.' })] }), _jsxs("div", { className: "space-y-2.5 pt-2", children: [_jsxs(Link, { to: "/login", className: "w-full py-3 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition", children: [_jsx(LogIn, { className: "w-4 h-4" }), _jsx("span", { children: lang === 'en' ? 'Sign In As Buyer / House Owner' : 'ഉപഭോക്താവായി ലോഗിൻ ചെയ്യുക' })] }), _jsxs(Link, { to: "/register", className: "w-full py-2.5 rounded-xl border border-stone-300 text-[#4A3626] hover:bg-stone-100 font-bold text-xs flex items-center justify-center gap-2 transition", children: [_jsx(UserCheck, { className: "w-4 h-4" }), _jsx("span", { children: lang === 'en' ? 'Create Free Buyer Account' : 'സൗജന്യ അക്കൗണ്ട് ഉണ്ടാക്കുക' })] }), _jsx("div", { className: "pt-2 border-t border-stone-100 text-center", children: _jsxs("button", { type: "button", onClick: handleQuickDemoLogin, className: "text-xs text-[#5B6147] hover:text-[#3F452F] font-bold underline decoration-stone-400 underline-offset-2", children: ["\u26A1 ", lang === 'en' ? 'Quick Demo Login (Suresh Kumar, Buyer)' : 'ടെസ്റ്റിംഗിനായി ഉടൻ ബയറായി ലോഗിൻ ചെയ്യുക'] }) })] })] }) })), quoteModalMill && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn", children: _jsxs("div", { className: "bg-white rounded-3xl border border-stone-300/80 shadow-2xl max-w-lg w-full p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-stone-100 pb-3", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-[#5B6147]", children: lang === 'en' ? 'Direct Sizing & Sawing Enquiry' : 'തടി അറുപ്പ് / കോട്ടേഷൻ' }), _jsx("h3", { className: "font-extrabold font-serif text-[#4A3626] text-base", children: lang === 'en' ? quoteModalMill.name : quoteModalMill.nameMl })] }), _jsx("button", { onClick: () => setQuoteModalMill(null), className: "text-stone-400 hover:text-stone-700 font-bold p-1 text-sm", children: "\u2715" })] }), quoteSubmitted ? (_jsxs("div", { className: "py-8 text-center space-y-3", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto", children: _jsx(CheckCircle, { className: "w-7 h-7" }) }), _jsx("h4", { className: "font-bold text-stone-900 text-base", children: lang === 'en' ? 'Quote Request Sent to Mill Owner!' : 'കോട്ടേഷൻ അപേക്ഷ മില്ലിലേക്ക് അയച്ചു!' }), _jsx("p", { className: "text-xs text-stone-500 max-w-sm mx-auto", children: lang === 'en'
                                        ? `${quoteModalMill.ownerName} will review your requirement and call you at +91 ${user?.phone || ''} shortly.`
                                        : `${quoteModalMill.ownerName} ഉടൻ തന്നെ താങ്കളുടെ ഫോണിൽ (+91 ${user?.phone || ''}) ബന്ധപ്പെടുന്നതായിരിക്കും.` })] })) : (_jsxs("form", { onSubmit: handleSendQuote, className: "space-y-3 text-xs", children: [_jsxs("div", { children: [_jsx("label", { className: "block font-semibold text-stone-700 mb-1", children: lang === 'en' ? 'Required Timber Species' : 'ആവശ്യമുള്ള തടി ഇനം' }), _jsx("select", { value: quoteSpecies, onChange: (e) => setQuoteSpecies(e.target.value), className: "w-full px-3.5 py-2.5 border border-stone-300/80 rounded-xl bg-[#E7E1D6]/50 text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B6147]", children: quoteModalMill.availableSpecies.map((sp, i) => (_jsx("option", { value: sp, children: sp }, i))) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block font-semibold text-stone-700 mb-1", children: lang === 'en' ? 'Service Needed' : 'ആവശ്യമുള്ള സേവനം' }), _jsxs("select", { value: quoteService, onChange: (e) => setQuoteService(e.target.value), className: "w-full px-3.5 py-2.5 border border-stone-300/80 rounded-xl bg-[#E7E1D6]/50 text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B6147]", children: [_jsx("option", { value: "Log Sawing (\u0D24\u0D1F\u0D3F \u0D05\u0D31\u0D41\u0D15\u0D4D\u0D15\u0D7D)", children: "Log Sawing (\u0D24\u0D1F\u0D3F \u0D05\u0D31\u0D41\u0D15\u0D4D\u0D15\u0D7D)" }), _jsx("option", { value: "Roof Truss Sizing (\u0D15\u0D34\u0D41\u0D15\u0D4D\u0D15\u0D4B\u0D7D)", children: "Roof Truss Sizing (\u0D15\u0D34\u0D41\u0D15\u0D4D\u0D15\u0D4B\u0D7D)" }), _jsx("option", { value: "Door Planks (\u0D35\u0D3E\u0D24\u0D3F\u0D7D \u0D2A\u0D32\u0D15)", children: "Door Planks (\u0D35\u0D3E\u0D24\u0D3F\u0D7D \u0D2A\u0D32\u0D15)" }), _jsx("option", { value: "Kiln Seasoning (\u0D09\u0D23\u0D15\u0D4D\u0D15\u0D7D)", children: "Kiln Seasoning (\u0D09\u0D23\u0D15\u0D4D\u0D15\u0D7D)" }), _jsx("option", { value: "Ready Timber Stock (\u0D24\u0D1F\u0D3F \u0D35\u0D3E\u0D19\u0D4D\u0D19\u0D3E\u0D7B)", children: "Ready Timber Stock (\u0D24\u0D1F\u0D3F \u0D35\u0D3E\u0D19\u0D4D\u0D19\u0D3E\u0D7B)" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block font-semibold text-stone-700 mb-1", children: lang === 'en' ? 'Approx. Quantity (CFT)' : 'അളവ് (CFT)' }), _jsx("input", { type: "number", min: 10, value: quoteCft, onChange: (e) => setQuoteCft(Number(e.target.value)), className: "w-full px-3.5 py-2.5 border border-stone-300/80 rounded-xl bg-[#E7E1D6]/50 text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B6147]", required: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block font-semibold text-stone-700 mb-1", children: lang === 'en'
                                                ? 'House Construction Site / Delivery Town'
                                                : 'വീട് പണിയുന്ന സ്ഥലം / ഡെലിവറി സ്ഥലം' }), _jsx("input", { type: "text", placeholder: "e.g. Kakkanad, Ernakulam or Adoor, Pathanamthitta", value: quoteDeliveryLocation, onChange: (e) => setQuoteDeliveryLocation(e.target.value), className: "w-full px-3.5 py-2.5 border border-stone-300/80 rounded-xl bg-[#E7E1D6]/50 text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B6147]", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block font-semibold text-stone-700 mb-1", children: lang === 'en' ? 'Special Specifications (Optional)' : 'പ്രത്യേക നിർദ്ദേശങ്ങൾ (ഓപ്ഷണൽ)' }), _jsx("textarea", { rows: 2, placeholder: "e.g. Need 4x3 inch rafters and 1-inch planks without bark", value: quoteNote, onChange: (e) => setQuoteNote(e.target.value), className: "w-full px-3.5 py-2 border border-stone-300/80 rounded-xl bg-[#E7E1D6]/50 text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#5B6147]" })] }), _jsxs("div", { className: "pt-2 flex items-center justify-end gap-2", children: [_jsx("button", { type: "button", onClick: () => setQuoteModalMill(null), className: "px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition", children: lang === 'en' ? 'Cancel' : 'റദ്ദാക്കുക' }), _jsxs("button", { type: "submit", className: "px-5 py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold flex items-center gap-1.5 shadow-sm transition", children: [_jsx(Send, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en' ? 'Submit Quote Request' : 'കോട്ടേഷൻ അയക്കുക' })] })] })] }))] }) })), reviewModalMill && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn", children: _jsxs("div", { className: "bg-white rounded-3xl border border-stone-300/80 shadow-2xl max-w-md w-full p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-stone-100 pb-3", children: [_jsx("h3", { className: "font-extrabold font-serif text-[#4A3626] text-base", children: lang === 'en' ? 'Review & Rate Mill' : 'മില്ലിന് റിവ്യൂ നൽകുക' }), _jsx("button", { onClick: () => setReviewModalMill(null), className: "text-stone-400 hover:text-stone-700 font-bold p-1 text-sm", children: "\u2715" })] }), reviewSubmitted ? (_jsxs("div", { className: "py-6 text-center space-y-2", children: [_jsx(CheckCircle, { className: "w-10 h-10 text-emerald-600 mx-auto" }), _jsx("h4", { className: "font-bold text-stone-900 text-sm", children: lang === 'en' ? 'Thank You For Your Review!' : 'താങ്കളുടെ അഭിപ്രായത്തിന് നന്ദി!' })] })) : (_jsxs("form", { onSubmit: handleSendReview, className: "space-y-3 text-xs", children: [_jsxs("div", { children: [_jsx("label", { className: "block font-semibold text-stone-700 mb-1", children: lang === 'en' ? 'Rating' : 'റേറ്റിംഗ്' }), _jsxs("div", { className: "flex items-center gap-2", children: [[1, 2, 3, 4, 5].map((star) => (_jsx("button", { type: "button", onClick: () => setReviewStars(star), className: `text-2xl transition ${star <= reviewStars ? 'text-stone-1000' : 'text-stone-300'}`, children: "\u2605" }, star))), _jsxs("span", { className: "font-bold text-stone-700 ml-2", children: [reviewStars, " / 5 Stars"] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block font-semibold text-stone-700 mb-1", children: lang === 'en' ? 'Your Experience / Feedback' : 'താങ്കളുടെ അനുഭവം' }), _jsx("textarea", { rows: 3, placeholder: "e.g. Excellent sawing precision, minimal wastage, friendly owner...", value: reviewText, onChange: (e) => setReviewText(e.target.value), className: "w-full px-3.5 py-2.5 border border-stone-300/80 rounded-xl bg-[#E7E1D6]/50 text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#5B6147]", required: true })] }), _jsxs("div", { className: "pt-2 flex items-center justify-end gap-2", children: [_jsx("button", { type: "button", onClick: () => setReviewModalMill(null), className: "px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold", children: lang === 'en' ? 'Cancel' : 'റദ്ദാക്കുക' }), _jsx("button", { type: "submit", className: "px-5 py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold", children: lang === 'en' ? 'Post Review' : 'സമർപ്പിക്കുക' })] })] }))] }) })), _jsx(LoginAlertModal, { isOpen: !!loginAlertMill, onClose: () => setLoginAlertMill(null), lang: lang, entityType: "mill", entityName: loginAlertMill?.name, returnUrl: "/mills" })] }));
}
