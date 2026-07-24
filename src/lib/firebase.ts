import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Expense, AuditLog, UserProfile } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get Firestore Database instance with specified database ID
export const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || '(default)'
);

// Get Firebase Auth instance
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// --- Auth Operations ---

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  };
}

/**
 * Sign in with Email and Password
 */
export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  const user = result.user;
  return {
    uid: user.uid,
    displayName: user.displayName || email.split('@')[0],
    email: user.email,
    photoURL: user.photoURL,
  };
}

/**
 * Register with Email and Password
 */
export async function registerWithEmail(email: string, pass: string): Promise<UserProfile> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  const user = result.user;
  return {
    uid: user.uid,
    displayName: user.displayName || email.split('@')[0],
    email: user.email,
    photoURL: user.photoURL,
  };
}

/**
 * Sign Out
 */
export async function logoutFirebase(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribe to Auth state changes
 */
export function subscribeAuthState(callback: (user: UserProfile | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, (firebaseUser: User | null) => {
    if (firebaseUser) {
      callback({
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Thành viên',
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
      });
    } else {
      callback(null);
    }
  });
}

// Collections
const EXPENSES_COLLECTION = 'expenses';
const MONTHS_COLLECTION = 'months';
const AUDIT_LOGS_COLLECTION = 'auditLogs';

// --- Realtime Subscriptions ---

/**
 * Subscribe to real-time expenses list in Firestore
 */
export function subscribeExpenses(
  onUpdate: (expenses: Expense[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  try {
    const q = query(collection(db, EXPENSES_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: Expense[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Expense;
          items.push({
            ...data,
            id: docSnap.id, // Ensure document ID matches expense ID
          });
        });
        // Sort by createdAt descending or date descending
        items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        onUpdate(items);
      },
      (err) => {
        console.warn('Firestore expenses snapshot error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to expenses:', err);
    return () => {};
  }
}

/**
 * Subscribe to real-time months list in Firestore
 */
export function subscribeMonths(
  onUpdate: (months: string[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  try {
    const q = query(collection(db, MONTHS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const set = new Set<string>();
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.monthKey) {
            set.add(data.monthKey);
          }
        });
        const arr = Array.from(set).sort().reverse();
        onUpdate(arr);
      },
      (err) => {
        console.warn('Firestore months snapshot error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to months:', err);
    return () => {};
  }
}

/**
 * Subscribe to real-time audit logs in Firestore
 */
export function subscribeAuditLogs(
  onUpdate: (logs: AuditLog[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  try {
    const q = query(collection(db, AUDIT_LOGS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: AuditLog[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as AuditLog;
          items.push({
            ...data,
            id: docSnap.id,
          });
        });
        items.sort((a, b) => b.timestamp - a.timestamp);
        onUpdate(items);
      },
      (err) => {
        console.warn('Firestore audit logs snapshot error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to audit logs:', err);
    return () => {};
  }
}

// --- Helper to clean undefined fields for Firestore ---

/**
 * Recursively removes undefined fields from an object to satisfy Firestore data requirements
 */
function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      result[key] = sanitizeForFirestore(value);
    }
  }
  return result as T;
}

// --- Sync Operations ---

/**
 * Save or Update an Expense to Firestore
 */
export async function syncSaveExpense(expense: Expense): Promise<void> {
  try {
    const ref = doc(db, EXPENSES_COLLECTION, expense.id);
    await setDoc(ref, sanitizeForFirestore(expense), { merge: true });

    // Also register monthKey to months collection
    if (expense.date) {
      const monthKey = expense.date.substring(0, 7);
      await syncAddMonth(monthKey);
    }
  } catch (e) {
    console.error('Error saving expense to Firestore:', e);
  }
}

/**
 * Delete an Expense from Firestore
 */
export async function syncDeleteExpense(expenseId: string): Promise<void> {
  try {
    const ref = doc(db, EXPENSES_COLLECTION, expenseId);
    await deleteDoc(ref);
  } catch (e) {
    console.error('Error deleting expense from Firestore:', e);
  }
}

/**
 * Add a month key to Firestore
 */
export async function syncAddMonth(monthKey: string): Promise<void> {
  try {
    const ref = doc(db, MONTHS_COLLECTION, monthKey);
    await setDoc(ref, sanitizeForFirestore({ monthKey }), { merge: true });
  } catch (e) {
    console.error('Error saving month to Firestore:', e);
  }
}

/**
 * Delete a month key from Firestore
 */
export async function syncDeleteMonth(monthKey: string): Promise<void> {
  try {
    const ref = doc(db, MONTHS_COLLECTION, monthKey);
    await deleteDoc(ref);
  } catch (e) {
    console.error('Error deleting month from Firestore:', e);
  }
}

/**
 * Save an AuditLog entry to Firestore
 */
export async function syncSaveAuditLog(log: AuditLog): Promise<void> {
  try {
    const ref = doc(db, AUDIT_LOGS_COLLECTION, log.id);
    await setDoc(ref, sanitizeForFirestore(log), { merge: true });
  } catch (e) {
    console.error('Error saving audit log to Firestore:', e);
  }
}
