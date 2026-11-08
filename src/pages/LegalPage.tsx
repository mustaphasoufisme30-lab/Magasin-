import { SITE_CONFIG } from '../config/siteConfig';
import { PageRoute } from '../components/Navbar';

interface LegalPageProps {
  type: 'privacy' | 'terms' | 'refund';
  onNavigate: (page: PageRoute) => void;
}

export function LegalPage({ type, onNavigate }: LegalPageProps) {
  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
      {/* Legal Navigation Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200/80">
        <button
          type="button"
          onClick={() => onNavigate('privacy')}
          className={`min-h-[40px] px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer ${
            type === 'privacy'
              ? 'bg-slate-900 text-white font-semibold'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Politique de confidentialité
        </button>
        <button
          type="button"
          onClick={() => onNavigate('terms')}
          className={`min-h-[40px] px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer ${
            type === 'terms'
              ? 'bg-slate-900 text-white font-semibold'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Conditions d’utilisation
        </button>
        <button
          type="button"
          onClick={() => onNavigate('refund')}
          className={`min-h-[40px] px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer ${
            type === 'refund'
              ? 'bg-slate-900 text-white font-semibold'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Politique de remboursement
        </button>
      </div>

      {type === 'privacy' && (
        <article className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-10 space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
          <header className="space-y-2 border-b border-slate-100 pb-6">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
              Politique de confidentialité
            </h1>
            <p className="text-xs text-slate-500">Dernière mise à jour : Novembre 2026</p>
          </header>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">1. Collecte minimale des données</h2>
            <p>
              Le site <strong>{SITE_CONFIG.name}</strong> est une vitrine publique de présentation de produits numériques. Vous pouvez consulter l’intégralité du catalogue sans créer de compte et sans fournir d’informations personnelles.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              2. Paiements et livraisons numériques via Payhip
            </h2>
            <p>
              Lorsque vous cliquez sur le bouton « Acheter », vous êtes redirigé vers notre boutique hébergée sur la plateforme sécurisée <strong>Payhip</strong>. Les informations nécessaires au traitement de votre commande (adresse e-mail de livraison et moyen de paiement) sont traitées directement par Payhip conformément aux normes PCI-DSS et au RGPD. <strong>{SITE_CONFIG.name} ne stocke jamais vos coordonnées bancaires.</strong>
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              3. Cookies, Google AdSense et Google Ads
            </h2>
            <p>
              Ce site est conçu dans le respect des règles relatives aux éditeurs Google AdSense et Google Ads. Des fournisseurs tiers, y compris Google, peuvent utiliser des cookies pour diffuser des annonces pertinentes ou mesurer l’efficacité des campagnes publicitaires. Vous pouvez à tout moment gérer ou désactiver la personnalisation des annonces via les paramètres des annonces Google.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">4. Vos droits et contact</h2>
            <p>
              Pour toute question relative à la protection de vos données ou pour demander la suppression des messages envoyés via le formulaire de contact, écrivez-nous à :{' '}
              <a href={`mailto:${SITE_CONFIG.contactEmail}`} className="text-blue-700 underline">
                {SITE_CONFIG.contactEmail}
              </a>
              .
            </p>
          </section>
        </article>
      )}

      {type === 'terms' && (
        <article className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-10 space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
          <header className="space-y-2 border-b border-slate-100 pb-6">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
              Conditions générales d’utilisation et de licence
            </h1>
            <p className="text-xs text-slate-500">Dernière mise à jour : Novembre 2026</p>
          </header>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">1. Objet du site</h2>
            <p>
              <strong>{SITE_CONFIG.name}</strong> présente des produits numériques téléchargeables (applications Android, logiciels, ebooks, PDF interactifs, outils de programmation et supports éducatifs). L’achat et le téléchargement s’effectuent via la plateforme tierce Payhip.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">2. Licence d’utilisation des produits</h2>
            <p>
              Sauf mention contraire explicite sur la fiche du produit (telle qu’une licence commerciale pour les kits de développement), l’achat d’un produit numérique confère à l’acheteur un droit d’usage personnel, non exclusif et non transférable. La revente, le partage public ou la redistribution gratuite des fichiers téléchargés (APK, PDF, EPUB, archives ZIP) sont strictement interdits.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">3. Compatibilité et prérequis</h2>
            <p>
              Les formats, tailles de fichiers et systèmes compatibles sont indiqués de manière transparente sur chaque fiche produit avant l’achat. Il appartient à l’acheteur de vérifier que son appareil (smartphone Android, tablette ou ordinateur) répond aux spécifications mentionnées.
            </p>
          </section>
        </article>
      )}

      {type === 'refund' && (
        <article className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-10 space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
          <header className="space-y-2 border-b border-slate-100 pb-6">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
              Politique de livraison numérique et de remboursement
            </h1>
            <p className="text-xs text-slate-500">Dernière mise à jour : Novembre 2026</p>
          </header>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">1. Livraison instantanée via Payhip</h2>
            <p>
              Tous les produits proposés sur <strong>{SITE_CONFIG.name}</strong> sont des biens numériques immatériels. Dès la validation de votre paiement sur Payhip, vous accédez immédiatement à la page de téléchargement et recevez un e-mail contenant votre lien d’accès.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              2. Assistance technique et garantie de bon fonctionnement
            </h2>
            <p>
              Si vous rencontrez une difficulté technique pour télécharger ou ouvrir un fichier (application Android, ebook, PDF ou archive de code), contactez notre support à{' '}
              <a href={`mailto:${SITE_CONFIG.contactEmail}`} className="text-blue-700 underline">
                {SITE_CONFIG.contactEmail}
              </a>
              . Nous vous renverrons un lien valide ou vous assisterons dans l’installation sous 24 heures ouvrées.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">3. Conditions de remboursement</h2>
            <p>
              En raison de la nature téléchargeable immédiate des fichiers numériques, les commandes dont les fichiers ont été téléchargés ne font généralement pas l’objet d’un droit de rétractation automatique. Toutefois, en cas d’achat en double par erreur ou de défaut technique avéré ne pouvant être résolu par notre support dans un délai de 7 jours suivant l’achat, un remboursement intégral sera effectué via Payhip.
            </p>
          </section>
        </article>
      )}
    </div>
  );
}
