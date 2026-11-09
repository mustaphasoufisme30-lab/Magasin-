import { useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  CategoryId,
  createSlug,
  DigitalProduct,
  formatProductPrice,
  getCategoryLabel,
  INITIAL_PRODUCTS,
} from '../data/products';
import {
  ADMIN_EMAIL,
  auth,
  db,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';

const INITIAL_SEEDED_KEY = 'mahfoud_firestore_initial_seeded_v1';

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
 * afin de respecter la limite de 1 Mo de Firestore tout en conservant une excellente netteté.
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
        const maxDimension = 900;
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
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedDataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

function mapDocToDigitalProduct(data: Record<string, unknown>): DigitalProduct {
  const price = typeof data.price === 'number' ? data.price : Number(data.price) || 0;
  const currency = typeof data.currency === 'string' ? data.currency : 'USD';
  const shortDesc = typeof data.shortDescription === 'string' ? data.shortDescription.trim() : '';
  const formatStr = typeof data.format === 'string' ? data.format.trim() : '';
  const imgStr = typeof data.image === 'string' ? data.image.trim() : '';

  const fullDescArr = Array.isArray(data.fullDescription)
    ? data.fullDescription.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
    : [];
  const featuresArr = Array.isArray(data.features)
    ? data.features.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
    : [];
  const compatArr = Array.isArray(data.compatibility)
    ? data.compatibility.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
    : [];

  return {
    id: String(data.id || ''),
    slug: String(data.slug || data.id || ''),
    name: String(data.name || ''),
    category: (data.category as Exclude<CategoryId, 'all'>) || 'applications',
    categoryLabel: String(data.categoryLabel || 'Applications'),
    price,
    currency,
    formattedPrice:
      typeof data.formattedPrice === 'string' && data.formattedPrice
        ? data.formattedPrice
        : formatProductPrice(price, currency),
    payhipUrl: String(data.payhipUrl || ''),
    image: imgStr || undefined,
    imageAlt: String(data.imageAlt || data.name || 'Produit'),
    shortDescription: shortDesc || undefined,
    fullDescription: fullDescArr.length > 0 ? fullDescArr : undefined,
    features: featuresArr.length > 0 ? featuresArr : undefined,
    format: formatStr || undefined,
    compatibility: compatArr.length > 0 ? compatArr : undefined,
    popular: Boolean(data.popular),
    visible: data.visible !== false,
  };
}

export function useCatalog() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [firestoreProducts, setFirestoreProducts] = useState<DigitalProduct[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const seedingRef = useRef(false);

  const isOwnerAdmin =
    Boolean(currentUser) &&
    currentUser?.email === ADMIN_EMAIL &&
    currentUser?.emailVerified === true;

  // 1. Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore listener on /products
  useEffect(() => {
    if (!isAuthReady) return;

    const productsRef = collection(db, 'products');
    // Verified owner receives all products (visible & hidden); public visitors receive visible products
    const targetQuery = isOwnerAdmin
      ? productsRef
      : query(productsRef, where('visible', '==', true));

    const unsubscribe = onSnapshot(
      targetQuery,
      async (snapshot) => {
        const docs = snapshot.docs.map((d) =>
          mapDocToDigitalProduct(d.data() as Record<string, unknown>)
        );

        // Auto-seed the initial real product into Firestore on first owner login if collection is empty
        const alreadySeeded =
          typeof window !== 'undefined' &&
          window.localStorage.getItem(INITIAL_SEEDED_KEY) === 'true';

        if (
          isOwnerAdmin &&
          auth.currentUser &&
          docs.length === 0 &&
          !alreadySeeded &&
          !seedingRef.current
        ) {
          seedingRef.current = true;
          try {
            const firstProd = INITIAL_PRODUCTS[0];
            await setDoc(doc(db, 'products', firstProd.id), {
              id: firstProd.id,
              slug: firstProd.slug,
              name: firstProd.name,
              category: firstProd.category,
              categoryLabel: firstProd.categoryLabel,
              price: firstProd.price,
              currency: firstProd.currency,
              formattedPrice: firstProd.formattedPrice,
              payhipUrl: firstProd.payhipUrl,
              image: firstProd.image || '',
              imageAlt: firstProd.imageAlt,
              shortDescription: firstProd.shortDescription || '',
              fullDescription: firstProd.fullDescription || [],
              features: firstProd.features || [],
              format: firstProd.format || '',
              compatibility: firstProd.compatibility || [],
              popular: true,
              visible: true,
              ownerId: auth.currentUser.uid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            if (typeof window !== 'undefined') {
              window.localStorage.setItem(INITIAL_SEEDED_KEY, 'true');
            }
          } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, `products/${INITIAL_PRODUCTS[0].id}`);
          } finally {
            seedingRef.current = false;
          }
          return;
        }

        if (docs.length > 0 && typeof window !== 'undefined') {
          window.localStorage.setItem(INITIAL_SEEDED_KEY, 'true');
        }

        setFirestoreProducts(docs);
        setIsLoading(false);
      },
      (error) => {
        setIsLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'products');
      }
    );

    return () => unsubscribe();
  }, [isAuthReady, isOwnerAdmin]);

  // If Firestore has not been seeded yet by the owner's first login, display INITIAL_PRODUCTS
  const hasBeenSeeded =
    typeof window !== 'undefined' &&
    window.localStorage.getItem(INITIAL_SEEDED_KEY) === 'true';

  const allProducts: DigitalProduct[] =
    firestoreProducts !== null && (firestoreProducts.length > 0 || hasBeenSeeded)
      ? firestoreProducts
      : INITIAL_PRODUCTS;

  const visibleProducts = allProducts.filter((p) => p.visible !== false);

  // Helper to ensure the initial product exists in Firestore before mutating it if not yet seeded
  const ensureInitialProductInFirestore = async (targetId: string) => {
    if (!auth.currentUser) return;
    const isInitial = INITIAL_PRODUCTS.some((p) => p.id === targetId);
    const existsInSnap = firestoreProducts?.some((p) => p.id === targetId);
    if (isInitial && !existsInSnap) {
      const firstProd = INITIAL_PRODUCTS[0];
      await setDoc(doc(db, 'products', firstProd.id), {
        id: firstProd.id,
        slug: firstProd.slug,
        name: firstProd.name,
        category: firstProd.category,
        categoryLabel: firstProd.categoryLabel,
        price: firstProd.price,
        currency: firstProd.currency,
        formattedPrice: firstProd.formattedPrice,
        payhipUrl: firstProd.payhipUrl,
        image: firstProd.image || '',
        imageAlt: firstProd.imageAlt,
        shortDescription: firstProd.shortDescription || '',
        fullDescription: firstProd.fullDescription || [],
        features: firstProd.features || [],
        format: firstProd.format || '',
        compatibility: firstProd.compatibility || [],
        popular: true,
        visible: true,
        ownerId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(INITIAL_SEEDED_KEY, 'true');
      }
    }
  };

  // 3. Add a new product to Firestore
  const addProduct = useCallback(async (input: ProductFormInput): Promise<DigitalProduct> => {
    if (!auth.currentUser) {
      throw new Error('Vous devez être connecté avec le compte propriétaire.');
    }

    const baseSlug = (createSlug(input.name) || 'produit').slice(0, 90);
    const uniqueId = `${baseSlug}-${Date.now().toString(36)}`.replace(/[^a-zA-Z0-9_-]/g, '');

    const safeName = input.name.trim().slice(0, 200);
    const safePrice = Math.min(Math.max(Number(input.price) || 0, 0), 100000);
    const safeCurrency = input.currency || 'USD';
    const safeFormattedPrice = formatProductPrice(safePrice, safeCurrency).slice(0, 50);
    const safePayhipUrl = input.payhipUrl.trim().slice(0, 500);
    const safeImage = (input.image?.trim() || '').slice(0, 900000);
    const safeShortDesc = (input.shortDescription?.trim() || '').slice(0, 600);
    const safeFormat = (input.format?.trim() || '').slice(0, 200);

    const fullDescription = (input.fullDescriptionText || '')
      .split('\n')
      .map((line) => line.trim().slice(0, 2000))
      .filter(Boolean)
      .slice(0, 30);

    const features = (input.featuresText || '')
      .split('\n')
      .map((line) => line.trim().slice(0, 500))
      .filter(Boolean)
      .slice(0, 30);

    const compatibility = (input.compatibilityText || '')
      .split('\n')
      .map((line) => line.trim().slice(0, 300))
      .filter(Boolean)
      .slice(0, 20);

    const firestorePayload = {
      id: uniqueId,
      slug: uniqueId,
      name: safeName,
      category: input.category,
      categoryLabel: getCategoryLabel(input.category).slice(0, 100),
      price: safePrice,
      currency: safeCurrency,
      formattedPrice: safeFormattedPrice,
      payhipUrl: safePayhipUrl,
      image: safeImage,
      imageAlt: safeName.slice(0, 250),
      shortDescription: safeShortDesc,
      fullDescription,
      features,
      format: safeFormat,
      compatibility,
      popular: true,
      visible: Boolean(input.visible),
      ownerId: auth.currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      const alreadySeeded =
        typeof window !== 'undefined' &&
        window.localStorage.getItem(INITIAL_SEEDED_KEY) === 'true';
      if (!alreadySeeded) {
        await ensureInitialProductInFirestore(INITIAL_PRODUCTS[0].id);
      }
      await setDoc(doc(db, 'products', uniqueId), firestorePayload);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(INITIAL_SEEDED_KEY, 'true');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `products/${uniqueId}`);
    }

    return mapDocToDigitalProduct(firestorePayload);
  }, [firestoreProducts]);

  // 4. Update an existing product in Firestore
  const updateProduct = useCallback(
    async (id: string, input: ProductFormInput): Promise<void> => {
      if (!auth.currentUser) {
        throw new Error('Vous devez être connecté avec le compte propriétaire.');
      }

      const safeName = input.name.trim().slice(0, 200);
      const safePrice = Math.min(Math.max(Number(input.price) || 0, 0), 100000);
      const safeCurrency = input.currency || 'USD';
      const safeFormattedPrice = formatProductPrice(safePrice, safeCurrency).slice(0, 50);
      const safePayhipUrl = input.payhipUrl.trim().slice(0, 500);
      const safeImage = (input.image?.trim() || '').slice(0, 900000);
      const safeShortDesc = (input.shortDescription?.trim() || '').slice(0, 600);
      const safeFormat = (input.format?.trim() || '').slice(0, 200);

      const fullDescription = (input.fullDescriptionText || '')
        .split('\n')
        .map((line) => line.trim().slice(0, 2000))
        .filter(Boolean)
        .slice(0, 30);

      const features = (input.featuresText || '')
        .split('\n')
        .map((line) => line.trim().slice(0, 500))
        .filter(Boolean)
        .slice(0, 30);

      const compatibility = (input.compatibilityText || '')
        .split('\n')
        .map((line) => line.trim().slice(0, 300))
        .filter(Boolean)
        .slice(0, 20);

      try {
        await ensureInitialProductInFirestore(id);
        await updateDoc(doc(db, 'products', id), {
          name: safeName,
          category: input.category,
          categoryLabel: getCategoryLabel(input.category).slice(0, 100),
          price: safePrice,
          currency: safeCurrency,
          formattedPrice: safeFormattedPrice,
          payhipUrl: safePayhipUrl,
          image: safeImage,
          imageAlt: safeName.slice(0, 250),
          shortDescription: safeShortDesc,
          fullDescription,
          features,
          format: safeFormat,
          compatibility,
          popular: true,
          visible: Boolean(input.visible),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
      }
    },
    [firestoreProducts]
  );

  // 5. Toggle product visibility in Firestore
  const toggleProductVisibility = useCallback(
    async (id: string): Promise<void> => {
      if (!auth.currentUser) return;
      const target = allProducts.find((p) => p.id === id);
      if (!target) return;
      const nextVisible = target.visible === false ? true : false;

      try {
        await ensureInitialProductInFirestore(id);
        await updateDoc(doc(db, 'products', id), {
          visible: nextVisible,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
      }
    },
    [allProducts, firestoreProducts]
  );

  // 6. Delete a product from Firestore
  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    if (!auth.currentUser) return;
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(INITIAL_SEEDED_KEY, 'true');
      }
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  }, []);

  return {
    allProducts,
    visibleProducts,
    isLoading,
    currentUser,
    isAuthReady,
    isOwnerAdmin,
    addProduct,
    updateProduct,
    toggleProductVisibility,
    deleteProduct,
  };
}
