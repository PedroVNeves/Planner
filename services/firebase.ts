import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeAuth, 
  getReactNativePersistence, 
  getAuth 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Configuração Web - PismaPlan
const firebaseConfig = {
  apiKey: "AIzaSyDgOMT8YGup7ZP0KHhkHwWPrfXSPU-RmlY",
  authDomain: "pismaplan.firebaseapp.com",
  projectId: "pismaplan",
  storageBucket: "pismaplan.firebasestorage.app",
  messagingSenderId: "1036185808762",
  appId: "1:1036185808762:web:4fb2abab835f44281a70c3",
  measurementId: "G-6P4SYJ6RQF"
};

// 1. Inicializa o App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Inicializa o Auth com PERSISTÊNCIA
// Isso evita que o auth.currentUser comece como null ao recarregar o app
const auth = initializeAuth(app, {























  
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// 3. Inicializa o Firestore
const db = getFirestore(app);

console.log("🔥 [Firebase] App, Auth e Firestore prontos com Persistência");

export { auth, db };