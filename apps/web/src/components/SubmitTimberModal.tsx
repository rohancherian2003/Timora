import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryClient } from '../lib/queryClient';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export interface SubmitTimberModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'en' | 'ml';
  onSuccessToast?: (msg: string) => void;
}

export function SubmitTimberModal({
  isOpen,
  onClose,
  lang = 'en',
  onSuccessToast,
}: SubmitTimberModalProps) {
  useBodyScrollLock(isOpen);

  const [title, setTitle] = useState('');
  const [speciesId, setSpeciesId] = useState(1); // Teak
  const [typeId, setTypeId] = useState(2); // Planks
  const [districtId, setDistrictId] = useState(5); // Kottayam
  const [quantity, setQuantity] = useState<number>(25);
  const [pricePerCft, setPricePerCft] = useState<number>(2400);

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [apiSpecies, setApiSpecies] = useState<Array<{ id: number; name_en: string; name_ml: string; slug: string }>>([]);
  const [apiDistricts, setApiDistricts] = useState<Array<{ id: number; name_en: string; name_ml: string }>>([]);

  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    species?: string;
    type?: string;
    district?: string;
    quantity?: string;
    pricePerCft?: string;
  }>({});

  useEffect(() => {
    if (!isOpen) {
      setSubmitted(false);
      return;
    }
    const VALID_SLUGS = ['teak', 'mahogany', 'rosewood', 'anjili', 'jackfruit', 'rubberwood', 'firewood'];
    api.get('/species').then((r) => {
      if (r.data?.success && Array.isArray(r.data?.data)) {
        let filtered = r.data.data.filter((s: any) => VALID_SLUGS.includes(s.slug));
        if (!filtered.some((s: any) => s.slug === 'firewood')) {
          filtered.push({ id: 8, name_en: 'Firewood', name_ml: 'വിറക്', slug: 'firewood' });
        }
        setApiSpecies(filtered);
      }
    }).catch(() => {});

    api.get('/districts').then((r) => {
      if (r.data?.success && Array.isArray(r.data?.data)) {
        setApiDistricts(r.data.data);
      }
    }).catch(() => {});
  }, [isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    // Deduplicate against existing selectedImages by name and size
    const existingFileKeys = new Set(selectedImages.map((f) => `${f.name}_${f.size}`));
    const uniqueFiles = files.filter((f) => !existingFileKeys.has(`${f.name}_${f.size}`));
    if (uniqueFiles.length === 0) {
      e.target.value = '';
      return;
    }

    if (selectedImages.length + uniqueFiles.length > 8) {
      setImageError(
        lang === 'en'
          ? 'Maximum 8 images allowed per listing.'
          : 'ഒരു ലിസ്റ്റിംഗിൽ പരമാവധി 8 ചിത്രങ്ങൾ മാത്രമേ അനുവദിക്കൂ.'
      );
      e.target.value = '';
      return;
    }

    for (const file of uniqueFiles) {
      if (!allowedTypes.includes(file.type)) {
        setImageError(
          lang === 'en'
            ? 'Unsupported file format. Please upload JPG, PNG, or WebP images.'
            : 'പിന്തുണയ്ക്കാത്ത ഫയൽ ഫോർമാറ്റ്. ദയവായി JPG, PNG, അല്ലെങ്കിൽ WebP ചിത്രങ്ങൾ അപ്‌ലോഡ് ചെയ്യുക.'
        );
        e.target.value = '';
        return;
      }
      if (file.size > maxSizeBytes) {
        setImageError(
          lang === 'en'
            ? 'File size exceeds 10 MB limit.'
            : 'ഫയൽ വലുപ്പം 10 MB പരിധി കവിയുന്നു.'
        );
        e.target.value = '';
        return;
      }
    }

    const newPreviews = uniqueFiles.map((file) => URL.createObjectURL(file));
    setSelectedImages((prev) => [...prev, ...uniqueFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    const url = imagePreviews[index];
    if (url) URL.revokeObjectURL(url);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // TanStack Query Mutation for submitting new timber listing
  const submitTimberMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/listings', {
        title: title.trim(),
        species_id: speciesId,
        timber_type_id: typeId,
        district_id: districtId,
        quantity,
        price_per_cft: pricePerCft,
        pricing_mode: 'fixed',
        unit: 'cft',
      });

      const listingId = res.data?.data?.id;

      if (listingId && selectedImages.length > 0) {
        for (const file of selectedImages) {
          const formData = new FormData();
          formData.append('photo', file);
          try {
            await api.patch(`/listings/${listingId}/photos`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            }).catch(() =>
              api.post(`/listings/${listingId}/images`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
              })
            );
          } catch (uploadErr) {
            console.error('Failed to upload image:', uploadErr);
          }
        }
      }

      return res.data;
    },
    onSuccess: () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setSelectedImages([]);
      setImagePreviews([]);
      setSubmitted(true);

      queryClient.invalidateQueries({ queryKey: ['admin-pending-listings'] });
      queryClient.invalidateQueries({ queryKey: ['seller-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      window.dispatchEvent(new CustomEvent('timora_listings_updated'));

      const successToast =
        lang === 'en'
          ? 'Timber stock submitted successfully! Sent for Admin Approval.'
          : 'തടി സ്റ്റോക്ക് വിജയകരമായി സമർപ്പിച്ചു! അഡ്മിൻ അംഗീകാരത്തിനായി അയച്ചു.';
      if (onSuccessToast) onSuccessToast(successToast);

      setTimeout(() => {
        onClose();
        setSubmitted(false);
      }, 1200);
    },
    onError: (err: any) => {
      setFormError(
        err?.response?.data?.error?.message ||
        err?.message ||
        (lang === 'en' ? 'Failed to submit timber listing.' : 'ലിസ്റ്റിംഗ് സമർപ്പിക്കാൻ സാധിച്ചില്ല.')
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setImageError(null);

    const errors: typeof fieldErrors = {};
    if (!title.trim()) {
      errors.title = lang === 'en' ? 'Stock Title is required.' : 'തടിയുടെ പേര് നൽകേണ്ടതാണ്.';
    }
    if (!speciesId || Number(speciesId) <= 0) {
      errors.species = lang === 'en' ? 'Please select a valid timber species.' : 'തടി ഇനം തിരഞ്ഞെടുക്കുക.';
    }
    if (!typeId || Number(typeId) <= 0) {
      errors.type = lang === 'en' ? 'Please select a valid timber type.' : 'തടി രൂപം തിരഞ്ഞെടുക്കുക.';
    }
    if (!districtId || Number(districtId) <= 0) {
      errors.district = lang === 'en' ? 'Please select a Kerala district.' : 'ജില്ല തിരഞ്ഞെടുക്കുക.';
    }
    if (!quantity || Number(quantity) <= 0 || isNaN(Number(quantity))) {
      errors.quantity = lang === 'en' ? 'Quantity must be greater than 0 CFT.' : 'അളവ് 0 ൽ കൂടുതലായിരിക്കണം.';
    }
    if (!pricePerCft || Number(pricePerCft) <= 0 || isNaN(Number(pricePerCft))) {
      errors.pricePerCft = lang === 'en' ? 'Price per CFT must be greater than ₹0.' : 'വില ₹0 ൽ കൂടുതലായിരിക്കണം.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    submitTimberMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <h2 className="text-lg font-extrabold font-serif text-[#4A3626]">
            {lang === 'en' ? 'Submit Timber Stock for Approval' : 'പുതിയ തടി അനുമതിക്കായി സമർപ്പിക്കുക'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={lang === 'en' ? 'Close form' : 'ഫോം അടയ്ക്കുക'}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-emerald-900 space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-700" />
            <div className="font-bold text-base">
              {lang === 'en' ? 'Submitted for Admin Review!' : 'അഡ്മിൻ അനുമതിക്കായി സമർപ്പിച്ചു!'}
            </div>
            <p className="text-xs text-emerald-700">
              {lang === 'en'
                ? 'Timber stock submitted successfully! Sent for Admin Approval.'
                : 'തടി സ്റ്റോക്ക് വിജയകരമായി സമർപ്പിച്ചു! അഡ്മിൻ അംഗീകാരത്തിനായി അയച്ചു.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {lang === 'en' ? 'Stock Title' : 'തടിയുടെ പേര് / വിവരണം'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. First-Grade Teak Planks 10ft"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: undefined }));
                }}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm transition ${
                  fieldErrors.title ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400' : 'border-stone-300'
                }`}
                required
              />
              {fieldErrors.title && (
                <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.title}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'en' ? 'Species' : 'തടി ഇനം'} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={speciesId}
                  onChange={(e) => {
                    setSpeciesId(Number(e.target.value));
                    if (fieldErrors.species) setFieldErrors((prev) => ({ ...prev, species: undefined }));
                  }}
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm bg-white transition ${
                    fieldErrors.species ? 'border-rose-400 bg-rose-50/20' : 'border-stone-300'
                  }`}
                >
                  {apiSpecies.length > 0 ? (
                    apiSpecies.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.name_en} ({sp.name_ml})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value={1}>Teak (തേക്ക്)</option>
                      <option value={2}>Mahogany (മഹാഗണി)</option>
                      <option value={7}>Rosewood (ഈട്ടി)</option>
                      <option value={3}>Anjili (ആഞ്ഞിലി)</option>
                      <option value={6}>Jackfruit (പ്ലാവ്)</option>
                      <option value={4}>Rubberwood (റബ്ബർ)</option>
                      <option value={8}>Firewood (വിറക്)</option>
                    </>
                  )}
                </select>
                {fieldErrors.species && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.species}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'en' ? 'Timber Type' : 'തടി രൂപം'} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={typeId}
                  onChange={(e) => {
                    setTypeId(Number(e.target.value));
                    if (fieldErrors.type) setFieldErrors((prev) => ({ ...prev, type: undefined }));
                  }}
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm bg-white transition ${
                    fieldErrors.type ? 'border-rose-400 bg-rose-50/20' : 'border-stone-300'
                  }`}
                >
                  <option value={1}>Round Logs (ലോഗ്സ്)</option>
                  <option value={2}>Rough-sawn Planks (പലക)</option>
                  <option value={3}>Squared Beams (തൂൺ)</option>
                  <option value={4}>Firewood (വിറക്)</option>
                </select>
                {fieldErrors.type && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.type}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'en' ? 'District' : 'ജില്ല'} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={districtId}
                  onChange={(e) => {
                    setDistrictId(Number(e.target.value));
                    if (fieldErrors.district) setFieldErrors((prev) => ({ ...prev, district: undefined }));
                  }}
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm bg-white transition ${
                    fieldErrors.district ? 'border-rose-400 bg-rose-50/20' : 'border-stone-300'
                  }`}
                >
                  {apiDistricts.length > 0 ? (
                    apiDistricts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name_en} ({d.name_ml})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value={1}>Thiruvananthapuram (തിരുവനന്തപുരം)</option>
                      <option value={2}>Kollam (കൊല്ലം)</option>
                      <option value={3}>Pathanamthitta (പത്തനംതിട്ട)</option>
                      <option value={4}>Alappuzha (ആലപ്പുഴ)</option>
                      <option value={5}>Kottayam (കോട്ടയം)</option>
                      <option value={6}>Idukki (ഇടുക്കി)</option>
                      <option value={7}>Ernakulam (എറണാകുളം)</option>
                      <option value={8}>Thrissur (തൃശ്ശൂർ)</option>
                      <option value={9}>Palakkad (പാലക്കാട്)</option>
                      <option value={10}>Malappuram (മലപ്പുറം)</option>
                      <option value={11}>Kozhikode (കോഴിക്കോട്)</option>
                      <option value={12}>Wayanad (വയനാട്)</option>
                      <option value={13}>Kannur (കണ്ണൂർ)</option>
                      <option value={14}>Kasaragod (കാസർഗോഡ്)</option>
                    </>
                  )}
                </select>
                {fieldErrors.district && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.district}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'en' ? 'Quantity (CFT)' : 'അളവ് (CFT)'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={quantity === 0 ? '' : quantity}
                  onChange={(e) => {
                    const val = e.target.value.replace(/^0+(?=\d)/, '');
                    setQuantity(val === '' ? 0 : Number(val));
                    if (fieldErrors.quantity) setFieldErrors((prev) => ({ ...prev, quantity: undefined }));
                  }}
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition ${
                    fieldErrors.quantity ? 'border-rose-400 bg-rose-50/20' : 'border-stone-300'
                  }`}
                  min={1}
                  required
                />
                {fieldErrors.quantity && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.quantity}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'en' ? 'Price per CFT (₹)' : 'ഒരു CFT യുടെ വില (₹)'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={pricePerCft === 0 ? '' : pricePerCft}
                  onChange={(e) => {
                    const val = e.target.value.replace(/^0+(?=\d)/, '');
                    setPricePerCft(val === '' ? 0 : Number(val));
                    if (fieldErrors.pricePerCft) setFieldErrors((prev) => ({ ...prev, pricePerCft: undefined }));
                  }}
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition ${
                    fieldErrors.pricePerCft ? 'border-rose-400 bg-rose-50/20' : 'border-stone-300'
                  }`}
                  min={1}
                  required
                />
                {fieldErrors.pricePerCft && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.pricePerCft}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Timber Photographs Upload Area */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-stone-700">
                  {lang === 'en' ? 'Timber Photographs (Max 8)' : 'തടിയുടെ ഫോട്ടോകൾ (പരമാവധി 8)'}
                </label>
                <span className="text-[11px] font-mono text-stone-500">
                  {selectedImages.length}/8
                </span>
              </div>

              {imageError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{imageError}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-3 items-center">
                {imagePreviews.map((previewUrl, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-2xl border border-stone-300 overflow-hidden group shadow-xs">
                    <img src={previewUrl} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black text-white rounded-full transition"
                      title={lang === 'en' ? 'Remove' : 'നീക്കം ചെയ്യുക'}
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-0 inset-x-0 bg-[#5B6147]/90 text-white text-[9px] text-center font-bold py-0.5">
                        {lang === 'en' ? 'Primary' : 'പ്രധാനം'}
                      </span>
                    )}
                  </div>
                ))}

                {selectedImages.length < 8 ? (
                  <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-[#8E7F6B]/40 hover:border-[#5B6147] flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-[#E7E1D6]/30 transition group">
                    <Camera className="w-6 h-6 text-[#8E7F6B] group-hover:text-[#5B6147] transition" />
                    <span className="text-[10px] font-semibold text-stone-500 mt-1">
                      {lang === 'en' ? 'Add Photo' : 'ചേർക്കുക'}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-100 flex flex-col items-center justify-center text-stone-400 select-none">
                    <Camera className="w-5 h-5 text-stone-400" />
                    <span className="text-[9px] font-semibold mt-1">
                      {lang === 'en' ? 'Max 8 Reached' : '8 ഫോട്ടോകൾ'}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-stone-400">
                {lang === 'en'
                  ? 'Upload clear photos of cross-cut end grains, side grain, and logs/planks (JPEG, PNG, WebP up to 10MB).'
                  : 'തടിയുടെ വ്യക്തമായ ചിത്രങ്ങൾ അപ്‌ലോഡ് ചെയ്യുക (JPEG, PNG, WebP, പരമാവധി 10MB).'}
              </p>
            </div>

            {formError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitTimberMutation.isPending}
              className="w-full py-3 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-amber-950/10 transition flex items-center justify-center gap-2"
            >
              {submitTimberMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === 'en' ? 'Uploading & Submitting...' : 'സമർപ്പിക്കുന്നു...'}</span>
                </>
              ) : (
                <span>{lang === 'en' ? 'Submit Listing for Approval' : 'അംഗീകാരത്തിനായി ലിസ്റ്റിംഗ് സമർപ്പിക്കുക'}</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

