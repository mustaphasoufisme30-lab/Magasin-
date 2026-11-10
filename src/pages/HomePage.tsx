import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, Download, FileText, Lock, Smartphone } from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';
import { CATEGORIES, CategoryId, DigitalProduct } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { PageRoute } from '../components/Navbar';

interface HomePageProps {
  products: DigitalProduct[];
  onNavigate: (page: PageRoute) => void;
  onSelectProduct: (slug: string) => void;
  onSelectCategory: (category: CategoryId) => void;
}

export function HomePage({
  products,
  onNavigate,
  onSelectProduct,
  onSelectCategory,
}: HomePageProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [heroImgError, setHeroImgError] = useState(false);

  const featuredProduct = products[0] || null;

  const displayedProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* SECTION 1: HERO & PRESENTATION RAPIDE */}
      <section className="pt-6 sm:pt-12 border-b border-slate-200/80 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left Column: Brand Value Proposition & Primary Actions */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4 sm:space-y-5">
                <p className="text-xs sm:text-sm font-medium text-blue-700 tracking-tight">
                  Applications · Ebooks · PDF · Outils de programmation
                </p>

                <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                  Mahfoud Digital Products
                </h1>

                <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl">
                  La plateforme dédiée aux produits numériques utiles, applications, livres numériques, guides PDF, modèles et ressources éducatives prêts à être téléchargés instantanément.
                </p>

                <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                  Chaque ressource est conçue pour répondre à un besoin concret sur smartphone, tablette ou ordinateur. Paiement sécurisé et livraison immédiate assurés par Payhip, sans création de compte obligatoire.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <a
                  href="#catalogue-produits"
                  className="min-h-[48px] px-6 py-3 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                >
                  <span>Découvrir les produits</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </a>

                <button
                  type="button"
                  onClick={() => onNavigate('products')}
                  className="min-h-[48px] px-6 py-3 text-sm font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200/70 transition-colors inline-flex items-center justify-center whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Voir la boutique complète
                </button>
              </div>
            </div>

            {/* Right Column: Featured Product Showcase Card */}
            <div className="lg:col-span-5 flex">
              {featuredProduct ? (
                <div className="w-full bg-[#FAF9F6] border border-slate-200/90 rounded-xl overflow-hidden flex flex-col justify-between">
                  <a
                    href={`/?product=${featuredProduct.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectProduct(featuredProduct.slug);
                    }}
                    className="block relative aspect-4/3 w-full bg-slate-200 overflow-hidden"
                  >
                    {featuredProduct.image && !heroImgError ? (
                      <img
                        src={featuredProduct.image}
                        alt={featuredProduct.imageAlt}
                        width={800}
                        height={600}
                        fetchPriority="high"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={() => setHeroImgError(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-100 text-slate-600 text-sm">
                        <FileText className="w-8 h-8 mb-2 text-slate-400" />
                        <span>{featuredProduct.name}</span>
                      </div>
                    )}
                  </a>

                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                        <span>{featuredProduct.categoryLabel}</span>
                      </div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        <a
                          href={`/?product=${featuredProduct.slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onSelectProduct(featuredProduct.slug);
                          }}
                          className="hover:text-blue-700 transition-colors"
                        >
                          {featuredProduct.name}
                        </a>
                      </h2>
                      {featuredProduct.shortDescription && (
                        <p className="text-xs sm:text-sm text-slate-600 mt-1.5 line-clamp-2">
                          {featuredProduct.shortDescription}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-4">
                      <div>
                        <span className="block text-[11px] text-slate-500">Prix</span>
                        <span className="font-mono-tabular text-base font-bold text-slate-900">
                          {featuredProduct.formattedPrice}
                        </span>
                      </div>

                      <a
                        href={featuredProduct.payhipUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[42px] px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      >
                        <span>Acheter</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full bg-[#FAF9F6] border border-slate-200/90 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                  <p className="text-sm text-slate-600">
                    Catalogue en cours de mise à jour.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Full-width 4-Column Trust & Key Benefits Strip below Hero Split */}
          <div className="mt-10 pt-8 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SITE_CONFIG.guarantees.map((item, index) => (
              <div key={index} className="space-y-1.5">
                <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: PRODUITS & FILTRAGE PAR CATÉGORIES */}
      <section id="catalogue-produits" className="max-w-[1200px] mx-auto px-4 sm:px-6 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Produits disponibles
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
              Découvrez nos produits numériques et achetez-les directement en toute sécurité via Payhip.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('products')}
            className="self-start md:self-auto text-sm font-semibold text-blue-700 hover:text-slate-900 inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Voir toute la boutique</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Category Filter Bar */}
        <div
          role="tablist"
          aria-label="Filtrer les produits par catégorie"
          className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-8 scrollbar-none"
        >
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.id;
            const count =
              category.id === 'all'
                ? products.length
                : products.filter((p) => p.category === category.id).length;

            return (
              <button
                key={category.id}
                role="tab"
                aria-selected={isSelected}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={`min-h-[42px] px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {category.shortLabel} ({count})
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-xl p-8 text-center space-y-3">
            <p className="text-sm text-slate-600">
              Aucun produit dans cette catégorie pour le moment.
            </p>
            {selectedCategory !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="min-h-[40px] px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Afficher tous les produits
              </button>
            )}
          </div>
        )}
      </section>

      {/* SECTION 3: EXPLORER PAR CATÉGORIES DÉTAILLÉES */}
      <section className="bg-white border-y border-slate-200/80 py-14 sm:py-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-10 space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Catégories de ressources
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Nos produits sont classés par spécialité pour vous permettre de trouver rapidement l’outil ou le support adapté à votre appareil.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.filter((c) => c.id !== 'all').map((cat, idx) => {
              const count = products.filter((p) => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className="text-left p-6 rounded-xl bg-[#FAF9F6] border border-slate-200/90 hover:border-slate-400 transition-colors flex flex-col justify-between gap-4 cursor-pointer group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-mono-tabular">0{idx + 1}</span>
                      <span>
                        {count} {count > 1 ? 'produits disponibles' : 'produit disponible'}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {cat.label}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-700 inline-flex items-center gap-1">
                    <span>Explorer cette catégorie</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4: COMMENT FONCTIONNE L'ACHAT SUR PAYHIP */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-10 lg:p-12">
          <div className="max-w-2xl mb-10 space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Un processus d’achat simple, direct et sécurisé
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Aucune inscription préalable n’est demandée sur notre site. La gestion du paiement et la livraison immédiate de vos fichiers sont assurées par la plateforme spécialisée Payhip.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center font-mono-tabular text-sm font-bold">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Choisissez votre produit</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Consultez la fiche du produit sur Mahfoud Digital Products.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center font-mono-tabular text-sm font-bold">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Cliquez sur « Acheter »</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Vous êtes redirigé vers la page officielle du produit sur Payhip avec une connexion chiffrée de bout en bout.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center font-mono-tabular text-sm font-bold">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Réglez en toute sécurité</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Payez par carte bancaire ou PayPal sans créer de compte. Vos informations de paiement restent strictement confidentielles.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center font-mono-tabular text-sm font-bold">
                4
              </div>
              <h3 className="text-base font-bold text-slate-900">Téléchargez immédiatement</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Accédez aussitôt au bouton de téléchargement de votre produit numérique et recevez également une copie du lien par e-mail.
              </p>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-slate-800" />
                Paiement chiffré SSL
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Download className="w-4 h-4 text-slate-800" />
                Livraison numérique instantanée
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-slate-800" />
                Optimisé pour smartphones et PC
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-4 h-4 text-slate-800" />
                Support client réactif
              </span>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('products')}
              className="min-h-[44px] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Accéder à la boutique
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
