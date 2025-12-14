// src/types/firebase.d.ts
import 'firebase/auth';

declare module 'firebase/auth' {
  import type { Persistence } from 'firebase/auth';

  /**
   * Adiciona definição ausente para React Native AsyncStorage.
   */
  export function getReactNativePersistence(storage: any): Persistence;
}
