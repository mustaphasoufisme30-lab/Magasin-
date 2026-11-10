/**
 * Test runner specification verifying that all 12 "Dirty Dozen" payloads
 * return PERMISSION_DENIED against firestore.rules for both /products and /categories.
 */

export interface DirtyDozenTestCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  auth: {
    uid: string;
    email?: string;
    email_verified?: boolean;
  } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: DirtyDozenTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated Product Creation',
    operation: 'create',
    path: '/products/convertisseur-pdf-to-kpf',
    auth: null,
    payload: { name: 'Hack' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Non-Admin Authenticated Category Write',
    operation: 'create',
    path: '/categories/applications',
    auth: { uid: 'user-1', email: 'visitor@example.com', email_verified: true },
    payload: { label: 'Hack' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unverified Admin Email Spoof on Category',
    operation: 'create',
    path: '/categories/applications',
    auth: { uid: 'admin-1', email: 'mustaphasoufisme@gmail.com', email_verified: false },
    payload: { label: 'Spoofed' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow Field Injection on Category Create',
    operation: 'create',
    path: '/categories/applications',
    auth: { uid: 'admin-1', email: 'mustaphasoufisme@gmail.com', email_verified: true },
    payload: { ghostField: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'OwnerId Spoofing on Create',
    operation: 'create',
    path: '/products/convertisseur-pdf-to-kpf',
    auth: { uid: 'admin-1', email: 'mustaphasoufisme@gmail.com', email_verified: true },
    payload: { ownerId: 'other-uid' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'ID Mismatch Poisoning on Category',
    operation: 'create',
    path: '/categories/applications',
    auth: { uid: 'admin-1', email: 'mustaphasoufisme@gmail.com', email_verified: true },
    payload: { id: 'different-id' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Path ID Regex Violation',
    operation: 'create',
    path: '/products/invalid id!',
    auth: { uid: 'admin-1', email: 'mustaphasoufisme@gmail.com', email_verified: true },
    payload: { id: 'invalid id!' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'String Size Overflow',
    operation: 'create',
    path: '/products/convertisseur-pdf-to-kpf',
    auth: { uid: 'admin-1', email: 'mustaphasoufisme@gmail.com', email_verified: true },
    payload: { name: 'x'.repeat(250) },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Array Size Overflow',
    operation: 'create',
    path: '/products/convertisseur-pdf-to-kpf',
    auth: { uid: 'admin-1', email: 'mustaphasoufisme@gmail.com', email_verified: true },
    payload: { features: new Array(35).fill('item') },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Client Timestamp Forgery',
    operation: 'create',
    path: '/products/convertisseur-pdf-to-kpf',
    auth: { uid: 'admin-1', email: 'mustaphasoufisme@gmail.com', email_verified: true },
    payload: { createdAt: '2020-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Immutable Field Mutation on Category Update',
    operation: 'update',
    path: '/categories/applications',
    auth: { uid: 'admin-1', email: 'mustaphasoufisme@gmail.com', email_verified: true },
    payload: { ownerId: 'mutated-owner' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Unauthorized Hidden Product Read',
    operation: 'get',
    path: '/products/hidden-product',
    auth: null,
    expectedResult: 'PERMISSION_DENIED',
  },
];
