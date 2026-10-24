import { createContext, useContext, useState, type ReactNode } from 'react';

export type Role = 'resident' | 'official';
const Session = createContext<{ role: Role | null; setRole: (role: Role | null) => void } | null>(null);
export function SessionProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  return <Session.Provider value={{ role, setRole }}>{children}</Session.Provider>;
}
export function useSession() { const value = useContext(Session); if (!value) throw new Error('SessionProvider is required'); return value; }
