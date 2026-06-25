"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "../page.module.css";
import { 
  Users, 
  Search, 
  ShieldCheck, 
  Video, 
  MapPin, 
  Calendar, 
  Award, 
  Sparkles, 
  Zap, 
  Flame, 
  Plus, 
  UserPlus, 
  ArrowLeft,
  X,
  Play,
  Heart,
  TrendingUp,
  Brain,
  GraduationCap,
  CreditCard,
  Lock,
  LogOut,
  Coins,
  Bot,
  Target,
  Gamepad2,
  Pizza,
  User,
  AlertCircle,
  CheckCircle,
  Palette
} from "lucide-react";
import { db, Child, Booking, Tutor } from "@/lib/db";
import { useAuth, ProtectedRoute } from "@/components/AuthProvider";
import AvatarIcon from "@/components/AvatarIcon";

// Mock Data for children profiles (baseline fallback)
const CHILDREN_DATA = {
  tyler: {
    name: "Tyler Jenkins",
    age: 10,
    coins: 45,
    avatar: "fox",
    struggleArea: "Social cues and conversational turn-taking",
    successArea: "Non-verbal recognition and emotional expressions",
    heatmap: [4, 2, 0, 1, 3, 4, 2, 3, 0, 4, 3, 2], // Mock strength values
    classes: [
      { id: 1, subject: "Conversational Dynamics", teacher: "Coach Alex", date: "Today, 4:00 PM", status: "Scheduled" },
      { id: 2, subject: "Active Listening Lab", teacher: "Sarah P.", date: "June 28, 2:00 PM", status: "Scheduled" }
    ]
  },
  emily: {
    name: "Emily Jenkins",
    age: 8,
    coins: 90,
    avatar: "unicorn",
    struggleArea: "Sensory overload pacing and executive task focus",
    successArea: "Written journaling and structured visual aids",
    heatmap: [1, 3, 4, 4, 2, 1, 0, 4, 4, 1, 2, 4],
    classes: [
      { id: 3, subject: "Anxiety Coping Tools", teacher: "Dr. Jessica", date: "Tomorrow, 10:00 AM", status: "Scheduled" },
      { id: 4, subject: "Visual Arts Focus", teacher: "Mike L.", date: "July 1, 11:30 AM", status: "Scheduled" }
    ]
  }
};

// Mock Tutors for AI Matching (baseline fallback)
const TUTORS = [
  {
    name: "Coach Alex M.",
    specialties: ["ADHD-Friendly", "Autism-Informed", "Social Skills"],
    experience: "8 Years",
    rating: "4.9/5",
    videoDuration: "0:30",
    introText: "Hey! I focus on interactive game-based social modeling. Let's build social confidence together!",
    avatar: "coach"
  },
  {
    name: "Sarah Parker, M.Ed.",
    specialties: ["Dyslexia Specialist", "Visual Learning", "English"],
    experience: "12 Years",
    rating: "5.0/5",
    videoDuration: "0:45",
    introText: "Hi parents! I craft custom visual guides to make reading and structural spelling stress-free.",
    avatar: "teacher"
  },
  {
    name: "Dr. Jessica Chen",
    specialties: ["Anxiety Support", "Behavioral Therapy", "Self-Regulation"],
    experience: "15 Years",
    rating: "4.95/5",
    videoDuration: "0:35",
    introText: "Welcome. My sessions incorporate mindfulness-based self-regulation templates for learning ease.",
    avatar: "therapist"
  }
];

