import { SITE_CONFIG } from '../config/siteConfig';
import { CategoryId, CategoryItem } from '../data/products';
import { PageRoute } from './Navbar';

interface FooterProps {
  categories: CategoryItem[];
  onNavigate: (page: PageRoute) => void;
  onSelectCategory: (categoryId: CategoryId) => void;
}

export function Footer({ categories, onNavigate, onSelectCategory }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200/90 text-slate-600">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-200/80">
          {/* Column 1: Brand & Mission */}
          <div className="lg:col-span-4 space-y-4">
            <a
              href="/?page=home"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('home');
              }}
              className="font-display text-lg font-bold tracking-tight text-slate-900 inline-block"
            >
              {SITE_CONFIG.name}
            </a>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
              {SITE_CONFIG.shortIntro}
            </p>
            <div className="pt-1 text-xs text-slate-500 space-y-1">
              <p>Paiements et livraisons numériques opérés de manière sécurisée via Payhip.</p>
              <p>
                Contact :{' '}
                <a
                  href={`mailto:${SITE_CONFIG.contactEmail}`}
                  className="text-slate-800 underline underline-offset-4 hover:text-blue-700"
                >
                  {SITE_CONFIG.contactEmail}
                </a>
              </p>
            </div>
          </div>

          {/* Column 2: Catégories */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Catégories de produits
            </h3>
            <ul className="space-y-2.5 text-sm">
              {categories.filter((c) => c.id !== 'all').map((cat) => (
                <li key={cat.id}>
                  <a
                    href={`/?page=products&category=${cat.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectCategory(cat.id);
                    }}
                    className="text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {cat.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Navigation */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="/?page=home"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('home');
                  }}
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Accueil
                </a>
              </li>
              <li>
                <a
                  href="/?page=products"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('products');
                  }}
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Tous les produits
                </a>
              </li>
              <li>
                <a
                  href="/?page=about"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('about');
                  }}
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  À propos
                </a>
              </li>
              <li>
                <a
                  href="/?page=contact"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('contact');
                  }}
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Contact &amp; Support
                </a>
              </li>
              <li>
                <a
                  href={SITE_CONFIG.payhipStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Boutique Payhip
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Informations légales (AdSense & Google Ads compliance) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Informations légales
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="/?page=privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('privacy');
                  }}
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a
                  href="/?page=terms"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('terms');
                  }}
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Conditions d’utilisation
                </a>
              </li>
              <li>
                <a
                  href="/?page=refund"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('refund');
                  }}
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Politique de remboursement
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Trust Note */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {currentYear} {SITE_CONFIG.name}. Tous droits réservés.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span>Produits numériques téléchargeables · Paiement sécurisé opéré par Payhip</span>
            <span aria-hidden="true">·</span>
            <a
              href="/?page=manage"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('manage');
              }}
              className="text-slate-500 hover:text-slate-900 underline underline-offset-4 transition-colors"
            >
              Gestion du catalogue
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
