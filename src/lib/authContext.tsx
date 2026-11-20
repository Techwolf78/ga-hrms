import React, { createContext, useContext, useState, useEffect } from "react";
import { CurrentUser, UserRole } from "../types/hrms";
import { storage, STORAGE_KEYS } from "./storage";
import { DEFAULT_USER } from "./storageInit";
import {
  signInWithGoogle,
  signInWithEmail,
  firebaseSignOut,
  subscribeToAuth,
} from "./firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase/config";

interface AuthContextType {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, role: UserRole, customUser?: CurrentUser) => void;
  loginWithGoogle: () => Promise<CurrentUser>;
  loginWithEmailPassword: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  switchPersona: (personaKey: string) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_USERS: Record<UserRole, CurrentUser> = {
  SUPER_ADMIN: {
    id: "usr-admin-01",
    name: "System Admin",
    email: "admin@ga-hrms.io",
    role: "SUPER_ADMIN",
    avatar: "",
    designation: "System Administrator",
    department: "System Administration",
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

export const DEMO_PERSONAS: Record<string, CurrentUser> = {
  SUPER_ADMIN: DEMO_USERS.SUPER_ADMIN,
  HR_ADMIN: DEMO_USERS.HR_ADMIN,
  MANAGER: DEMO_USERS.MANAGER,
  EMPLOYEE: DEMO_USERS.EMPLOYEE,
  NEW_HIRE: {
    id: "EMP-1033",
    name: "Ramesh Patil",
    email: "ramesh.patil@ga-hrms.io",
    role: "EMPLOYEE",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    employeeId: "EMP-1033",
    designation: "Full Stack Developer",
    department: "Engineering & Cloud Platforms",
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CurrentUser | null>(() => {
    return storage.get<CurrentUser | null>(STORAGE_KEYS.USER, DEFAULT_USER);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state with storage updates
  useEffect(() => {
    const unsubscribe = storage.subscribe(({ key, value }) => {
      if (key === STORAGE_KEYS.USER) {
        setUser(value);
      }
    });
    return unsubscribe;
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubAuth = subscribeToAuth(async (fbUser) => {
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", fbUser.uid));
          if (userDoc.exists()) {
            const hrmsUser = userDoc.data() as CurrentUser;
            storage.set(STORAGE_KEYS.USER, hrmsUser);
            setUser(hrmsUser);
          }
        } catch (e) {
          console.warn("Could not fetch user profile from Firestore:", e);
        }
      }
    });
    return unsubAuth;
  }, []);

  const clearError = () => setError(null);

  const loginWithGoogle = async (): Promise<CurrentUser> => {
    setIsLoading(true);
    setError(null);
    try {
      const { hrmsUser } = await signInWithGoogle();
      storage.set(STORAGE_KEYS.USER, hrmsUser);
      setUser(hrmsUser);
      setIsLoading(false);
      return hrmsUser;
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.message || "Failed to sign in with Google.";
      setError(msg);
      throw err;
    }
  };

  const loginWithEmailPassword = async (emailInput: string, pass: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const fbUser = await signInWithEmail(emailInput, pass);
      const userDoc = await getDoc(doc(db, "users", fbUser.uid));
      let hrmsUser: CurrentUser;
      if (userDoc.exists()) {
        hrmsUser = userDoc.data() as CurrentUser;
      } else {
        hrmsUser = {
          id: fbUser.uid,
          name: fbUser.displayName || emailInput.split("@")[0],
          email: fbUser.email || emailInput,
          role: "EMPLOYEE",
          avatar: fbUser.photoURL || "",
          employeeId: `EMP-${fbUser.uid.substring(0, 5).toUpperCase()}`,
          designation: "Staff Member",
          department: "General",
        };
      }
      storage.set(STORAGE_KEYS.USER, hrmsUser);
      setUser(hrmsUser);
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.message || "Failed to sign in. Please check your email and password.";
      setError(msg);
      throw err;
    }
  };

  const login = (email: string, role: UserRole, customUser?: CurrentUser) => {
    let demoUser: CurrentUser;
    if (customUser) {
      demoUser = customUser;
    } else if (email === "ramesh.patil@ga-hrms.io") {
      demoUser = DEMO_PERSONAS.NEW_HIRE;
    } else {
      demoUser = DEMO_USERS[role] || {
        ...DEFAULT_USER,
        email,
        role,
      };
    }
    storage.set(STORAGE_KEYS.USER, demoUser);
    setUser(demoUser);
  };

  const logout = async () => {
    try {
      await firebaseSignOut();
    } catch (e) {
      console.warn("Firebase signout error:", e);
    }
    storage.set<CurrentUser | null>(STORAGE_KEYS.USER, null);
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    const updated = DEMO_USERS[newRole];
    storage.set(STORAGE_KEYS.USER, updated);
    setUser(updated);
  };

  const switchPersona = (personaKey: string) => {
    const persona = DEMO_PERSONAS[personaKey];
    if (persona) {
      storage.set(STORAGE_KEYS.USER, persona);
      setUser(persona);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        loginWithGoogle,
        loginWithEmailPassword,
        logout,
        switchRole,
        switchPersona,
        clearError,
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
