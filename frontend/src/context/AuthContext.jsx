import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    authApi
      .session()
      .then((res) => {
        if (res.data?.authenticated) {
          setUser(res.data.user);
        }
      })
      .finally(() => setReady(true));
  }, []);

  const login = async (payload) => {
    const res = await authApi.login(payload);
    setUser(res.data.user);
    return res;
  };

  const register = async (payload) => {
    const res = await authApi.register(payload);
    setUser(res.data.user);
    return res;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, ready, isAuthenticated: Boolean(user), isAdmin: user?.role === 'admin', login, register, logout }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
