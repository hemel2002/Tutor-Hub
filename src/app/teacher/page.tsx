"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
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
  Star,
  Brain,
  BarChart3,
  Target,
  Trophy,
  MessageSquare,
  Video,
  Volume2,
  RotateCcw,
  Save,
  Share2,
  MessageCircle,
  Heart,
  ThumbsUp,
  Activity,
  AlertCircle,
  Info,
  X,
  Bot,
  Sparkle,
  Target as TargetIcon,
  TrendingUp as TrendingUpIcon,
  Award as AwardIcon,
  RefreshCw
} from "lucide-react";
import { useAuth, ProtectedRoute } from "@/components/AuthProvider";
import { db, Child, SessionReport } from "@/lib/db";
import AvatarIcon from "@/components/AvatarIcon";


// Bookings are fetched dynamically from Supabase database.

// AI Recommendation Types
interface AIRecommendation {
  id: string;
  type: 'session_optimization' | 'resource_suggestion' | 'skill_focus' | 'parent_communication';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  timestamp: string;
}

interface GamificationStats {
  level: number;
  exp: number;
  expToNext: number;
  coins: number;
  streak: number;
  achievements: string[];
}

// Real-time collaboration type
interface CollaborationSession {
  id: string;
  studentId: string;
  studentName: string;
  isActive: boolean;
  startTime: string;
  tools: string[];
}

interface TeacherScheduleItem {
  id: string;
  student: string;
  childId: string;
  subject: string;
  tutorName: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMin: number;
  status: string;
}

