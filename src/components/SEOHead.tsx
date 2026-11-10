import { useEffect } from 'react';
import { SITE_CONFIG } from '../config/siteConfig';
import { DigitalProduct } from '../data/products';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  product?: DigitalProduct | null;
  products: DigitalProduct[];
  noindex?: boolean;
}

export function SEOHead({
  title,
  description,
  canonicalPath = '/',
  product = null,
  products,
  noindex = false,
}: SEOHeadProps) {
  useEffect(() => {
    document.title = title;

    const setMeta = (selector: string, attr: string, value: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        if (selector.includes('property=')) {
          const propMatch = selector.match(/property="([^"]+)"/);
          if (propMatch) element.setAttribute('property', propMatch[1]);
        } else if (selector.includes('name=')) {
          const nameMatch = selector.match(/name="([^"]+)"/);
          if (nameMatch) element.setAttribute('name', nameMatch[1]);
        }
        document.head.appendChild(element);
      }
      element.setAttribute(attr, value);
    };

    const baseDomain = SITE_CONFIG.domain.replace(/\/$/, '');
    const normalizedPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    const canonicalUrl = `${baseDomain}${normalizedPath}`;

    const resolveAbsoluteImage = (img?: string) => {
      if (!img || img.startsWith('data:') || img.startsWith('/src/')) {
        return SITE_CONFIG.defaultOgImage;
      }
      if (img.startsWith('http://') || img.startsWith('https://')) {
        return img;
      }
      return `${baseDomain}${img.startsWith('/') ? img : `/${img}`}`;
    };

    const shareImage = product ? resolveAbsoluteImage(product.image) : SITE_CONFIG.defaultOgImage;
    const shareImageAlt = product
      ? product.imageAlt || product.name
      : `${SITE_CONFIG.name} – Produits numériques téléchargeables via Payhip`;

    setMeta('meta[name="description"]', 'content', description);
    setMeta(
      'meta[name="robots"]',
      'content',
      noindex
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );

    // Open Graph
    setMeta('meta[property="og:type"]', 'content', product ? 'product' : 'website');
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);
    setMeta('meta[property="og:image"]', 'content', shareImage);
    setMeta('meta[property="og:image:alt"]', 'content', shareImageAlt);

    // Twitter Cards
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('meta[name="twitter:image"]', 'content', shareImage);
    setMeta('meta[name="twitter:image:alt"]', 'content', shareImageAlt);

    // Canonical link
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = canonicalUrl;

    // Hreflang links (fr & x-default)
    const updateHreflang = (lang: string, href: string) => {
      let linkEl = document.querySelector(
        `link[rel="alternate"][hreflang="${lang}"]`
      ) as HTMLLinkElement | null;
      if (!linkEl) {
        linkEl = document.createElement('link');
        linkEl.rel = 'alternate';
        linkEl.hreflang = lang;
        document.head.appendChild(linkEl);
      }
      linkEl.href = href;
    };
    updateHreflang('fr', canonicalUrl);
    updateHreflang('x-default', canonicalUrl);

    // Structured Data JSON-LD for Google Rich Snippets
    let scriptEl = document.getElementById('schema-json-ld') as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'schema-json-ld';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    if (product) {
      const productPageSchema = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Accueil',
                item: `${baseDomain}/`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Produits',
                item: `${baseDomain}/?page=products`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: product.name,
                item: canonicalUrl,
              },
            ],
          },
          {
            '@type': 'Product',
            name: product.name,
            description: product.shortDescription || `${product.name} - ${product.categoryLabel}`,
            sku: product.id,
            category: product.categoryLabel,
            image: resolveAbsoluteImage(product.image),
            url: canonicalUrl,
            brand: {
              '@type': 'Brand',
              name: SITE_CONFIG.name,
            },
            offers: {
              '@type': 'Offer',
              url: product.payhipUrl,
              priceCurrency: product.currency,
              price: product.price.toFixed(2),
              availability: 'https://schema.org/InStock',
              seller: {
                '@type': 'Organization',
                name: SITE_CONFIG.name,
              },
            },
          },
        ],
      };
      scriptEl.textContent = JSON.stringify(productPageSchema);
    } else {
      const websiteSchema = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': `${baseDomain}/#organization`,
            name: SITE_CONFIG.name,
            url: `${baseDomain}/`,
            logo: `${baseDomain}${SITE_CONFIG.logoUrl}`,
            email: SITE_CONFIG.contactEmail,
            description: SITE_CONFIG.shortIntro,
          },
          {
            '@type': 'WebSite',
            '@id': `${baseDomain}/#website`,
            name: SITE_CONFIG.name,
            url: `${baseDomain}/`,
            inLanguage: 'fr-FR',
            publisher: {
              '@id': `${baseDomain}/#organization`,
            },
            description: SITE_CONFIG.tagline,
          },
          {
            '@type': 'ItemList',
            name: 'Catalogue Mahfoud Digital Products',
            numberOfItems: products.length,
            itemListElement: products.map((item, idx) => ({
              '@type': 'ListItem',
              position: idx + 1,
              item: {
                '@type': 'Product',
                name: item.name,
                category: item.categoryLabel,
                image: resolveAbsoluteImage(item.image),
                description: item.shortDescription || `${item.name} - ${item.categoryLabel}`,
                url: `${baseDomain}/?product=${item.slug}`,
                brand: {
                  '@type': 'Brand',
                  name: SITE_CONFIG.name,
                },
                offers: {
                  '@type': 'Offer',
                  price: item.price.toFixed(2),
                  priceCurrency: item.currency,
                  availability: 'https://schema.org/InStock',
                  url: item.payhipUrl,
                },
              },
            })),
          },
        ],
      };
      scriptEl.textContent = JSON.stringify(websiteSchema);
    }
  }, [title, description, canonicalPath, product, products, noindex]);

  return null;
}
