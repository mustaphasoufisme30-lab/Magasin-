import { ArrowRight, Check, Download, Lock, Smartphone } from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';
import { PageRoute } from '../components/Navbar';

interface AboutPageProps {
  onNavigate: (page: PageRoute) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12 sm:space-y-16">
      {/* Header */}
      <header className="space-y-4 border-b border-slate-200/80 pb-8">
        <p className="text-xs sm:text-sm font-medium text-blue-700">
          À propos de la plateforme
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Concevoir des produits numériques utiles, accessibles et durables
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
          {SITE_CONFIG.name} est une vitrine indépendante spécialisée dans la création et la distribution d’applications Android, de livres numériques techniques, de guides PDF interactifs et d’outils de programmation.
        </p>
      </header>

      {/* Mission & Philosophy */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-5">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
            Notre approche du produit numérique
          </h2>
        </div>
        <div className="md:col-span-7 space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
          <p>
            Dans un écosystème numérique saturé par les abonnements mensuels et les applications surchargées de publicités, {SITE_CONFIG.name} défend une vision simple : proposer des outils et des ouvrages clairs, que vous achetez une seule fois et que vous conservez durablement sur vos appareils.
          </p>
          <p>
            Qu’il s’agisse d’une application Android fonctionnant hors-ligne, d’un ebook d’architecture logicielle, d’un système d’organisation PDF ou d’un starter kit de code, chaque produit est testé sur de vrais appareils (smartphones Android, tablettes et ordinateurs) avant d’être publié au catalogue.
          </p>
        </div>
      </section>

      {/* Quality Commitments */}
      <section className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-10 space-y-8">
        <div className="max-w-2xl space-y-2">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
            Nos engagements envers chaque acheteur
          </h2>
          <p className="text-sm text-slate-600">
            La confiance de nos visiteurs repose sur la transparence des fiches produits et la sécurité du processus de commande.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
              <Smartphone className="w-4 h-4 text-blue-700" />
              <span>Priorité à l’expérience mobile et Android</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Nos applications, PDF interactifs et ebooks sont systématiquement vérifiés pour offrir une lecture et une prise en main confortables sur téléphone et tablette.
            </p>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
              <Lock className="w-4 h-4 text-blue-700" />
              <span>Paiement externalisé et sécurisé via Payhip</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Nous utilisons l’infrastructure reconnue de Payhip pour traiter les paiements et livrer les fichiers. Aucune coordonnée bancaire ne transite par notre site vitrine.
            </p>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
              <Download className="w-4 h-4 text-blue-700" />
              <span>Accès immédiat sans création de compte</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Vous n’avez pas besoin de créer un mot de passe ni de remplir de longs formulaires. Dès le paiement validé, votre téléchargement démarre immédiatement.
            </p>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
              <Check className="w-4 h-4 text-blue-700" />
              <span>Fiches descriptives fidèles et détaillées</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Chaque produit indique clairement son format exact (APK, PDF, EPUB, ZIP), sa taille, sa version et les appareils compatibles avant tout clic d’achat.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#FAF9F6] border border-slate-200/90 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
            Prêt à découvrir nos ressources ?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Parcourez notre catalogue ou contactez-nous directement pour toute question technique.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('products')}
            className="min-h-[44px] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Voir les produits</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('contact')}
            className="min-h-[44px] px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Nous contacter
          </button>
        </div>
      </section>
    </div>
  );
}
