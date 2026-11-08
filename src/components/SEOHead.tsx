import { useEffect } from 'react';
import { SITE_CONFIG } from '../config/siteConfig';
import { DigitalProduct } from '../data/products';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  product?: DigitalProduct | null;
  products: DigitalProduct[];
}

export function SEOHead({
  title,
  description,
  canonicalPath = '/',
  product = null,
  products,
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

    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);

    const origin = typeof window !== 'undefined' ? window.location.origin : SITE_CONFIG.domain;
    const canonicalUrl = `${origin}${canonicalPath}`;
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);

    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = canonicalUrl;

    // Structured Data JSON-LD for Google Rich Snippets & Google Ads alignment
    let scriptEl = document.getElementById('schema-json-ld') as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'schema-json-ld';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    if (product) {
      const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.shortDescription || `${product.name} - ${product.categoryLabel}`,
        sku: product.id,
        category: product.categoryLabel,
        image: product.image ? `${origin}${product.image}` : undefined,
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
      };
      scriptEl.textContent = JSON.stringify(productSchema);
    } else {
      const websiteSchema = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            name: SITE_CONFIG.name,
            url: origin,
            email: SITE_CONFIG.contactEmail,
            description: SITE_CONFIG.shortIntro,
          },
          {
            '@type': 'WebSite',
            name: SITE_CONFIG.name,
            url: origin,
            inLanguage: 'fr-FR',
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
                description: item.shortDescription || `${item.name} - ${item.categoryLabel}`,
                url: `${origin}/?product=${item.slug}`,
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
  }, [title, description, canonicalPath, product, products]);

  return null;
}
