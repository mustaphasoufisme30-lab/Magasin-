/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { SITE_CONFIG } from './config/siteConfig';
import { CATEGORIES, CategoryId, DigitalProduct } from './data/products';
import { useCatalog } from './hooks/useCatalog';
import { Navbar, PageRoute } from './components/Navbar';
import { Footer } from './components/Footer';
import { SEOHead } from './components/SEOHead';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LegalPage } from './pages/LegalPage';
import { CatalogManagerPage } from './pages/CatalogManagerPage';

function parseUrlState(allProducts: DigitalProduct[]): {
  page: PageRoute;
  productSlug: string | null;
  category: CategoryId;
} {
  if (typeof window === 'undefined') {
    return { page: 'home', productSlug: null, category: 'all' };
  }
  const params = new URLSearchParams(window.location.search);
  const productParam = params.get('product');
  const pageParam = params.get('page') as PageRoute | null;
  const categoryParam = params.get('category') as CategoryId | null;

  const validCategory =
    categoryParam && CATEGORIES.some((c) => c.id === categoryParam)
      ? categoryParam
      : 'all';

  if (productParam && allProducts.some((p) => p.slug === productParam)) {
    return { page: 'products', productSlug: productParam, category: validCategory };
  }

  const validPages: PageRoute[] = [
    'home',
    'products',
    'about',
    'contact',
    'privacy',
    'terms',
    'refund',
    'manage',
  ];

  const page: PageRoute =
    pageParam && validPages.includes(pageParam) ? pageParam : 'home';

  return { page, productSlug: null, category: validCategory };
}

