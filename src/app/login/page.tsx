"use client";

import React, { useState, useEffect } from "react";
import { useAuth, UserRole } from "@/components/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GraduationCap, AlertCircle, Zap, Key } from "lucide-react";

function LoginPageContent() {
  const { user, loading, error, signIn, signUp, signInWithMock, clearError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Tabs: login vs register
  const [isLogin, setIsLogin] = useState(true);
  
  // Selected role for registration and Quick Login
  const [selectedRole, setSelectedRole] = useState<UserRole>("parent");
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Get redirect path
  const redirectPath = searchParams.get("redirect") || "";

  // If user is already logged in, redirect them
  useEffect(() => {
    if (user && !loading) {
      if (redirectPath) {
        router.replace(decodeURIComponent(redirectPath));
      } else {
        router.replace(`/${user.role}`);
      }
    }
  }, [user, loading, router, redirectPath]);

  // Clear context error on toggle
  useEffect(() => {
    clearError();
    setFormError(null);
  }, [isLogin, selectedRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!email || !password) {
      setFormError("Please fill in all required fields.");
      return;
    }

    if (!isLogin && !name) {
      setFormError("Please enter your name to register.");
      return;
    }

    setSubmitting(true);
    try {
      let success = false;
      if (isLogin) {
        success = await signIn(email, password);
      } else {
        success = await signUp(email, password, name, selectedRole);
      }

      if (success) {
        // Successful login/register will trigger the useEffect to redirect
      }
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel">
        <div className="login-header">
          <div className="logo-badge" style={{ display: "inline-flex", justifyContent: "center", alignItems: "center", marginBottom: "0.5rem" }}>
            <GraduationCap size={48} style={{ color: "var(--color-primary)" }} />
          </div>
          <h1>Tutor Hub</h1>
          <p className="subtitle">
            {isLogin ? "Welcome back! Please sign in to your portal." : "Join our educational marketplace today."}
          </p>
        </div>

        {/* Role Selection Tabs for Registration */}
        {!isLogin && (
          <div className="role-tabs-container">
            <span className="role-label">I want to register as:</span>
            <div className="role-tabs">
              {(["parent", "teacher", "admin"] as UserRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  className={`role-tab ${selectedRole === role ? "active" : ""}`}
                  onClick={() => setSelectedRole(role)}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Messages */}
        {(error || formError) && (
          <div className="error-alert">
            <span className="error-icon" style={{ display: "inline-flex", alignItems: "center" }}>
              <AlertCircle size={16} />
            </span>
            <p>{formError || error}</p>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required={!isLogin}
              />
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary submit-btn" disabled={submitting}>
            {submitting ? (
              <span className="loading-spinner"></span>
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Toggle between login/register */}
        <div className="auth-toggle">
          {isLogin ? (
            <p>
              New to Tutor Hub?{" "}
              <button type="button" onClick={() => setIsLogin(false)}>
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button type="button" onClick={() => setIsLogin(true)}>
                Sign in
              </button>
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="divider">
          <span>DEVELOPER OPTIONS</span>
        </div>

        {/* Quick Dev Login Panel */}
        <div className="dev-panel">
          <p className="dev-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Zap size={16} /> Fast Track Developer Quick-Login
          </p>
          <p className="dev-desc">Instantly log into any portal using client-side mock credentials.</p>
          <div className="dev-buttons">
            <button
              type="button"
              className="dev-btn parent"
              onClick={() => signInWithMock("parent")}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Key size={14} /> Parent Portal
            </button>
            <button
              type="button"
              className="dev-btn teacher"
              onClick={() => signInWithMock("teacher")}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Key size={14} /> Teacher Portal
            </button>
            <button
              type="button"
              className="dev-btn admin"
              onClick={() => signInWithMock("admin")}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Key size={14} /> Admin Portal
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-cream);
          padding: 2rem 1rem;
          font-family: var(--font-outfit), sans-serif;
          color: var(--text-navy);
          background-image: radial-gradient(rgba(46, 196, 182, 0.08) 1.5px, transparent 1.5px);
          background-size: 24px 24px;
        }

        .login-card {
          width: 100%;
          max-width: 480px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-badge {
          font-size: 3rem;
          margin-bottom: 0.5rem;
          display: inline-block;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        h1 {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-navy);
          margin-bottom: 0.5rem;
          letter-spacing: -0.025em;
        }

        .subtitle {
          color: #64748b;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .role-tabs-container {
          margin-bottom: 1.5rem;
        }

        .role-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        .role-tabs {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          background: rgba(15, 23, 42, 0.04);
          padding: 4px;
          border-radius: 10px;
        }

        .role-tab {
          background: transparent;
          border: none;
          color: #64748b;
          padding: 8px 12px;
          border-radius: 8px;
          font-family: var(--font-outfit), sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .role-tab:hover {
          color: var(--text-navy);
        }

        .role-tab.active {
          background: #ffffff;
          color: var(--color-primary);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
        }

        .error-alert {
          background: #fef2f2;
          border: 1px solid #fee2e2;
          color: #991b1b;
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 1.5rem;
          display: flex;
          gap: 8px;
          font-size: 0.85rem;
          align-items: flex-start;
        }

        .error-icon {
          font-size: 1rem;
        }

        .error-alert p {
          margin: 0;
          line-height: 1.4;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .input-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-navy);
        }

        .input-group input {
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          font-family: var(--font-outfit), sans-serif;
          font-size: 0.95rem;
          background: rgba(255, 255, 255, 0.8);
          transition: all 0.2s;
        }

        .input-group input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(46, 196, 182, 0.15);
          background: #ffffff;
        }

        .submit-btn {
          margin-top: 0.5rem;
          width: 100%;
          padding: 14px;
          border-radius: 10px;
          border: none;
          font-family: var(--font-outfit), sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #ffffff;
          background: var(--color-primary);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .submit-btn:hover {
          background: #25b2a4;
          transform: translateY(-1px);
        }

        .submit-btn:active {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #ffffff;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .auth-toggle {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.9rem;
          color: #64748b;
        }

        .auth-toggle button {
          background: none;
          border: none;
          color: var(--color-primary);
          font-weight: 600;
          padding: 0;
          cursor: pointer;
          font-family: inherit;
        }

        .auth-toggle button:hover {
          text-decoration: underline;
        }

        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 2rem 0 1.5rem;
          color: #94a3b8;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .divider::before,
        .divider::after {
          content: "";
          flex: 1;
          border-bottom: 1px solid #e2e8f0;
        }

        .divider span {
          padding: 0 10px;
        }

        .dev-panel {
          background: rgba(46, 196, 182, 0.05);
          border: 1px dashed rgba(46, 196, 182, 0.3);
          border-radius: 12px;
          padding: 1.25rem;
        }

        .dev-title {
          font-weight: 700;
          font-size: 0.85rem;
          color: #0f766e;
          margin: 0 0 4px;
        }

        .dev-desc {
          font-size: 0.75rem;
          color: #475569;
          margin: 0 0 12px;
          line-height: 1.4;
        }

        .dev-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .dev-btn {
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 8px;
          padding: 10px;
          font-family: var(--font-outfit), sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          background: #ffffff;
          transition: all 0.2s;
        }

        .dev-btn:hover {
          background: #f8fafc;
          border-color: var(--color-primary);
          transform: translateX(2px);
        }

        .dev-btn.parent:hover { color: #2ec4b6; }
        .dev-btn.teacher:hover { color: #f77f00; }
        .dev-btn.admin:hover { color: #d62828; }
      `}</style>
    </div>
  );
}

import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading Login Portal...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
