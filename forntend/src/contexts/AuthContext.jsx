import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // For demo: hardcode a user/tenant/token. Replace with real login later.
  const [auth, setAuth] = useState({
    user: { id: 'demoUser', name: 'Demo Admin' },
    tenantId: 'demoTenant',
    token: 'demo.jwt.token' // Replace with real JWT after login
  });
  return (
    <AuthContext.Provider value={{ ...auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
