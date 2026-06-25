"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "../page.module.css";
import TiltCard from "../../components/TiltCard";
import {
  ShieldAlert,
  Sliders,
  Eye,
  ArrowLeft,
  Users,
  CheckCircle,
  FileText,
  AlertCircle,
  GraduationCap,
  Scale,
  Video,
  Volume2,
  Trash2,
  Clock,
  DollarSign,
  LogOut,
  Play,
  MessageSquare,
  Zap,
  Lightbulb,
  School,
  Palette
} from "lucide-react";
import { db, ChatMessage } from "@/lib/db";
import { useAuth, ProtectedRoute } from "@/components/AuthProvider";
import AvatarIcon from "../../components/AvatarIcon";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "disputes" | "commission" | "shadow">("overview");
  const [commissionRate, setCommissionRate] = useState(15);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [children, setChildren] = useState<Record<string, any>>({});
  const [tutors, setTutors] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<any | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<string | null>(null);
  const [isShadowing, setIsShadowing] = useState(false);
  const [shadowSession, setShadowSession] = useState<any | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);

  const { user, signOut } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const dataDisputes = await db.getDisputes();
        const pendingDisputes = dataDisputes.filter(d => d.status.toLowerCase().includes('pending'));
        setDisputes(pendingDisputes);

        const dataChildren = await db.getChildren();
        setChildren(dataChildren);

        const dataTutors = await db.getTutors();
        setTutors(dataTutors);

        const dataBookings = await db.getBookings();
        setBookings(dataBookings);
      } catch (err) {
        console.error("Error loading admin data:", err);
      }
    }
    loadData();
  }, []);

  const activeSessions = bookings
    .filter(b => b.status === "Scheduled")
    .map((b, i) => {
      const elapsedTimes = ["22 mins", "15 mins", "41 mins", "10 mins"];
      return {
        id: b.id,
        childId: b.childId,
        student: b.childName,
        tutor: b.tutorName,
        subject: b.subject,
        elapsed: elapsedTimes[i % elapsedTimes.length],
        status: "In Progress"
      };
    });

  // Live Auditing Whiteboard Auto-Drawing Simulation
  useEffect(() => {
    if (!isShadowing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let frame = 0;
    let animationId: number;
    
    // Commands to draw a house and a smiley sun
    const commands = [
      // 1. Draw Ground line
      { type: 'line', x1: 20, y1: 150, x2: 260, y2: 150, color: '#475569', width: 2 },
      // 2. Draw House base box
      { type: 'line', x1: 50, y1: 150, x2: 50, y2: 90, color: '#f77f00', width: 3 },
      { type: 'line', x1: 50, y1: 90, x2: 130, y2: 90, color: '#f77f00', width: 3 },
      { type: 'line', x1: 130, y1: 90, x2: 130, y2: 150, color: '#f77f00', width: 3 },
      // 3. Draw House roof triangle
      { type: 'line', x1: 40, y1: 90, x2: 90, y2: 50, color: '#d62828', width: 3 },
      { type: 'line', x1: 90, y1: 50, x2: 140, y2: 90, color: '#d62828', width: 3 },
      // 4. Draw Door
      { type: 'line', x1: 80, y1: 150, x2: 80, y2: 115, color: '#0f172a', width: 2 },
      { type: 'line', x1: 80, y1: 115, x2: 100, y2: 115, color: '#0f172a', width: 2 },
      { type: 'line', x1: 100, y1: 115, x2: 100, y2: 150, color: '#0f172a', width: 2 },
      // 5. Draw Sun circle
      { type: 'arc', x: 210, y: 50, r: 20, start: 0, end: Math.PI * 2, color: '#fcbf49', width: 3 },
      // 6. Sun rays
      { type: 'line', x1: 210, y1: 20, x2: 210, y2: 26, color: '#fcbf49', width: 2 },
      { type: 'line', x1: 210, y1: 74, x2: 210, y2: 80, color: '#fcbf49', width: 2 },
      { type: 'line', x1: 180, y1: 50, x2: 186, y2: 50, color: '#fcbf49', width: 2 },
      { type: 'line', x1: 234, y1: 50, x2: 240, y2: 50, color: '#fcbf49', width: 2 },
      // 7. Success Text
      { type: 'text', text: "Great Job, Tyler!", x: 60, y: 30, color: '#2ec4b6' }
    ];

    const drawGrid = () => {
      ctx.strokeStyle = "rgba(46, 196, 182, 0.06)";
      ctx.lineWidth = 1;
      for (let i = 15; i < canvas.width; i += 15) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 15; i < canvas.height; i += 15) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }
    };
    
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid();
      
      // We will draw each step progressively every 30 frames
      const currentStep = Math.min(Math.floor(frame / 35), commands.length);
      
      for (let i = 0; i < currentStep; i++) {
        const cmd = commands[i];
        ctx.strokeStyle = cmd.color || '#000';
        ctx.lineWidth = cmd.width || 2;
        ctx.lineCap = "round";
        
        if (cmd.type === 'line' && cmd.x1 !== undefined && cmd.y1 !== undefined && cmd.x2 !== undefined && cmd.y2 !== undefined) {
          ctx.beginPath();
          ctx.moveTo(cmd.x1, cmd.y1);
          ctx.lineTo(cmd.x2, cmd.y2);
          ctx.stroke();
        } else if (cmd.type === 'arc' && cmd.x !== undefined && cmd.y !== undefined && cmd.r !== undefined && cmd.start !== undefined && cmd.end !== undefined) {
          ctx.beginPath();
          ctx.arc(cmd.x, cmd.y, cmd.r, cmd.start, cmd.end);
          ctx.stroke();
        } else if (cmd.type === 'text' && cmd.text && cmd.x !== undefined && cmd.y !== undefined) {
          ctx.font = "bold 18px var(--font-caveat), cursive, sans-serif";
          ctx.fillStyle = cmd.color || '#2ec4b6';
          ctx.fillText(cmd.text, cmd.x, cmd.y);
        }
      }
      
      // Animate current command in progress
      if (currentStep < commands.length) {
        const cmd = commands[currentStep];
        ctx.strokeStyle = cmd.color || '#000';
        ctx.lineWidth = cmd.width || 2;
        ctx.lineCap = "round";
        const stepProgress = (frame % 35) / 35;
        
        if (cmd.type === 'line' && cmd.x1 !== undefined && cmd.y1 !== undefined && cmd.x2 !== undefined && cmd.y2 !== undefined) {
          ctx.beginPath();
          ctx.moveTo(cmd.x1, cmd.y1);
          ctx.lineTo(cmd.x1 + (cmd.x2 - cmd.x1) * stepProgress, cmd.y1 + (cmd.y2 - cmd.y1) * stepProgress);
          ctx.stroke();
        } else if (cmd.type === 'arc' && cmd.x !== undefined && cmd.y !== undefined && cmd.r !== undefined && cmd.start !== undefined && cmd.end !== undefined) {
          ctx.beginPath();
          ctx.arc(cmd.x, cmd.y, cmd.r, cmd.start, cmd.start + (cmd.end - cmd.start) * stepProgress);
          ctx.stroke();
        } else if (cmd.type === 'text' && cmd.text && cmd.x !== undefined && cmd.y !== undefined) {
          ctx.font = "bold 18px var(--font-caveat), cursive, sans-serif";
          ctx.fillStyle = `rgba(46, 196, 182, ${stepProgress})`;
          ctx.fillText(cmd.text.substring(0, Math.floor(cmd.text.length * stepProgress)), cmd.x, cmd.y);
        }
      }
      
      // Loop sequence
      if (frame > (commands.length + 2) * 35) {
        frame = 0;
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isShadowing]);

  // Calculate simulated marketplace revenue based on commission
  const totalVolume = 125000; // Monthly tutor hours total booking dollar value
  const estimatedRevenue = (totalVolume * commissionRate) / 100;

  const handleResolveDispute = async (disputeId: string, decision: string) => {
    setResolutionStatus(decision);
    await db.updateDisputeStatus(disputeId, decision);
    setTimeout(() => {
      setDisputes(prev => prev.filter(d => d.id !== disputeId));
      setSelectedDispute(null);
      setResolutionStatus(null);
    }, 2000);
  };

  const startShadowing = () => {
    if (consentChecked) {
      setIsShadowing(true);
    }
  };

  const stopShadowing = () => {
    setIsShadowing(false);
    setShadowSession(null);
    setConsentChecked(false);
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
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
            <Scale size={20} />
            <span>Overview</span>
          </li>
          <li 
            className={`${styles.menuItem} ${activeTab === "disputes" ? styles.menuActive : ""}`}
            onClick={() => setActiveTab("disputes")}
          >
            <ShieldAlert size={20} />
            <span>Disputes Log ({disputes.length})</span>
          </li>
          <li 
            className={`${styles.menuItem} ${activeTab === "commission" ? styles.menuActive : ""}`}
            onClick={() => setActiveTab("commission")}
          >
            <Sliders size={20} />
            <span>Commission Engine</span>
          </li>
          <li 
            className={`${styles.menuItem} ${activeTab === "shadow" ? styles.menuActive : ""}`}
            onClick={() => setActiveTab("shadow")}
          >
            <Eye size={20} />
            <span>Silent Shadow Join</span>
          </li>
        </ul>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{
            background: "var(--sticky-yellow)",
            padding: "1rem",
            borderRadius: "12px",
            fontSize: "0.8rem",
            border: "1px solid rgba(29, 42, 68, 0.05)"
          }}>
            <strong style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginBottom: "0.5rem" }}>
              <Scale size={16} />
              <span>Marketplace Safety:</span>
            </strong> Audit logs, session records, and active calls inside the Trust & Safety system.
          </div>
          <Link href="/" className={styles.btnOutline} style={{ textAlign: "center", display: "block" }}>
            <ArrowLeft size={16} style={{ verticalAlign: "middle", marginRight: "0.5rem" }} />
            Back to Home
          </Link>
          <button 
            onClick={() => signOut()}
            className={styles.btnPrimary} 
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", borderRadius: "10px", marginTop: "0.5rem" }}
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Dashboard Content */}
      <main className={styles.dashContent}>
        <header className={styles.dashHeader}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Marketplace Admin</h1>
            <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Secure administrative controls for trust verification, disputes auditing, and commercial parameters.
            </p>
          </div>
          <div className={styles.userProfileBadge}>
            <ShieldAlert size={18} />
            <span style={{ fontWeight: 700 }}>Admin Portal (Active)</span>
          </div>
        </header>

        {/* OVERVIEW PANEL */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            {/* Key Metrics Row */}
            <div className={styles.dashGrid}>
              <TiltCard className={styles.dashCard}>
                <div className={styles.dashCardHeader}>
                  <span>Total Marketplace Volume</span>
                  <DollarSign size={20} style={{ color: "var(--color-primary)" }} />
                </div>
                <div className={styles.dashCardValue}>${totalVolume.toLocaleString()}</div>
                <span className={styles.dashCardSubtext}>
                  Active monthly booking volume
                </span>
              </TiltCard>

              <TiltCard className={styles.dashCard}>
                <div className={styles.dashCardHeader}>
                  <span>Average Platform Fee</span>
                  <Sliders size={20} style={{ color: "var(--color-secondary)" }} />
                </div>
                <div className={styles.dashCardValue}>{commissionRate}%</div>
                <span className={styles.dashCardSubtext} style={{ color: "var(--color-primary)" }}>
                  Estimated Revenue: ${estimatedRevenue.toLocaleString()}
                </span>
              </TiltCard>

              <TiltCard className={styles.dashCard}>
                <div className={styles.dashCardHeader}>
                  <span>Active Live Sessions</span>
                  <Video size={20} style={{ color: "green" }} />
                </div>
                <div className={styles.dashCardValue}>{activeSessions.length} calls</div>
                <span className={styles.dashCardSubtext} style={{ color: "green" }}>
                  ● Live safety feeds available
                </span>
              </TiltCard>

              <TiltCard className={styles.dashCard}>
                <div className={styles.dashCardHeader}>
                  <span>Open Dispute Tickets</span>
                  <ShieldAlert size={20} style={{ color: "var(--color-accent)" }} />
                </div>
                <div className={styles.dashCardValue}>{disputes.length} pending</div>
                <span className={styles.dashCardSubtext} style={{ color: "var(--color-accent-hover)" }}>
                  Needs immediate resolution
                </span>
              </TiltCard>
            </div>

            {/* Quick overview of disputes & commission */}
            <div className={styles.grid2col}>
              <div style={{ background: "white", padding: "2rem", borderRadius: "24px", border: "1px solid rgba(29, 42, 68, 0.05)" }}>
                <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800 }}>
                  <ShieldAlert size={22} style={{ color: "var(--color-accent)" }} />
                  Pending Dispute Log
                </h3>
                {disputes.length === 0 ? (
                  <p style={{ color: "green", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <CheckCircle size={16} />
                    <span>All disputes resolved!</span>
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {disputes.map((disp) => (
                      <div 
                        key={disp.id} 
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
                          <strong style={{ display: "block" }}>{disp.type}</strong>
                          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                            Parent: {disp.parentName} vs Tutor: {disp.tutorName}
                          </span>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedDispute(disp);
                            setActiveTab("disputes");
                          }}
                          className={styles.btnOutline} 
                          style={{ padding: "0.5rem 1rem", borderRadius: "8px" }}
                        >
                          Audit File
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ background: "white", padding: "2rem", borderRadius: "24px", border: "1px solid rgba(29, 42, 68, 0.05)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800 }}>
                    <Sliders size={22} style={{ color: "var(--color-primary)" }} />
                    Commission Control Panel
                  </h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                    Adjust the marketplace service commission. Updates the gross margins instantly.
                  </p>
                  
                  <div style={{ background: "var(--bg-cream)", padding: "1.5rem", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)" }}>
                    <label style={{ fontSize: "0.9rem", fontWeight: "bold", display: "block", marginBottom: "0.5rem" }}>
                      Selected Plate Rate: {commissionRate}%
                    </label>
                    <input 
                      type="range" 
                      min="10" 
                      max="20" 
                      step="1"
                      value={commissionRate} 
                      onChange={(e) => setCommissionRate(parseInt(e.target.value))} 
                      style={{ width: "100%", cursor: "pointer" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                      <span>10% (Minimum)</span>
                      <span>20% (Maximum)</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Platform Yield Rate:</span>
                    <strong style={{ display: "block", fontSize: "1.2rem", color: "var(--color-primary)" }}>
                      ${estimatedRevenue.toLocaleString()} / mo
                    </strong>
                  </div>
                  <button 
                    onClick={() => setActiveTab("commission")}
                    className={styles.btnPrimary} 
                    style={{ borderRadius: "10px" }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DISPUTES PANEL */}
        {activeTab === "disputes" && (
          <div style={{ background: "white", padding: "2.5rem", borderRadius: "24px", border: "1px solid rgba(29, 42, 68, 0.05)" }}>
            <h2 style={{ fontWeight: 800, fontSize: "1.5rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Scale size={24} style={{ color: "var(--color-primary)" }} />
              <span>Marketplace Dispute Resolution Center</span>
            </h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2.5rem" }}>
              {/* Disputes List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h4 style={{ fontWeight: 800, color: "var(--text-muted)" }}>Active Cases</h4>
                {disputes.length === 0 ? (
                  <p style={{ color: "green", fontWeight: "bold" }}>No active disputes.</p>
                ) : (
                  disputes.map((disp) => (
                    <div 
                      key={disp.id} 
                      onClick={() => setSelectedDispute(disp)}
                      style={{
                        padding: "1rem",
                        borderRadius: "12px",
                        border: "2px solid",
                        borderColor: selectedDispute?.id === disp.id ? "var(--color-primary)" : "rgba(29, 42, 68, 0.05)",
                        backgroundColor: selectedDispute?.id === disp.id ? "var(--bg-mint)" : "var(--bg-cream)",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "bold" }}>{disp.id}</span>
                      <strong style={{ display: "block", fontSize: "0.95rem" }}>{disp.type}</strong>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-navy)" }}>{disp.parentName} vs {disp.tutorName}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Dispute Audit Viewer */}
              <div>
                {selectedDispute ? (
                  <div style={{ border: "1px solid rgba(29, 42, 68, 0.1)", padding: "2rem", borderRadius: "20px", backgroundColor: "var(--bg-cream)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                      <div>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "bold" }}>CASE FILE: {selectedDispute.id}</span>
                        <h3 style={{ fontWeight: 800, fontSize: "1.3rem" }}>{selectedDispute.type}</h3>
                      </div>
                      <span style={{ background: "orange", color: "white", padding: "4px 10px", borderRadius: "50px", fontSize: "0.8rem", fontWeight: "bold" }}>
                        {selectedDispute.status}
                      </span>
                    </div>

                    <p style={{ marginBottom: "1.5rem", fontSize: "0.95rem", lineHeight: "1.5" }}>
                      <strong>Summary of Claim:</strong> {selectedDispute.reason}
                    </p>

                    {/* Simulated Voice Call Recording */}
                    <div style={{
                      backgroundColor: "white",
                      padding: "1rem",
                      borderRadius: "12px",
                      border: "1px solid rgba(0,0,0,0.05)",
                      marginBottom: "1.5rem"
                    }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.25rem", marginBottom: "0.5rem" }}>
                        <Volume2 size={16} />
                        <span>CLASS AUDIO RECORDING LOG</span>
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <button style={{
                          backgroundColor: "var(--color-primary)",
                          color: "white",
                          border: "none",
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center"
                        }}>
                          <Play size={16} fill="white" />
                        </button>
                        {/* Audio Waveform visualization */}
                        <div style={{ display: "flex", gap: "3px", flex: 1, alignItems: "center" }}>
                          {[12, 18, 5, 25, 40, 15, 30, 22, 10, 35, 12, 5, 20, 28, 14, 8, 30, 42, 15, 20, 10, 5, 18, 25, 32].map((h, i) => (
                            <div key={i} style={{ width: "4px", height: `${h}px`, backgroundColor: "var(--color-primary)", borderRadius: "2px" }} />
                          ))}
                        </div>
                        <span style={{ fontSize: "0.85rem", fontWeight: "bold" }}>01:14 / 04:32</span>
                      </div>
                    </div>

                    {/* Simulated Chats Transcript */}
                    <div style={{
                      backgroundColor: "white",
                      padding: "1.5rem",
                      borderRadius: "16px",
                      border: "1px solid rgba(0,0,0,0.05)",
                      marginBottom: "2rem"
                    }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.25rem", marginBottom: "1rem" }}>
                        <MessageSquare size={16} />
                        <span>CHAT TRANSCRIPT LOGGER</span>
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {selectedDispute.chatLog.map((chat: ChatMessage, i: number) => (
                          <div key={i} style={{ fontSize: "0.85rem", borderLeft: "3px solid var(--color-primary)", paddingLeft: "0.75rem" }}>
                            <strong style={{ color: "var(--color-primary-hover)" }}>[{chat.sender}]</strong>
                            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginLeft: "0.5rem" }}>{chat.time}</span>
                            <p style={{ marginTop: "0.25rem" }}>{chat.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <button 
                        onClick={() => handleResolveDispute(selectedDispute.id, "Parent Refunded")}
                        className={styles.btnSecondary} 
                        style={{ borderRadius: "10px", flex: 1 }}
                        disabled={resolutionStatus !== null}
                      >
                        Refund Parent
                      </button>
                      <button 
                        onClick={() => handleResolveDispute(selectedDispute.id, "Tutor Paid Out")}
                        className={styles.btnPrimary} 
                        style={{ borderRadius: "10px", flex: 1 }}
                        disabled={resolutionStatus !== null}
                      >
                        Pay Tutor (Dismiss Claim)
                      </button>
                    </div>

                    {resolutionStatus && (
                      <div style={{
                        textAlign: "center",
                        color: "var(--color-primary)",
                        fontWeight: 700,
                        marginTop: "1rem",
                        animation: "pulse-soft 2s infinite",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.25rem"
                      }}>
                        <Zap size={16} style={{ color: "orange" }} />
                        <span>Action processing: Resolving case as <strong>{resolutionStatus}</strong>...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{
                    padding: "3rem",
                    border: "2px dashed rgba(29, 42, 68, 0.1)",
                    borderRadius: "20px",
                    textAlign: "center",
                    color: "var(--text-muted)"
                  }}>
                    Select an active dispute case file from the sidebar to inspect chat logs and voice transcripts.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* COMMISSION ENGINE PANEL */}
        {activeTab === "commission" && (
          <div style={{ background: "white", padding: "2.5rem", borderRadius: "24px", border: "1px solid rgba(29, 42, 68, 0.05)" }}>
            <h2 style={{ fontWeight: 800, fontSize: "1.5rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Sliders size={24} style={{ color: "var(--color-primary)" }} />
              <span>Commission Engine Pricing Controls</span>
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "2rem" }}>
              Configure global platform fee rates. The slider updates margins on all client transactions.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "2.5rem" }}>
              <div style={{
                background: "var(--bg-cream)",
                padding: "2rem",
                borderRadius: "20px",
                border: "1px solid rgba(0,0,0,0.05)"
              }}>
                <h4 style={{ fontWeight: 800, marginBottom: "1.5rem" }}>Service Charge Percentage</h4>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <span style={{ fontSize: "1.1rem", fontWeight: "bold" }}>Platform Fee:</span>
                  <strong style={{ fontSize: "2rem", color: "var(--color-primary)" }}>{commissionRate}%</strong>
                </div>

                <input 
                  type="range" 
                  min="10" 
                  max="20" 
                  step="1"
                  value={commissionRate} 
                  onChange={(e) => setCommissionRate(parseInt(e.target.value))} 
                  style={{ width: "100%", cursor: "pointer", height: "8px", borderRadius: "4px" }}
                />

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                  <span>10.0% Minimum (Tutor Friendly)</span>
                  <span>20.0% Maximum (Standard Platform)</span>
                </div>

                {/* Vertical Bar Chart for Commission Rate Allocation */}
                <div style={{ marginTop: '2.5rem', background: 'white', padding: '1.5rem', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <h5 style={{ fontWeight: 'bold', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-navy)', textAlign: 'center' }}>
                    Revenue Share Split Visualizer
                  </h5>
                  <div style={{ display: 'flex', gap: '3rem', height: '160px', alignItems: 'flex-end', borderBottom: '2px solid rgba(0,0,0,0.06)', paddingBottom: '1rem', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{100 - commissionRate}%</span>
                      <div style={{ width: '45px', height: `${(100 - commissionRate) * 1.3}px`, backgroundColor: 'var(--color-primary)', borderRadius: '6px 6px 0 0', transition: 'height 0.3s ease', boxShadow: '0 4px 10px rgba(46,196,182,0.2)' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-navy)' }}>Tutors</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-accent)' }}>{commissionRate}%</span>
                      <div style={{ width: '45px', height: `${commissionRate * 1.3}px`, backgroundColor: 'var(--color-accent)', borderRadius: '6px 6px 0 0', transition: 'height 0.3s ease', boxShadow: '0 4px 10px rgba(247,127,0,0.2)' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-navy)' }}>Platform</span>
                    </div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: "var(--sticky-green)",
                  padding: "1rem",
                  borderRadius: "12px",
                  marginTop: "2rem",
                  fontSize: "0.85rem",
                  border: "1px solid rgba(0,0,0,0.05)"
                }}>
                  <strong style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                    <Lightbulb size={16} />
                    <span>Impact Analysis:</span>
                  </strong> At <strong>{commissionRate}%</strong>, platform revenue margins are solid, leaving {100 - commissionRate}% base pay directly to the specialists.
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ padding: "1.5rem", border: "1px solid rgba(29, 42, 68, 0.05)", borderRadius: "18px", backgroundColor: "var(--bg-cream)" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>ESTIMATED REVENUE YIELD</span>
                  <strong style={{ fontSize: "1.8rem", color: "var(--color-primary)" }}>${estimatedRevenue.toLocaleString()}.00</strong>
                  <span style={{ fontSize: "0.8rem", color: "green", display: "block", marginTop: "0.25rem" }}>
                    Based on $125k marketplace volume
                  </span>
                </div>

                <div style={{ padding: "1.5rem", border: "1px solid rgba(29, 42, 68, 0.05)", borderRadius: "18px", backgroundColor: "var(--bg-cream)" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>TUTOR RETENTION PREDICTION</span>
                  <strong style={{ fontSize: "1.8rem", color: "orange" }}>
                    {commissionRate <= 12 ? "98.5% (Very High)" : commissionRate <= 16 ? "94.2% (Healthy)" : "85.0% (Risk of Leaks)"}
                  </strong>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginTop: "0.25rem" }}>
                    Forecasted instructor loyalty index
                  </span>
                </div>

                <button 
                  onClick={() => alert(`Platform Commission saved successfully at ${commissionRate}%!`)}
                  className={styles.btnPrimary} 
                  style={{ width: "100%", borderRadius: "12px", padding: "1rem" }}
                >
                  Apply Global Commission Rate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SHADOWING PANEL */}
        {activeTab === "shadow" && (
          <div style={{ background: "white", padding: "2.5rem", borderRadius: "24px", border: "1px solid rgba(29, 42, 68, 0.05)" }}>
            <h2 style={{ fontWeight: 800, fontSize: "1.5rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Eye size={24} style={{ color: "var(--color-primary)" }} />
              <span>Silent Class Shadowing (Trust Vetting)</span>
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "2rem" }}>
              Join active training sessions silently to audit teaching quality and student safety.
            </p>

            {!isShadowing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <h4 style={{ fontWeight: 800 }}>Active Tutoring Feeds</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {activeSessions.map((sess) => (
                    <div 
                      key={sess.id} 
                      style={{
                        padding: "1.25rem 2rem",
                        border: "1px solid rgba(29, 42, 68, 0.05)",
                        borderRadius: "16px",
                        backgroundColor: "var(--bg-cream)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                        <School size={28} style={{ color: "var(--color-primary)" }} />
                        <div>
                          <strong style={{ display: "block", fontSize: "1.1rem" }}>{sess.subject}</strong>
                          <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                            Student: {sess.student} | Instructor: {sess.tutor}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: "bold" }}>
                          <Clock size={16} />
                          <span>ELAPSED: {sess.elapsed}</span>
                        </span>
                        <button 
                          onClick={() => setShadowSession(sess)}
                          className={styles.btnPrimary} 
                          style={{ borderRadius: "8px", padding: "0.5rem 1.25rem" }}
                        >
                          Shadow Join
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Live Auditing Screen
              <div style={{ background: "#1D2A44", color: "white", padding: "2.5rem", borderRadius: "20px", display: "flex", flexDirection: "column", gap: "1.5rem", position: "relative" }}>
                <div style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  backgroundColor: "rgba(255, 0, 0, 0.2)",
                  color: "red",
                  border: "1px solid red",
                  padding: "4px 12px",
                  borderRadius: "50px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  animation: "pulse-soft 1.5s infinite"
                }}>
                  <div style={{ width: "8px", height: "8px", backgroundColor: "red", borderRadius: "50%" }} />
                  SHADOW ACTIVE
                </div>

                <div>
                  <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", fontWeight: "bold" }}>SILENT AUDIT CONNECTION LIVE</span>
                  <h3 style={{ fontSize: "1.5rem", color: "white", fontWeight: 800, marginTop: "0.25rem" }}>
                    Shadowing: {shadowSession?.subject}
                  </h3>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
                    Student: {shadowSession?.student} | Instructor: {shadowSession?.tutor}
                  </p>
                </div>

                {/* Simulated video stream panels and live whiteboard audit */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.25fr", gap: "1.5rem", margin: "1rem 0" }}>
                  <div style={{ height: "240px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.2)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <AvatarIcon avatar={children[shadowSession?.childId]?.avatar || "fox"} size={36} />
                    <strong style={{ marginTop: "1rem" }}>{shadowSession?.student} (Student Feed)</strong>
                    <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>Video Signal: Excellent</span>
                  </div>

                  <div style={{ height: "240px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.2)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <AvatarIcon avatar={tutors.find(t => t.name === shadowSession?.tutor)?.avatar || "coach"} size={36} />
                    <strong style={{ marginTop: "1rem" }}>{shadowSession?.tutor} (Tutor Feed)</strong>
                    <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>Audio Signal: Vetted & VoiIP Live</span>
                  </div>

                  <div style={{ height: "240px", backgroundColor: "white", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)", display: "flex", flexDirection: "column", alignItems: "center", padding: "12px", color: "#1D2A44" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--color-primary)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Palette size={16} />
                      <span>LIVE WHITEBOARD FEED ({shadowSession?.student ? shadowSession.student.split(" ")[0].toUpperCase() : "STUDENT"})</span>
                    </span>
                    <canvas 
                      ref={canvasRef} 
                      width={280} 
                      height={190} 
                      style={{ border: "1px solid rgba(0,0,0,0.1)", borderRadius: "8px", width: "100%", height: "100%", backgroundColor: "#f8fafc" }}
                    />
                  </div>
                </div>

                {/* Live Chat scrolling ticker */}
                <div style={{
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "8px",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  position: "relative",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  margin: "0.5rem 0 1.5rem 0"
                }}>
                  <span style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    backgroundColor: "var(--color-accent)",
                    color: "white",
                    padding: "0 12px",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    zIndex: 2,
                    boxShadow: "2px 0 5px rgba(0,0,0,0.3)"
                  }}>
                    LIVE TRANSCRIPT:
                  </span>
                  <div style={{
                    display: "inline-block",
                    paddingLeft: "100%",
                    animation: "ticker-scroll 25s linear infinite",
                    fontSize: "0.85rem",
                    color: "#2ec4b6"
                  }}>
                    [Tutor]: Next, draw a nice smiley face inside the sun to show it is a warm day. ... [Student]: I am coloring the roof red now, Coach Alex. ... [Tutor]: That looks excellent, Tyler! Keep up the great work! ... [Student]: Yes, I want to add some green grass next. ...
                  </div>
                  <style dangerouslySetInnerHTML={{ __html: `
                    @keyframes ticker-scroll {
                      0% { transform: translate3d(0, 0, 0); }
                      100% { transform: translate3d(-100%, 0, 0); }
                    }
                  `}} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
                      <Volume2 size={18} />
                      <span>Decibels level: -45dB (Normal)</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
                      <Clock size={18} />
                      <span>Recording uptime: {shadowSession?.elapsed}</span>
                    </div>
                  </div>

                  <button 
                    onClick={stopShadowing}
                    className={styles.btnSecondary} 
                    style={{ borderRadius: "8px", padding: "0.75rem 1.5rem" }}
                  >
                    Disconnect Shadow Connection
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Trust & Shadow Vetting Consent Warning Modal */}
      {shadowSession && !isShadowing && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid rgba(0,0,0,0.06)", paddingBottom: "1rem" }}>
              <ShieldAlert size={26} style={{ color: "red" }} />
              <h3 style={{ fontWeight: 800, fontSize: "1.3rem" }}>Privacy Security & Consent Agreement</h3>
            </div>

            <div style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "var(--text-navy)" }}>
              <p style={{ marginBottom: "1rem" }}>
                You are about to establish a silent administrative link to <strong>{shadowSession.tutor}&apos;s</strong> session with <strong>{shadowSession.student}</strong>.
              </p>
              <p style={{
                background: "var(--sticky-pink)",
                padding: "1rem",
                borderRadius: "12px",
                border: "1px solid rgba(255,0,0,0.05)",
                fontSize: "0.85rem",
                color: "var(--color-accent-hover)"
              }}>
                <strong>WARNING:</strong> Silently shadowing live training feeds is strictly monitored. 
                You are only authorized to audit sessions for reports of behavior infractions, child welfare checks, or developer telemetry validation.
              </p>
            </div>

            <div style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              background: "var(--bg-cream)",
              padding: "1rem",
              borderRadius: "12px",
              border: "1px solid rgba(0,0,0,0.05)"
            }}>
              <input 
                type="checkbox" 
                id="consent-check" 
                checked={consentChecked} 
                onChange={(e) => setConsentChecked(e.target.checked)}
                style={{ marginTop: "3px", cursor: "pointer" }}
              />
              <label htmlFor="consent-check" style={{ fontSize: "0.85rem", cursor: "pointer", fontWeight: 600 }}>
                I agree to silently shadow this session strictly for trust and safety vetting. I declare that this complies with child privacy protection regulations.
              </label>
            </div>

            <div style={{ display: "flex", gap: "1rem", alignSelf: "flex-end", marginTop: "1rem" }}>
              <button 
                onClick={startShadowing}
                className={styles.btnPrimary} 
                style={{ borderRadius: "10px" }}
                disabled={!consentChecked}
              >
                Accept & Shadow Feed
              </button>
              <button 
                onClick={() => setShadowSession(null)}
                className={styles.btnOutline} 
                style={{ borderRadius: "10px" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}