export default function App() {
  const {
    allProducts,
    visibleProducts,
    currentUser,
    isAuthReady,
    isOwnerAdmin,
    addProduct,
    updateProduct,
    toggleProductVisibility,
    deleteProduct,
  } = useCatalog();

  const initial = parseUrlState(allProducts);
  const [currentPage, setCurrentPage] = useState<PageRoute>(initial.page);
  const [activeProductSlug, setActiveProductSlug] = useState<string | null>(
    initial.productSlug
  );
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>(
    initial.category
  );

  // Sync with browser back/forward buttons
  useEffect(() => {
    const onPopState = () => {
      const next = parseUrlState(allProducts);
      setCurrentPage(next.page);
      setActiveProductSlug(next.productSlug);
      setSelectedCategory(next.category);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [allProducts]);

  const updateUrl = (
    page: PageRoute,
    productSlug: string | null = null,
    category: CategoryId = 'all'
  ) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.search = '';

    if (productSlug) {
      url.searchParams.set('product', productSlug);
    } else if (page !== 'home') {
      url.searchParams.set('page', page);
      if (page === 'products' && category !== 'all') {
        url.searchParams.set('category', category);
      }
    }

    window.history.pushState({}, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (page: PageRoute) => {
    setActiveProductSlug(null);
    setCurrentPage(page);
    updateUrl(page, null, page === 'products' ? selectedCategory : 'all');
  };

  const handleSelectProduct = (slug: string) => {
    setActiveProductSlug(slug);
    setCurrentPage('products');
    updateUrl('products', slug, selectedCategory);
  };

  const handleSelectCategory = (category: CategoryId) => {
    setSelectedCategory(category);
    setActiveProductSlug(null);
    setCurrentPage('products');
    updateUrl('products', null, category);
  };

  // In the public storefront, only show activeProduct if it exists in visibleProducts
  const activeProduct = activeProductSlug
    ? visibleProducts.find((p) => p.slug === activeProductSlug) || null
    : null;

  // Dynamic SEO metadata resolution per view
  const getSeoProps = () => {
    if (activeProduct) {
      return {
        title: `${activeProduct.name} – ${SITE_CONFIG.name}`,
        description: `${activeProduct.name} (${activeProduct.categoryLabel}) – ${activeProduct.formattedPrice}. Disponible sur Mahfoud Digital Products via Payhip.`,
        canonicalPath: `/?product=${activeProduct.slug}`,
        product: activeProduct,
        products: visibleProducts,
      };
    }

    switch (currentPage) {
      case 'products':
        return {
          title: `Boutique des Produits Numériques – ${SITE_CONFIG.name}`,
          description:
            'Parcourez notre catalogue d’applications, ebooks, PDF, outils de programmation et ressources éducatives sur Mahfoud Digital Products.',
          canonicalPath: '/?page=products',
          products: visibleProducts,
        };
      case 'about':
        return {
          title: `À propos de ${SITE_CONFIG.name} – Notre Mission`,
          description:
            'Découvrez Mahfoud Digital Products, plateforme dédiée aux produits numériques utiles, accessibles et livrés instantanément via Payhip.',
          canonicalPath: '/?page=about',
          products: visibleProducts,
        };
      case 'contact':
        return {
          title: `Contact & Support Client – ${SITE_CONFIG.name}`,
          description:
            'Contactez l’équipe de Mahfoud Digital Products pour toute question sur nos produits numériques et téléchargements Payhip.',
          canonicalPath: '/?page=contact',
          products: visibleProducts,
        };
      case 'privacy':
        return {
          title: `Politique de Confidentialité – ${SITE_CONFIG.name}`,
          description:
            'Consultez la politique de confidentialité et de sécurité des paiements Payhip sur Mahfoud Digital Products.',
          canonicalPath: '/?page=privacy',
          products: visibleProducts,
        };
      case 'terms':
        return {
          title: `Conditions d’Utilisation – ${SITE_CONFIG.name}`,
          description:
            'Conditions générales d’utilisation et de licence des produits numériques distribués par Mahfoud Digital Products.',
          canonicalPath: '/?page=terms',
          products: visibleProducts,
        };
      case 'refund':
        return {
          title: `Politique de Remboursement & Livraison – ${SITE_CONFIG.name}`,
          description:
            'Informations sur la livraison numérique instantanée via Payhip et les conditions de remboursement.',
          canonicalPath: '/?page=refund',
          products: visibleProducts,
        };
      case 'manage':
        return {
          title: `Gestion du Catalogue – ${SITE_CONFIG.name}`,
          description: 'Espace propriétaire de gestion des produits numériques.',
          canonicalPath: '/?page=manage',
          products: visibleProducts,
        };
      default:
        return {
          title: `${SITE_CONFIG.name} – Applications, Ebooks, PDF & Outils Numériques`,
          description:
            'Découvrez Mahfoud Digital Products : applications, logiciels, ebooks, PDF pratiques, outils de programmation et ressources éducatives en téléchargement immédiat.',
          canonicalPath: '/',
          products: visibleProducts,
        };
    }
  };

  const seoProps = getSeoProps();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-slate-900">
      <SEOHead {...seoProps} />

      <Navbar
        currentPage={currentPage}
        activeProductSlug={activeProductSlug}
        onNavigate={handleNavigate}
      />

      <main className="flex-1">
        {currentPage === 'manage' ? (
          <CatalogManagerPage
            products={allProducts}
            currentUser={currentUser}
            isAuthReady={isAuthReady}
            isOwnerAdmin={isOwnerAdmin}
            onAddProduct={addProduct}
            onUpdateProduct={updateProduct}
            onToggleVisibility={toggleProductVisibility}
            onDeleteProduct={deleteProduct}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        ) : activeProduct ? (
          <ProductDetailPage
            product={activeProduct}
            allVisibleProducts={visibleProducts}
            onBackToCatalog={() => handleNavigate('products')}
            onSelectProduct={handleSelectProduct}
            onNavigate={handleNavigate}
          />
        ) : currentPage === 'products' ? (
          <ProductsPage
            products={visibleProducts}
            initialCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            onSelectProduct={handleSelectProduct}
            onNavigate={handleNavigate}
          />
        ) : currentPage === 'about' ? (
          <AboutPage onNavigate={handleNavigate} />
        ) : currentPage === 'contact' ? (
          <ContactPage products={visibleProducts} />
        ) : currentPage === 'privacy' ||
          currentPage === 'terms' ||
          currentPage === 'refund' ? (
          <LegalPage type={currentPage} onNavigate={handleNavigate} />
        ) : (
          <HomePage
            products={visibleProducts}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
            onSelectCategory={handleSelectCategory}
          />
        )}
      </main>

      <Footer
        onNavigate={handleNavigate}
        onSelectCategory={handleSelectCategory}
      />
    </div>
  );
}
