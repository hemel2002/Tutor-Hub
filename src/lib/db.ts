/**
 * db.ts - Tutor-Hub Database Adapter
 *
 * This file abstracts database operations for the Tutor-Hub educational marketplace.
 * It integrates with Supabase when env vars are present, and gracefully falls back
 * to a fully-functional in-memory store so the app works out-of-the-box.
 * New features: messages, notifications, reviews, session reports, earnings.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// Types Definition
// ==========================================

export interface Goal {
  id: string;
  text: string;
  completed: boolean;
  reward: number;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  coins: number;
  avatar: string;
  struggleArea: string;
  successArea: string;
  heatmap: number[];
  goals: Goal[];
}

export interface Booking {
  id: string;
  childId: string;
  childName: string;
  tutorName: string;
  subject: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface Tutor {
  id: string;
  name: string;
  avatar: string;
  specialties: string[];
  experience: string;
  rating: string;
  videoDuration: string;
  introText: string;
  rate: number;
  bio?: string;
  languages?: string[];
  totalSessions?: number;
}

export interface ChatMessage {
  sender: 'Tutor' | 'Parent' | 'System';
  time: string;
  message: string;
}

export interface Dispute {
  id: string;
  bookingId: string;
  childId: string;
  parentName: string;
  tutorName: string;
  type: string;
  reason: string;
  status: string;
  date: string;
  chatLog: ChatMessage[];
  audioUrl?: string;
}

// New types for enhanced features
export interface Message {
  id: string;
  conversationId: string;
  senderName: string;
  senderRole: 'parent' | 'teacher' | 'admin';
  recipientName: string;
  text: string;
  read: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  userRole: 'parent' | 'teacher' | 'admin';
  title: string;
  body: string;
  type: 'booking' | 'message' | 'dispute' | 'system' | 'payment';
  read: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  tutorName: string;
  parentName: string;
  childName: string;
  rating: number;
  text: string;
  date: string;
}

export interface SessionReport {
  id: string;
  bookingId: string;
  childId: string;
  childName: string;
  tutorName: string;
  subject: string;
  date: string;
  summary: string;
  progressNotes: string;
  engagement: number;
  mastery: number;
  behavior: number;
}

// ==========================================
// Mock Data Baseline (Seeding)
// ==========================================

const INITIAL_TUTORS: Tutor[] = [
  {
    id: "tutor_1",
    name: "Coach Alex M.",
    avatar: "coach",
    specialties: ["ADHD-Friendly", "Autism-Informed", "Social Skills"],
    experience: "8 Years",
    rating: "4.9/5",
    videoDuration: "0:30",
    introText: "Hey! I focus on interactive game-based social modeling. Let's build social confidence together!",
    rate: 45,
    bio: "Former special education teacher with a passion for game-based learning. Certified in ADHD and autism-informed instructional strategies.",
    languages: ["English", "Spanish"],
    totalSessions: 1240
  },
  {
    id: "tutor_2",
    name: "Sarah Parker, M.Ed.",
    avatar: "teacher",
    specialties: ["Dyslexia Specialist", "Visual Learning", "English"],
    experience: "12 Years",
    rating: "5.0/5",
    videoDuration: "0:45",
    introText: "Hi parents! My sessions craft custom visual guides to make reading and structural spelling stress-free.",
    rate: 55,
    bio: "Master's in Education with a specialization in dyslexia intervention. I create multi-sensory visual learning paths tailored to each child.",
    languages: ["English", "French"],
    totalSessions: 980
  },
  {
    id: "tutor_3",
    name: "Dr. Jessica Chen",
    avatar: "teacher",
    specialties: ["Anxiety Support", "Behavioral Therapy", "Self-Regulation"],
    experience: "15 Years",
    rating: "4.95/5",
    videoDuration: "0:35",
    introText: "Welcome. My sessions incorporate mindfulness-based self-regulation templates for learning ease.",
    rate: 75,
    bio: "Licensed clinical psychologist specializing in child anxiety and behavioral therapy. Mindfulness-based approach to self-regulation.",
    languages: ["English", "Mandarin"],
    totalSessions: 1620
  },
  {
    id: "tutor_4",
    name: "Marcus Johnson",
    avatar: "coach",
    specialties: ["Math Specialist", "Executive Function", "Test Prep"],
    experience: "6 Years",
    rating: "4.85/5",
    videoDuration: "0:28",
    introText: "Math doesn't have to be scary! I use visual frameworks and gamified problem-solving to build confidence.",
    rate: 50,
    bio: "Math education specialist with expertise in executive function support. I turn math anxiety into math confidence.",
    languages: ["English"],
    totalSessions: 720
  },
  {
    id: "tutor_5",
    name: "Dr. Priya Sharma",
    avatar: "teacher",
    specialties: ["Speech Therapy", "Communication", "Social Pragmatics"],
    experience: "10 Years",
    rating: "4.92/5",
    videoDuration: "0:32",
    introText: "Every child has a voice. I help find it through evidence-based speech and communication strategies.",
    rate: 65,
    bio: "Speech-language pathologist with a doctorate in communication sciences. Specializing in social pragmatics and expressive language.",
    languages: ["English", "Hindi", "Tamil"],
    totalSessions: 1100
  },
  {
    id: "tutor_6",
    name: "Emma Wilson, BCBA",
    avatar: "coach",
    specialties: ["ABA Therapy", "Behavior Plans", "Autism-Informed"],
    experience: "9 Years",
    rating: "4.97/5",
    videoDuration: "0:40",
    introText: "Board-certified behavior analyst creating individualized positive behavior support plans for lasting growth.",
    rate: 80,
    bio: "BCBA-certified with 9 years experience designing and implementing individualized behavior intervention plans.",
    languages: ["English"],
    totalSessions: 890
  }
];

const INITIAL_CHILDREN: Record<string, Child> = {
  tyler: {
    id: "tyler",
    name: "Tyler Jenkins",
    age: 10,
    coins: 45,
    avatar: "fox",
    struggleArea: "Social cues and conversational turn-taking",
    successArea: "Non-verbal recognition and emotional expressions",
    heatmap: [4, 2, 0, 1, 3, 4, 2, 3, 0, 4, 3, 2],
    goals: [
      { id: "g1", text: "Take turns in conversation 3 times", completed: true, reward: 10 },
      { id: "g2", text: "Share a topic without prompting", completed: false, reward: 10 },
      { id: "g3", text: "Maintain task focus for 5 minutes", completed: false, reward: 15 }
    ]
  },
  emily: {
    id: "emily",
    name: "Emily Jenkins",
    age: 8,
    coins: 90,
    avatar: "unicorn",
    struggleArea: "Sensory overload pacing and executive task focus",
    successArea: "Written journaling and structured visual aids",
    heatmap: [1, 3, 4, 4, 2, 1, 0, 4, 4, 1, 2, 4],
    goals: [
      { id: "g4", text: "Use breathing techniques during sensory spikes", completed: true, reward: 10 },
      { id: "g5", text: "Outline task sequence visually before start", completed: true, reward: 10 },
      { id: "g6", text: "Complete writing session without a break", completed: false, reward: 15 }
    ]
  }
};

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "b_1",
    childId: "tyler",
    childName: "Tyler Jenkins",
    tutorName: "Coach Alex M.",
    subject: "Conversational Dynamics",
    date: "Today",
    time: "4:00 PM",
    status: "Scheduled"
  },
  {
    id: "b_2",
    childId: "tyler",
    childName: "Tyler Jenkins",
    tutorName: "Sarah Parker, M.Ed.",
    subject: "Active Listening Lab",
    date: "June 28",
    time: "2:00 PM",
    status: "Scheduled"
  },
  {
    id: "b_3",
    childId: "emily",
    childName: "Emily Jenkins",
    tutorName: "Dr. Jessica Chen",
    subject: "Anxiety Coping Tools",
    date: "Tomorrow",
    time: "10:00 AM",
    status: "Scheduled"
  },
  {
    id: "b_4",
    childId: "emily",
    childName: "Emily Jenkins",
    tutorName: "Coach Alex M.",
    subject: "Visual Arts Focus",
    date: "July 1",
    time: "11:30 AM",
    status: "Scheduled"
  }
];

const INITIAL_DISPUTES: Dispute[] = [
  {
    id: "DISP-8031",
    bookingId: "b_old_1",
    childId: "tyler",
    parentName: "Sarah Jenkins",
    tutorName: "Coach Alex M.",
    type: "Late Cancellation Dispute",
    reason: "Parent claims tutor had a connectivity issue and cancelled 5 minutes before. Tutor claims parent missed the notification.",
    status: "Pending Review",
    date: "June 23, 2026",
    chatLog: [
      { sender: "Tutor", time: "13:45", message: "Hi! Ready for our 14:00 session?" },
      { sender: "Parent", time: "13:55", message: "Sorry, Tyler is running a bit late, can we delay 10 minutes?" },
      { sender: "Tutor", time: "13:58", message: "I have another student immediately at 15:15, so I cannot delay today. If we cancel it will be subject to standard late policy." },
      { sender: "Tutor", time: "14:05", message: "Since there's no response, I am cancelling this session. Standard rate applies." }
    ],
    audioUrl: "/mock-dispute-recording.mp3"
  },
  {
    id: "DISP-9024",
    bookingId: "b_old_2",
    childId: "emily",
    parentName: "David Miller",
    tutorName: "Dr. Jessica Chen",
    type: "Inappropriate Prompt",
    date: "June 22, 2026",
    status: "Pending Review",
    reason: "Parent reported whiteboard prompt was stressful. Tutor claims it was an anxiety exposure coping test.",
    chatLog: [
      { sender: "System", time: "10:00", message: "Session started." },
      { sender: "Tutor", time: "10:15", message: "Let's draw your biggest fear on the whiteboard. What does your anxiety look like?" },
      { sender: "Parent", time: "10:20", message: "Emily got very upset drawing this and started crying. We had to stop." }
    ],
    audioUrl: "/mock-dispute-sensory.mp3"
  }
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "msg_1",
    conversationId: "conv_parent_alex",
    senderName: "Sarah Jenkins",
    senderRole: "parent",
    recipientName: "Coach Alex M.",
    text: "Hi Alex! Tyler is really excited about today's session on conversational dynamics.",
    read: true,
    createdAt: "2026-06-24T14:30:00Z"
  },
  {
    id: "msg_2",
    conversationId: "conv_parent_alex",
    senderName: "Coach Alex M.",
    senderRole: "teacher",
    recipientName: "Sarah Jenkins",
    text: "That's wonderful to hear! We'll be practicing turn-taking with a fun game today. See you at 4!",
    read: true,
    createdAt: "2026-06-24T14:35:00Z"
  },
  {
    id: "msg_3",
    conversationId: "conv_parent_alex",
    senderName: "Coach Alex M.",
    senderRole: "teacher",
    recipientName: "Sarah Jenkins",
    text: "Quick update - Tyler did amazing today! He maintained a 5-minute conversation flow. Big progress!",
    read: false,
    createdAt: "2026-06-24T17:15:00Z"
  },
  {
    id: "msg_4",
    conversationId: "conv_parent_jessica",
    senderName: "David Miller",
    senderRole: "parent",
    recipientName: "Dr. Jessica Chen",
    text: "Dr. Chen, Emily has been using the breathing techniques all week. Thank you so much!",
    read: true,
    createdAt: "2026-06-23T09:00:00Z"
  }
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "notif_1",
    userId: "parent",
    userRole: "parent",
    title: "Session Completed",
    body: "Coach Alex M. completed a session with Tyler. New progress report available!",
    type: "booking",
    read: false,
    createdAt: "2026-06-24T17:20:00Z"
  },
  {
    id: "notif_2",
    userId: "parent",
    userRole: "parent",
    title: "New Message",
    body: "Coach Alex M. sent you a message about Tyler's progress.",
    type: "message",
    read: false,
    createdAt: "2026-06-24T17:15:00Z"
  },
  {
    id: "notif_3",
    userId: "teacher",
    userRole: "teacher",
    title: "New Booking",
    body: "A new session has been scheduled with Emily Jenkins for tomorrow at 10 AM.",
    type: "booking",
    read: false,
    createdAt: "2026-06-24T10:00:00Z"
  },
  {
    id: "notif_4",
    userId: "admin",
    userRole: "admin",
    title: "Dispute Filed",
    body: "A new dispute has been filed. Case DISP-9024 needs review.",
    type: "dispute",
    read: false,
    createdAt: "2026-06-22T10:25:00Z"
  }
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: "rev_1",
    tutorName: "Coach Alex M.",
    parentName: "Sarah Jenkins",
    childName: "Tyler",
    rating: 5,
    text: "Alex has been incredible for Tyler. His game-based approach keeps Tyler engaged the entire session. We've seen real improvement in his conversational skills!",
    date: "June 20, 2026"
  },
  {
    id: "rev_2",
    tutorName: "Dr. Jessica Chen",
    parentName: "David Miller",
    childName: "Emily",
    rating: 5,
    text: "Dr. Chen's mindfulness techniques have transformed how Emily handles anxiety. The breathing exercises are now part of our daily routine. Highly recommend!",
    date: "June 18, 2026"
  },
  {
    id: "rev_3",
    tutorName: "Sarah Parker, M.Ed.",
    parentName: "Maria Rosales",
    childName: "Sophie",
    rating: 5,
    text: "Sarah's visual learning approach is exactly what Sophie needed. Her reading confidence has skyrocketed in just two months!",
    date: "June 15, 2026"
  },
  {
    id: "rev_4",
    tutorName: "Coach Alex M.",
    parentName: "David Miller",
    childName: "Emily",
    rating: 4,
    text: "Alex is great with Emily during visual arts sessions. Very patient and creative. Sometimes sessions run a few minutes over but always productive.",
    date: "June 10, 2026"
  }
];

const INITIAL_SESSION_REPORTS: SessionReport[] = [
  {
    id: "sr_1",
    bookingId: "b_1",
    childId: "tyler",
    childName: "Tyler Jenkins",
    tutorName: "Coach Alex M.",
    subject: "Conversational Dynamics",
    date: "June 24, 2026",
    summary: "Tyler showed excellent progress in conversational turn-taking today. Used a board game format to practice waiting for cues.",
    progressNotes: "Successfully completed 3 rounds of turn-taking without prompting. Maintained eye contact during 2 out of 3 exchanges. Next session: expand to peer-to-peer roleplay scenarios.",
    engagement: 4,
    mastery: 3,
    behavior: 4
  },
  {
    id: "sr_2",
    bookingId: "b_3",
    childId: "emily",
    childName: "Emily Jenkins",
    tutorName: "Dr. Jessica Chen",
    subject: "Anxiety Coping Tools",
    date: "June 23, 2026",
    summary: "Emily successfully demonstrated the 4-7-8 breathing technique independently. Introduced a new grounding exercise using sensory objects.",
    progressNotes: "Emily independently initiated breathing when she felt overwhelmed during a math worksheet. This is a major milestone. Next session: practice in a simulated group setting.",
    engagement: 4,
    mastery: 4,
    behavior: 5
  }
];

// ==========================================
// Local In-Memory Store (fallback when Supabase is not configured)
// ==========================================

const localStore = {
  tutors: [...INITIAL_TUTORS],
  children: { ...INITIAL_CHILDREN },
  bookings: [...INITIAL_BOOKINGS],
  disputes: [...INITIAL_DISPUTES],
  messages: [...INITIAL_MESSAGES],
  notifications: [...INITIAL_NOTIFICATIONS],
  reviews: [...INITIAL_REVIEWS],
  sessionReports: [...INITIAL_SESSION_REPORTS],
};

const genId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

// ==========================================
// Exported DB Operations (Supabase + Local Fallback)
// ==========================================

export const db = {
  // --- Tutors ---
  async getTutors(): Promise<Tutor[]> {
    if (supabase) {
      const { data, error } = await supabase.from('tutors').select('*');
      if (error) { console.error("Error fetching tutors:", error); throw error; }
      if (data && data.length > 0) return data as Tutor[];
      await supabase.from('tutors').insert(INITIAL_TUTORS);
      return INITIAL_TUTORS;
    }
    return [...localStore.tutors];
  },

  async getTutorById(id: string): Promise<Tutor | null> {
    if (supabase) {
      const { data, error } = await supabase.from('tutors').select('*').eq('id', id).single();
      if (error) { console.error("Error fetching tutor:", error); throw error; }
      return data as Tutor;
    }
    return localStore.tutors.find(t => t.id === id) || null;
  },

  // --- Children ---
  async getChildren(): Promise<Record<string, Child>> {
    if (supabase) {
      const { data, error } = await supabase.from('children').select('*');
      if (error) { console.error("Error fetching children:", error); throw error; }
      if (data && data.length > 0) {
        const map: Record<string, Child> = {};
        data.forEach((row: any) => {
          map[row.id] = {
            ...row,
            heatmap: Array.isArray(row.heatmap) ? row.heatmap : JSON.parse(JSON.stringify(row.heatmap || [])),
            goals: Array.isArray(row.goals) ? row.goals : JSON.parse(JSON.stringify(row.goals || []))
          };
        });
        return map;
      }
      await supabase.from('children').insert(Object.values(INITIAL_CHILDREN));
      return INITIAL_CHILDREN;
    }
    return { ...localStore.children };
  },

  async updateChildCoins(childId: string, coins: number): Promise<Child> {
    if (supabase) {
      const { data, error } = await supabase.from('children').update({ coins }).eq('id', childId).select().single();
      if (error) throw error;
      return data as Child;
    }
    if (!localStore.children[childId]) throw new Error(`Child ${childId} not found`);
    localStore.children[childId].coins = coins;
    return localStore.children[childId];
  },

  async updateChildGoal(childId: string, goalId: string, completed: boolean): Promise<Child> {
    if (supabase) {
      const { data: child, error: fetchErr } = await supabase.from('children').select('*').eq('id', childId).single();
      if (fetchErr) throw fetchErr;
      if (!child) throw new Error(`Child ${childId} not found`);
      const goals = Array.isArray(child.goals) ? [...child.goals] : [];
      const goal = goals.find((g: any) => g.id === goalId);
      if (!goal) throw new Error(`Goal ${goalId} not found`);
      let coins = child.coins || 0;
      if (completed && !goal.completed) coins += goal.reward;
      else if (!completed && goal.completed) coins = Math.max(0, coins - goal.reward);
      goal.completed = completed;
      const { data: updated, error: updateErr } = await supabase.from('children').update({ goals, coins }).eq('id', childId).select().single();
      if (updateErr) throw updateErr;
      return updated as Child;
    }
    const child = localStore.children[childId];
    if (!child) throw new Error(`Child ${childId} not found`);
    const goal = child.goals.find(g => g.id === goalId);
    if (!goal) throw new Error(`Goal ${goalId} not found`);
    if (completed && !goal.completed) child.coins += goal.reward;
    else if (!completed && goal.completed) child.coins = Math.max(0, child.coins - goal.reward);
    goal.completed = completed;
    return child;
  },

  // --- Bookings ---
  async getBookings(childId?: string): Promise<Booking[]> {
    if (supabase) {
      let query = supabase.from('bookings').select('*');
      if (childId) query = query.eq('childId', childId);
      const { data, error } = await query;
      if (error) { console.error("Error fetching bookings:", error); throw error; }
      if (data && data.length > 0) return data as Booking[];
      if (!childId) {
        await supabase.from('bookings').insert(INITIAL_BOOKINGS);
        return INITIAL_BOOKINGS;
      }
      return [];
    }
    if (childId) return localStore.bookings.filter(b => b.childId === childId);
    return [...localStore.bookings];
  },

  async createBooking(booking: Omit<Booking, 'id' | 'status'>): Promise<Booking> {
    const newBooking: Booking = { ...booking, id: genId('b'), status: 'Scheduled' };
    if (supabase) {
      const { data, error } = await supabase.from('bookings').insert(newBooking).select().single();
      if (error) throw error;
      return data as Booking;
    }
    localStore.bookings.push(newBooking);
    return newBooking;
  },

  async updateBookingStatus(bookingId: string, status: Booking['status']): Promise<Booking> {
    if (supabase) {
      const { data, error } = await supabase.from('bookings').update({ status }).eq('id', bookingId).select().single();
      if (error) throw error;
      return data as Booking;
    }
    const booking = localStore.bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error(`Booking ${bookingId} not found`);
    booking.status = status;
    return booking;
  },

  // --- Disputes ---
  async getDisputes(): Promise<Dispute[]> {
    if (supabase) {
      const { data, error } = await supabase.from('disputes').select('*');
      if (error) throw error;
      if (data && data.length > 0) return data as Dispute[];
      await supabase.from('disputes').insert(INITIAL_DISPUTES);
      return INITIAL_DISPUTES;
    }
    return [...localStore.disputes];
  },

  async updateDisputeStatus(disputeId: string, status: string): Promise<Dispute> {
    if (supabase) {
      const { data, error } = await supabase.from('disputes').update({ status }).eq('id', disputeId).select().single();
      if (error) throw error;
      return data as Dispute;
    }
    const dispute = localStore.disputes.find(d => d.id === disputeId);
    if (!dispute) throw new Error(`Dispute ${disputeId} not found`);
    dispute.status = status;
    return dispute;
  },

  async createDispute(dispute: Omit<Dispute, 'status' | 'date'>): Promise<Dispute> {
    const newDispute: Dispute = {
      ...dispute,
      status: 'Pending Review',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };
    if (supabase) {
      const { data, error } = await supabase.from('disputes').insert(newDispute).select().single();
      if (error) throw error;
      return data as Dispute;
    }
    localStore.disputes.push(newDispute);
    return newDispute;
  },

  // --- Messages ---
  async getMessages(conversationId?: string): Promise<Message[]> {
    if (supabase) {
      let query = supabase.from('messages').select('*').order('createdAt', { ascending: true });
      if (conversationId) query = query.eq('conversationId', conversationId);
      const { data, error } = await query;
      if (error) throw error;
      return (data as Message[]) || [];
    }
    if (conversationId) return localStore.messages.filter(m => m.conversationId === conversationId);
    return [...localStore.messages];
  },

  async getConversations(userRole: 'parent' | 'teacher' | 'admin', userName: string): Promise<Array<{ id: string; participantName: string; lastMessage: string; lastMessageTime: string; unread: number }>> {
    const all = supabase ? await this.getMessages() : [...localStore.messages];
    const userMsgs = all.filter(m =>
      (m.senderRole === userRole && m.senderName === userName) ||
      (m.recipientName === userName)
    );
    const convMap = new Map<string, any>();
    userMsgs.forEach(m => {
      const otherParty = m.senderName === userName ? m.recipientName : m.senderName;
      if (!convMap.has(m.conversationId)) {
        convMap.set(m.conversationId, {
          id: m.conversationId,
          participantName: otherParty,
          lastMessage: m.text,
          lastMessageTime: m.createdAt,
          unread: 0
        });
      }
      const conv = convMap.get(m.conversationId);
      if (m.createdAt > conv.lastMessageTime) {
        conv.lastMessage = m.text;
        conv.lastMessageTime = m.createdAt;
      }
      if (m.recipientName === userName && !m.read) conv.unread++;
    });
    return Array.from(convMap.values()).sort((a, b) => b.lastMessageTime.localeCompare(a.lastMessageTime));
  },

  async sendMessage(msg: Omit<Message, 'id' | 'createdAt' | 'read'>): Promise<Message> {
    const newMsg: Message = {
      ...msg,
      id: genId('msg'),
      read: false,
      createdAt: new Date().toISOString()
    };
    if (supabase) {
      const { data, error } = await supabase.from('messages').insert(newMsg).select().single();
      if (error) throw error;
      return data as Message;
    }
    localStore.messages.push(newMsg);
    return newMsg;
  },

  async markMessageRead(messageId: string): Promise<void> {
    if (supabase) {
      await supabase.from('messages').update({ read: true }).eq('id', messageId);
      return;
    }
    const msg = localStore.messages.find(m => m.id === messageId);
    if (msg) msg.read = true;
  },

  // --- Notifications ---
  async getNotifications(userRole: 'parent' | 'teacher' | 'admin', userId: string): Promise<Notification[]> {
    if (supabase) {
      const { data, error } = await supabase.from('notifications').select('*').order('createdAt', { ascending: false });
      if (error) throw error;
      return ((data as Notification[]) || []).filter(n => n.userRole === userRole && (n.userId === userId || n.userId === userRole));
    }
    return localStore.notifications
      .filter(n => n.userRole === userRole && (n.userId === userId || n.userId === userRole))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async createNotification(notif: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<Notification> {
    const newNotif: Notification = {
      ...notif,
      id: genId('notif'),
      read: false,
      createdAt: new Date().toISOString()
    };
    if (supabase) {
      const { data, error } = await supabase.from('notifications').insert(newNotif).select().single();
      if (error) throw error;
      return data as Notification;
    }
    localStore.notifications.push(newNotif);
    return newNotif;
  },

  async markNotificationRead(notifId: string): Promise<void> {
    if (supabase) {
      await supabase.from('notifications').update({ read: true }).eq('id', notifId);
      return;
    }
    const n = localStore.notifications.find(n => n.id === notifId);
    if (n) n.read = true;
  },

  // --- Reviews ---
  async getReviews(tutorName?: string): Promise<Review[]> {
    if (supabase) {
      let query = supabase.from('reviews').select('*');
      if (tutorName) query = query.eq('tutorName', tutorName);
      const { data, error } = await query;
      if (error) throw error;
      return (data as Review[]) || [];
    }
    if (tutorName) return localStore.reviews.filter(r => r.tutorName === tutorName);
    return [...localStore.reviews];
  },

  async createReview(review: Omit<Review, 'id' | 'date'>): Promise<Review> {
    const newReview: Review = {
      ...review,
      id: genId('rev'),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };
    if (supabase) {
      const { data, error } = await supabase.from('reviews').insert(newReview).select().single();
      if (error) throw error;
      return data as Review;
    }
    localStore.reviews.push(newReview);
    return newReview;
  },

  // --- Session Reports ---
  async getSessionReports(childId?: string): Promise<SessionReport[]> {
    if (supabase) {
      let query = supabase.from('session_reports').select('*');
      if (childId) query = query.eq('childId', childId);
      const { data, error } = await query;
      if (error) throw error;
      return (data as SessionReport[]) || [];
    }
    if (childId) return localStore.sessionReports.filter(r => r.childId === childId);
    return [...localStore.sessionReports];
  },

  async createSessionReport(report: Omit<SessionReport, 'id'>): Promise<SessionReport> {
    const newReport: SessionReport = { ...report, id: genId('sr') };
    if (supabase) {
      const { data, error } = await supabase.from('session_reports').insert(newReport).select().single();
      if (error) throw error;
      return data as SessionReport;
    }
    localStore.sessionReports.push(newReport);
    return newReport;
  },
};