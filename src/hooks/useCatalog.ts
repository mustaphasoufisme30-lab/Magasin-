import { useState, useEffect, useCallback } from 'react';
import {
  CategoryId,
  createSlug,
  DigitalProduct,
  formatProductPrice,
  getCategoryLabel,
  INITIAL_PRODUCTS,
} from '../data/products';

const CATALOG_STORAGE_KEY = 'mahfoud_digital_catalog_v1';

export interface ProductFormInput {
  name: string;
  category: Exclude<CategoryId, 'all'>;
  price: number;
  currency: string;
  payhipUrl: string;
  image?: string;
  shortDescription?: string;
  fullDescriptionText?: string;
  featuresText?: string;
  format?: string;
  compatibilityText?: string;
  visible: boolean;
}

/**
 * Redimensionne et compresse une photo téléversée depuis un téléphone ou un ordinateur
 * afin de garantir un affichage rapide et une sauvegarde fiable.
 */
export function processUploadedProductPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Impossible de lire le fichier image.'));
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error('Format d’image non valide.'));
      img.onload = () => {
        const maxDimension = 1000;
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.84);
        resolve(compressedDataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

function loadStoredProducts(): DigitalProduct[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const raw = window.localStorage.getItem(CATALOG_STORAGE_KEY);
    if (!raw) return INITIAL_PRODUCTS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return INITIAL_PRODUCTS;

    return parsed.map((item: DigitalProduct) => ({
      ...item,
      visible: item.visible !== false,
      formattedPrice:
        item.formattedPrice || formatProductPrice(Number(item.price) || 0, item.currency || 'USD'),
    }));
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function useCatalog() {
  const [products, setProducts] = useState<DigitalProduct[]>(loadStoredProducts);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(products));
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du catalogue :', err);
    }
  }, [products]);

  const visibleProducts = products.filter((p) => p.visible !== false);

  const addProduct = useCallback((input: ProductFormInput): DigitalProduct => {
    const baseSlug = createSlug(input.name) || `produit-${Date.now()}`;
    const uniqueId = `${baseSlug}-${Date.now().toString(36)}`;

    const fullDescription = (input.fullDescriptionText || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const features = (input.featuresText || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const compatibility = (input.compatibilityText || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const trimmedImage = input.image?.trim() || undefined;

    const newProduct: DigitalProduct = {
      id: uniqueId,
      slug: uniqueId,
      name: input.name.trim(),
      category: input.category,
      categoryLabel: getCategoryLabel(input.category),
      price: Number(input.price),
      currency: input.currency,
      formattedPrice: formatProductPrice(Number(input.price), input.currency),
      payhipUrl: input.payhipUrl.trim(),
      image: trimmedImage,
      imageAlt: input.name.trim(),
      shortDescription: input.shortDescription?.trim() || undefined,
      fullDescription: fullDescription.length > 0 ? fullDescription : undefined,
      features: features.length > 0 ? features : undefined,
      format: input.format?.trim() || undefined,
      compatibility: compatibility.length > 0 ? compatibility : undefined,
      popular: true,
      visible: input.visible,
    };

    setProducts((prev) => [...prev, newProduct]);
    return newProduct;
  }, []);

  const updateProduct = useCallback((id: string, input: ProductFormInput) => {
    const fullDescription = (input.fullDescriptionText || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const features = (input.featuresText || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const compatibility = (input.compatibilityText || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const trimmedImage = input.image?.trim() || undefined;

    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== id) return prod;
        return {
          ...prod,
          name: input.name.trim(),
          category: input.category,
          categoryLabel: getCategoryLabel(input.category),
          price: Number(input.price),
          currency: input.currency,
          formattedPrice: formatProductPrice(Number(input.price), input.currency),
          payhipUrl: input.payhipUrl.trim(),
          image: trimmedImage,
          imageAlt: input.name.trim(),
          shortDescription: input.shortDescription?.trim() || undefined,
          fullDescription: fullDescription.length > 0 ? fullDescription : undefined,
          features: features.length > 0 ? features : undefined,
          format: input.format?.trim() || undefined,
          compatibility: compatibility.length > 0 ? compatibility : undefined,
          visible: input.visible,
        };
      })
    );
  }, []);

  const toggleProductVisibility = useCallback((id: string) => {
    setProducts((prev) =>
      prev.map((prod) =>
        prod.id === id ? { ...prod, visible: prod.visible === false ? true : false } : prod
      )
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((prod) => prod.id !== id));
  }, []);

  return {
    allProducts: products,
    visibleProducts,
    addProduct,
    updateProduct,
    toggleProductVisibility,
    deleteProduct,
  };
}
