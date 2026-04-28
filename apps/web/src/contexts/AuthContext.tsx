import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, getIdTokenResult, type User } from 'firebase/auth';
import { auth } from '../lib/firebase';

export interface PodeaClaims {
  studioId?: string;
  role?: 'platform_admin' | 'studio_admin' | 'practitioner' | 'frontdesk';
  tier?: 'trial' | 'premium';
}

interface AuthContextType {
  user: User | null;
  claims: PodeaClaims | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  claims: null,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<PodeaClaims | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch custom claims from the decoded JWT
        const tokenResult = await getIdTokenResult(currentUser, true);
        setClaims({
          studioId: tokenResult.claims.studioId as string | undefined,
          role: tokenResult.claims.role as PodeaClaims['role'] | undefined,
          tier: tokenResult.claims.tier as PodeaClaims['tier'] | undefined,
        });
      } else {
        setClaims(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, claims, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
