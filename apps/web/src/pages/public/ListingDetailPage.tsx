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
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-forest-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        {lang === 'en' ? 'Back to Marketplace' : 'തിരികെ മാർക്കറ്റിലേക്ക്'}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {listing.images.map((img, i) => (
              <div key={i} className="aspect-[16/9] rounded-xl overflow-hidden border border-slate-200">
                <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Details & Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-bold flex items-center gap-1">
                <Tag className="w-3 h-3 text-forest-600" />
                {listing.species}
              </span>
              <span className="text-xs text-slate-400 font-semibold">{listing.type}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {listing.title}
            </h1>

            <div className="flex items-center gap-2 text-xs text-slate-600 mt-2">
              <MapPin className="w-4 h-4 text-forest-700" />
              <span>{listing.locality}, {listing.district}</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400">Rate per CFT</span>
              <div className="text-3xl font-black text-forest-900">{formatINR(listing.price_per_cft)}</div>
              <span className="text-xs text-slate-500 font-medium">Available: {listing.quantity} {listing.unit}</span>
            </div>

            <button
              onClick={() => setShowEnquiryModal(true)}
              className="px-6 py-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm shadow-sm transition flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {lang === 'en' ? 'Send Price Enquiry' : 'അന്വേഷണം അയക്കുക'}
            </button>
          </div>

          {/* Dimension Specifications */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              {lang === 'en' ? 'Timber Dimensions & Specifications' : 'തടിയുടെ അളവുകളും വിവരങ്ങളും'}
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-semibold">Dimensions</span>
                <div className="font-bold text-slate-800 mt-0.5">{listing.dimensions}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-semibold">Total Pieces</span>
                <div className="font-bold text-slate-800 mt-0.5">{listing.pieces} Pieces (എണ്ണം)</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-semibold">Seasoned / Dried</span>
                <div className="font-bold text-slate-800 mt-0.5">{listing.is_dried ? 'Air-Seasoned (ഉണക്കിയത്)' : 'Raw Wet'}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-semibold">Visible Cracks</span>
                <div className="font-bold text-slate-800 mt-0.5">{listing.has_cracks ? 'Minor surface checks' : 'Zero cracks (വിള്ളലുകൾ ഇല്ല)'}</div>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-800">Seller Notes: </span>
              {listing.condition_notes}
            </div>
          </div>

          {/* Seller Contact Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center font-bold text-forest-800">
                {listing.seller_name[0]}
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                  {listing.seller_name}
                  {listing.seller_verified && (
                    <ShieldCheck className="w-4 h-4 text-forest-600" />
                  )}
                </div>
                <div className="text-xs text-slate-500">{listing.district}</div>
              </div>
            </div>

            <a
              href={`tel:${listing.seller_phone}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
            >
              <Phone className="w-3.5 h-3.5 text-forest-700" />
              {lang === 'en' ? 'Call Seller' : 'വിളിക്കുക'}
            </a>
          </div>
        </div>
      </div>

      {/* Enquiry Modal */}
      {showEnquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {lang === 'en' ? 'Send Timber Enquiry' : 'തടി അന്വേഷണം അയക്കുക'}
              </h3>
              <button
                onClick={() => setShowEnquiryModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {sent ? (
              <div className="p-4 bg-forest-50 border border-forest-200 rounded-xl text-center text-forest-900 space-y-1">
                <CheckCircle2 className="w-6 h-6 mx-auto text-forest-700" />
                <div className="font-bold text-sm">
                  {lang === 'en' ? 'Enquiry Sent to Seller!' : 'അന്വേഷണം വിജയകരമായി അയച്ചു!'}
                </div>
                <p className="text-xs text-forest-700">
                  {lang === 'en' ? 'The seller will review your offer and reply.' : 'കച്ചവടക്കാരൻ നിങ്ങളുടെ ഓഫർ കണ്ട് മറുപടി നൽകും.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendEnquiry} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === 'en' ? 'Quantity (CFT)' : 'ആവശ്യമുള്ള അളവ് (CFT)'}
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-xl text-sm"
                      min={1}
                      max={listing.quantity}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === 'en' ? 'Proposed Rate / CFT (₹)' : 'ഉദ്ദേശിക്കുന്ന വില / CFT'}
                    </label>
                    <input
                      type="number"
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-xl text-sm"
                      min={1}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'en' ? 'Message for Seller' : 'കച്ചവടക്കാരനുള്ള സന്ദേശം'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={lang === 'en' ? 'e.g. Need delivery in Kottayam next week. Can we finalize at this price?' : 'സന്ദേശം നൽകുക...'}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold text-sm shadow-sm transition"
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
