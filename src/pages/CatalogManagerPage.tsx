import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { User } from 'firebase/auth';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  ImagePlus,
  Lock,
  LogOut,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import {
  CATEGORIES,
  CategoryId,
  CURRENCIES,
  DigitalProduct,
  formatProductPrice,
} from '../data/products';
import {
  processUploadedProductPhoto,
  ProductFormInput,
} from '../hooks/useCatalog';
import { ADMIN_EMAIL, signInAsOwner, signOutOwner } from '../lib/firebase';
import { PageRoute } from '../components/Navbar';

interface CatalogManagerPageProps {
  products: DigitalProduct[];
  currentUser: User | null;
  isAuthReady: boolean;
  isOwnerAdmin: boolean;
  onAddProduct: (input: ProductFormInput) => Promise<DigitalProduct>;
  onUpdateProduct: (id: string, input: ProductFormInput) => Promise<void>;
  onToggleVisibility: (id: string) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onNavigate: (page: PageRoute) => void;
  onSelectProduct: (slug: string) => void;
}

const EMPTY_FORM: ProductFormInput = {
  name: '',
  category: 'applications',
  price: 5,
  currency: 'USD',
  payhipUrl: '',
  image: '',
  shortDescription: '',
  fullDescriptionText: '',
  featuresText: '',
  format: '',
  compatibilityText: '',
  visible: true,
};

