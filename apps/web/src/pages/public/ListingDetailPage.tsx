import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Tag, ArrowLeft, Send, CheckCircle2, Phone, AlertCircle } from 'lucide-react';
import { formatINR } from '@timora/shared';

export function ListingDetailPage({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const { id } = useParams<{ id: string }>();
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [quantity, setQuantity] = useState(10);
  const [proposedPrice, setProposedPrice] = useState(2800);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  // Mock listing details (in production fetched via `api.get('/listings/' + id)`)
  const listing = {
    id: id || '1',
    title: 'First-Grade Nilambur Teak Planks',
    species: 'Teak (തേക്ക്)',
    type: 'Rough-sawn Planks (അറുത്ത പലകകൾ)',
    district: 'Malappuram (മലപ്പുറം)',
    locality: 'Nilambur Forest Division',
    quantity: 45,
    unit: 'CFT',
    price_per_cft: 2800,
    dimensions: '10 ft Length × 8 in Width × 2 in Thickness',
    pieces: 36,
    is_dried: true,
    has_cracks: false,
    condition_notes: 'Mature timber harvested with transit permits. Straight grain, zero sapwood, naturally air-seasoned for 8 months.',
    seller_name: 'Nilambur Wood Works',
    seller_phone: '+919847120001',
    seller_verified: true,
    images: [
      '/images/timber/teak-logs.png',
      '/images/timber/mahogany-logs.jpg',
    ],
  };

  const handleSendEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setShowEnquiryModal(false);
      setSent(false);
      setMessage('');
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-[#b45309] transition"
      >
        <ArrowLeft className="w-4 h-4" />
        {lang === 'en' ? 'Back to Marketplace' : 'തിരികെ മാർക്കറ്റിലേക്ക്'}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#faf6ee] border border-amber-200/80 shadow-sm">
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {listing.images.map((img, i) => (
              <div key={i} className="aspect-[16/9] rounded-xl overflow-hidden border border-amber-200/80">
                <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Details & Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1">
                <Tag className="w-3 h-3 text-[#b45309]" />
                {listing.species}
              </span>
              <span className="text-xs text-stone-500 font-semibold">{listing.type}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#2c160b] tracking-tight">
              {listing.title}
            </h1>

            <div className="flex items-center gap-2 text-xs text-stone-600 mt-2">
              <MapPin className="w-4 h-4 text-[#b45309]" />
              <span>{listing.locality}, {listing.district}</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#faf6ee] to-[#f4ebe0] border border-amber-300/80 shadow-xs flex items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold text-[#854d0e] tracking-wider">Rate per CFT</span>
              <div className="text-3xl font-extrabold font-serif text-[#b45309]">{formatINR(listing.price_per_cft)}</div>
              <span className="text-xs text-[#6b472e] font-medium">Available: {listing.quantity} {listing.unit}</span>
            </div>

            <button
              onClick={() => setShowEnquiryModal(true)}
              className="px-6 py-3.5 rounded-2xl bg-[#b45309] hover:bg-[#92400e] text-white font-bold text-sm shadow-md shadow-amber-950/10 transition flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {lang === 'en' ? 'Send Price Enquiry' : 'അന്വേഷണം അയക്കുക'}
            </button>
          </div>

          {/* Dimension Specifications */}
          <div className="bg-white rounded-3xl border border-amber-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold font-serif text-[#2c160b] text-base">
              {lang === 'en' ? 'Timber Dimensions & Specifications' : 'തടിയുടെ അളവുകളും വിവരങ്ങളും'}
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-[#faf6ee] rounded-2xl border border-amber-200/50">
                <span className="text-stone-400 font-semibold">Dimensions</span>
                <div className="font-bold text-[#2c160b] mt-0.5">{listing.dimensions}</div>
              </div>

              <div className="p-3.5 bg-[#faf6ee] rounded-2xl border border-amber-200/50">
                <span className="text-stone-400 font-semibold">Total Pieces</span>
                <div className="font-bold text-[#2c160b] mt-0.5">{listing.pieces} Pieces (എണ്ണം)</div>
              </div>

              <div className="p-3.5 bg-[#faf6ee] rounded-2xl border border-amber-200/50">
                <span className="text-stone-400 font-semibold">Seasoned / Dried</span>
                <div className="font-bold text-[#2c160b] mt-0.5">{listing.is_dried ? 'Air-Seasoned (ഉണക്കിയത്)' : 'Raw Wet'}</div>
              </div>

              <div className="p-3.5 bg-[#faf6ee] rounded-2xl border border-amber-200/50">
                <span className="text-stone-400 font-semibold">Visible Cracks</span>
                <div className="font-bold text-[#2c160b] mt-0.5">{listing.has_cracks ? 'Minor surface checks' : 'Zero cracks (വിള്ളലുകൾ ഇല്ല)'}</div>
              </div>
            </div>

            <div className="pt-2 text-xs text-stone-600 leading-relaxed font-normal">
              <span className="font-bold text-[#2c160b]">Seller Notes: </span>
              {listing.condition_notes}
            </div>
          </div>

          {/* Seller Contact Card */}
          <div className="bg-white rounded-3xl border border-amber-200/80 p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-bold text-[#78350f]">
                {listing.seller_name[0]}
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-stone-900 text-sm">
                  {listing.seller_name}
                  {listing.seller_verified && (
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div className="text-xs text-stone-500">{listing.district}</div>
              </div>
            </div>

            <a
              href={`tel:${listing.seller_phone}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-amber-300 text-[#78350f] hover:bg-amber-50 text-xs font-bold transition"
            >
              <Phone className="w-3.5 h-3.5 text-[#b45309]" />
              {lang === 'en' ? 'Call Seller' : 'വിളിക്കുക'}
            </a>
          </div>
        </div>
      </div>

      {/* Enquiry Modal */}
      {showEnquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl space-y-5 border border-amber-200/90">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <h3 className="font-extrabold font-serif text-[#2c160b] text-base">
                {lang === 'en' ? 'Send Timber Enquiry' : 'തടി അന്വേഷണം അയക്കുക'}
              </h3>
              <button
                onClick={() => setShowEnquiryModal(false)}
                className="text-stone-400 hover:text-stone-600 font-bold"
              >
                ✕
              </button>
            </div>

            {sent ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-emerald-900 space-y-1">
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600" />
                <div className="font-bold text-sm">
                  {lang === 'en' ? 'Enquiry Sent to Seller!' : 'അന്വേഷണം വിജയകരമായി അയച്ചു!'}
                </div>
                <p className="text-xs text-emerald-700">
                  {lang === 'en' ? 'The seller will review your offer and reply.' : 'കച്ചവടക്കാരൻ നിങ്ങളുടെ ഓഫർ കണ്ട് മറുപടി നൽകും.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendEnquiry} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {lang === 'en' ? 'Quantity (CFT)' : 'ആവശ്യമുള്ള അളവ് (CFT)'}
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 border border-amber-200 rounded-xl text-sm focus:ring-2 focus:ring-[#b45309] focus:outline-none bg-stone-50/50 font-medium"
                      min={1}
                      max={listing.quantity}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {lang === 'en' ? 'Proposed Rate / CFT (₹)' : 'ഉദ്ദേശിക്കുന്ന വില / CFT'}
                    </label>
                    <input
                      type="number"
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 border border-amber-200 rounded-xl text-sm focus:ring-2 focus:ring-[#b45309] focus:outline-none bg-stone-50/50 font-medium"
                      min={1}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {lang === 'en' ? 'Message for Seller' : 'കച്ചവടക്കാരനുള്ള സന്ദേശം'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={lang === 'en' ? 'e.g. Need delivery in Kottayam next week. Can we finalize at this price?' : 'സന്ദേശം നൽകുക...'}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2 border border-amber-200 rounded-xl text-xs focus:ring-2 focus:ring-[#b45309] focus:outline-none bg-stone-50/50"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#b45309] hover:bg-[#92400e] text-white font-bold text-sm shadow-md shadow-amber-950/10 transition"
                >
                  {lang === 'en' ? 'Submit Enquiry & Offer' : 'ഓഫർ സമർപ്പിക്കുക'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
