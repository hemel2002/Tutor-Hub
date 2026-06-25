"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/db";

export type UserRole = "parent" | "teacher" | "admin";

export interface UserSession {
  email: string;
  name: string;
  role: UserRole;
  id: string;
  isMock?: boolean;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  signOut: () => Promise<void>;
  signInWithMock: (role: UserRole) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Load session on mount
  useEffect(() => {
    async function initSession() {
      try {
        setLoading(true);
        
        // 1. First check Supabase Auth
        if (supabase) {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;

          if (session?.user) {
            const metadata = session.user.user_metadata;
            setUser({
              id: session.user.id,
              email: session.user.email || "",
              name: metadata.name || "Specialist User",
              role: (metadata.role as UserRole) || "parent",
              isMock: false,
            });
            setLoading(false);
            return;
          }
        }

        // 2. Fallback to localStorage session
        const storedUser = localStorage.getItem("tutor_hub_user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err: any) {
        console.error("Auth initialization error:", err);
      } finally {
        setLoading(false);
      }
    }

    initSession();
  }, []);

  const clearError = () => setError(null);

  // Sign In
  const signIn = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setLoading(true);

    try {
      if (supabase) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;

        if (data.user) {
          const metadata = data.user.user_metadata;
          const sessionUser: UserSession = {
            id: data.user.id,
            email: data.user.email || "",
            name: metadata.name || "Specialist User",
            role: (metadata.role as UserRole) || "parent",
            isMock: false,
          };
          setUser(sessionUser);
          localStorage.setItem("tutor_hub_user", JSON.stringify(sessionUser));
          setLoading(false);
          return true;
        }
      }
      
      // Local storage fallback / offline simulation if no supabase
      const mockAccounts = JSON.parse(localStorage.getItem("tutor_hub_mock_users") || "[]");
      const matched = mockAccounts.find((a: any) => a.email === email && a.password === password);
      
      if (matched) {
        const sessionUser: UserSession = {
          id: matched.id,
          email: matched.email,
          name: matched.name,
          role: matched.role,
          isMock: true,
        };
        setUser(sessionUser);
        localStorage.setItem("tutor_hub_user", JSON.stringify(sessionUser));
        setLoading(false);
        return true;
      }

      throw new Error("Invalid credentials. Try our Developer Quick-Login or Sign Up.");
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
      setLoading(false);
      return false;
    }
  };

  // Sign Up
  const signUp = async (email: string, password: string, name: string, role: UserRole): Promise<boolean> => {
    setError(null);
    setLoading(true);

    try {
      if (supabase) {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role,
            },
          },
        });

        if (authError) throw authError;

        if (data.user) {
          const sessionUser: UserSession = {
            id: data.user.id,
            email: data.user.email || "",
            name,
            role,
            isMock: false,
          };
          setUser(sessionUser);
          localStorage.setItem("tutor_hub_user", JSON.stringify(sessionUser));
          setLoading(false);
          return true;
        }
      }

      // Offline mock register fallback
      const mockAccounts = JSON.parse(localStorage.getItem("tutor_hub_mock_users") || "[]");
      if (mockAccounts.some((a: any) => a.email === email)) {
        throw new Error("An account with this email already exists.");
      }

      const newMockUser = {
        id: "mock_" + Math.random().toString(36).substr(2, 9),
        email,
        password, // stored in plain text purely for mock demo purposes
        name,
        role,
      };
      mockAccounts.push(newMockUser);
      localStorage.setItem("tutor_hub_mock_users", JSON.stringify(mockAccounts));

      const sessionUser: UserSession = {
        id: newMockUser.id,
        email: newMockUser.email,
        name: newMockUser.name,
        role: newMockUser.role,
        isMock: true,
      };
      setUser(sessionUser);
      localStorage.setItem("tutor_hub_user", JSON.stringify(sessionUser));
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
      setLoading(false);
      return false;
    }
  };

  // Sign Out
  const signOut = async () => {
    setLoading(true);
    try {
      if (supabase && user && !user.isMock) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error("Error signing out from Supabase:", err);
    } finally {
      setUser(null);
      localStorage.removeItem("tutor_hub_user");
      setLoading(false);
      router.push("/");
    }
  };

  // Developer Mock bypass
  const signInWithMock = (role: UserRole) => {
    setLoading(true);
    setError(null);
    const mockUser: UserSession = {
      id: `dev_${role}_${Math.random().toString(36).substr(2, 5)}`,
      email: `${role}@tutorhub.dev`,
      name: `Developer ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      role: role,
      isMock: true,
    };
    setUser(mockUser);
    localStorage.setItem("tutor_hub_user", JSON.stringify(mockUser));
    setLoading(false);
    
    // Redirect to respective dashboard
    router.push(`/${role}`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        signInWithMock,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Protected Route Component Wrapper
export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login with redirect parameter
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (!allowedRoles.includes(user.role)) {
        // Redirect to their default dashboard if role is incorrect
        router.replace(`/${user.role}`);
      } else {
        setAuthorized(true);
      }
    }
  }, [user, loading, allowedRoles, router, pathname]);

  if (loading || !authorized) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "var(--bg-cream)",
        color: "var(--text-navy)",
        fontFamily: "var(--font-outfit)"
      }}>
        <div className="spinner" style={{
          border: "4px solid rgba(46, 196, 182, 0.1)",
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          borderLeftColor: "var(--color-primary)",
          animation: "spin 1s linear infinite",
          marginBottom: "1rem"
        }} />
        <p style={{ fontWeight: 600 }}>Securing Connection...</p>
        <style jsx global>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}
