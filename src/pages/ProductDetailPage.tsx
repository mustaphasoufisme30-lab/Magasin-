import { useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  FileText,
  Info,
  Lock,
  Smartphone,
} from 'lucide-react';
import { DigitalProduct } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { PageRoute } from '../components/Navbar';

interface ProductDetailPageProps {
  product: DigitalProduct;
  allVisibleProducts: DigitalProduct[];
  onBackToCatalog: () => void;
  onSelectProduct: (slug: string) => void;
  onNavigate: (page: PageRoute) => void;
}

export function ProductDetailPage({
  product,
  allVisibleProducts,
  onBackToCatalog,
  onSelectProduct,
  onNavigate,
}: ProductDetailPageProps) {
  const [imgError, setImgError] = useState(false);

  const relatedProducts = allVisibleProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="pb-24 lg:pb-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        {/* Breadcrumb / Back Navigation */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToCatalog}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors min-h-[40px] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour aux produits</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span>Catalogue</span>
            <span aria-hidden="true">/</span>
            <span>{product.categoryLabel}</span>
            <span aria-hidden="true">/</span>
            <span className="text-slate-800 font-medium truncate max-w-[260px]">
              {product.name}
            </span>
          </div>
        </div>

        {/* Main PDP Contiguous Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column (7 cols): High-Resolution Image & Available Details */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden">
              <div className="aspect-4/3 w-full bg-slate-100 overflow-hidden">
                {product.image && !imgError ? (
                  <img
                    src={product.image}
                    alt={product.imageAlt}
                    width={800}
                    height={600}
                    fetchPriority="high"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-100 text-slate-600">
                    <FileText className="w-10 h-10 mb-3 text-slate-400" />
                    <span className="text-sm font-medium">{product.name}</span>
                  </div>
                )}
              </div>
            </div>

            {product.fullDescription && product.fullDescription.length > 0 && (
              <section className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-8 space-y-4">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Présentation complète
                </h2>
                <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
                  {product.fullDescription.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </section>
            )}

            {product.features && product.features.length > 0 && (
              <section className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-8 space-y-5">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Fonctionnalités
                </h2>
                <ul className="space-y-3">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-slate-700">
                      <Check className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {(product.format ||
              product.fileSize ||
              (product.compatibility && product.compatibility.length > 0) ||
              (product.importantInfo && product.importantInfo.length > 0)) && (
              <section className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-8 space-y-6">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Informations techniques
                </h2>

                {(product.format || product.fileSize) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {product.format && (
                      <div className="p-4 rounded-lg bg-[#FAF9F6] border border-slate-200/80 space-y-1">
                        <span className="text-xs text-slate-500">Format du produit</span>
                        <p className="text-sm font-semibold text-slate-900">{product.format}</p>
                      </div>
                    )}

                    {product.fileSize && (
                      <div className="p-4 rounded-lg bg-[#FAF9F6] border border-slate-200/80 space-y-1">
                        <span className="text-xs text-slate-500">Taille</span>
                        <p className="font-mono-tabular text-sm font-semibold text-slate-900">
                          {product.fileSize}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {product.compatibility && product.compatibility.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-slate-700" />
                      <span>Compatibilité</span>
                    </h3>
                    <ul className="list-disc list-inside text-sm text-slate-700 space-y-1 pl-1">
                      {product.compatibility.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {product.importantInfo && product.importantInfo.length > 0 && (
                  <div className="pt-4 border-t border-slate-200/80 space-y-2">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-700" />
                      <span>Informations importantes</span>
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      {product.importantInfo.map((info, idx) => (
                        <li key={idx}>{info}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {product.faq && product.faq.length > 0 && (
              <section className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-8 space-y-5">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Questions fréquentes
                </h2>
                <div className="divide-y divide-slate-200/80">
                  {product.faq.map((item, idx) => (
                    <div key={idx} className="py-4 first:pt-0 last:pb-0 space-y-1.5">
                      <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                        {item.question}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column (5 cols): Contiguous Purchase Module */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-blue-700">{product.categoryLabel}</span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {product.shortDescription && (
                <p className="text-sm text-slate-600 leading-relaxed">
                  {product.shortDescription}
                </p>
              )}

              <div className="p-4 rounded-lg bg-[#FAF9F6] border border-slate-200/80 flex items-baseline justify-between">
                <span className="text-xs font-medium text-slate-600">Prix</span>
                <span className="font-mono-tabular text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {product.formattedPrice}
                </span>
              </div>

              {/* Primary Buy Button (Redirects directly to https://payhip.com/b/8cbQk) */}
              <div className="space-y-3">
                <a
                  href={product.payhipUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[52px] px-6 py-3.5 text-base font-semibold text-white bg-slate-900 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <span>Acheter</span>
                  <ArrowUpRight className="w-5 h-5 shrink-0" />
                </a>
              </div>

              <div className="pt-5 border-t border-slate-200/80 space-y-3 text-xs sm:text-sm text-slate-600">
                <div className="flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Paiement et téléchargement gérés directement sur Payhip.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Une question ?</span>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="font-semibold text-slate-800 underline underline-offset-4 hover:text-blue-700 cursor-pointer"
                >
                  Contacter le support
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section (only shown if more than 1 product exists) */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-slate-200/80">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                Autres produits numériques
              </h2>
              <button
                type="button"
                onClick={onBackToCatalog}
                className="text-xs sm:text-sm font-semibold text-blue-700 hover:underline whitespace-nowrap cursor-pointer"
              >
                Tout voir
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile Sticky Bottom Buy Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-slate-500 truncate">{product.name}</p>
          <p className="font-mono-tabular text-base font-bold text-slate-900">
            {product.formattedPrice}
          </p>
        </div>
        <a
          href={product.payhipUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[44px] px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <span>Acheter</span>
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
