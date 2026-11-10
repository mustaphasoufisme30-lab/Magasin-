/**
 * Structure centralisée des catégories et des produits numériques de Mahfoud Digital Products.
 * Contient uniquement les produits réels et les catégories initiales par défaut.
 */

export type CategoryId = string;

export interface CategoryItem {
  id: CategoryId;
  label: string;
  shortLabel: string;
  description: string;
  order?: number;
}

export interface ProductFAQ {
  question: string;
  answer: string;
}

export interface DigitalProduct {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  fullDescription?: string[];
  category: CategoryId;
  categoryLabel: string;
  price: number;
  currency: string;
  formattedPrice: string;
  payhipUrl: string;
  image?: string;
  imageAlt: string;
  popular: boolean;
  visible: boolean;
  features?: string[];
  importantInfo?: string[];
  compatibility?: string[];
  format?: string;
  fileSize?: string;
  version?: string;
  updatedAt?: string;
  downloadInfo?: string;
  faq?: ProductFAQ[];
}

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'Dollar ($ USD)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€ EUR)' },
  { code: 'GBP', symbol: '£', label: 'Livre (£ GBP)' },
  { code: 'CAD', symbol: '$ CA', label: 'Dollar canadien ($ CAD)' },
  { code: 'MAD', symbol: 'DH', label: 'Dirham (MAD)' },
  { code: 'DZD', symbol: 'DA', label: 'Dinar (DZD)' },
];

export function formatProductPrice(price: number, currency: string): string {
  const cleanPrice = Number.isInteger(price)
    ? price.toString()
    : price.toFixed(2).replace('.', ',');

  switch (currency) {
    case 'USD':
      return `${cleanPrice} $`;
    case 'EUR':
      return `${cleanPrice} €`;
    case 'GBP':
      return `${cleanPrice} £`;
    case 'CAD':
      return `${cleanPrice} $ CA`;
    case 'MAD':
      return `${cleanPrice} DH`;
    case 'DZD':
      return `${cleanPrice} DA`;
    default:
      return `${cleanPrice} ${currency}`;
  }
}

export const ALL_CATEGORY_ITEM: CategoryItem = {
  id: 'all',
  label: 'Tous les produits',
  shortLabel: 'Tous',
  description: 'Catalogue des produits numériques disponibles sur Mahfoud Digital Products.',
  order: -1,
};

export const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'applications',
    label: 'Applications',
    shortLabel: 'Applications',
    description: 'Applications et logiciels numériques disponibles en téléchargement via Payhip.',
    order: 0,
  },
  {
    id: 'ebooks',
    label: 'Livres numériques / Ebooks',
    shortLabel: 'Ebooks',
    description: 'Livres numériques et ouvrages téléchargeables.',
    order: 1,
  },
  {
    id: 'pdf',
    label: 'PDF',
    shortLabel: 'PDF',
    description: 'Documents et ressources au format PDF.',
    order: 2,
  },
  {
    id: 'programmation',
    label: 'Outils de programmation',
    shortLabel: 'Programmation',
    description: 'Outils et ressources pour la programmation.',
    order: 3,
  },
  {
    id: 'education',
    label: 'Produits éducatifs',
    shortLabel: 'Éducation',
    description: 'Supports et produits éducatifs numériques.',
    order: 4,
  },
  {
    id: 'outils',
    label: 'Modèles & Ressources numériques',
    shortLabel: 'Ressources',
    description: 'Modèles et ressources numériques.',
    order: 5,
  },
];

export const CATEGORIES: CategoryItem[] = [
  ALL_CATEGORY_ITEM,
  ...INITIAL_CATEGORIES,
];

export function getCategoryLabel(
  categoryId: CategoryId,
  customCategories: CategoryItem[] = CATEGORIES
): string {
  const found =
    customCategories.find((c) => c.id === categoryId) ||
    CATEGORIES.find((c) => c.id === categoryId);
  return found ? found.shortLabel : categoryId;
}

export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Premier produit réel officiel (ne jamais supprimer ni altérer par défaut)
 */
export const INITIAL_PRODUCTS: DigitalProduct[] = [
  {
    id: 'convertisseur-pdf-to-kpf',
    slug: 'convertisseur-pdf-to-kpf',
    name: 'Convertisseur PDF to KPF',
    category: 'applications',
    categoryLabel: 'Applications',
    price: 5,
    currency: 'USD',
    formattedPrice: '5 $',
    payhipUrl: 'https://payhip.com/b/8cbQk',
    image: '/src/assets/images/prod_dev_starter_kit_1794160075314.jpg',
    imageAlt: 'Application Convertisseur PDF to KPF disponible sur Mahfoud Digital Products',
    popular: true,
    visible: true,
  },
];

export const PRODUCTS: DigitalProduct[] = INITIAL_PRODUCTS;
