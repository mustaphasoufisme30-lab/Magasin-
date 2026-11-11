import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  inMemoryPersistence,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  UserCredential,
} from 'firebase/auth';
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export const ADMIN_EMAIL = 'mustaphasoufisme@gmail.com';
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
export const FIREBASE_AUTH_SETTINGS_URL = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`;
export const FIREBASE_AUTH_PROVIDERS_URL = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`;

export function isVerifiedOwnerEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

testConnection();

async function ensureAuthPersistence() {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch {
    try {
      await setPersistence(auth, browserSessionPersistence);
    } catch {
      await setPersistence(auth, inMemoryPersistence);
    }
  }
}

export async function signInAsOwner(): Promise<UserCredential> {
  await ensureAuthPersistence();
  return signInWithPopup(auth, googleProvider);
}

export async function signInAsOwnerRedirect(): Promise<void> {
  await ensureAuthPersistence();
  await signInWithRedirect(auth, googleProvider);
}

export async function resolveRedirectSignIn(): Promise<UserCredential | null> {
  try {
    return await getRedirectResult(auth);
  } catch (error) {
    console.error('Firebase Redirect Auth Error:', error);
    throw error;
  }
}

export async function signOutOwner() {
  return signOut(auth);
}

export interface ParsedAuthError {
  code: string;
  message: string;
  isUnauthorizedDomain: boolean;
  isPopupBlocked: boolean;
  isOperationNotAllowed: boolean;
  currentHostname: string;
}

export function parseFirebaseAuthError(error: unknown): ParsedAuthError {
  const rawMessage = error instanceof Error ? error.message : String(error);
  const codeMatch = rawMessage.match(/\((auth\/[^)]+)\)/);
  const errorObj = error as { code?: string };
  const code = errorObj?.code || (codeMatch ? codeMatch[1] : 'auth/unknown');
  const currentHostname =
    typeof window !== 'undefined' ? window.location.hostname : 'laboutique.cfd';

  if (code === 'auth/unauthorized-domain' || rawMessage.includes('unauthorized-domain')) {
    return {
      code: 'auth/unauthorized-domain',
      message: `Le domaine actuel « ${currentHostname} » n’est pas encore autorisé dans Firebase Authentication.`,
      isUnauthorizedDomain: true,
      isPopupBlocked: false,
      isOperationNotAllowed: false,
      currentHostname,
    };
  }

  if (
    code === 'auth/popup-blocked' ||
    code === 'auth/cancelled-popup-request' ||
    rawMessage.includes('popup-blocked')
  ) {
    return {
      code: 'auth/popup-blocked',
      message:
        'La fenêtre de connexion Google a été bloquée par votre navigateur. Autorisez les popups ou utilisez le bouton de connexion par redirection ci-dessous.',
      isUnauthorizedDomain: false,
      isPopupBlocked: true,
      isOperationNotAllowed: false,
      currentHostname,
    };
  }

  if (code === 'auth/popup-closed-by-user' || rawMessage.includes('popup-closed-by-user')) {
    return {
      code: 'auth/popup-closed-by-user',
      message:
        'La fenêtre de connexion Google a été fermée avant la fin de l’authentification. Cliquez à nouveau sur le bouton pour choisir votre compte Google.',
      isUnauthorizedDomain: false,
      isPopupBlocked: true,
      isOperationNotAllowed: false,
      currentHostname,
    };
  }

  if (code === 'auth/operation-not-allowed' || rawMessage.includes('operation-not-allowed')) {
    return {
      code: 'auth/operation-not-allowed',
      message:
        'Le fournisseur de connexion Google n’est pas activé dans la console Firebase Authentication.',
      isUnauthorizedDomain: false,
      isPopupBlocked: false,
      isOperationNotAllowed: true,
      currentHostname,
    };
  }

  if (code === 'auth/network-request-failed' || rawMessage.includes('network-request-failed')) {
    return {
      code: 'auth/network-request-failed',
      message:
        'Erreur réseau lors de la communication avec Google / Firebase. Vérifiez votre connexion Internet ou désactivez temporairement votre bloqueur de suivi.',
      isUnauthorizedDomain: false,
      isPopupBlocked: false,
      isOperationNotAllowed: false,
      currentHostname,
    };
  }

  return {
    code,
    message: `Erreur d’authentification Firebase (${code}) : ${rawMessage}`,
    isUnauthorizedDomain: false,
    isPopupBlocked: true,
    isOperationNotAllowed: false,
    currentHostname,
  };
}
