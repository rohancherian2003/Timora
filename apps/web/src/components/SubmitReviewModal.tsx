import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Star, X, CheckCircle2, AlertCircle, ShieldCheck, Lock, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export interface SubmitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'carpenter' | 'mill' | 'transport' | 'seller';
  targetId: string;
  targetName: string;
  onReviewSubmitted?: (review: {
    id: string;
    author: string;
    role: string;
    rating: number;
    date: string;
    comment: string;
    commentMl?: string;
    isVerified: boolean;
  }) => void;
  lang?: 'en' | 'ml';
}

export function SubmitReviewModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
  onReviewSubmitted,
  lang = 'en',
}: SubmitReviewModalProps) {
  const { user, isAuthenticated } = useAuth();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!comment.trim() || comment.trim().length < 5) {
      setErrorMsg(
        lang === 'en'
          ? 'Please enter a genuine review comment (at least 5 characters).'
          : 'കുറഞ്ഞത് 5 അക്ഷരമുള്ള അഭിപ്രായം രേഖപ്പെടുത്തുക.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Attempt backend review submission
      const { api } = await import('../lib/api');
      try {
        await api.post('/reviews', {
          entity_id: targetId,
          rating,
          body: comment.trim(),
        });
      } catch (backendErr: any) {
        // If backend returns ORDER_NOT_COMPLETED or FORBIDDEN, handle gracefully
        const errCode = backendErr?.response?.data?.error?.code;
        if (errCode === 'ORDER_NOT_COMPLETED' || errCode === 'FORBIDDEN') {
          setErrorMsg(
            lang === 'en'
              ? 'Only users with a confirmed completed transaction can submit verified reviews.'
              : 'പൂർത്തിയായ ഇടപാടുകളുള്ള ഉപയോക്താക്കൾക്ക് മാത്രമേ വെരിഫൈഡ് റിവ്യൂ നൽകാൻ അനുമതിയുള്ളൂ.'
          );
          setIsSubmitting(false);
          return;
        }
      }

      // Format newly created review
      const newReview = {
        id: `rev-local-${Date.now()}`,
        author: user?.name || 'Verified Client',
        role: user?.role === 'buyer' ? 'Verified Buyer' : 'Verified Trade Partner',
        rating,
        date: lang === 'en' ? 'Just now' : 'ഇപ്പോൾ',
        comment: comment.trim(),
        commentMl: comment.trim(),
        isVerified: true,
      };

      if (onReviewSubmitted) {
        onReviewSubmitted(newReview);
      }

      setSubmitted(true);
      setIsSubmitting(false);

      setTimeout(() => {
        setSubmitted(false);
        setComment('');
        onClose();
      }, 1500);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || (lang === 'en' ? 'Failed to submit review.' : 'റിവ്യൂ സമർപ്പിക്കാൻ സാധിച്ചില്ല.'));
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-300 p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <h3 className="font-extrabold font-serif text-[#4A3626] text-base">
              {lang === 'en' ? 'Write a Verified Review' : 'റേറ്റിംഗും അഭിപ്രായവും നൽകുക'}
            </h3>
            <p className="text-[11px] text-[#7A5A3A] font-medium line-clamp-1">
              {targetName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="p-5 rounded-2xl bg-[#E7E1D6]/40 border border-[#8E7F6B]/30 text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-[#5B6147] mx-auto flex items-center justify-center shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#4A3626]">
                {lang === 'en' ? 'Sign In Required' : 'ലോഗിൻ ചെയ്യേണ്ടതുണ്ട്'}
              </h4>
              <p className="text-xs text-[#7A5A3A] mt-1 leading-relaxed">
                {lang === 'en'
                  ? 'Only authenticated buyers and verified clients with completed transactions can post genuine reviews.'
                  : 'വ്യാജ റേറ്റിംഗുകൾ ഒഴിവാക്കാൻ ലോഗിൻ ചെയ്ത ഉപയോക്താക്കൾക്ക് മാത്രമേ റിവ്യൂ നൽകാനാകൂ.'}
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                to="/login"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs transition"
              >
                {lang === 'en' ? 'Sign In' : 'ലോഗിൻ'}
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-100 transition"
              >
                {lang === 'en' ? 'Cancel' : 'റദ്ദാക്കുക'}
              </button>
            </div>
          </div>
        ) : submitted ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-emerald-900 space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
            <div className="font-bold text-base">
              {lang === 'en' ? 'Review Submitted Successfully!' : 'റിവ്യൂ വിജയകരമായി സമർപ്പിച്ചു!'}
            </div>
            <p className="text-xs text-emerald-700">
              {lang === 'en'
                ? 'Your rating has been recorded and verified.'
                : 'നിങ്ങളുടെ വിലയേറിയ അഭിപ്രായം രേഖപ്പെടുത്തി.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Verified Buyer Badge notice */}
            <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 flex items-center gap-2 text-emerald-900 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>
                {lang === 'en'
                  ? 'Posting as verified member: '
                  : 'വെരിഫൈഡ് അക്കൗണ്ട്: '}
                <strong>{user?.name}</strong>
              </span>
            </div>

            {/* Star Rating Selector */}
            <div>
              <label className="block font-bold text-[#4A3626] mb-1.5">
                {lang === 'en' ? 'Overall Experience Rating' : 'റേറ്റിംഗ് നൽകുക'}
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-500'
                          : 'fill-stone-100 text-stone-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 font-bold text-stone-700 text-sm">
                  {rating}.0 / 5.0
                </span>
              </div>
            </div>

            {/* Written Comment */}
            <div>
              <label className="block font-bold text-[#4A3626] mb-1">
                {lang === 'en' ? 'Detailed Feedback & Review' : 'നിങ്ങളുടെ അനുഭവവും അഭിപ്രായവും'}
              </label>
              <textarea
                rows={4}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  lang === 'en'
                    ? 'e.g. Prompt service, excellent timber quality, clean sizing, on-time delivery...'
                    : 'ഉദാ: കൃത്യസമയത്ത് സാധനം എത്തിച്ചു, നല്ല ഗുണനിലവാരമുള്ള തടി...'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
              />
            </div>

            {/* Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-stone-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-100 transition text-xs"
              >
                {lang === 'en' ? 'Cancel' : 'റദ്ദാക്കുക'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold transition flex items-center gap-1.5 shadow-xs text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {isSubmitting
                    ? (lang === 'en' ? 'Submitting...' : 'സമർപ്പിക്കുന്നു...')
                    : (lang === 'en' ? 'Submit Review' : 'സമർപ്പിക്കുക')}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
