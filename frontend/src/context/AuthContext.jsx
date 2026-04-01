import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

function getCouponStorageKey(user) {
  if (!user) return null;
  const identity = user.id ?? user.email ?? 'guest';
  return `neocart_coupons_${identity}`;
}

function loadCoupons(user) {
  const key = getCouponStorageKey(user);
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCoupons(user, coupons) {
  const key = getCouponStorageKey(user);
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(coupons));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    authApi
      .session()
      .then((res) => {
        if (res.data?.authenticated) {
          const sessionUser = res.data.user;
          setUser(sessionUser);
          setCoupons(loadCoupons(sessionUser));
        }
      })
      .finally(() => setReady(true));
  }, []);

  const login = async (payload) => {
    const res = await authApi.login(payload);
    const nextUser = res.data.user;
    setUser(nextUser);
    setCoupons(loadCoupons(nextUser));
    return res;
  };

  const adminLogin = async (payload) => {
    const res = await authApi.adminLogin(payload);
    const nextUser = res.data.user;
    setUser(nextUser);
    setCoupons(loadCoupons(nextUser));
    return res;
  };

  const register = async (payload) => {
    const res = await authApi.register(payload);
    return res;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setCoupons([]);
  };

  const updateProfile = async (payload) => {
    const res = await authApi.updateProfile(payload);
    const nextUser = res.data?.data;
    if (nextUser) {
      setUser(nextUser);
      setCoupons(loadCoupons(nextUser));
    }
    return res;
  };

  const addCoupon = (coupon) => {
    if (!user || !coupon?.code) return false;
    const exists = coupons.some((item) => item.code === coupon.code);
    if (exists) return false;
    const nextCoupons = [...coupons, { ...coupon, collected_at: new Date().toISOString() }];
    setCoupons(nextCoupons);
    saveCoupons(user, nextCoupons);
    return true;
  };

  const removeCoupon = (code) => {
    if (!user) return;
    const nextCoupons = coupons.filter((item) => item.code !== code);
    setCoupons(nextCoupons);
    saveCoupons(user, nextCoupons);
  };

  const value = useMemo(
    () => ({
      user,
      ready,
      coupons,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      login,
      adminLogin,
      register,
      logout,
      updateProfile,
      addCoupon,
      removeCoupon,
    }),
    [user, ready, coupons]
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
