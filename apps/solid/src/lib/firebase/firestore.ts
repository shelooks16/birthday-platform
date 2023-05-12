import { getFirestore } from 'firebase/firestore';
import { app } from './app';

export const firestore = getFirestore(app);

export {
  connectFirestoreEmulator,
  doc,
  collection,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  limitToLast,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField
} from 'firebase/firestore';
