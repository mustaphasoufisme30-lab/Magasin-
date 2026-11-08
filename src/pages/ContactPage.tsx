import { FormEvent, useState } from 'react';
import { ArrowUpRight, Check, Copy, Mail, Send } from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';
import { DigitalProduct } from '../data/products';

interface ContactPageProps {
  products: DigitalProduct[];
}

export function ContactPage({ products }: ContactPageProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Question sur un produit');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  const handleCopyEmail = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(SITE_CONFIG.contactEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  const mailtoHref = `mailto:${SITE_CONFIG.contactEmail}?subject=${encodeURIComponent(
    `[${SITE_CONFIG.name}] ${subject}${selectedProduct ? ` - ${selectedProduct}` : ''}`
  )}&body=${encodeURIComponent(
    `Nom : ${fullName}\nE-mail : ${email}\nProduit concerné : ${
      selectedProduct || 'Non spécifié'
    }\n\nMessage :\n${message}`
  )}`;

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <header className="space-y-3 border-b border-slate-200/80 pb-8">
        <p className="text-xs sm:text-sm font-medium text-blue-700">
          Support &amp; Renseignements
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Contactez {SITE_CONFIG.name}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          Une question technique avant d’acheter un produit ou besoin d’assistance après votre téléchargement sur Payhip ? Notre équipe vous répond sous 24 heures ouvrées.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column (7 cols): Functional Contact Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-xl p-6 sm:p-8">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="font-display text-xl font-bold text-slate-900">
                Envoyer un message
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-800">
                    Nom complet *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Votre nom"
                    className="w-full min-h-[44px] px-3.5 py-2 bg-[#FAF9F6] border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-800">
                    Adresse e-mail *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="w-full min-h-[44px] px-3.5 py-2 bg-[#FAF9F6] border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="contact-subject" className="block text-xs font-semibold text-slate-800">
                    Objet de la demande
                  </label>
                  <select
                    id="contact-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 bg-[#FAF9F6] border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-700"
                  >
                    <option value="Question sur un produit">Question avant achat</option>
                    <option value="Assistance au téléchargement">Assistance au téléchargement Payhip</option>
                    <option value="Support technique Android / PDF">Support technique (Android / PDF / Code)</option>
                    <option value="Autre demande">Autre demande</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contact-product" className="block text-xs font-semibold text-slate-800">
                    Produit concerné (optionnel)
                  </label>
                  <select
                    id="contact-product"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 bg-[#FAF9F6] border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-700"
                  >
                    <option value="">Sélectionner un produit...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-800">
                  Votre message *
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Précisez votre question ou le numéro de reçu Payhip si vous avez déjà effectué un achat..."
                  className="w-full p-3.5 bg-[#FAF9F6] border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-700 resize-y"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto min-h-[48px] px-6 py-3 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Préparer et envoyer le message</span>
              </button>
            </form>
          ) : (
            <div className="space-y-5 py-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Votre message est prêt
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Merci <strong>{fullName}</strong>. Votre demande concernant « <strong>{subject}</strong> » a bien été enregistrée. Vous pouvez également l’expédier directement via votre application de messagerie en un clic ci-dessous pour recevoir une copie de suivi sur <strong>{email}</strong>.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={mailtoHref}
                  className="min-h-[44px] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Ouvrir dans mon application e-mail</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setMessage('');
                  }}
                  className="min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Envoyer un autre message
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Direct Contact Details & Socials */}
        <div className="lg:col-span-5 space-y-6">
          {/* Direct Email Box */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Coordonnées directes
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Vous préférez nous écrire directement ? Envoyez un e-mail à l’adresse ci-dessous :
            </p>

            <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-slate-200/80 flex items-center justify-between gap-2">
              <a
                href={`mailto:${SITE_CONFIG.contactEmail}`}
                className="font-mono-tabular text-xs sm:text-sm font-semibold text-slate-900 hover:text-blue-700 truncate"
              >
                {SITE_CONFIG.contactEmail}
              </a>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="min-h-[36px] px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 inline-flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-blue-700" />
                    <span>Copié</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-500">{SITE_CONFIG.supportHours}</p>
          </div>

          {/* Official Links & Social Networks */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Liens officiels &amp; réseaux
            </h2>
            <ul className="divide-y divide-slate-100">
              {SITE_CONFIG.socials.map((soc) => (
                <li key={soc.name} className="py-3 first:pt-0 last:pb-0">
                  <a
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-sm group"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors block">
                        {soc.name}
                      </span>
                      <span className="text-xs text-slate-500">{soc.handle}</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
