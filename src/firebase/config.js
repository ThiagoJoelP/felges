import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBSB80qI_B77sjk3gkin7iRbkE2GNENbSY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'felges.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'felges',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'felges.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1028185607490',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1028185607490:web:dc7d1559e66223e97a8cdb'
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export default app
