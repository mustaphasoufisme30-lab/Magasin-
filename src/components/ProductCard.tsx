import { useState } from 'react';
import { ArrowUpRight, FileText } from 'lucide-react';
import { DigitalProduct } from '../data/products';

interface ProductCardProps {
  product: DigitalProduct;
  onSelectProduct: (slug: string) => void;
}

export function ProductCard({ product, onSelectProduct }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <article className="group bg-white border border-slate-200/90 rounded-xl overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5 hover:border-slate-300">
      <div>
        {/* Product Image (4:3 aspect ratio with resilient fallback) */}
        <a
          href={`/?product=${product.slug}`}
          onClick={(e) => {
            e.preventDefault();
            onSelectProduct(product.slug);
          }}
          aria-label={product.name}
          className="block relative aspect-4/3 w-full bg-slate-100 overflow-hidden border-b border-slate-100"
        >
          {product.image && !imageError ? (
            <img
              src={product.image}
              alt={product.imageAlt}
              width={800}
              height={600}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600">
              <FileText className="w-8 h-8 mb-2 text-slate-500" />
              <span className="text-xs font-medium text-slate-700">{product.name}</span>
            </div>
          )}
        </a>

        {/* Card Content */}
        <div className="p-5 sm:p-6">
          {/* Category metadata */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span className="font-medium text-slate-600">{product.categoryLabel}</span>
            {product.format && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate">{product.format.split('+')[0].trim()}</span>
              </>
            )}
          </div>

          {/* Product Title */}
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
            <a
              href={`/?product=${product.slug}`}
              onClick={(e) => {
                e.preventDefault();
                onSelectProduct(product.slug);
              }}
              className="hover:text-blue-700 transition-colors"
            >
              {product.name}
            </a>
          </h3>

          {/* Optional Short Description */}
          {product.shortDescription && (
            <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mt-2">
              {product.shortDescription}
            </p>
          )}
        </div>
      </div>

      {/* Card Footer: Price & Acheter Button */}
      <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-3 border-t border-slate-100 flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-slate-500">Prix</span>
          <span className="font-mono-tabular text-lg font-semibold text-slate-900">
            {product.formattedPrice}
          </span>
        </div>

        <a
          href={product.payhipUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full min-h-[46px] px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <span>Acheter</span>
          <ArrowUpRight className="w-4 h-4 shrink-0" />
        </a>
      </div>
    </article>
  );
}