function ParentDashboardContent() {
  const { user, signOut } = useAuth();
  const searchParams = useSearchParams();

  const [selectedChild, setSelectedChild] = useState<"tyler" | "emily">("tyler");
  const [children, setChildren] = useState<Record<string, Child>>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState({
    personality: "",
    needs: "",
    specialization: ""
  });
  const [matchedTutor, setMatchedTutor] = useState<any | null>(null);
  
  // QuickBook Form States
  const [quickBookSubject, setQuickBookSubject] = useState("");
  const [quickBookTime, setQuickBookTime] = useState("Immediate (within 60m)");
  const [quickBookSuccess, setQuickBookSuccess] = useState(false);
  const [bookedTutor, setBookedTutor] = useState("");

  // Payment integration states
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockBookingData, setMockBookingData] = useState<{
    childId: string;
    childName: string;
    tutorName: string;
    subject: string;
    date: string;
    time: string;
    amount: number;
  } | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardError, setCardError] = useState("");
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);

  // Redirect back success/canceled handler
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "true") {
      const pendingStr = localStorage.getItem("pending_booking");
      localStorage.removeItem("pending_booking");

      let pending = pendingStr ? JSON.parse(pendingStr) : null;
      if (!pending) {
        // Fallback if localStorage was cleared
        pending = {
          childId: selectedChild,
          childName: children[selectedChild]?.name || "Tyler Jenkins",
          tutorName: searchParams.get("tutor") || "Specialist Tutor",
          subject: searchParams.get("subject") || "Specialist Session",
          date: "July 2",
          time: "3:00 PM"
        };
      }

      async function createStripeBooking() {
        try {
          const newBooking = await db.createBooking({
            childId: pending.childId,
            childName: pending.childName,
            tutorName: pending.tutorName,
            subject: pending.subject,
            date: pending.date,
            time: pending.time
          });

          setBookings(prev => {
            if (prev.some(b => b.id === newBooking.id)) return prev;
            return [...prev, newBooking];
          });

          setPaymentSuccessMessage(`Payment Successful! Booking with ${pending.tutorName} for ${pending.childName} has been confirmed via Stripe.`);
          setTimeout(() => setPaymentSuccessMessage(null), 6000);
          
          if (pending.subject.startsWith("Emergency Substitute:")) {
            setBookedTutor(pending.tutorName);
            setQuickBookSuccess(true);
          }
        } catch (err) {
          console.error("Error creating stripe booking:", err);
        } finally {
          window.history.replaceState({}, "", "/parent");
        }
      }
      createStripeBooking();
    } else if (canceled === "true") {
      alert("Payment process canceled. No charges were made.");
      localStorage.removeItem("pending_booking");
      window.history.replaceState({}, "", "/parent");
    }
  }, [searchParams, children, selectedChild]);

  // Initiate Stripe checkout or mock gateway fallback
  const handleInitiateCheckout = async (bookingDetails: {
    childId: string;
    childName: string;
    tutorName: string;
    subject: string;
    date: string;
    time: string;
    amount: number;
  }) => {
    setPaymentLoading(true);
    setCardError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: bookingDetails.subject,
          tutorName: bookingDetails.tutorName,
          childName: bookingDetails.childName,
          amount: bookingDetails.amount
        })
      });

      if (!response.ok) {
        throw new Error("Failed to contact payment gateway");
      }

      const data = await response.json();

      if (data.mock) {
        // Stripe credentials missing -> Fallback to client mock modal
        setMockBookingData(bookingDetails);
        setShowMockModal(true);
      } else if (data.url) {
        // Save pending booking details to localStorage for post-Stripe redirection processing
        localStorage.setItem("pending_booking", JSON.stringify(bookingDetails));
        window.location.href = data.url;
      } else {
        throw new Error("Invalid server response");
      }
    } catch (err: any) {
      console.warn("Stripe checkout failed/unavailable, falling back to mock payment modal:", err);
      // Connection fails / stripe keys not setup -> Fallback to client mock modal
      setMockBookingData(bookingDetails);
      setShowMockModal(true);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Process mock card details directly inside dashboard
  const handleProcessMockPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockBookingData) return;

    if (cardNumber.replace(/\s/g, "").length < 16) {
      setCardError("Card number must be 16 digits");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      setCardError("Expiry date must be MM/YY");
      return;
    }
    if (cardCvc.length < 3) {
      setCardError("CVC must be 3 digits");
      return;
    }

    setCardError("");
    setPaymentLoading(true);

    // Simulate 2 second loading delay
    setTimeout(async () => {
      try {
        const newBooking = await db.createBooking({
          childId: mockBookingData.childId,
          childName: mockBookingData.childName,
          tutorName: mockBookingData.tutorName,
          subject: mockBookingData.subject,
          date: mockBookingData.date,
          time: mockBookingData.time
        });

        setBookings(prev => {
          if (prev.some(b => b.id === newBooking.id)) return prev;
          return [...prev, newBooking];
        });

        setPaymentLoading(false);
        setShowMockModal(false);
        setPaymentSuccessMessage(`Booking with ${mockBookingData.tutorName} has been confirmed! Mock payment successful.`);
        setTimeout(() => setPaymentSuccessMessage(null), 6000);
        
        if (mockBookingData.subject.startsWith("Emergency Substitute:")) {
          setBookedTutor(mockBookingData.tutorName);
          setQuickBookSuccess(true);
        }

        // Reset card fields
        setCardNumber("");
        setCardExpiry("");
        setCardCvc("");
        setCardName("");
      } catch (err) {
        console.error(err);
        setCardError("Failed to save booking. Please try again.");
        setPaymentLoading(false);
      }
    }, 2000);
  };

  useEffect(() => {
    async function loadData() {
      const dataChildren = await db.getChildren();
      const dataBookings = await db.getBookings();
      const dataTutors = await db.getTutors();
      setChildren(dataChildren);
      setBookings(dataBookings);
      setTutors(dataTutors);
    }
    loadData();
  }, []);

  const currentChild = children[selectedChild] || {
    id: selectedChild,
    ...CHILDREN_DATA[selectedChild]
  };

  const currentChildBookings = bookings.filter(b => b.childId === selectedChild);

  const handleSelectOption = (key: string, value: string) => {
    setQuizAnswers(prev => ({ ...prev, [key]: value }));
    if (quizStep < 3) {
      setQuizStep(prev => prev + 1);
    } else {
      // Find a match based on answers
      const matchIndex = value === "ADHD Support" ? 0 : value === "Dyslexia Support" ? 1 : 2;
      const listTutors = tutors.length > 0 ? tutors : TUTORS;
      setMatchedTutor(listTutors[matchIndex]);
      setQuizStep(4);
    }
  };

  const resetQuiz = () => {
    setShowQuiz(false);
    setQuizStep(1);
    setMatchedTutor(null);
    setQuizAnswers({ personality: "", needs: "", specialization: "" });
  };

  const handleQuickBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickBookSubject) return;
    
    // Auto match emergency tutor
    const listTutors = tutors.length > 0 ? tutors : TUTORS;
    const randomTutor = listTutors[Math.floor(Math.random() * listTutors.length)];
    
    handleInitiateCheckout({
      childId: selectedChild,
      childName: currentChild.name,
      tutorName: randomTutor.name,
      subject: `Emergency Substitute: ${quickBookSubject}`,
      date: "Today",
      time: quickBookTime,
      amount: 75
    });
  };

  const [rewardMessage, setRewardMessage] = useState<string | null>(null);

  const handleToggleGoal = async (goalId: string, completed: boolean) => {
    try {
      const updatedChild = await db.updateChildGoal(selectedChild, goalId, completed);
      setChildren(prev => ({
        ...prev,
        [selectedChild]: updatedChild
      }));
    } catch (err) {
      console.error("Failed to update goal:", err);
    }
  };

  const handleRedeemReward = async (rewardName: string, cost: number) => {
    if (currentChild.coins < cost) {
      alert(`Oops! Not enough coins. ${currentChild.name} needs ${cost - currentChild.coins} more coins.`);
      return;
    }
    try {
      const newCoins = currentChild.coins - cost;
      const updatedChild = await db.updateChildCoins(selectedChild, newCoins);
      setChildren(prev => ({
        ...prev,
        [selectedChild]: {
          ...updatedChild,
          goals: currentChild.goals // Keep current goals loaded in memory
        }
      }));
      setRewardMessage(`Success: Redeemed "${rewardName}" for ${currentChild.name}! 100% Parent Vetted.`);
      setTimeout(() => setRewardMessage(null), 4000);
    } catch (err) {
      console.error("Failed to redeem reward:", err);
    }
  };

  return (
    <div className={styles.dashLayout}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <GraduationCap size={28} />
          <span>Tutor-Hub</span>
        </div>
        <ul className={styles.sidebarMenu}>
          <li className={`${styles.menuItem} ${styles.menuActive}`}>
            <Users size={20} />
            <span>Dashboard</span>
          </li>
          <li className={styles.menuItem} onClick={() => setShowQuiz(true)}>
            <Sparkles size={20} />
            <span>AI Perfect Match</span>
          </li>
          <li className={styles.menuItem} onClick={() => {
            document.getElementById("quickbook-section")?.scrollIntoView({ behavior: "smooth" });
          }}>
            <Zap size={20} />
            <span>Emergency QuickBook</span>
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
              <User size={16} style={{ color: "var(--text-muted)" }} />
              <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                {user.name}
              </span>
            </div>
          )}
          <div style={{
            background: "var(--sticky-yellow)",
            padding: "1rem",
            borderRadius: "12px",
            fontSize: "0.8rem",
            border: "1px solid rgba(29, 42, 68, 0.05)",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontWeight: 700 }}>
              <ShieldCheck size={16} style={{ color: "var(--color-primary)" }} />
              <span>Safety Guaranteed:</span>
            </div>
            <p style={{ margin: 0 }}>All tutors have passed a 7-point background & reference verify.</p>
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
              cursor: "pointer",
              fontFamily: "inherit"
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Dashboard Content */}
      <main className={styles.dashContent}>
        {paymentSuccessMessage && (
          <div style={{
            background: "#E6F7F0",
            color: "#2EC4B6",
            padding: "1rem 1.5rem",
            borderRadius: "16px",
            fontSize: "0.95rem",
            fontWeight: 700,
            marginBottom: "2rem",
            border: "1px solid #2EC4B6",
            boxShadow: "0 4px 12px rgba(46, 196, 182, 0.15)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <CheckCircle size={18} />
            <span>{paymentSuccessMessage}</span>
          </div>
        )}

        <header className={styles.dashHeader}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Parent Dashboard</h1>
            <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Welcome back, {user?.name || "parent"}. Manage profiles and monitor your children's learning pathways.
            </p>
          </div>

          {/* Child Sub-Profile Switcher */}
          <div className={styles.userProfileBadge} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AvatarIcon avatar={currentChild.avatar} size={16} />
            <select 
              value={selectedChild} 
              onChange={(e) => setSelectedChild(e.target.value as "tyler" | "emily")}
              style={{
                border: "none",
                background: "none",
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "var(--text-navy)",
                cursor: "pointer",
                outline: "none"
              }}
            >
              <option value="tyler">Tyler Jenkins (Age 10)</option>
              <option value="emily">Emily Jenkins (Age 8)</option>
            </select>
          </div>
        </header>

        {/* Dashboard Stats */}
        <div className={styles.dashGrid}>
          {/* Strength Areas */}
          <div className={styles.dashCard}>
            <div className={styles.dashCardHeader}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}><Sparkles size={16} /> Success Area</span>
              <Award size={18} style={{ color: "var(--color-primary)" }} />
            </div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem", marginTop: "0.5rem" }}>
              {currentChild.successArea}
            </div>
            <span className={styles.dashCardSubtext}>Pulled from tutor session reviews</span>
          </div>

          {/* Struggles Grid */}
          <div className={styles.dashCard}>
            <div className={styles.dashCardHeader}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}><Search size={16} /> Struggle Focus</span>
              <Brain size={18} style={{ color: "var(--color-accent)" }} />
            </div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem", marginTop: "0.5rem" }}>
              {currentChild.struggleArea}
            </div>
            <span className={styles.dashCardSubtext}>Matching algorithms focus here</span>
          </div>

          {/* Gamified Coins */}
          <div className={styles.dashCard} style={{ background: "linear-gradient(135deg, #FFF9EB 0%, #FFF1D6 100%)" }}>
            <div className={styles.dashCardHeader}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}><Coins size={16} /> Knowledge Coins</span>
              <Flame size={18} style={{ color: "var(--color-secondary)" }} />
            </div>
            <div className={styles.dashCardValue} style={{ color: "#EAA43F" }}>
              {currentChild.coins}
            </div>
            <span className={styles.dashCardSubtext}>Earned for attending & homework completions</span>
          </div>
        </div>

        {/* AI Perfect Match Action Card */}
        <div className={styles.quizCard}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <div style={{ background: "rgba(255, 255, 255, 0.2)", padding: "0.75rem", borderRadius: "12px", display: "inline-flex" }}>
              <Bot size={32} style={{ color: "white" }} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>AI-Driven Tutor Matching</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
                Take our interactive learning difference & soft-skill personality quiz to match {currentChild.name} with the ideal specialist tutor.
              </p>
            </div>
          </div>
          <div>
            <button className={styles.btnPrimary} onClick={() => setShowQuiz(true)}>
              Start Personality Matching Quiz &rarr;
            </button>
          </div>
        </div>

        {/* Learning Snapshot & Scheduled Sessions */}
        <div className={styles.grid2col}>
          {/* Heatmap Snapshot */}
          <div className={styles.calendarContainer}>
            <h3 style={{ fontWeight: 800, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <TrendingUp size={20} /> Learning Snapshot Heatmap ({currentChild.name})
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              Shows daily learning engagement and performance scoring mapped from session reports.
            </p>
            
            <div className={styles.heatmapContainer}>
              <div className={styles.heatmapGrid}>
                {currentChild.heatmap.map((val, idx) => (
                  <div 
                    key={idx} 
                    className={`${styles.heatmapCell} ${
                      val === 0 ? styles.cell0 : 
                      val === 1 ? styles.cell1 : 
                      val === 2 ? styles.cell2 : 
                      val === 3 ? styles.cell3 : 
                      styles.cell4
                    }`}
                    title={`Engagement Score: ${val}/4`}
                  />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                <span>Low Engagement</span>
                <span>Exceptional Progress</span>
              </div>
            </div>
          </div>

          {/* Active Sessions list */}
          <div className={styles.calendarContainer}>
            <h3 style={{ fontWeight: 800, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Calendar size={20} /> Scheduled Sessions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {currentChildBookings.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontStyle: "italic" }}>
                  No sessions scheduled yet. Use QuickBook or AI Perfect Match to get started!
                </p>
              ) : (
                currentChildBookings.map((cls) => (
                  <div key={cls.id} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1rem",
                    background: "var(--bg-cream)",
                    borderRadius: "12px",
                    borderLeft: "4px solid var(--color-primary)"
                  }}>
                    <div>
                      <h4 style={{ fontWeight: 700 }}>{cls.subject}</h4>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        Tutor: {cls.tutorName} &bull; {cls.date} at {cls.time}
                      </span>
                    </div>
                    <span style={{
                      fontSize: "0.8rem",
                      background: "#E6F7F0",
                      color: "#2EC4B6",
                      padding: "0.3rem 0.6rem",
                      borderRadius: "6px",
                      fontWeight: 700
                    }}>{cls.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* NEW FEATURES: Interactive Goal Checklist & Reward Store */}
        <div className={styles.grid2col} style={{ marginTop: "2rem", marginBottom: "2rem" }}>
          {/* Goal Checklist */}
          <div className={styles.calendarContainer} style={{ background: "linear-gradient(135deg, #F0FAF7 0%, #FFFFFF 100%)", border: "1px solid rgba(46, 196, 182, 0.15)" }}>
            <h3 style={{ fontWeight: 800, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Target size={20} /> Active Learning Goals ({currentChild.name})
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              Toggle achievements completed in class or during home assignments to award Knowledge Coins.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {currentChild.goals && currentChild.goals.map((goal) => (
                <label 
                   key={goal.id} 
                   style={{
                     display: "flex",
                     alignItems: "center",
                     gap: "0.75rem",
                     padding: "0.85rem 1rem",
                     background: goal.completed ? "#E6F7F0" : "var(--bg-cream)",
                     borderRadius: "12px",
                     cursor: "pointer",
                     transition: "all 0.2s ease",
                     border: goal.completed ? "1px solid #2EC4B6" : "1px solid rgba(29, 42, 68, 0.05)",
                     opacity: goal.completed ? 0.9 : 1
                   }}
                >
                  <input 
                    type="checkbox" 
                    checked={goal.completed}
                    onChange={(e) => handleToggleGoal(goal.id, e.target.checked)}
                    style={{
                      width: "18px",
                      height: "18px",
                      accentColor: "var(--color-primary)",
                      cursor: "pointer"
                    }}
                  />
                  <div style={{ flexGrow: 1 }}>
                    <span style={{ 
                      fontWeight: 650, 
                      fontSize: "0.9rem",
                      textDecoration: goal.completed ? "line-through" : "none",
                      color: goal.completed ? "var(--text-muted)" : "var(--text-navy)"
                    }}>
                      {goal.text}
                    </span>
                  </div>
                  <span style={{
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    background: goal.completed ? "#2EC4B6" : "var(--sticky-yellow)",
                    color: goal.completed ? "var(--color-white)" : "var(--text-navy)",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "6px",
                  }}>
                    {goal.completed ? "Earned!" : `+${goal.reward} Coins`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Gamified Reward Store */}
          <div className={styles.calendarContainer} style={{ background: "linear-gradient(135deg, #FFF9EB 0%, #FFFFFF 100%)", border: "1px solid rgba(248, 192, 100, 0.25)" }}>
            <h3 style={{ fontWeight: 800, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Coins size={20} /> Knowledge Coin Reward Store
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              Spend your child's hard-earned Knowledge Coins to claim parent-vetted learning milestone rewards!
            </p>

            {rewardMessage && (
              <div style={{
                background: "#E6F7F0",
                color: "#2EC4B6",
                padding: "0.85rem 1rem",
                borderRadius: "12px",
                fontSize: "0.85rem",
                fontWeight: 700,
                marginBottom: "1rem",
                border: "1px solid #2EC4B6",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem"
              }}>
                <CheckCircle size={16} />
                <span>{rewardMessage}</span>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { name: "1 Hour Roblox / Gaming Time", cost: 30, icon: <Gamepad2 size={16} /> },
                { name: "New Visual Sketchbook", cost: 50, icon: <Palette size={16} /> },
                { name: "Double Scoop Mint Chip Ice Cream", cost: 20, icon: <Sparkles size={16} /> },
                { name: "Choose Dinner Tonight", cost: 15, icon: <Pizza size={16} /> }
              ].map((reward, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.85rem 1rem",
                    background: "var(--bg-cream)",
                    borderRadius: "12px",
                    border: "1px solid rgba(29, 42, 68, 0.05)"
                  }}
                >
                  <div style={{ fontWeight: 650, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {reward.icon}
                    <span>{reward.name}</span>
                  </div>
                  <button 
                    onClick={() => handleRedeemReward(reward.name, reward.cost)}
                    className={currentChild.coins >= reward.cost ? styles.btnSecondary : styles.btnOutline}
                    style={{
                      padding: "0.35rem 0.75rem",
                      fontSize: "0.8rem",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    Claim ({reward.cost} <Coins size={14} style={{ color: "#E9C46A" }} />)
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Last-Minute Booking Section */}
        <section id="quickbook-section" className={styles.calendarContainer} style={{ background: "linear-gradient(135deg, #FFEBF0 0%, #FFFFFF 100%)", border: "1px solid rgba(226, 126, 140, 0.2)" }}>
          <h3 style={{ fontWeight: 800, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-accent-hover)" }}>
            <Zap size={22} fill="var(--color-accent)" /> Homework Emergency Substitute booking
          </h3>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Need an on-demand verified substitute tutor within the next hour? Choose a topic to search our active emergency queue.
          </p>

          {!quickBookSuccess ? (
            <form onSubmit={handleQuickBook} style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <input 
                type="text" 
                placeholder="Describe subject (e.g. Social script reading, Math exam preparation)" 
                value={quickBookSubject}
                onChange={(e) => setQuickBookSubject(e.target.value)}
                required
                style={{
                  flexGrow: 1,
                  padding: "0.85rem 1.25rem",
                  borderRadius: "12px",
                  border: "2px solid rgba(29, 42, 68, 0.1)",
                  outline: "none",
                  fontWeight: 600
                }}
              />
              <select 
                value={quickBookTime}
                onChange={(e) => setQuickBookTime(e.target.value)}
                style={{
                  padding: "0.85rem 1.25rem",
                  borderRadius: "12px",
                  border: "2px solid rgba(29, 42, 68, 0.1)",
                  fontWeight: 600,
                  outline: "none"
                }}
              >
                <option>Immediate (within 60m)</option>
                <option>Tonight (within 4 hours)</option>
              </select>
              <button type="submit" className={styles.btnSecondary} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                Find Substitute <Search size={18} />
              </button>
            </form>
          ) : (
            <div style={{
              background: "#E6F7F0",
              color: "#2EC4B6",
              padding: "1.5rem",
              borderRadius: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <h4 style={{ fontWeight: 800, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle size={18} /> Emergency Booking Vetted & Confirmed!</h4>
                <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                  <strong>{bookedTutor}</strong> has accepted the emergency booking for "{quickBookSubject}". Link sent to email!
                </p>
              </div>
              <button className={styles.btnOutline} onClick={() => {
                setQuickBookSuccess(false);
                setQuickBookSubject("");
              }}>
                Book Another
              </button>
            </div>
          )}
        </section>
      </main>

      {/* AI Matching Quiz Modal */}
      {showQuiz && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontWeight: 800, fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><Bot size={22} /> AI Perfect Match Quiz</h3>
              <button onClick={resetQuiz} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={24} />
              </button>
            </div>

            {/* Quiz Wizard Steps */}
            {quizStep === 1 && (
              <div>
                <p style={{ marginBottom: "1.5rem", color: "var(--text-muted)" }}>
                  Step 1: Describe {currentChild.name}'s social personality style:
                </p>
                <div className={styles.optionGrid}>
                  <button className={styles.optionButton} onClick={() => handleSelectOption("personality", "Shy & Reserved")}>
                    Shy & Reserved (needs visual pacing)
                  </button>
                  <button className={styles.optionButton} onClick={() => handleSelectOption("personality", "Highly Energetic")}>
                    Highly Energetic (needs interactive loops)
                  </button>
                  <button className={styles.optionButton} onClick={() => handleSelectOption("personality", "Task Oriented")}>
                    Task Oriented (needs structured checklists)
                  </button>
                  <button className={styles.optionButton} onClick={() => handleSelectOption("personality", "Creative Explorer")}>
                    Creative Explorer (needs modeling stories)
                  </button>
                </div>
              </div>
            )}

            {quizStep === 2 && (
              <div>
                <p style={{ marginBottom: "1.5rem", color: "var(--text-muted)" }}>
                  Step 2: Choose the primary learning focus target:
                </p>
                <div className={styles.optionGrid}>
                  <button className={styles.optionButton} onClick={() => handleSelectOption("needs", "Social Skills Development")}>
                    Social Cue Modeling
                  </button>
                  <button className={styles.optionButton} onClick={() => handleSelectOption("needs", "Focus and Organization")}>
                    Attention & Executive Function
                  </button>
                  <button className={styles.optionButton} onClick={() => handleSelectOption("needs", "Reading & Writing Mechanics")}>
                    Spelling & Reading Decoding
                  </button>
                  <button className={styles.optionButton} onClick={() => handleSelectOption("needs", "Coping with Anxiety")}>
                    Emotional Self-Regulation
                  </button>
                </div>
              </div>
            )}

            {quizStep === 3 && (
              <div>
                <p style={{ marginBottom: "1.5rem", color: "var(--text-muted)" }}>
                  Step 3: Are there any specific learning differences or needs?
                </p>
                <div className={styles.optionGrid}>
                  <button className={styles.optionButton} onClick={() => handleSelectOption("specialization", "ADHD Support")}>
                    ADHD-Friendly Tutor
                  </button>
                  <button className={styles.optionButton} onClick={() => handleSelectOption("specialization", "Dyslexia Support")}>
                    Dyslexia Specialist
                  </button>
                  <button className={styles.optionButton} onClick={() => handleSelectOption("specialization", "Autism-Informed")}>
                    Autism-Informed / Neurodiverse Vetted
                  </button>
                  <button className={styles.optionButton} onClick={() => handleSelectOption("specialization", "None / General Study")}>
                    None / General Social Support
                  </button>
                </div>
              </div>
            )}

            {quizStep === 4 && matchedTutor && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={{
                  background: "var(--sticky-green)",
                  padding: "1.5rem",
                  borderRadius: "20px",
                  border: "2px solid var(--color-primary)"
                }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-primary)", fontWeight: 700, letterSpacing: "1px" }}>98% ALGORITHM MATCH SCORE</span>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center", margin: "1rem 0" }}>
                    <AvatarIcon avatar={matchedTutor.avatar} size={24} />
                    <div>
                      <h4 style={{ fontWeight: 800, fontSize: "1.2rem" }}>{matchedTutor.name}</h4>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        Experience: {matchedTutor.experience} &bull; Rating: {matchedTutor.rating}
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.9rem", fontStyle: "italic", color: "var(--text-navy)" }}>
                    &ldquo;{matchedTutor.introText}&rdquo;
                  </p>
                  
                  {/* Specialties tag list */}
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
                    {matchedTutor.specialties.map((spec: string, i: number) => (
                      <span key={i} style={{
                        background: "var(--color-white)",
                        padding: "0.3rem 0.6rem",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: 700
                      }}>{spec}</span>
                    ))}
                  </div>
                </div>

                {/* Safety Verification & Intro Video play button */}
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div style={{
                    flexGrow: 1,
                    background: "var(--bg-cream)",
                    padding: "1rem",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem"
                  }}>
                    <ShieldCheck size={24} style={{ color: "#2EC4B6" }} />
                    <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>Vetted 7-Point Background Check Verified</span>
                  </div>

                  <button 
                    className={styles.btnSecondary} 
                    onClick={() => alert("Simulating play 30-second tutor introduction video...")}
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                  >
                    <Video size={18} /> Intro Video ({matchedTutor.videoDuration})
                  </button>
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <button className={styles.btnPrimary} style={{ flexGrow: 1 }} onClick={() => {
                    handleInitiateCheckout({
                      childId: selectedChild,
                      childName: currentChild.name,
                      tutorName: matchedTutor.name,
                      subject: `${quizAnswers.specialization || "Social Skills Integration"} (Trial)`,
                      date: "July 2",
                      time: "3:00 PM",
                      amount: 45
                    });
                    resetQuiz();
                  }}>
                    Book Trial Session with {matchedTutor.name}
                  </button>
                  <button className={styles.btnOutline} onClick={resetQuiz}>
                    Find Someone Else
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showMockModal && mockBookingData && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent} style={{ maxWidth: "480px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(29, 42, 68, 0.08)", paddingBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CreditCard size={22} style={{ color: "var(--color-primary)" }} />
                <h3 style={{ fontWeight: 850, fontSize: "1.25rem", color: "var(--text-navy)" }}>Secure Checkout</h3>
              </div>
              <button 
                onClick={() => {
                  setShowMockModal(false);
                  setCardNumber("");
                  setCardExpiry("");
                  setCardCvc("");
                  setCardName("");
                  setCardError("");
                }} 
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                disabled={paymentLoading}
              >
                <X size={24} />
              </button>
            </div>

            {/* Booking Details Summary */}
            <div style={{ background: "var(--bg-cream)", padding: "1.25rem", borderRadius: "16px", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Tutor:</span>
                <span style={{ fontWeight: 700, color: "var(--text-navy)" }}>{mockBookingData.tutorName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Subject:</span>
                <span style={{ fontWeight: 700, color: "var(--text-navy)" }}>{mockBookingData.subject}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Time:</span>
                <span style={{ fontWeight: 700, color: "var(--text-navy)" }}>{mockBookingData.date} at {mockBookingData.time}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed rgba(29, 42, 68, 0.1)", paddingTop: "0.5rem", marginTop: "0.25rem" }}>
                <span style={{ fontWeight: 800, color: "var(--text-navy)" }}>Amount:</span>
                <span style={{ fontWeight: 800, color: "var(--color-primary)", fontSize: "1.1rem" }}>${mockBookingData.amount}.00 USD</span>
              </div>
            </div>

            {/* Payment form */}
            <form onSubmit={handleProcessMockPayment} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-navy)" }}>CARDHOLDER NAME</label>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                  disabled={paymentLoading}
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: "2px solid rgba(29, 42, 68, 0.1)",
                    outline: "none",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "var(--text-navy)",
                    background: "var(--color-white)"
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-navy)" }}>CARD NUMBER</label>
                <div style={{ position: "relative" }}>
                  <input 
                    type="text" 
                    placeholder="4242 4242 4242 4242" 
                    value={cardNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                      const formatted = val.replace(/(\d{4})(?=\d)/g, "$1 ");
                      setCardNumber(formatted);
                    }}
                    required
                    disabled={paymentLoading}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem 0.75rem 2.5rem",
                      borderRadius: "10px",
                      border: "2px solid rgba(29, 42, 68, 0.1)",
                      outline: "none",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      color: "var(--text-navy)",
                      background: "var(--color-white)"
                    }}
                  />
                  <span style={{ position: "absolute", left: "0.75rem", top: "52%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "inline-flex", alignItems: "center" }}>
                    <CreditCard size={16} />
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-navy)" }}>EXPIRY DATE</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY" 
                    value={cardExpiry}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "").slice(0, 4);
                      if (val.length >= 2) {
                        val = val.slice(0, 2) + "/" + val.slice(2);
                      }
                      setCardExpiry(val);
                    }}
                    required
                    disabled={paymentLoading}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "10px",
                      border: "2px solid rgba(29, 42, 68, 0.1)",
                      outline: "none",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      color: "var(--text-navy)",
                      background: "var(--color-white)"
                    }}
                  />
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-navy)" }}>CVC</label>
                  <input 
                    type="text" 
                    placeholder="123" 
                    value={cardCvc}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setCardCvc(val);
                    }}
                    required
                    disabled={paymentLoading}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "10px",
                      border: "2px solid rgba(29, 42, 68, 0.1)",
                      outline: "none",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      color: "var(--text-navy)",
                      background: "var(--color-white)"
                    }}
                  />
                </div>
              </div>

              {cardError && (
                <div style={{ color: "var(--color-accent-hover)", fontSize: "0.8rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <AlertCircle size={14} /> {cardError}
                </div>
              )}

              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", color: "var(--text-muted)", margin: "0.5rem 0" }}>
                <Lock size={12} />
                <span>Encrypted 256-bit SSL connection</span>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                <button 
                  type="button" 
                  className={styles.btnOutline} 
                  style={{ flex: 1, borderRadius: "10px", padding: "0.75rem", fontFamily: "inherit" }}
                  disabled={paymentLoading}
                  onClick={() => {
                    setShowMockModal(false);
                    setCardNumber("");
                    setCardExpiry("");
                    setCardCvc("");
                    setCardName("");
                    setCardError("");
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.btnPrimary} 
                  disabled={paymentLoading}
                  style={{ 
                    flex: 1, 
                    borderRadius: "10px", 
                    padding: "0.75rem", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    gap: "0.5rem",
                    fontFamily: "inherit"
                  }}
                >
                  {paymentLoading ? (
                    <>
                      <div className="spinner" style={{
                        width: "16px",
                        height: "16px",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        borderRadius: "50%",
                        borderTopColor: "#fff",
                      }} />
                      Processing...
                    </>
                  ) : (
                    `Pay $${mockBookingData.amount}.00`
                  )}
                </button>
              </div>
            </form>
          </div>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            .spinner {
              animation: spin 1s linear infinite;
            }
          `}} />
        </div>
      )}
    </div>
  );
}

export default function ParentDashboard() {
  return (
    <ProtectedRoute allowedRoles={["parent"]}>
      <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading Premium Portal...</div>}>
        <ParentDashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}