export function CatalogManagerPage({
  products,
  currentUser,
  isAuthReady,
  isOwnerAdmin,
  onAddProduct,
  onUpdateProduct,
  onToggleVisibility,
  onDeleteProduct,
  onNavigate,
  onSelectProduct,
}: CatalogManagerPageProps) {
  const [authError, setAuthError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  // Form state (null = list mode, 'new' = adding, string = editing product id)
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<ProductFormInput>(EMPTY_FORM);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [feedbackBanner, setFeedbackBanner] = useState('');

  // Delete confirmation state
  const [confirmDeleteProduct, setConfirmDeleteProduct] =
    useState<DigitalProduct | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    setAuthError('');
    try {
      const credential = await signInAsOwner();
      if (credential.user.email !== ADMIN_EMAIL) {
        setAuthError(
          `Accès refusé : le compte ${credential.user.email} n’est pas le compte propriétaire autorisé.`
        );
      }
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Impossible de se connecter avec Google.'
      );
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setEditingId(null);
    await signOutOwner();
  };

  const startAddingProduct = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setEditingId('new');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditingProduct = (product: DigitalProduct) => {
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      currency: product.currency || 'USD',
      payhipUrl: product.payhipUrl,
      image: product.image || '',
      shortDescription: product.shortDescription || '',
      fullDescriptionText: (product.fullDescription || []).join('\n'),
      featuresText: (product.features || []).join('\n'),
      format: product.format || '',
      compatibilityText: (product.compatibility || []).join('\n'),
      visible: product.visible !== false,
    });
    setFormError('');
    setEditingId(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    setFormError('');
    try {
      const dataUrl = await processUploadedProductPhoto(file);
      setForm((prev) => ({ ...prev, image: dataUrl }));
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Erreur lors du chargement de la photo.'
      );
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmitForm = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim()) {
      setFormError('Veuillez renseigner le nom du produit.');
      return;
    }
    if (isNaN(Number(form.price)) || Number(form.price) < 0) {
      setFormError('Veuillez saisir un prix valide.');
      return;
    }
    if (!form.payhipUrl.trim() || !form.payhipUrl.trim().startsWith('http')) {
      setFormError('Veuillez saisir un lien Payhip valide commençant par https://');
      return;
    }

    setSaving(true);
    try {
      if (editingId === 'new') {
        const created = await onAddProduct(form);
        setFeedbackBanner(
          `Le produit « ${created.name} » a été enregistré dans Firebase Firestore (${
            created.visible ? 'Visible en boutique' : 'Masqué'
          }).`
        );
      } else if (editingId) {
        await onUpdateProduct(editingId, form);
        setFeedbackBanner(
          `Les modifications sur « ${form.name.trim()} » ont été enregistrées dans Firebase Firestore.`
        );
      }

      setEditingId(null);
      setTimeout(() => setFeedbackBanner(''), 5000);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de l’enregistrement dans Firebase.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="max-w-[460px] mx-auto px-4 sm:px-6 py-16 text-center text-sm text-slate-600">
        Vérification de la connexion Firebase...
      </div>
    );
  }

  // LOCKED VIEW: Protected Owner Authentication via Firebase Google Login
  if (!isOwnerAdmin) {
    return (
      <div className="max-w-[480px] mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="w-11 h-11 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              Gestion du catalogue (Firebase)
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Cet espace est protégé par Firebase Authentication et réservé au propriétaire de Mahfoud Digital Products. Tous les produits ajoutés ou modifiés ici sont sauvegardés dans Firebase Firestore et synchronisés sur Vercel.
            </p>
          </div>

          {currentUser && !isOwnerAdmin && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 space-y-2">
              <p>
                Connecté avec <strong>{currentUser.email}</strong>, qui n’est pas le compte administrateur autorisé.
              </p>
              <button
                type="button"
                onClick={handleSignOut}
                className="font-semibold underline cursor-pointer"
              >
                Se déconnecter
              </button>
            </div>
          )}

          {authError && (
            <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {authError}
            </p>
          )}

          <button
            type="button"
            disabled={signingIn}
            onClick={handleGoogleSignIn}
            className="w-full min-h-[48px] px-5 py-3 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            {signingIn
              ? 'Connexion en cours...'
              : 'Se connecter avec Google (Propriétaire)'}
          </button>

          <div className="pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => onNavigate('products')}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retourner à la boutique publique</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // UNLOCKED VIEW: Connected to Firebase Firestore as Verified Owner
  return (
    <div className="max-w-[1050px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-700">
            <Lock className="w-3.5 h-3.5" />
            <span>Connecté à Firebase Firestore ({currentUser?.email})</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Gestion des produits
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Vos produits sont stockés de façon persistante dans Firebase Firestore et visibles en temps réel sur votre site déployé sur Vercel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {!editingId && (
            <button
              type="button"
              onClick={startAddingProduct}
              className="min-h-[44px] px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un produit</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            className="min-h-[44px] px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Feedback Notifications */}
      {feedbackBanner && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-blue-700 shrink-0" />
            <span>{feedbackBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackBanner('')}
            className="text-blue-700 hover:text-blue-950 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* FORM VIEW: ADD OR EDIT PRODUCT */}
      {editingId !== null ? (
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
              {editingId === 'new'
                ? 'Ajouter un nouveau produit'
                : 'Modifier les informations du produit'}
            </h2>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="min-h-[38px] px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 inline-flex items-center gap-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Fermer</span>
            </button>
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-6">
            {/* 1. PHOTO DU PRODUIT (TÉLÉVERSEMENT) */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-900">
                Photo du produit (utilisée sur la carte, le catalogue et la fiche détaillée)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
                {/* Preview Box */}
                <div className="sm:col-span-5 aspect-4/3 w-full bg-slate-100 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative">
                  {form.image ? (
                    <img
                      src={form.image}
                      alt={form.name || 'Aperçu du produit'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="p-4 text-center text-slate-500 flex flex-col items-center">
                      <FileText className="w-8 h-8 mb-2 text-slate-400" />
                      <span className="text-xs">
                        Aucune photo fournie (image de remplacement par défaut)
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="sm:col-span-7 space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      disabled={photoUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 cursor-pointer"
                    >
                      <ImagePlus className="w-4 h-4" />
                      <span>
                        {photoUploading
                          ? 'Chargement de la photo...'
                          : 'Choisir / Téléverser une photo'}
                      </span>
                    </button>

                    {form.image && (
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, image: '' }))}
                        className="min-h-[44px] px-3.5 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        Retirer la photo
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Sélectionnez une image depuis votre téléphone ou votre ordinateur (JPG, PNG, WebP). Vous pouvez également coller un lien ou chemin d’image ci-dessous :
                  </p>

                  <input
                    type="text"
                    value={
                      form.image && form.image.startsWith('data:')
                        ? ''
                        : form.image || ''
                    }
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, image: e.target.value }))
                    }
                    placeholder={
                      form.image && form.image.startsWith('data:')
                        ? 'Photo téléversée depuis votre appareil (prête)'
                        : 'Ou chemin / URL d’image (optionnel)'
                    }
                    className="w-full min-h-[42px] px-3.5 py-2 bg-[#FAF9F6] border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>
            </div>

            {/* 2. NOM & CATÉGORIE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="prod-name" className="block text-xs font-semibold text-slate-900">
                  Nom du produit *
                </label>
                <input
                  id="prod-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex : Convertisseur PDF to KPF"
                  className="w-full min-h-[44px] px-3.5 py-2 bg-[#FAF9F6] border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-700"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="prod-category" className="block text-xs font-semibold text-slate-900">
                  Catégorie *
                </label>
                <select
                  id="prod-category"
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      category: e.target.value as Exclude<CategoryId, 'all'>,
                    }))
                  }
                  className="w-full min-h-[44px] px-3.5 py-2 bg-[#FAF9F6] border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-700"
                >
                  {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. PRIX, DEVISE & LIEN PAYHIP */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-3 space-y-1.5">
                <label htmlFor="prod-price" className="block text-xs font-semibold text-slate-900">
                  Prix *
                </label>
                <input
                  id="prod-price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={form.price}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))
                  }
                  className="w-full min-h-[44px] px-3.5 py-2 bg-[#FAF9F6] border border-slate-200 rounded-lg text-sm font-mono-tabular text-slate-900 focus:bg-white focus:outline-none focus:border-blue-700"
                />
              </div>

              <div className="sm:col-span-3 space-y-1.5">
                <label htmlFor="prod-currency" className="block text-xs font-semibold text-slate-900">
                  Devise *
                </label>
                <select
                  id="prod-currency"
                  value={form.currency}
                  onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-[#FAF9F6] border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-700"
                >
                  {CURRENCIES.map((cur) => (
                    <option key={cur.code} value={cur.code}>
                      {cur.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-6 space-y-1.5">
                <label htmlFor="prod-payhip" className="block text-xs font-semibold text-slate-900">
                  Lien officiel Payhip *
                </label>
                <input
                  id="prod-payhip"
                  type="url"
                  required
                  value={form.payhipUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, payhipUrl: e.target.value }))}
                  placeholder="https://payhip.com/b/..."
                  className="w-full min-h-[44px] px-3.5 py-2 bg-[#FAF9F6] border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-700"
                />
              </div>
            </div>

            {/* 4. STATUT VISIBLE / MASQUÉ */}
            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs sm:text-sm font-semibold text-slate-900 block">
                  Visibilité dans la boutique publique
                </span>
                <span className="text-xs text-slate-600">
                  {form.visible
                    ? 'Ce produit est visible par tous les visiteurs et peut être acheté.'
                    : 'Ce produit est masqué : il ne s’affiche pas dans la boutique publique.'}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, visible: true }))}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                    form.visible
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Visible</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, visible: false }))}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                    !form.visible
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Masqué</span>
                </button>
              </div>
            </div>

            {/* 5. DESCRIPTIONS (COURTE & COMPLÈTE) */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="prod-short-desc" className="block text-xs font-semibold text-slate-900">
                  Description courte (affichée sur la carte du produit — optionnel)
                </label>
                <input
                  id="prod-short-desc"
                  type="text"
                  value={form.shortDescription || ''}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, shortDescription: e.target.value }))
                  }
                  placeholder="Résumé concis en 1 ou 2 phrases"
                  className="w-full min-h-[44px] px-3.5 py-2 bg-[#FAF9F6] border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-700"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="prod-full-desc" className="block text-xs font-semibold text-slate-900">
                  Description complète (affichée sur la page détaillée du produit — optionnel)
                </label>
                <textarea
                  id="prod-full-desc"
                  rows={4}
                  value={form.fullDescriptionText || ''}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, fullDescriptionText: e.target.value }))
                  }
                  placeholder="Détaillez le fonctionnement et l’utilité du produit (un paragraphe par ligne)"
                  className="w-full p-3.5 bg-[#FAF9F6] border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-700 resize-y"
                />
              </div>
            </div>

            {/* 6. CARACTÉRISTIQUES, FORMAT & COMPATIBILITÉ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="prod-format" className="block text-xs font-semibold text-slate-900">
                  Format du produit (optionnel)
                </label>
                <input
                  id="prod-format"
                  type="text"
                  value={form.format || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, format: e.target.value }))}
                  placeholder="Ex : Application Windows (.exe / .zip), APK, PDF..."
                  className="w-full min-h-[44px] px-3.5 py-2 bg-[#FAF9F6] border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-700"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="prod-compat" className="block text-xs font-semibold text-slate-900">
                  Compatibilité (optionnel, une par ligne)
                </label>
                <textarea
                  id="prod-compat"
                  rows={2}
                  value={form.compatibilityText || ''}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, compatibilityText: e.target.value }))
                  }
                  placeholder="Ex : Windows 10 / 11&#10;Android"
                  className="w-full p-3 bg-[#FAF9F6] border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-700 resize-y"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="prod-features" className="block text-xs font-semibold text-slate-900">
                Caractéristiques principales (optionnel, une caractéristique par ligne)
              </label>
              <textarea
                id="prod-features"
                rows={3}
                value={form.featuresText || ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, featuresText: e.target.value }))
                }
                placeholder="Une caractéristique par ligne"
                className="w-full p-3.5 bg-[#FAF9F6] border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-700 resize-y"
              />
            </div>

            {formError && (
              <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                {formError}
              </p>
            )}

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="min-h-[46px] px-5 py-2.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="min-h-[46px] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                {saving
                  ? 'Enregistrement dans Firebase...'
                  : editingId === 'new'
                  ? 'Enregistrer le produit'
                  : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* CONFIRMATION DE SUPPRESSION */}
      {confirmDeleteProduct && (
        <div className="bg-red-50/90 border border-red-200 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-red-950">
              Confirmer la suppression définitive
            </h3>
            <p className="text-xs sm:text-sm text-red-900">
              Voulez-vous vraiment supprimer le produit «{' '}
              <strong>{confirmDeleteProduct.name}</strong> » de Firebase Firestore ? Si vous souhaitez simplement le retirer temporairement de la boutique publique, utilisez plutôt le bouton « Masquer ».
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={async () => {
                const deletedName = confirmDeleteProduct.name;
                const targetId = confirmDeleteProduct.id;
                setConfirmDeleteProduct(null);
                await onDeleteProduct(targetId);
                setFeedbackBanner(
                  `Le produit « ${deletedName} » a été supprimé de Firebase Firestore.`
                );
                setTimeout(() => setFeedbackBanner(''), 4000);
              }}
              className="min-h-[42px] px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
            >
              Confirmer la suppression
            </button>
            <button
              type="button"
              onClick={() => setConfirmDeleteProduct(null)}
              className="min-h-[42px] px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* LISTE DES PRODUITS EXISTANTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Produits enregistrés ({products.length})
          </h2>
          <span className="text-xs text-slate-500">
            {products.filter((p) => p.visible !== false).length} visible(s) en boutique
          </span>
        </div>

        {products.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-xl p-8 text-center space-y-3">
            <p className="text-sm text-slate-600">
              Aucun produit n’est actuellement enregistré dans le catalogue.
            </p>
            <button
              type="button"
              onClick={startAddingProduct}
              className="min-h-[44px] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un produit</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => {
              const isVisible = product.visible !== false;
              return (
                <div
                  key={product.id}
                  className={`bg-white border rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
                    isVisible ? 'border-slate-200/90' : 'border-slate-200/60 bg-slate-50/70'
                  }`}
                >
                  {/* Product Thumbnail & Core Info */}
                  <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                    <div className="w-20 h-16 sm:w-24 sm:h-18 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.imageAlt}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText className="w-6 h-6 text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">
                          {product.categoryLabel}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular font-semibold text-slate-900">
                          {product.formattedPrice ||
                            formatProductPrice(product.price, product.currency)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-medium ${
                            isVisible ? 'text-blue-700' : 'text-slate-500'
                          }`}
                        >
                          {isVisible ? 'Visible en boutique' : 'Masqué'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 truncate">
                        {product.name}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <a
                          href={product.payhipUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-600 hover:text-blue-700 underline underline-offset-2 inline-flex items-center gap-1 truncate max-w-[260px]"
                        >
                          <span className="truncate">{product.payhipUrl}</span>
                          <ArrowUpRight className="w-3 h-3 shrink-0" />
                        </a>
                        <span aria-hidden="true">·</span>
                        <button
                          type="button"
                          onClick={() => onSelectProduct(product.slug)}
                          className="text-slate-600 hover:text-slate-900 underline underline-offset-2 cursor-pointer"
                        >
                          Voir la fiche
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="w-full md:w-auto flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEditingProduct(product)}
                      className="flex-1 sm:flex-initial min-h-[40px] px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Modifier</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleVisibility(product.id)}
                      className="flex-1 sm:flex-initial min-h-[40px] px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isVisible ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Masquer</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Afficher</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmDeleteProduct(product)}
                      aria-label={`Supprimer ${product.name}`}
                      className="min-h-[40px] px-3 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200/80 rounded-lg hover:bg-red-100 transition-colors inline-flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="sm:inline">Supprimer</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
