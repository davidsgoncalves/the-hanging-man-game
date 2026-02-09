type FirebaseAuthClient = {
  onAuthStateChanged: (
    callback: (user: FirebaseUser | null) => void,
  ) => () => void;
  signInWithPopup: (provider: unknown) => Promise<void>;
  signOut: () => Promise<void>;
  currentUser: FirebaseUser | null;
};

type FirebaseAuthFactory = (() => FirebaseAuthClient) & {
  GoogleAuthProvider: new () => unknown;
};

type FirebaseFirestoreFactory = (() => FirebaseFirestore) & {
  FieldValue: {
    serverTimestamp: () => unknown;
  };
};

type FirebaseCompat = {
  apps: unknown[];
  initializeApp: (config: Record<string, string>) => unknown;
  auth: FirebaseAuthFactory;
  firestore: FirebaseFirestoreFactory;
};

export type FirebaseUser = {
  uid: string;
  displayName?: string | null;
  email?: string | null;
};

export type FirebaseFirestore = {
  collection: (path: string) => {
    add: (data: Record<string, unknown>) => Promise<{ id: string }>;
    doc: (id: string) => FirebaseDocRef;
  };
  runTransaction: <T>(
    updateFunction: (transaction: FirebaseTransaction) => Promise<T>,
  ) => Promise<T>;
};

export type FirebaseDocRef = {
  onSnapshot: (
    next: (snapshot: FirebaseSnapshot) => void,
    error?: (err: unknown) => void,
  ) => () => void;
  update: (data: Record<string, unknown>) => Promise<void>;
};

export type FirebaseSnapshot = {
  exists: boolean;
  data: () => Record<string, unknown>;
};

export type FirebaseTransaction = {
  get: (ref: FirebaseDocRef) => Promise<FirebaseSnapshot>;
  update: (ref: FirebaseDocRef, data: Record<string, unknown>) => void;
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

const getFirebaseCompat = (): FirebaseCompat | null => {
  if (typeof window === "undefined") return null;
  const firebase = (window as unknown as { firebase?: FirebaseCompat }).firebase;
  if (!firebase) return null;
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  return firebase;
};

export const getAuthClient = () => getFirebaseCompat()?.auth() ?? null;

export const getDbClient = () => getFirebaseCompat()?.firestore() ?? null;

export const getGoogleProvider = () => {
  const firebase = getFirebaseCompat();
  if (!firebase) return null;
  return new firebase.auth.GoogleAuthProvider();
};

export const getServerTimestamp = () => {
  const firebase = getFirebaseCompat();
  return firebase?.firestore.FieldValue.serverTimestamp() ?? null;
};
