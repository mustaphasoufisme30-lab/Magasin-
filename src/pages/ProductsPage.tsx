import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { CategoryId, CategoryItem, DigitalProduct } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { PageRoute } from '../components/Navbar';

interface ProductsPageProps {
  products: DigitalProduct[];
  categories: CategoryItem[];
  initialCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
  onSelectProduct: (slug: string) => void;
  onNavigate: (page: PageRoute) => void;
}

type SortOption = 'popular' | 'price-asc' | 'price-desc';

export function ProductsPage({
  products,
  categories,
  initialCategory,
  onSelectCategory,
  onSelectProduct,
  onNavigate,
}: ProductsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  const activeCategoryObj =
    categories.find((c) => c.id === initialCategory) || categories[0];

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory =
        initialCategory === 'all' || product.category === initialCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        (product.shortDescription || '').toLowerCase().includes(query) ||
        product.categoryLabel.toLowerCase().includes(query) ||
        (product.format || '').toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return Number(b.popular) - Number(a.popular);
    });

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-8">
      {/* Page Header */}
      <div className="space-y-3 border-b border-slate-200/80 pb-8">
        <p className="text-xs sm:text-sm font-medium text-blue-700">
          <span>Catalogue officiel · Téléchargement immédiat via Payhip</span>
          <span aria-hidden="true"> · </span>
          <a
            href="/?page=manage"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('manage');
            }}
            className="text-xs sm:text-sm font-medium text-blue-700 hover:underline cursor-pointer"
          >
            Gestion catalogue
          </a>
        </p>
        <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {activeCategoryObj.label}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
          {activeCategoryObj.description}
        </p>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un produit..."
              aria-label="Rechercher un produit numérique"
              className="w-full min-h-[44px] pl-10 pr-9 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Effacer la recherche"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Select */}
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <SlidersHorizontal className="w-4 h-4 text-slate-500 shrink-0" />
            <label htmlFor="sort-products" className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">
              Trier par :
            </label>
            <select
              id="sort-products"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="min-h-[42px] px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-700 cursor-pointer"
            >
              <option value="popular">Populaires en premier</option>
              <option value="price-asc">Prix : croissant</option>
              <option value="price-desc">Prix : décroissant</option>
            </select>
          </div>
        </div>

        {/* Category Buttons */}
        <div
          role="tablist"
          aria-label="Catégories de produits"
          className="flex items-center gap-1.5 overflow-x-auto pb-2"
        >
          {categories.map((category) => {
            const isSelected = initialCategory === category.id;
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
                onClick={() => onSelectCategory(category.id)}
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
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {filteredProducts.length}{' '}
          {filteredProducts.length > 1 ? 'produits affichés' : 'produit affiché'}
        </span>
        {(initialCategory !== 'all' || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              onSelectCategory('all');
              setSearchQuery('');
            }}
            className="text-blue-700 hover:underline font-medium cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Products Grid or Empty State */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-xl p-10 text-center space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Aucun produit ne correspond à votre sélection
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Essayez un autre mot-clé ou affichez l’ensemble des catégories disponibles dans la boutique.
          </p>
          <button
            type="button"
            onClick={() => {
              onSelectCategory('all');
              setSearchQuery('');
            }}
            className="min-h-[44px] px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Afficher tous les produits
          </button>
        </div>
      )}
    </div>
  );
}
