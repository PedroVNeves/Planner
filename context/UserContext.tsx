import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getDB } from '../database';

export interface LocalUser {
  uid: string;
  displayName: string | null;
}

interface UserContextType {
  user: LocalUser | null;
  loading: boolean;
  updateUser: (newUserData: Partial<LocalUser>) => Promise<void>;
  refreshUser: () => void;
}

const UserContext = createContext<UserContextType>({} as UserContextType);

const db = getDB();

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  const setupLocalUser = useCallback(async () => {
    try {
      const userStats = await db.getFirstAsync<{ display_name: string }>(
        "SELECT display_name FROM user_stats WHERE id = 'user'"
      );

      const localUser: LocalUser = {
        uid: 'local-user-01',
        displayName: userStats?.display_name || 'Usuário',
      };
      setUser(localUser);
    } catch (error) {
      console.error("Failed to load user from database", error);
      setUser({
        uid: 'local-user-01',
        displayName: 'Usuário',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setupLocalUser();
  }, [setupLocalUser]);

  const updateUser = async (newUserData: Partial<LocalUser>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);

    try {
      if(newUserData.displayName) {
        await db.runAsync('UPDATE user_stats SET display_name = ? WHERE id = ?', [
          newUserData.displayName,
          'user',
        ]);
      }
    } catch (error) {
      console.error('Failed to update user in DB', error);
      // Optional: rollback UI update on error
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, updateUser, refreshUser: setupLocalUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);