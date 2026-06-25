"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import styles from "../page.module.css";
import TiltCard from "../../components/TiltCard";
import {
  Calendar,
  Award,
  Clock,
  ArrowLeft,
  Users,
  Download,
  FileText,
  Plus,
  Trash2,
  GraduationCap,
  Zap,
  Sparkles,
  TrendingUp,
  Check,
  Settings,
  Palette,
  LogOut,
  ShieldCheck,
  User,
  BookOpen,
  Edit3,
  Pin,
  CheckCircle,
  Lightbulb,
  Star
} from "lucide-react";
import { useAuth, ProtectedRoute } from "@/components/AuthProvider";
import { db, Booking } from "@/lib/db";
import AvatarIcon from "@/components/AvatarIcon";


// Bookings are fetched dynamically from Supabase database.

// Mock Invoices list
const INVOICES_DATA = {
  "June 2026": {
    gross: 3850,
    classesTaught: 32,
    rate: 120,
    hours: 32,
    details: [
      { date: "June 23, 2026", desc: "Tyler Jenkins - Conversational Dynamics", rate: 120, duration: "1.0 hr" },
      { date: "June 20, 2026", desc: "Emily Jenkins - Anxiety Coping Tools", rate: 120, duration: "1.0 hr" },
      { date: "June 18, 2026", desc: "Sophie Rosales - Social Skills Intro", rate: 120, duration: "1.0 hr" }
    ]
  },
  "May 2026": {
    gross: 4200,
    classesTaught: 35,
    rate: 120,
    hours: 35,
    details: [
      { date: "May 28, 2026", desc: "Tyler Jenkins - Active Listening", rate: 120, duration: "1.0 hr" },
      { date: "May 25, 2026", desc: "Emily Jenkins - Visual Arts Focus", rate: 120, duration: "1.0 hr" },
      { date: "May 22, 2026", desc: "Sophie Rosales - Non-verbal Cues", rate: 120, duration: "1.0 hr" }
    ]
  }
};