function getBufferedTime(time: string, minutesToAdd: number) {
  const [hoursStr, minutesStr] = time.split(":");
  const date = new Date();
  date.setHours(parseInt(hoursStr), parseInt(minutesStr) + minutesToAdd, 0);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export default function TeacherDashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "schedule" | "whiteboard" | "invoices" | "analytics" | "ai-assistant">("overview");
  const [enableBuffer, setEnableBuffer] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<"June 2026" | "May 2026">("June 2026");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [commissionRate, setCommissionRate] = useState(15); // Mock commission rate from database/admin settings

  // AI-Powered Features
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [activeAIMode, setActiveAIMMode] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('AI Assistant ready to help');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiChatMessages, setAiChatMessages] = useState<Array<{sender: string, message: string, timestamp: string}>>([
    { sender: 'AI', message: 'Hello! I am your AI teaching assistant. I can help you optimize sessions and analyze student progress.', timestamp: new Date().toLocaleTimeString() }
  ]);
  const [userMessage, setUserMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Gamification States
  const [gamificationStats, setGamificationStats] = useState<GamificationStats>({
    level: 12,
    exp: 8470,
    expToNext: 10000,
    coins: 1240,
    streak: 7,
    achievements: ["Master Tutor", "5-Star Specialist", "Session Champion", "Parent Favorite", "Quick Responder"]
  });

  // Real-time Collaboration
  const [collaborationSessions, setCollaborationSessions] = useState<CollaborationSession[]>([]);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [collaborationTools, setCollaborationTools] = useState<string[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('whiteboard');

  // Session Timer - Functional
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<TeacherScheduleItem | null>(null);
  const [sessionReports, setSessionReports] = useState<SessionReport[]>([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [savingReport, setSavingReport] = useState(false);
  const [reportSummary, setReportSummary] = useState("");
  const [reportNotes, setReportNotes] = useState("");
  const [reportScores, setReportScores] = useState({ engagement: 4, mastery: 3, behavior: 4 });

  const startSession = (session: TeacherScheduleItem) => {
    setCurrentSession(session);
    setSessionTimer(0);
    setIsTimerRunning(true);
    setCollaborationSessions([{ id: session.id, studentId: session.childId, studentName: session.student, isActive: true, startTime: session.startTime, tools: collaborationTools }]);
  };

  const stopSession = () => {
    setIsTimerRunning(false);
    setShowCompletionModal(true);
  };

  // Functional collaboration tools
  const activateCollaborationTool = (tool: string) => {
    if (!collaborationTools.includes(tool)) {
      setCollaborationTools(prev => [...prev, tool]);
    }
    setSelectedTool(tool);
  };

  const deactivateCollaborationTool = (tool: string) => {
    setCollaborationTools(prev => prev.filter(t => t !== tool));
  };

  // Enhanced Analytics
  const [analyticsPeriod, setAnalyticsPeriod] = useState<"week" | "month" | "quarter">("month");
  const [engagementMetrics, setEngagementMetrics] = useState({
    avgRating: 0,
    totalSessions: 0,
    retentionRate: 0,
    parentSatisfaction: 0,
    skillImprovement: 0
  });

  // DB-driven Schedule States & Helpers
  const [bookings, setBookings] = useState<TeacherScheduleItem[]>([]);
  const [childrenMap, setChildrenMap] = useState<Record<string, Child>>({});
  const [hourlyRate, setHourlyRate] = useState(0);
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

        const [childrenData, bookingsData, reportsData, tutorsData] = await Promise.all([
          db.getChildren(),
          db.getBookings(),
          db.getSessionReports(),
          db.getTutors(),
        ]);

        setChildrenMap(childrenData);

        const tutorName = user.isMock ? "Coach Alex M." : user.name;
        setHourlyRate(tutorsData.find((tutor) => tutor.name === tutorName)?.rate ?? 0);
        const tutorBookings = bookingsData.filter((booking) => booking.tutorName.toLowerCase() === tutorName.toLowerCase());

        const mapped = tutorBookings.map((b) => {
          const startTime = parse12To24(b.time);
          return {
            id: b.id,
            student: b.childName,
            childId: b.childId,
            subject: b.subject,
            tutorName: b.tutorName,
            date: b.date,
            startTime,
            endTime: getBufferedTime(startTime, 60),
            durationMin: 60,
            status: b.status
          };
        });

        mapped.sort((a, b) => a.startTime.localeCompare(b.startTime));
        setBookings(mapped);
        setSessionReports(reportsData.filter((report) => report.tutorName === tutorName));
      } catch (err: unknown) {
        console.error("Failed to load schedule from Supabase:", err);
        setScheduleError(err instanceof Error ? err.message : "Failed to load schedule.");
      } finally {
        setLoadingSchedule(false);
      }
    }
    loadData();
  }, [user]);

  // Recommendations are based on the tutor's saved session reports.
  function generateAIRecommendations() {
    if (sessionReports.length === 0) {
      setAiRecommendations([{ id: "first-report", type: "resource_suggestion", title: "Complete your first session report", description: "Reports unlock evidence-based progress views and clear family follow-ups.", priority: "medium", action: "Open session workspace", timestamp: "Ready now" }]);
      return;
    }

    const latest = sessionReports[0];
    const recommendations: AIRecommendation[] = [
      {
        id: `report-${latest.id}`,
        type: latest.engagement < 3 ? "session_optimization" : "resource_suggestion",
        title: latest.engagement < 3 ? `Plan shorter focus blocks for ${latest.childName}` : `Reuse what engaged ${latest.childName}`,
        description: latest.engagement < 3
          ? `The latest ${latest.subject} report logged engagement at ${latest.engagement}/5. Add a reset break and a clearer first task next time.`
          : `The latest ${latest.subject} report logged engagement at ${latest.engagement}/5. Turn the successful activity into the next session's opening prompt.`,
        priority: latest.engagement < 3 ? "high" : "medium",
        action: "Open whiteboard",
        timestamp: latest.date,
      },
      {
        id: "family-update",
        type: "parent_communication",
        title: "Share a concise family update",
        description: `Send the latest progress note for ${latest.childName} directly to the parent conversation.`,
        priority: "low",
        action: "Send update",
        timestamp: "Based on latest report",
      },
    ];
    setAiRecommendations(recommendations);
  }

  const sendAIMessage = async () => {
    const message = userMessage.trim();
    if (!message || aiLoading) return;

    const newMessage = { sender: "You", message, timestamp: new Date().toLocaleTimeString() };
    const history = aiChatMessages.map((item, index) => ({
      id: `teacher-chat-${index}`,
      role: item.sender === "AI" ? "assistant" as const : "user" as const,
      text: item.message,
      createdAt: new Date().toISOString(),
    }));
    setAiChatMessages((current) => [...current, newMessage]);
    setUserMessage("");
    setAiLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `I am a tutor. ${message}`,
          history,
          memories: [],
        }),
      });
      if (!response.ok || !response.body) throw new Error("The assistant is unavailable.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let answer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line) continue;
          const event = JSON.parse(line) as { kind: string; message: string };
          if (event.kind === "answer" || event.kind === "error") answer = event.message;
        }
      }
      setAiChatMessages((current) => [...current, {
        sender: "AI",
        message: answer || "I could not prepare a response. Please try again.",
        timestamp: new Date().toLocaleTimeString(),
      }]);
    } catch (error) {
      setAiChatMessages((current) => [...current, {
        sender: "AI",
        message: error instanceof Error ? error.message : "The assistant is unavailable right now.",
        timestamp: new Date().toLocaleTimeString(),
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  function initializeCollaborationTools() {
    setCollaborationTools(['whiteboard', 'screen_share', 'breakout_rooms', 'polls', 'document_share']);
  }

  function loadAnalytics() {
    if (sessionReports.length === 0) {
      setEngagementMetrics({ avgRating: 0, totalSessions: 0, retentionRate: 0, parentSatisfaction: 0, skillImprovement: 0 });
      return;
    }
    const average = (key: "engagement" | "mastery" | "behavior") => sessionReports.reduce((sum, report) => sum + report[key], 0) / sessionReports.length;
    setEngagementMetrics({
      avgRating: Number(average("behavior").toFixed(1)),
      totalSessions: sessionReports.length,
      retentionRate: Math.round(average("engagement") * 20),
      parentSatisfaction: Math.round(average("behavior") * 20),
      skillImprovement: Math.round(average("mastery") * 20),
    });
  }

  // Initialize AI recommendations and collaboration helpers for the signed-in tutor.
  useEffect(() => {
    const initializationTimer = setTimeout(() => {
      generateAIRecommendations();
      initializeCollaborationTools();
      loadAnalytics();
    }, 0);
    return () => clearTimeout(initializationTimer);
  }, [user, sessionReports]);

  const startCollaboration = (studentId: string) => {
    setIsCollaborating(true);
    const session = collaborationSessions.find(s => s.studentId === studentId);
    if (session) {
      setCollaborationSessions(prev => prev.map(s =>
        s.id === session.id ? { ...s, isActive: true } : s
      ));
    }
  };

  const endCollaboration = (studentId: string) => {
    setIsCollaborating(false);
    setCollaborationSessions(prev => prev.map(s =>
      s.studentId === studentId ? { ...s, isActive: false } : s
    ));
  };

  const toggleAIMode = () => {
    setActiveAIMMode(!activeAIMode);
    if (!activeAIMode) {
      // Generate AI insights when enabling
      setAiAnalysis("AI Mode activated. Analyzing teaching patterns for optimization opportunities...");
    } else {
      setAiAnalysis("AI Mode deactivated. Resume manual teaching mode.");
    }
  };

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
  }, [activeTab, brushSize, color]);

  // Functional canvas drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
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
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Save drawing as image
  const saveDrawing = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const completedBookings = bookings.filter((booking) => booking.status === "Completed");
  const currentInvoiceData = {
    gross: completedBookings.length * hourlyRate,
    classesTaught: completedBookings.length,
    rate: hourlyRate,
    hours: completedBookings.length,
    details: completedBookings.map((booking) => ({
      date: booking.date,
      desc: `${booking.student} - ${booking.subject}`,
      rate: hourlyRate,
      duration: "1.0 hr",
    })),
  };
  const feeAmount = (currentInvoiceData.gross * commissionRate) / 100;
  const netAmount = currentInvoiceData.gross - feeAmount;

  const handleDownloadInvoice = () => {
    setIsGeneratingPDF(true);
    const statement = [
      `Tutor Hub payout statement - ${selectedMonth}`,
      `Completed sessions: ${currentInvoiceData.classesTaught}`,
      `Gross earnings: $${currentInvoiceData.gross.toFixed(2)}`,
      `Platform commission (${commissionRate}%): -$${feeAmount.toFixed(2)}`,
      `Net payout: $${netAmount.toFixed(2)}`,
      "",
      ...currentInvoiceData.details.map((row) => `${row.date} | ${row.desc} | ${row.duration} | $${row.rate}/hr`),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([statement], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `tutor-hub-statement-${selectedMonth.replace(" ", "-").toLowerCase()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setIsGeneratingPDF(false);
    setGenerateSuccess(true);
    setTimeout(() => setGenerateSuccess(false), 3000);
  };

  const submitSessionReport = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentSession || !reportSummary.trim() || !reportNotes.trim()) return;
    setSavingReport(true);
    try {
      const completedBooking = await db.updateBookingStatus(currentSession.id, "Completed");
      const report = await db.createSessionReport({
        bookingId: currentSession.id,
        childId: currentSession.childId,
        childName: currentSession.student,
        tutorName: currentSession.tutorName,
        subject: currentSession.subject,
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        summary: reportSummary.trim(),
        progressNotes: reportNotes.trim(),
        ...reportScores,
      });
      const parentName = currentSession.childId === "tyler" ? "Sarah Jenkins" : "David Miller";
      const conversationId = `conv_parent_${currentSession.tutorName.toLowerCase().includes("alex") ? "alex" : currentSession.childId}`;
      await Promise.all([
        db.sendMessage({
          conversationId,
          senderName: currentSession.tutorName,
          senderRole: "teacher",
          recipientName: parentName,
          text: `Session update for ${currentSession.student}: ${report.summary}`,
        }),
        db.createNotification({
          userId: "parent",
          userRole: "parent",
          title: "New session report",
          body: `${currentSession.tutorName} published a ${currentSession.subject} update for ${currentSession.student}.`,
          type: "booking",
        }),
      ]);
      setBookings((current) => current.map((booking) => booking.id === completedBooking.id ? { ...booking, status: completedBooking.status } : booking));
      setSessionReports((current) => [report, ...current]);
      setShowCompletionModal(false);
      setCurrentSession(null);
      setSessionTimer(0);
      setReportSummary("");
      setReportNotes("");
      setReportScores({ engagement: 4, mastery: 3, behavior: 4 });
    } catch (error) {
      console.error("Failed to complete session:", error);
      setAiAnalysis("The session report could not be saved. Please check your connection and try again.");
    } finally {
      setSavingReport(false);
    }
  };

  const handleRecommendationAction = async (recommendation: AIRecommendation) => {
    if (recommendation.action === "Open whiteboard" || recommendation.action === "Open session workspace") {
      setWhiteboardPrompt(sessionReports[0]?.progressNotes || "Create a focused visual warm-up for the next session.");
      setActiveTab("whiteboard");
      return;
    }
    const latest = sessionReports[0];
    if (!latest) return;
    const parentName = latest.childId === "tyler" ? "Sarah Jenkins" : "David Miller";
    await db.sendMessage({
      conversationId: `conv_parent_${latest.tutorName.toLowerCase().includes("alex") ? "alex" : latest.childId}`,
      senderName: latest.tutorName,
      senderRole: "teacher",
      recipientName: parentName,
      text: `Progress update for ${latest.childName}: ${latest.summary}`,
    });
    setAiAnalysis(`A progress update for ${latest.childName} was added to the parent conversation.`);
  };

  const exportAiReport = () => {
    const content = [
      "Tutor Hub teaching insights",
      `Generated: ${new Date().toLocaleString()}`,
      "",
      ...aiRecommendations.map((recommendation) => `- ${recommendation.title}: ${recommendation.description}`),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "tutor-hub-insights.txt";
    link.click();
    URL.revokeObjectURL(url);
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
              className={`${styles.menuItem} ${activeTab === "analytics" ? styles.menuActive : ""}`}
              onClick={() => setActiveTab("analytics")}
            >
              <BarChart3 size={20} />
              <span>Advanced Analytics</span>
            </li>
            <li
              className={`${styles.menuItem} ${activeTab === "ai-assistant" ? styles.menuActive : ""}`}
              onClick={() => setActiveTab("ai-assistant")}
            >
              <Brain size={20} />
              <span>AI Assistant</span>
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
            {/* Gamification Profile Card */}
            <div style={{
              background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
              padding: "1.25rem",
              borderRadius: "16px",
              color: "white",
              border: "none",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{
                position: "absolute",
                top: "-20px",
                right: "-20px",
                width: "80px",
                height: "80px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "50%"
              }} />
              <div style={{
                position: "absolute",
                bottom: "-30px",
                left: "-30px",
                width: "100px",
                height: "100px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "50%"
              }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <Trophy size={24} style={{ color: "#FFD700" }} />
                  <div>
                    <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Level {gamificationStats.level}</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>{user?.name || "Coach Alex"}</div>
                  </div>
                </div>

                <div style={{ marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", justifyItems: "space-between", marginBottom: "0.25rem" }}>
                    <span style={{ fontSize: "0.8rem" }}>Progress</span>
                    <span style={{ fontSize: "0.8rem" }}>{gamificationStats.exp}/{gamificationStats.expToNext} XP</span>
                  </div>
                  <div style={{
                    height: "8px",
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "4px",
                    overflow: "hidden"
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${(gamificationStats.exp / gamificationStats.expToNext) * 100}%`,
                      background: "linear-gradient(90deg, #FFD700, #FFA500)",
                      borderRadius: "4px",
                      transition: "width 0.5s ease"
                    }} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "2rem", fontSize: "0.9rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Sparkles size={16} />
                    <span>{gamificationStats.coins} Coins</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Zap size={16} />
                    <span>{gamificationStats.streak} day streak</span>
                  </div>
                </div>
              </div>
            </div>

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

            {/* AI Assistant Quick Access */}
            <div style={{
              background: "linear-gradient(135deg, rgba(72, 107, 229, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)",
              padding: "1rem",
              borderRadius: "12px",
              border: "1px solid rgba(72, 107, 229, 0.2)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onClick={() => setActiveTab("ai-assistant")}
            >
              <div style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #486BE5, #9333EA)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Brain size={20} style={{ color: "white" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-navy)" }}>
                  AI Assistant Ready
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {aiRecommendations.length} recommendations available
                </div>
              </div>
              <div style={{
                width: "8px",
                height: "8px",
                background: "#10B981",
                borderRadius: "50%",
                animation: "pulse 2s infinite"
              }} />
            </div>

            {/* Active Collaboration Indicator */}
            {collaborationSessions.length > 0 && (
              <div style={{
                background: "rgba(16, 185, 129, 0.1)",
                padding: "0.75rem",
                borderRadius: "12px",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.8rem"
              }}>
                <div style={{
                  width: "8px",
                  height: "8px",
                  background: "#10B981",
                  borderRadius: "50%",
                  animation: "pulse 1s infinite"
                }} />
                <span style={{ color: "#059669", fontWeight: 600 }}>
                  {collaborationSessions.length} active collaboration session{collaborationSessions.length > 1 ? 's' : ''}
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
            {/* Session Timer */}
            {currentSession && (
              <div style={{
                background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(251, 146, 60, 0.1) 100%)",
                padding: "1.5rem",
                borderRadius: "16px",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.5rem"
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <Clock size={20} style={{ color: "#EF4444" }} />
                    <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-navy)" }}>
                      Active Session
                    </span>
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    {currentSession.student} - {currentSession.subject}
                  </p>
                  <p style={{ fontSize: "2rem", fontWeight: 700, color: "#EF4444", margin: "0.5rem 0" }}>
                    {formatTime(sessionTimer)}
                  </p>
                </div>
                <button
                  onClick={stopSession}
                  className={styles.btnPrimary}
                  style={{
                    background: "#EF4444",
                    padding: "0.75rem 1.5rem"
                  }}
                >
                  End Session
                </button>
              </div>
            )}

            {/* Quick Session Start Buttons */}
            {!currentSession && (
              <div style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: "16px",
                border: "1px solid rgba(29, 42, 68, 0.05)",
                marginBottom: "1.5rem"
              }}>
                <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 700 }}>
                  Quick Start Sessions
                </h3>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  {bookings.filter((booking) => booking.status === "Scheduled").slice(0, 3).map((booking) => (
                    <button
                      key={booking.id}
                      onClick={() => startSession(booking)}
                      className={styles.btnPrimary}
                      style={{
                        padding: "0.75rem 1.25rem",
                        fontSize: "0.9rem"
                      }}
                    >
                      Start with {booking.student}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Real-time Status Banner */}
            <div style={{
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
              padding: "1.5rem",
              borderRadius: "16px",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "4px",
                height: "100%",
                background: "linear-gradient(180deg, #10B981, #3B82F6)"
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <div style={{
                    width: "12px",
                    height: "12px",
                    background: "#10B981",
                    borderRadius: "50%",
                    animation: "pulse 2s infinite"
                  }} />
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-navy)" }}>
                    Live Session Status
                  </h3>
                </div>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                  You have {collaborationSessions.filter(s => s.isActive).length} active session{collaborationSessions.filter(s => s.isActive).length > 1 ? 's' : ''}
                  with {collaborationSessions.reduce((acc, s) => acc + (s.isActive ? 1 : 0), 0)} student{collaborationSessions.reduce((acc, s) => acc + (s.isActive ? 1 : 0), 0) > 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setIsCollaborating(!isCollaborating)}
                className={styles.btnPrimary}
                style={{
                  background: isCollaborating ? "var(--color-accent)" : "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.9rem"
                }}
              >
                <Video size={16} />
                {isCollaborating ? "End Collaboration" : "Start Collaboration"}
              </button>
            </div>

            {/* Functional Collaboration Tools */}
            {isCollaborating && (
              <div style={{
                background: "var(--bg-cream)",
                padding: "1.5rem",
                borderRadius: "16px",
                border: "1px solid rgba(29, 42, 68, 0.05)"
              }}>
                <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 700 }}>
                  Collaboration Tools
                </h3>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  {['whiteboard', 'screen_share', 'document_share', 'polls', 'breakout_rooms'].map((tool) => (
                    <button
                      key={tool}
                      onClick={() => collaborationTools.includes(tool) ? deactivateCollaborationTool(tool) : activateCollaborationTool(tool)}
                      className={styles.btnOutline}
                      style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        background: collaborationTools.includes(tool) ? "var(--color-primary)" : "white",
                        color: collaborationTools.includes(tool) ? "white" : "var(--text-navy)"
                      }}
                    >
                      {tool === 'whiteboard' && <Palette size={16} />}
                      {tool === 'screen_share' && <Video size={16} />}
                      {tool === 'document_share' && <BookOpen size={16} />}
                      {tool === 'polls' && <Target size={16} />}
                      {tool === 'breakout_rooms' && <Users size={16} />}
                      <span style={{ marginLeft: "0.5rem" }}>
                        {tool.replace('_', ' ')}
                      </span>
                    </button>
                  ))}
                </div>
                {collaborationTools.length > 0 && (
                  <div style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(72, 107, 229, 0.1)", borderRadius: "8px" }}>
                    <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                      Active Tools: {collaborationTools.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            )}

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
                  <span>AI Performance Score</span>
                  <Brain size={20} style={{ color: "var(--color-accent)" }} />
                </div>
                <div className={styles.dashCardValue}>94.7%</div>
                <span className={styles.dashCardSubtext} style={{ color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Star size={12} fill="var(--color-primary)" style={{ color: "var(--color-primary)" }} /> Top 5% AI-Optimized
                </span>
              </TiltCard>

              <TiltCard className={styles.dashCard}>
                <div className={styles.dashCardHeader}>
                  <span>Hours Taught (Month)</span>
                  <Clock size={20} style={{ color: "var(--color-secondary)" }} />
                </div>
                <div className={styles.dashCardValue}>{currentInvoiceData.hours} hrs</div>
                <span className={styles.dashCardSubtext}>
                  {currentInvoiceData.classesTaught} unique training sessions
                </span>
              </TiltCard>

              <TiltCard className={styles.dashCard}>
                <div className={styles.dashCardHeader}>
                  <span>Gamification Level</span>
                  <Trophy size={20} style={{ color: "var(--color-secondary)" }} />
                </div>
                <div className={styles.dashCardValue}>Level {gamificationStats.level}</div>
                <span className={styles.dashCardSubtext} style={{ color: "orange" }}>
                  {gamificationStats.exp}/{gamificationStats.expToNext} XP
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
                          15-minute Auto-Buffer Active: Guarding {item.student}&apos;s wrap-up session and prep time. (Next session pushed to safe window)
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
                  <span>AI-Powered Whiteboard Studio</span>
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Collaborate in real-time with AI suggestions and smart drawing tools.
                </p>
              </div>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
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
                <button
                  onClick={() => {
                    // AI Suggestion generation
                    const suggestions = [
                      "Try drawing a step-by-step process breakdown",
                      "Consider using color-coding for different concepts",
                      "Add simple icons to represent key ideas",
                      "Create a mind map structure for better organization"
                    ];
                    setAiSuggestions(suggestions);
                  }}
                  className={styles.btnSecondary}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.9rem"
                  }}
                >
                  <Brain size={16} />
                  AI Suggestions
                </button>
              </div>
            </div>

            {/* AI Suggestions Panel */}
            {aiSuggestions.length > 0 && (
              <div style={{
                background: "linear-gradient(135deg, rgba(72, 107, 229, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)",
                padding: "1rem",
                borderRadius: "12px",
                border: "1px solid rgba(72, 107, 229, 0.2)",
                marginBottom: "1.5rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <Sparkle size={16} style={{ color: "var(--color-accent)" }} />
                  <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>AI Drawing Suggestions</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {aiSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setWhiteboardPrompt(suggestion)}
                      className={styles.btnOutline}
                      style={{
                        fontSize: "0.85rem",
                        padding: "0.5rem 1rem",
                        borderRadius: "50px"
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

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

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className={styles.btnOutline} style={{ borderRadius: "8px", padding: "0.5rem 1.25rem" }} onClick={clearCanvas}>
                      Clear Screen
                    </button>
                    <button
                      onClick={saveDrawing}
                      className={styles.btnPrimary}
                      style={{ borderRadius: "8px", padding: "0.5rem 1.25rem", fontSize: "0.9rem" }}
                    >
                      <Save size={16} />
                      Save Drawing
                    </button>
                  </div>
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

         {/* ADVANCED ANALYTICS PANEL */}
        {activeTab === "analytics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            {/* Analytics Period Selector */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <BarChart3 size={24} style={{ color: "var(--color-primary)" }} />
                  <span>Advanced Analytics Dashboard</span>
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  AI-powered insights and performance metrics for optimized teaching strategies.
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {["week", "month", "quarter"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setAnalyticsPeriod(period as "week" | "month" | "quarter")}
                    className={styles.btnOutline}
                    style={{
                      padding: "0.5rem 1.25rem",
                      borderRadius: "8px",
                      background: analyticsPeriod === period ? "var(--color-primary)" : "white",
                      color: analyticsPeriod === period ? "white" : "var(--text-navy)"
                    }}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Performance Overview */}
            <div className={styles.dashGrid}>
              <TiltCard className={styles.dashCard}>
                <div className={styles.dashCardHeader}>
                  <span>Average Rating</span>
                  <Star size={20} style={{ color: "#FFD700" }} />
                </div>
                <div className={styles.dashCardValue}>{engagementMetrics.avgRating}/5.0</div>
                <span className={styles.dashCardSubtext} style={{ color: "green" }}>
                  ↑ 0.3 from last period
                </span>
              </TiltCard>

              <TiltCard className={styles.dashCard}>
                <div className={styles.dashCardHeader}>
                  <span>Student Retention</span>
                  <Target size={20} style={{ color: "var(--color-accent)" }} />
                </div>
                <div className={styles.dashCardValue}>{engagementMetrics.retentionRate}%</div>
                <span className={styles.dashCardSubtext} style={{ color: "var(--color-primary)" }}>
                  Industry benchmark: 78%
                </span>
              </TiltCard>

              <TiltCard className={styles.dashCard}>
                <div className={styles.dashCardHeader}>
                  <span>Parent Satisfaction</span>
                  <Heart size={20} style={{ color: "#EF4444" }} />
                </div>
                <div className={styles.dashCardValue}>{engagementMetrics.parentSatisfaction}%</div>
                <span className={styles.dashCardSubtext} style={{ color: "var(--color-secondary)" }}>
                  Excellent feedback score
                </span>
              </TiltCard>

              <TiltCard className={styles.dashCard}>
                <div className={styles.dashCardHeader}>
                  <span>Skill Improvement</span>
                  <TrendingUpIcon size={20} style={{ color: "var(--color-secondary)" }} />
                </div>
                <div className={styles.dashCardValue}>{engagementMetrics.skillImprovement}%</div>
                <span className={styles.dashCardSubtext} style={{ color: "orange" }}>
                  +12% from baseline
                </span>
              </TiltCard>
            </div>

            {/* Detailed Analytics Sections */}
            <div className={styles.grid2col}>
              {/* Student Progress Heatmap */}
              <div style={{ background: "white", padding: "2rem", borderRadius: "24px", border: "1px solid rgba(29, 42, 68, 0.05)" }}>
                <h3 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800 }}>
                  <Activity size={20} style={{ color: "var(--color-primary)" }} />
                  Student Engagement Heatmap
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {Object.entries(childrenMap).map(([childId, child]) => (
                    <div key={childId}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <span style={{ fontWeight: 600 }}>{child.name}</span>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                          Level {(childId.length % 5) + 1}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {(child.heatmap as number[]).map((value: number, index: number) => (
                          <div
                            key={index}
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "4px",
                              background: value === 4 ? "var(--color-primary)" :
                                        value === 3 ? "var(--color-secondary)" :
                                        value === 2 ? "#EAB308" :
                                        value === 1 ? "#F59E0B" : "#FDE047",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.75rem",
                              fontWeight: "700",
                              color: value >= 3 ? "white" : "var(--text-navy)"
                            }}
                          >
                            {value}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Insights Panel */}
              <div style={{ background: "white", padding: "2rem", borderRadius: "24px", border: "1px solid rgba(29, 42, 68, 0.05)" }}>
                <h3 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800 }}>
                  <Brain size={20} style={{ color: "var(--color-accent)" }} />
                  AI-Powered Insights
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div style={{
                    padding: "1rem",
                    background: "linear-gradient(135deg, rgba(72, 107, 229, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)",
                    borderRadius: "12px",
                    border: "1px solid rgba(72, 107, 229, 0.2)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <TargetIcon size={16} style={{ color: "var(--color-primary)" }} />
                      <span style={{ fontWeight: 700 }}>Optimization Opportunity</span>
                    </div>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-navy)" }}>
                      Moving sessions to earlier times could improve focus scores by 23% based on biometric patterns.
                    </p>
                  </div>

                  <div style={{
                    padding: "1rem",
                    background: "rgba(34, 197, 94, 0.1)",
                    borderRadius: "12px",
                    border: "1px solid rgba(34, 197, 94, 0.2)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <AwardIcon size={16} style={{ color: "#22C55E" }} />
                      <span style={{ fontWeight: 700 }}>Success Pattern Detected</span>
                    </div>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-navy)" }}>
                      Sessions with visual aids show 45% better retention rates across all student demographics.
                    </p>
                  </div>

                  <div style={{
                    padding: "1rem",
                    background: "rgba(251, 146, 60, 0.1)",
                    borderRadius: "12px",
                    border: "1px solid rgba(251, 146, 60, 0.2)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <AlertCircle size={16} style={{ color: "#FB923C" }} />
                      <span style={{ fontWeight: 700 }}>Attention Required</span>
                    </div>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-navy)" }}>
                      Tyler shows decreased engagement after 45 minutes. Consider shortening sessions or adding breaks.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Trends */}
            <div style={{ background: "white", padding: "2rem", borderRadius: "24px", border: "1px solid rgba(29, 42, 68, 0.05)" }}>
              <h3 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800 }}>
                <TrendingUpIcon size={20} style={{ color: "var(--color-primary)" }} />
                Performance Trends
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
                <div>
                  <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Session Duration Impact</h4>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ flex: 1 }}>
                      {[60, 45, 30].map((duration) => (
                        <div key={duration} style={{ marginBottom: "0.5rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                            <span style={{ fontSize: "0.85rem" }}>{duration} min</span>
                            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                              {85 - (duration - 30) * 2}%
                            </span>
                          </div>
                          <div style={{
                            height: "8px",
                            background: "rgba(29, 42, 68, 0.1)",
                            borderRadius: "4px",
                            overflow: "hidden"
                          }}>
                            <div style={{
                              height: "100%",
                              width: `${85 - (duration - 30) * 2}%`,
                              background: duration === 45 ? "var(--color-primary)" : "var(--color-secondary)",
                              borderRadius: "4px"
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Preferred Teaching Methods</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {[
                      { method: "Visual Aids", percentage: 92 },
                      { method: "Interactive Games", percentage: 88 },
                      { method: "Direct Instruction", percentage: 75 },
                      { method: "Group Activities", percentage: 68 }
                    ].map((item) => (
                      <div key={item.method}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                          <span style={{ fontSize: "0.85rem" }}>{item.method}</span>
                          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{item.percentage}%</span>
                        </div>
                        <div style={{
                          height: "8px",
                          background: "rgba(29, 42, 68, 0.1)",
                          borderRadius: "4px",
                          overflow: "hidden"
                        }}>
                          <div style={{
                            height: "100%",
                            width: `${item.percentage}%`,
                            background: "var(--color-primary)",
                            borderRadius: "4px"
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI ASSISTANT PANEL */}
        {activeTab === "ai-assistant" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Brain size={24} style={{ color: "var(--color-accent)" }} />
                  <span>AI Teaching Assistant</span>
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Real-time AI recommendations and insights to enhance your teaching effectiveness.
                </p>
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "50px",
                background: activeAIMode ? "var(--color-primary)" : "var(--bg-cream)",
                color: activeAIMode ? "white" : "var(--text-navy)",
                fontWeight: 700,
                fontSize: "0.9rem"
              }}>
                <div style={{
                  width: "8px",
                  height: "8px",
                  background: activeAIMode ? "#10B981" : "#EF4444",
                  borderRadius: "50%",
                  marginRight: "0.5rem"
                }} />
                AI Mode: {activeAIMode ? "Active" : "Standby"}
              </div>
            </div>

            {/* AI Recommendations */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Smart Recommendations</h3>
                <p style={{ marginTop: "-0.75rem", color: "var(--text-muted)", fontSize: "0.82rem" }}>{aiAnalysis}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
                {aiRecommendations.map((rec) => (
                  <div
                    key={rec.id}
                    style={{
                      flex: 1,
                      minWidth: "300px",
                      background: "white",
                      padding: "1.5rem",
                      borderRadius: "16px",
                      border: "1px solid rgba(29, 42, 68, 0.05)",
                      position: "relative",
                      overflow: "hidden"
                    }}
                  >
                    <div style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "4px",
                      height: "100%",
                      background: rec.priority === "high" ? "#EF4444" :
                                  rec.priority === "medium" ? "#F59E0B" : "#10B981"
                    }} />
                    <div style={{ marginBottom: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        {rec.type === "session_optimization" && <Target size={16} style={{ color: "var(--color-primary)" }} />}
                        {rec.type === "resource_suggestion" && <BookOpen size={16} style={{ color: "var(--color-secondary)" }} />}
                        {rec.type === "skill_focus" && <Brain size={16} style={{ color: "var(--color-accent)" }} />}
                        {rec.type === "parent_communication" && <MessageSquare size={16} style={{ color: "#10B981" }} />}
                        <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-muted)" }}>
                          {rec.type.replace(/_/g, ' ')}
                        </span>
                        <span style={{
                          fontSize: "0.8rem",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "50px",
                          background: rec.priority === "high" ? "rgba(239, 68, 68, 0.1)" :
                                    rec.priority === "medium" ? "rgba(245, 158, 11, 0.1)" : "rgba(16, 185, 129, 0.1)",
                          color: rec.priority === "high" ? "#EF4444" :
                                 rec.priority === "medium" ? "#F59E0B" : "#10B981"
                        }}>
                          {rec.priority}
                        </span>
                      </div>
                      <h4 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>{rec.title}</h4>
                      <p style={{ fontSize: "0.9rem", color: "var(--text-navy)", marginBottom: "1rem" }}>
                        {rec.description}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{rec.timestamp}</span>
                        <button
                          onClick={() => void handleRecommendationAction(rec)}
                          className={styles.btnPrimary}
                          style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                        >
                          {rec.action}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Chat Interface */}
            <div style={{
              background: "white",
              padding: "2rem",
              borderRadius: "24px",
              border: "1px solid rgba(29, 42, 68, 0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "1rem"
            }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>AI Consultation</h3>
              <div style={{
                height: "300px",
                overflowY: "auto",
                padding: "1rem",
                background: "var(--bg-cream)",
                borderRadius: "12px",
                border: "1px solid rgba(29, 42, 68, 0.05)"
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {aiChatMessages.map((message, index) => (
                    <div key={`${message.timestamp}-${index}`} style={{
                      background: message.sender === "AI" ? "var(--color-primary)" : "white",
                      color: message.sender === "AI" ? "white" : "var(--text-navy)",
                      padding: "1rem",
                      borderRadius: "12px",
                      maxWidth: "80%",
                      marginLeft: message.sender === "AI" ? 0 : "auto",
                      border: message.sender === "AI" ? "none" : "1px solid rgba(29, 42, 68, 0.1)"
                    }}>
                      <p style={{ fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>{message.message}</p>
                      <span style={{ display: "block", marginTop: "0.35rem", opacity: 0.7, fontSize: "0.65rem" }}>{message.timestamp}</span>
                    </div>
                  ))}
                  {aiLoading && <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Assistant is preparing a response…</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendAIMessage()}
                  placeholder="Ask your AI teaching assistant..."
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(29, 42, 68, 0.1)",
                    outline: "none"
                  }}
                />
                <button
                  onClick={sendAIMessage}
                  disabled={aiLoading || !userMessage.trim()}
                  className={styles.btnPrimary}
                  style={{ padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
                >
                  <MessageCircle size={16} />
                  Send
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
              <button
                  onClick={toggleAIMode}
                className={styles.btnPrimary}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: activeAIMode ? "var(--color-accent)" : "var(--color-primary)"
                }}
              >
                {activeAIMode ? (
                  <>
                    <X size={16} />
                    Disable AI Mode
                  </>
                ) : (
                  <>
                    <Brain size={16} />
                    Enable AI Mode
                  </>
                )}
              </button>
              <button onClick={exportAiReport} className={styles.btnOutline} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Download size={16} />
                Export AI Report
              </button>
              <button onClick={() => { generateAIRecommendations(); loadAnalytics(); setAiAnalysis("Insights refreshed from saved session reports."); }} className={styles.btnOutline} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <RefreshCw size={16} />
                Refresh Insights
              </button>
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
                  <strong>Tutor Hub Company</strong><br />
                  123 Learning Path Circle<br />
                  Education City, CA 90210<br />
                  tutor-safety@tutorhub.com
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong>STATEMENT NO:</strong> TH-{selectedMonth.replace(" ", "")}-042<br />
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
                <span>Statement exported successfully as a downloadable text record.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {showCompletionModal && currentSession && (
        <div className={styles.modalBackdrop} role="presentation">
          <form onSubmit={submitSessionReport} className={styles.modalContent} style={{ maxWidth: "620px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: "1.25rem" }}>Complete {currentSession.subject}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "0.25rem" }}>Publish a progress update for {currentSession.student}.</p>
              </div>
              <button type="button" onClick={() => { setShowCompletionModal(false); setIsTimerRunning(true); }} style={{ background: "none", border: "none", cursor: "pointer" }} aria-label="Return to active session"><X size={22} /></button>
            </div>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontWeight: 700, fontSize: "0.82rem" }}>
              Session summary
              <textarea required value={reportSummary} onChange={(event) => setReportSummary(event.target.value)} placeholder="What did the learner practise and achieve?" rows={3} style={{ padding: "0.8rem", borderRadius: "10px", border: "1px solid rgba(29,42,68,0.15)", resize: "vertical", font: "inherit" }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontWeight: 700, fontSize: "0.82rem" }}>
              Next step for home and the next session
              <textarea required value={reportNotes} onChange={(event) => setReportNotes(event.target.value)} placeholder="Add the next activity, support, or observation." rows={3} style={{ padding: "0.8rem", borderRadius: "10px", border: "1px solid rgba(29,42,68,0.15)", resize: "vertical", font: "inherit" }} />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
              {(["engagement", "mastery", "behavior"] as const).map((score) => (
                <label key={score} style={{ display: "flex", flexDirection: "column", gap: "0.35rem", textTransform: "capitalize", fontSize: "0.78rem", fontWeight: 700 }}>
                  {score}
                  <select value={reportScores[score]} onChange={(event) => setReportScores((current) => ({ ...current, [score]: Number(event.target.value) }))} style={{ padding: "0.65rem", borderRadius: "8px", border: "1px solid rgba(29,42,68,0.15)", background: "white" }}>
                    {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} / 5</option>)}
                  </select>
                </label>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button type="button" className={styles.btnOutline} onClick={() => { setShowCompletionModal(false); setIsTimerRunning(true); }} disabled={savingReport}>Keep session open</button>
              <button type="submit" className={styles.btnPrimary} disabled={savingReport}>{savingReport ? "Publishing…" : "Complete & publish update"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  </ProtectedRoute>
  );
}
