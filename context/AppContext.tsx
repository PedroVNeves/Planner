import React, { createContext, useContext, useState, useEffect } from 'react';

// Definição do Utilizador Local
export interface LocalUser {
  uid: string;
  displayName: string | null;
  email: string | null;
}

interface AppContextType {
  user: LocalUser | null;
  loading: boolean;
  setSessionUser: (user: LocalUser | null) => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulação de verificação de sessão local
    // Futuramente, você pode carregar o último usuário do SQLite aqui
    setLoading(false);
  }, []);

  // Função para login local
  const setSessionUser = (newUser: LocalUser | null) => {
    setUser(newUser);
  };

  return (
    <AppContext.Provider value={{ 
        user, 
        loading, 
        setSessionUser
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);