export default function TeacherDashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "schedule" | "whiteboard" | "invoices">("overview");
  const [enableBuffer, setEnableBuffer] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<"June 2026" | "May 2026">("June 2026");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [commissionRate, setCommissionRate] = useState(15); // Mock commission rate from database/admin settings

  // DB-driven Schedule States & Helpers
  const [bookings, setBookings] = useState<any[]>([]);
  const [childrenMap, setChildrenMap] = useState<Record<string, any>>({});
  const [loadingSchedule, setLoadingSchedule] = useState<boolean>(true);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const parse12To24 = (time12: string): string => {
    if (!time12) return "00:00";
    if (/^\d{2}:\d{2}$/.test(time12)) return time12;
    const match = time12.match(/^(\d+):(\d+)\s*(AM|PM|am|pm)$/i);
    if (!match) return time12;
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = match[3].toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    else if (ampm === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  };

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        setLoadingSchedule(true);
        setScheduleError(null);
        
        const [childrenData, bookingsData] = await Promise.all([
          db.getChildren(),
          db.getBookings()
        ]);

        setChildrenMap(childrenData);

        const tutorBookings = bookingsData.filter(
          (b) => b.tutorName.toLowerCase() === user.name.toLowerCase()
        );

        const mapped = tutorBookings.map((b) => {
          const startTime = parse12To24(b.time);
          return {
            id: b.id,
            student: b.childName,
            childId: b.childId,
            subject: b.subject,
            startTime,
            endTime: getBufferedTime(startTime, 60),
            durationMin: 60,
            status: b.status
          };
        });

        mapped.sort((a, b) => a.startTime.localeCompare(b.startTime));
        setBookings(mapped);
      } catch (err: any) {
        console.error("Failed to load schedule from Supabase:", err);
        setScheduleError(err.message || "Failed to load schedule.");
      } finally {
        setLoadingSchedule(false);
      }
    }
    loadData();
  }, [user]);

  // Whiteboard drawing states
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#1D2A44"); // Navy
  const [brushSize, setBrushSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [whiteboardPrompt, setWhiteboardPrompt] = useState("Draw a smiley face showing how you feel today!");
  const [stickyNotes, setStickyNotes] = useState<Array<{ id: string, text: string, color: string }>>([
    { id: "note_1", text: "Today's Goal: Conversational turn-taking & active listening", color: "#FFF9EB" },
    { id: "note_2", text: "Tyler's Focus: Keep task sequence visual", color: "#F0FAF7" }
  ]);

  const addStickyNote = () => {
    const colors = ["#FFF9EB", "#F0FAF7", "#FFEBF0"];
    const randomColor = colors[stickyNotes.length % colors.length];
    setStickyNotes(prev => [
      ...prev,
      {
        id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        text: "New session reminder...",
        color: randomColor
      }
    ]);
  };

  const updateStickyNote = (id: string, text: string) => {
    setStickyNotes(prev => prev.map(note => note.id === id ? { ...note, text } : note));
  };

  const removeStickyNote = (id: string) => {
    setStickyNotes(prev => prev.filter(note => note.id !== id));
  };

  // Payout tax generated state
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [generateSuccess, setGenerateSuccess] = useState(false);

  // Initialize canvas
  useEffect(() => {
    if (activeTab === "whiteboard" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
      }
    }
  }, [activeTab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      // Map mouse coordinates to canvas internal coordinates
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
      ctx.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
      ctx.lineTo(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Dynamic scheduler helpers
  const getBufferedTime = (time: string, minutesToAdd: number) => {
    const [hoursStr, minutesStr] = time.split(":");
    const date = new Date();
    date.setHours(parseInt(hoursStr), parseInt(minutesStr) + minutesToAdd, 0);
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const currentInvoiceData = INVOICES_DATA[selectedMonth];
  const feeAmount = (currentInvoiceData.gross * commissionRate) / 100;
  const netAmount = currentInvoiceData.gross - feeAmount;

  const handleDownloadInvoice = () => {
    setIsGeneratingPDF(true);
    setTimeout(() => {
      setIsGeneratingPDF(false);
      setGenerateSuccess(true);
      setTimeout(() => setGenerateSuccess(false), 3000);
    }, 2000);
  };

  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <div className={styles.dashLayout}>
        {/* Sidebar Navigation */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarLogo}>
            <GraduationCap size={28} style={{ verticalAlign: "middle", marginRight: "0.5rem" }} />
            <span>Tutor-Hub</span>
          </div>
          <ul className={styles.sidebarMenu}>
            <li 
              className={`${styles.menuItem} ${activeTab === "overview" ? styles.menuActive : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <Users size={20} />
              <span>Overview</span>
            </li>
            <li 
              className={`${styles.menuItem} ${activeTab === "schedule" ? styles.menuActive : ""}`}
              onClick={() => setActiveTab("schedule")}
            >
              <Calendar size={20} />
              <span>Smart Schedule</span>
            </li>
            <li 
              className={`${styles.menuItem} ${activeTab === "whiteboard" ? styles.menuActive : ""}`}
              onClick={() => setActiveTab("whiteboard")}
            >
              <Palette size={20} />
              <span>Virtual Whiteboard</span>
            </li>
            <li 
              className={`${styles.menuItem} ${activeTab === "invoices" ? styles.menuActive : ""}`}
              onClick={() => setActiveTab("invoices")}
            >
              <FileText size={20} />
              <span>Invoices & Earnings</span>
            </li>
          </ul>

          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {user && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0.75rem",
                borderRadius: "8px",
                background: "rgba(29, 42, 68, 0.03)",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--text-navy)"
              }}>
                <User size={16} style={{ color: "var(--text-navy)" }} />
                <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {user.name}
                </span>
              </div>
            )}
            <div style={{
              background: "var(--sticky-green)",
              padding: "1rem",
              borderRadius: "12px",
              fontSize: "0.8rem",
              border: "1px solid rgba(29, 42, 68, 0.05)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <Lightbulb size={16} style={{ color: "var(--color-secondary)" }} />
              <span><strong>Dynamic Buffer:</strong> Toggle standard class padding slots inside the Scheduler tool page.</span>
            </div>
            <button 
              onClick={signOut} 
              className={styles.btnOutline} 
              style={{ 
                width: "100%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                gap: "0.5rem",
                borderColor: "rgba(214, 40, 40, 0.4)",
                color: "#d62828"
              }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Dashboard Content */}
        <main className={styles.dashContent}>
          <header className={styles.dashHeader}>
            <div>
              <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Teacher Dashboard</h1>
              <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
                Welcome back, {user?.name || "Coach Alex"}. Manage your whiteboard prompts and scheduled class timings.
              </p>
            </div>
            <div className={styles.userProfileBadge} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <GraduationCap size={20} style={{ color: "var(--color-primary)" }} />
              <span style={{ fontWeight: 700 }}>{user?.name || "Coach Alex"} (Specialist Tutor)</span>
            </div>
          </header>

        {/* OVERVIEW PANEL */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            {/* Key Metrics Row with Tilt Effects */}
            <div className={styles.dashGrid}>
              <TiltCard className={styles.dashCard}>
                <div className={styles.dashCardHeader}>
                  <span>Total Gross Earnings</span>
                  <TrendingUp size={20} style={{ color: "var(--color-primary)" }} />
                </div>
                <div className={styles.dashCardValue}>${currentInvoiceData.gross.toLocaleString()}</div>
                <span className={styles.dashCardSubtext} style={{ color: "green" }}>
                  ↑ 12.5% from last period
                </span>
              </TiltCard>

              <TiltCard className={styles.dashCard}>
                <div className={styles.dashCardHeader}>
                  <span>Retention Conversion Rate</span>
                  <Users size={20} style={{ color: "var(--color-accent)" }} />
                </div>
                <div className={styles.dashCardValue}>96.2%</div>
                <span className={styles.dashCardSubtext} style={{ color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Star size={12} fill="var(--color-primary)" style={{ color: "var(--color-primary)" }} /> Elite Level Instructor
                </span>
              </TiltCard>

              <TiltCard className={styles.dashCard}>
                <div className={styles.dashCardHeader}>
                  <span>Hours Taught (Month)</span>
                  <Clock size={20} style={{ color: "var(--color-secondary)" }} />
                </div>
                <div className={styles.dashCardValue}>{currentInvoiceData.hours} hrs</div>
                <span className={styles.dashCardSubtext}>
                  32 unique training sessions
                </span>
              </TiltCard>

              <TiltCard className={styles.dashCard}>
                <div className={styles.dashCardHeader}>
                  <span>Distributed Knowledge Coins</span>
                  <Sparkles size={20} style={{ color: "var(--color-secondary)" }} />
                </div>
                <div className={styles.dashCardValue}>1,240</div>
                <span className={styles.dashCardSubtext} style={{ color: "orange" }}>
                  Active Gamification Tier 4
                </span>
              </TiltCard>
            </div>

            {/* Quick overview of schedule & prompt */}
            <div className={styles.grid2col}>
              <div style={{ background: "white", padding: "2rem", borderRadius: "24px", border: "1px solid rgba(29, 42, 68, 0.05)" }}>
                <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800 }}>
                  <Calendar size={22} style={{ color: "var(--color-primary)" }} />
                  Upcoming Sessions Today
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {loadingSchedule ? (
                    <div style={{ padding: "1rem", color: "var(--text-muted)", textAlign: "center" }}>
                      Loading sessions...
                    </div>
                  ) : scheduleError ? (
                    <div style={{ padding: "1rem", color: "red", textAlign: "center" }}>
                      Error loading sessions.
                    </div>
                  ) : bookings.length === 0 ? (
                    <div style={{ padding: "1rem", color: "var(--text-muted)", textAlign: "center" }}>
                      No upcoming sessions today.
                    </div>
                  ) : (
                    bookings.slice(0, 2).map((item) => (
                      <div 
                        key={item.id} 
                        style={{
                          padding: "1rem",
                          border: "1px solid rgba(29, 42, 68, 0.05)",
                          borderRadius: "14px",
                          backgroundColor: "var(--bg-cream)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div>
                          <strong style={{ display: "block" }}>{item.subject}</strong>
                          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Student: {item.student}</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ display: "block", fontWeight: 700, color: "var(--color-primary)" }}>{item.startTime} - {item.endTime}</span>
                          <span style={{ fontSize: "0.85rem", background: "var(--sticky-green)", padding: "2px 8px", borderRadius: "50px", fontWeight: "bold" }}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button 
                  onClick={() => setActiveTab("schedule")}
                  className={styles.btnOutline} 
                  style={{ width: "100%", marginTop: "1.5rem" }}
                >
                  View Full Scheduler
                </button>
              </div>

              <div style={{ background: "white", padding: "2rem", borderRadius: "24px", border: "1px solid rgba(29, 42, 68, 0.05)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800 }}>
                    <Palette size={22} style={{ color: "var(--color-accent)" }} />
                    Active Whiteboard Prompt
                  </h3>
                  <div style={{
                    padding: "1.5rem",
                    borderRadius: "16px",
                    background: "var(--sticky-yellow)",
                    fontFamily: "var(--font-caveat), cursive",
                    fontSize: "1.5rem",
                    lineHeight: "1.3",
                    border: "1px solid rgba(29, 42, 68, 0.05)",
                    transform: "rotate(-1deg)"
                  }}>
                    {whiteboardPrompt}
                  </div>
                </div>
                <div style={{ marginTop: "1.5rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>
                    Update Whiteboard Task Prompt:
                  </label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input 
                      type="text" 
                      value={whiteboardPrompt} 
                      onChange={(e) => setWhiteboardPrompt(e.target.value)} 
                      style={{
                        flex: 1,
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "1px solid rgba(29, 42, 68, 0.1)",
                        outline: "none"
                      }}
                    />
                    <button 
                      onClick={() => setActiveTab("whiteboard")}
                      className={styles.btnPrimary} 
                      style={{ borderRadius: "8px", padding: "0.75rem 1.25rem" }}
                    >
                      Draw
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SMART SCHEDULER PANEL */}
        {activeTab === "schedule" && (
          <div style={{ background: "white", padding: "2.5rem", borderRadius: "24px", border: "1px solid rgba(29, 42, 68, 0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Calendar size={24} style={{ color: "var(--color-primary)" }} />
                  <span>Intelligent Course Scheduler</span>
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Prevent fatigue and session overlaps with smart calendar buffers.
                </p>
              </div>

              {/* Buffer Toggle Button */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "var(--bg-cream)", padding: "0.75rem 1.25rem", borderRadius: "50px", border: "1px solid rgba(29, 42, 68, 0.05)" }}>
                <span style={{ fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <ShieldCheck size={18} style={{ color: "var(--color-accent)" }} />
                  <span>Auto-Buffer (15m):</span>
                </span>
                <button 
                  onClick={() => setEnableBuffer(!enableBuffer)}
                  style={{
                    width: "50px",
                    height: "26px",
                    borderRadius: "50px",
                    background: enableBuffer ? "var(--color-primary)" : "#ccc",
                    border: "none",
                    position: "relative",
                    cursor: "pointer",
                    transition: "background 0.2s"
                  }}
                >
                  <div style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "white",
                    position: "absolute",
                    top: "3px",
                    left: enableBuffer ? "27px" : "3px",
                    transition: "left 0.2s"
                  }} />
                </button>
              </div>
            </div>

            {/* Timings Schedule list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {loadingSchedule ? (
                <div style={{ padding: "2rem", color: "var(--text-muted)", textAlign: "center" }}>
                  Loading schedule from database...
                </div>
              ) : scheduleError ? (
                <div style={{ padding: "2rem", color: "red", textAlign: "center" }}>
                  Error: {scheduleError}
                </div>
              ) : bookings.length === 0 ? (
                <div style={{ padding: "2rem", color: "var(--text-muted)", textAlign: "center" }}>
                  No scheduled classes found.
                </div>
              ) : (
                bookings.map((item, index) => {
                  // Calculate display start & end times based on buffer
                  const showBuffer = enableBuffer && index < bookings.length - 1;
                  const child = childrenMap[item.childId];
                  const avatar = child?.avatar || "fox";
                  
                  return (
                    <React.Fragment key={item.id}>
                      <div 
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "1.5rem",
                          backgroundColor: "var(--bg-cream)",
                          borderRadius: "16px",
                          border: "1px solid rgba(29, 42, 68, 0.05)",
                          transition: "all 0.2s"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                          <AvatarIcon avatar={avatar} size={28} />
                          <div>
                            <h4 style={{ fontWeight: 800 }}>{item.subject}</h4>
                            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Student: <strong>{item.student}</strong></span>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "2.5rem", alignItems: "center" }}>
                          <div>
                            <span style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "bold" }}>SESSION TIMING</span>
                            <span style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                              {item.startTime} - {item.endTime}
                            </span>
                          </div>

                          <div>
                            <span style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "bold" }}>DURATION</span>
                            <span style={{ fontWeight: 600 }}>{item.durationMin} mins</span>
                          </div>

                          <div style={{
                            backgroundColor: "var(--color-white)",
                            border: "1px solid rgba(29, 42, 68, 0.05)",
                            padding: "0.5rem 1rem",
                            borderRadius: "8px",
                            fontWeight: 700,
                            color: "green",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem"
                          }}>
                            <Check size={16} /> Confirmed
                          </div>
                        </div>
                      </div>

                      {showBuffer && (
                        <div 
                          style={{
                            margin: "0.25rem 0 0.25rem 4rem",
                            padding: "0.75rem 1.5rem",
                            background: "var(--sticky-pink)",
                            color: "var(--color-accent-hover)",
                            borderRadius: "10px",
                            border: "1px dashed var(--color-accent)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            fontSize: "0.9rem",
                            fontWeight: 700,
                            animation: "pulse-soft 2s ease infinite"
                          }}
                        >
                          <Zap size={16} />
                          15-minute Auto-Buffer Active: Guarding {item.student}'s wrap-up session and prep time. (Next session pushed to safe window)
                        </div>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* WHITEBOARD PANEL */}
        {activeTab === "whiteboard" && (
          <div className={styles.whiteboardContainer}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Palette size={24} style={{ color: "var(--color-accent)" }} />
                  <span>Interactive Whiteboard Workspace</span>
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Demonstrate concepts dynamically. Share drawings directly with the client student session.
                </p>
              </div>
              <div style={{
                background: "var(--sticky-yellow)",
                padding: "0.5rem 1rem",
                borderRadius: "12px",
                border: "1px solid rgba(0,0,0,0.05)",
                fontSize: "0.85rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "0.25rem"
              }}>
                <Edit3 size={14} />
                <span>Prompt: {whiteboardPrompt}</span>
              </div>
            </div>

            {/* 2-Column Grid */}
            <div className={styles.grid2col}>
              {/* Left Column: Canvas, color/brush controls, preset prompts and custom override */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                
                {/* Whiteboard Workspace Toolbar */}
                <div className={styles.whiteboardToolbar} style={{ margin: 0, width: "100%" }}>
                  <div className={styles.toolbarGroup}>
                    <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Brushes:</span>
                    <button 
                      className={styles.colorCircle} 
                      style={{ backgroundColor: "#1D2A44", border: color === "#1D2A44" ? "3px solid var(--color-secondary)" : "none" }}
                      onClick={() => setColor("#1D2A44")}
                      title="Navy"
                    />
                    <button 
                      className={styles.colorCircle} 
                      style={{ backgroundColor: "#E27E8C", border: color === "#E27E8C" ? "3px solid var(--color-primary)" : "none" }}
                      onClick={() => setColor("#E27E8C")}
                      title="Coral"
                    />
                    <button 
                      className={styles.colorCircle} 
                      style={{ backgroundColor: "#486BE5", border: color === "#486BE5" ? "3px solid var(--color-secondary)" : "none" }}
                      onClick={() => setColor("#486BE5")}
                      title="Blue"
                    />
                    <button 
                      className={styles.colorCircle} 
                      style={{ backgroundColor: "#EAA43F", border: color === "#EAA43F" ? "3px solid var(--color-primary)" : "none" }}
                      onClick={() => setColor("#EAA43F")}
                      title="Orange"
                    />
                  </div>

                  <div className={styles.toolbarGroup}>
                    <label style={{ fontSize: "0.9rem", fontWeight: 700 }}>Size ({brushSize}px): </label>
                    <input 
                      type="range" 
                      min="2" 
                      max="20" 
                      value={brushSize} 
                      onChange={(e) => setBrushSize(parseInt(e.target.value))} 
                      style={{ cursor: "pointer" }}
                    />
                  </div>

                  <button className={styles.btnOutline} style={{ borderRadius: "8px", padding: "0.5rem 1.25rem" }} onClick={clearCanvas}>
                    Clear Screen
                  </button>
                </div>

                {/* Preset Prompt Dropdown & Custom Override Input */}
                <div style={{
                  background: "var(--bg-cream)",
                  padding: "1.25rem",
                  borderRadius: "16px",
                  border: "1px solid rgba(29, 42, 68, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem"
                }}>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.9rem", minWidth: "100px" }}>Preset Prompt:</span>
                    <select
                      value={["Draw a smiley face showing how you feel today!", "Outline conversational turn-taking steps.", "Draw a timeline checklist for today's goals.", "Draw anything you want! Free space."].includes(whiteboardPrompt) ? whiteboardPrompt : "Custom"}
                      onChange={(e) => {
                        if (e.target.value !== "Custom") {
                          setWhiteboardPrompt(e.target.value);
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "0.5rem",
                        borderRadius: "8px",
                        border: "1px solid rgba(29, 42, 68, 0.1)",
                        fontWeight: 600,
                        outline: "none"
                      }}
                    >
                      <option value="Draw a smiley face showing how you feel today!">Daily Mood</option>
                      <option value="Outline conversational turn-taking steps.">Social Focus Map</option>
                      <option value="Draw a timeline checklist for today's goals.">Tasks Timeline</option>
                      <option value="Draw anything you want! Free space.">Free Draw</option>
                      <option value="Custom">Custom Override...</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.9rem", minWidth: "100px" }}>Override Prompt:</span>
                    <input 
                      type="text" 
                      value={whiteboardPrompt} 
                      onChange={(e) => setWhiteboardPrompt(e.target.value)} 
                      placeholder="Type custom prompt here..."
                      style={{
                        flex: 1,
                        padding: "0.5rem 0.75rem",
                        borderRadius: "8px",
                        border: "1px solid rgba(29, 42, 68, 0.1)",
                        outline: "none",
                        fontWeight: 500
                      }}
                    />
                  </div>
                </div>

                {/* The Actual Canvas Component */}
                <div className={styles.canvasContainer} style={{ background: "white", padding: "10px", borderRadius: "16px", border: "2px solid rgba(29,42,68,0.06)", margin: 0 }}>
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={400}
                    className={styles.canvas}
                    style={{ display: "block", margin: "0 auto", background: "var(--bg-cream)" }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
                <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)", margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}>
                  <Palette size={14} />
                  <span>Left-click and drag inside the sandbox canvas above to simulate drawing. Works on touchpads/mice.</span>
                </p>
              </div>

              {/* Right Column: Visually rotated sticky notes post-it board with inline textareas, add, and delete actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontWeight: 800, fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Pin size={18} style={{ color: "var(--color-primary)" }} />
                    <span>Sticky Notes Board</span>
                  </h3>
                  <button 
                    onClick={addStickyNote}
                    className={styles.btnSecondary}
                    style={{
                      padding: "0.5rem 1rem",
                      fontSize: "0.85rem",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontWeight: 700
                    }}
                  >
                    <Plus size={16} /> Add Note
                  </button>
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: "1.5rem",
                  maxHeight: "560px",
                  overflowY: "auto",
                  padding: "0.5rem"
                }}>
                  {stickyNotes.map((note) => {
                    let noteClass = styles.noteYellow;
                    if (note.color === "#FFF9EB") noteClass = styles.noteYellow;
                    else if (note.color === "#F0FAF7") noteClass = styles.noteGreen;
                    else if (note.color === "#FFEBF0") noteClass = styles.notePink;
                    
                    return (
                      <div 
                        key={note.id} 
                        className={`${styles.stickyNote} ${noteClass}`}
                        style={{ 
                          padding: "1.5rem 1rem 1rem 1rem",
                          fontSize: "1.2rem",
                          gap: "0.5rem",
                          minHeight: "180px",
                          display: "flex",
                          flexDirection: "column"
                        }}
                      >
                        <textarea
                          value={note.text}
                          onChange={(e) => updateStickyNote(note.id, e.target.value)}
                          style={{
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            resize: "none",
                            fontFamily: "inherit",
                            fontSize: "inherit",
                            color: "inherit",
                            width: "100%",
                            flexGrow: 1,
                            lineHeight: "1.2"
                          }}
                          placeholder="Write a note..."
                        />
                        <button
                          onClick={() => removeStickyNote(note.id)}
                          style={{
                            alignSelf: "flex-end",
                            background: "none",
                            border: "none",
                            color: "rgba(29, 42, 68, 0.4)",
                            cursor: "pointer",
                            padding: "0.25rem",
                            transition: "color 0.2s"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-accent-hover)"}
                          onMouseLeave={(e) => e.currentTarget.style.color = "rgba(29, 42, 68, 0.4)"}
                          title="Delete Note"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INVOICES & EARNINGS PANEL */}
        {activeTab === "invoices" && (
          <div style={{ background: "white", padding: "2.5rem", borderRadius: "24px", border: "1px solid rgba(29, 42, 68, 0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FileText size={24} style={{ color: "var(--color-primary)" }} />
                  <span>Automated Payout & Invoice Statements</span>
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Verify teaching hours, view commission deductions, and download tax/payment declarations.
                </p>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value as "June 2026" | "May 2026")}
                  style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "12px",
                    fontWeight: 700,
                    border: "1px solid rgba(29,42,68,0.15)",
                    outline: "none"
                  }}
                >
                  <option value="June 2026">June 2026</option>
                  <option value="May 2026">May 2026</option>
                </select>
                <button 
                  onClick={() => setShowInvoiceModal(true)}
                  className={styles.btnPrimary} 
                  style={{ borderRadius: "12px" }}
                >
                  Generate Statement
                </button>
              </div>
            </div>

            {/* Earnings Summary Sheet */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
              <div style={{ padding: "1.5rem", background: "var(--bg-cream)", borderRadius: "18px", border: "1px solid rgba(29, 42, 68, 0.05)", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                <h4 style={{ fontWeight: 800, color: "var(--text-navy)" }}>Summary Breakdown</h4>
                <div>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>Gross Taught Earnings</span>
                  <strong style={{ fontSize: "1.3rem" }}>${currentInvoiceData.gross.toFixed(2)}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>Platform Commission ({commissionRate}%)</span>
                  <strong style={{ fontSize: "1.3rem", color: "var(--color-accent-hover)" }}>-${feeAmount.toFixed(2)}</strong>
                </div>
                <hr style={{ borderColor: "rgba(0,0,0,0.06)" }} />
                <div>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>Net Payout Amount</span>
                  <strong style={{ fontSize: "1.6rem", color: "var(--color-primary)" }}>${netAmount.toFixed(2)}</strong>
                </div>
              </div>

              <div>
                <h4 style={{ fontWeight: 800, marginBottom: "1rem" }}>Session Audit Trail</h4>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid rgba(29,42,68,0.1)", textAlign: "left" }}>
                      <th style={{ padding: "0.75rem 0.5rem" }}>Date</th>
                      <th style={{ padding: "0.75rem 0.5rem" }}>Description</th>
                      <th style={{ padding: "0.75rem 0.5rem" }}>Duration</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>Rate/hr</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentInvoiceData.details.map((row, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(29,42,68,0.05)" }}>
                        <td style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)" }}>{row.date}</td>
                        <td style={{ padding: "0.75rem 0.5rem", fontWeight: 600 }}>{row.desc}</td>
                        <td style={{ padding: "0.75rem 0.5rem" }}>{row.duration}</td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: 700 }}>${row.rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Invoice Payout Statement Modal */}
      {showInvoiceModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent} style={{ maxWidth: "700px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <GraduationCap size={24} style={{ color: "var(--color-primary)" }} />
                <h3 style={{ fontWeight: 800, fontSize: "1.3rem" }}>Official Payout Statement</h3>
              </div>
              <button 
                onClick={() => setShowInvoiceModal(false)} 
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem" }}
              >
                &times;
              </button>
            </div>

            {/* Payout Details */}
            <div style={{ border: "2px solid rgba(29,42,68,0.05)", padding: "2rem", borderRadius: "16px", backgroundColor: "var(--bg-cream)", fontSize: "0.9rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <div>
                  <strong>James Stanfield Company</strong><br />
                  123 Learning Path Circle<br />
                  Education City, CA 90210<br />
                  tutor-safety@stanfield.com
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong>STATEMENT NO:</strong> JSS-{selectedMonth.replace(" ", "")}-042<br />
                  <strong>DATE:</strong> June 24, 2026<br />
                  <strong>TUTOR ID:</strong> T-ALEX-9042
                </div>
              </div>

              <hr style={{ margin: "1rem 0", borderColor: "rgba(0,0,0,0.06)" }} />

              <div style={{ marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>ISSUED TO:</span>
                <strong>Coach Alex M.</strong><br />
                Special Needs Educator (ADHD / Autism Spectrum specialist)<br />
                alex.tutor@example.com
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", margin: "1.5rem 0" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid rgba(0,0,0,0.06)", textAlign: "left" }}>
                    <th style={{ padding: "0.5rem" }}>Description</th>
                    <th style={{ padding: "0.5rem", textAlign: "right" }}>Hours</th>
                    <th style={{ padding: "0.5rem", textAlign: "right" }}>Net Rate</th>
                    <th style={{ padding: "0.5rem", textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "0.5rem" }}>Tutoring Services ({selectedMonth})</td>
                    <td style={{ padding: "0.5rem", textAlign: "right" }}>{currentInvoiceData.hours}.0</td>
                    <td style={{ padding: "0.5rem", textAlign: "right" }}>${currentInvoiceData.rate}.00</td>
                    <td style={{ padding: "0.5rem", textAlign: "right" }}>${currentInvoiceData.gross.toFixed(2)}</td>
                  </tr>
                  <tr style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                    <td colSpan={3} style={{ padding: "0.5rem", textAlign: "right", color: "var(--text-muted)" }}>Platform Commission Fee ({commissionRate}%)</td>
                    <td style={{ padding: "0.5rem", textAlign: "right", color: "var(--color-accent-hover)" }}>-${feeAmount.toFixed(2)}</td>
                  </tr>
                  <tr style={{ borderTop: "2px solid rgba(29,42,68,0.1)", fontWeight: 700 }}>
                    <td colSpan={3} style={{ padding: "0.5rem", textAlign: "right" }}>Total Net Paid Out</td>
                    <td style={{ padding: "0.5rem", textAlign: "right", color: "var(--color-primary)" }}>${netAmount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{
                backgroundColor: "var(--sticky-green)",
                padding: "0.75rem",
                borderRadius: "10px",
                textAlign: "center",
                fontWeight: 700,
                color: "green",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem"
              }}>
                <CheckCircle size={16} />
                <span>Bank Transfer Status: Cleared & Deposited on June 22, 2026.</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", alignSelf: "flex-end" }}>
              <button 
                onClick={handleDownloadInvoice}
                className={styles.btnPrimary} 
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", borderRadius: "10px" }}
                disabled={isGeneratingPDF}
              >
                <Download size={18} />
                {isGeneratingPDF ? "Generating PDF..." : "Export PDF Statement"}
              </button>
              <button 
                onClick={() => setShowInvoiceModal(false)}
                className={styles.btnOutline} 
                style={{ borderRadius: "10px" }}
              >
                Close
              </button>
            </div>

            {generateSuccess && (
              <div style={{
                textAlign: "center",
                color: "green",
                fontWeight: 700,
                marginTop: "0.5rem",
                animation: "pulse-soft 2s infinite",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem"
              }}>
                <Sparkles size={16} />
                <span>Statement exported successfully! Simulated PDF JSS-{selectedMonth.replace(" ", "")}-042.pdf downloaded.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </ProtectedRoute>
  );
}
