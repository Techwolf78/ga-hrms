import React, { createContext, useContext, useState, useEffect } from "react";
import { CurrentUser, UserRole } from "../types/hrms";
import { storage, STORAGE_KEYS } from "./storage";
import { DEFAULT_USER } from "./storageInit";

interface AuthContextType {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_USERS: Record<UserRole, CurrentUser> = {
  SUPER_ADMIN: {
    id: "EMP-1001",
    name: "Ajay Pawar",
    email: "ajay.pawar@ga-hrms.io",
    role: "SUPER_ADMIN",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    employeeId: "EMP-1001",
    designation: "VP of Engineering & Super Admin",
    department: "Engineering & Cloud Platforms",
  },
  HR_ADMIN: {
    id: "EMP-1002",
    name: "Priya Sharma",
    email: "priya.sharma@ga-hrms.io",
    role: "HR_ADMIN",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    employeeId: "EMP-1002",
    designation: "Senior HR Business Partner",
    department: "Human Resources & People Ops",
  },
  MANAGER: {
    id: "EMP-1003",
    name: "Rajesh Kulkarni",
    email: "rajesh.kulkarni@ga-hrms.io",
    role: "MANAGER",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    employeeId: "EMP-1003",
    designation: "Lead Architect & People Manager",
    department: "Engineering & Cloud Platforms",
  },
  EMPLOYEE: {
    id: "EMP-1004",
    name: "Ananya Iyer",
    email: "ananya.iyer@ga-hrms.io",
    role: "EMPLOYEE",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    employeeId: "EMP-1004",
    designation: "Senior Software Engineer",
    department: "Engineering & Cloud Platforms",
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CurrentUser | null>(() => {
    return storage.get<CurrentUser | null>(STORAGE_KEYS.USER, DEFAULT_USER);
  });

  useEffect(() => {
    const unsubscribe = storage.subscribe(({ key, value }) => {
      if (key === STORAGE_KEYS.USER) {
        setUser(value);
      }
    });
    return unsubscribe;
  }, []);

  const login = (email: string, role: UserRole) => {
    const demoUser = DEMO_USERS[role] || {
      ...DEFAULT_USER,
      email,
      role,
    };
    storage.set(STORAGE_KEYS.USER, demoUser);
    setUser(demoUser);
  };

  const logout = () => {
    storage.set<CurrentUser | null>(STORAGE_KEYS.USER, null);
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    const updated = DEMO_USERS[newRole];
    storage.set(STORAGE_KEYS.USER, updated);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
