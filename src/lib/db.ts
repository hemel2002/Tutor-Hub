/**
 * db.ts - Tutor-Hub Database Adapter
 * 
 * This file abstracts database operations for the Tutor-Hub educational marketplace.
 * It integrates with Supabase, querying tables with automatic background seeding,
 * and throws errors directly if operations fail, ensuring no silent local fallbacks.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing!");
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Please check your environment variables.");
  }
  return supabase;
};

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
  rate: number; // hourly rate
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

// ==========================================
// Mock Data Baseline (Seeding)
// ==========================================

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
    rate: 45
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
    rate: 55
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
    rate: 75
  }
];

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

// ==========================================
// Exported DB Operations (Supabase Only)
// ==========================================

export const db = {
  // --- Tutors ---
  async getTutors(): Promise<Tutor[]> {
    const client = getSupabaseClient();
    const { data, error } = await client.from('tutors').select('*');
    
    if (error) {
      console.error("Error fetching tutors from Supabase:", error);
      throw error;
    }
    
    if (data && data.length > 0) {
      return data as Tutor[];
    } else {
      console.log("Supabase 'tutors' table is empty. Seeding baseline tutors...");
      const { error: seedError } = await client.from('tutors').insert(INITIAL_TUTORS);
      if (seedError) {
        console.error("Seeding tutors failed:", seedError);
        throw seedError;
      }
      return INITIAL_TUTORS;
    }
  },

  // --- Children ---
  async getChildren(): Promise<Record<string, Child>> {
    const client = getSupabaseClient();
    const { data, error } = await client.from('children').select('*');
    
    if (error) {
      console.error("Error fetching children from Supabase:", error);
      throw error;
    }
    
    if (data && data.length > 0) {
      const map: Record<string, Child> = {};
      data.forEach((row: any) => {
        map[row.id] = {
          id: row.id,
          name: row.name,
          age: row.age,
          coins: row.coins,
          avatar: row.avatar,
          struggleArea: row.struggleArea,
          successArea: row.successArea,
          heatmap: Array.isArray(row.heatmap) ? row.heatmap : JSON.parse(JSON.stringify(row.heatmap || [])),
          goals: Array.isArray(row.goals) ? row.goals : JSON.parse(JSON.stringify(row.goals || []))
        };
      });
      return map;
    } else {
      console.log("Supabase 'children' table is empty. Seeding baseline children...");
      const seedRows = Object.values(INITIAL_CHILDREN);
      const { error: seedError } = await client.from('children').insert(seedRows);
      if (seedError) {
        console.error("Seeding children failed:", seedError);
        throw seedError;
      }
      return INITIAL_CHILDREN;
    }
  },

  async updateChildCoins(childId: string, coins: number): Promise<Child> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('children')
      .update({ coins })
      .eq('id', childId)
      .select()
      .single();

    if (error) {
      console.error(`Error updating coins for child ${childId}:`, error);
      throw error;
    }

    if (data) {
      return data as Child;
    }
    throw new Error(`Child with ID ${childId} not found`);
  },

  async updateChildGoal(childId: string, goalId: string, completed: boolean): Promise<Child> {
    const client = getSupabaseClient();
    const { data: child, error: fetchErr } = await client
      .from('children')
      .select('*')
      .eq('id', childId)
      .single();
    
    if (fetchErr) {
      console.error(`Error fetching child ${childId} for goal update:`, fetchErr);
      throw fetchErr;
    }

    if (!child) {
      throw new Error(`Child with ID ${childId} not found`);
    }

    const goals = Array.isArray(child.goals) ? [...child.goals] : [];
    const goal = goals.find((g: any) => g.id === goalId);
    
    if (!goal) {
      throw new Error(`Goal with ID ${goalId} not found`);
    }

    let coins = child.coins || 0;
    if (completed && !goal.completed) {
      coins += goal.reward;
    } else if (!completed && goal.completed) {
      coins = Math.max(0, coins - goal.reward);
    }
    goal.completed = completed;
    
    const { data: updatedChild, error: updateErr } = await client
      .from('children')
      .update({ goals, coins })
      .eq('id', childId)
      .select()
      .single();

    if (updateErr) {
      console.error(`Error updating goal for child ${childId}:`, updateErr);
      throw updateErr;
    }

    if (updatedChild) {
      return updatedChild as Child;
    }
    throw new Error(`Failed to update child ${childId}`);
  },

  // --- Bookings ---
  async getBookings(childId?: string): Promise<Booking[]> {
    const client = getSupabaseClient();
    let query = client.from('bookings').select('*');
    if (childId) {
      query = query.eq('childId', childId);
    }
    
    const { data, error } = await query;
    if (error) {
      console.error("Error fetching bookings from Supabase:", error);
      throw error;
    }

    if (data && data.length > 0) {
      return data as Booking[];
    } else if (data && data.length === 0 && !childId) {
      console.log("Supabase 'bookings' table is empty. Seeding baseline bookings...");
      const { error: seedError } = await client.from('bookings').insert(INITIAL_BOOKINGS);
      if (seedError) {
        console.error("Seeding bookings failed:", seedError);
        throw seedError;
      }
      return INITIAL_BOOKINGS;
    }
    return [];
  },

  async createBooking(booking: Omit<Booking, 'id' | 'status'>): Promise<Booking> {
    const client = getSupabaseClient();
    const uniqueId = `b_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newBooking: Booking = {
      ...booking,
      id: uniqueId,
      status: 'Scheduled'
    };
    
    const { data, error } = await client
      .from('bookings')
      .insert(newBooking)
      .select()
      .single();

    if (error) {
      console.error("Error creating booking in Supabase:", error);
      throw error;
    }

    if (data) {
      return data as Booking;
    }
    throw new Error("Failed to create booking");
  },

  async updateBookingStatus(bookingId: string, status: Booking['status']): Promise<Booking> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      console.error(`Error updating booking status for ${bookingId}:`, error);
      throw error;
    }

    if (data) {
      return data as Booking;
    }
    throw new Error(`Booking with ID ${bookingId} not found`);
  },

  // --- Disputes ---
  async getDisputes(): Promise<Dispute[]> {
    const client = getSupabaseClient();
    const { data, error } = await client.from('disputes').select('*');
    
    if (error) {
      console.error("Error fetching disputes from Supabase:", error);
      throw error;
    }

    if (data && data.length > 0) {
      return data as Dispute[];
    } else {
      console.log("Supabase 'disputes' table is empty. Seeding baseline disputes...");
      const { error: seedError } = await client.from('disputes').insert(INITIAL_DISPUTES);
      if (seedError) {
        console.error("Seeding disputes failed:", seedError);
        throw seedError;
      }
      return INITIAL_DISPUTES;
    }
  },

  async updateDisputeStatus(disputeId: string, status: Dispute['status']): Promise<Dispute> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('disputes')
      .update({ status })
      .eq('id', disputeId)
      .select()
      .single();

    if (error) {
      console.error(`Error updating dispute status for ${disputeId}:`, error);
      throw error;
    }

    if (data) {
      return data as Dispute;
    }
    throw new Error(`Dispute with ID ${disputeId} not found`);
  },

  async createDispute(dispute: Omit<Dispute, 'status' | 'date'>): Promise<Dispute> {
    const client = getSupabaseClient();
    const newDispute: Dispute = {
      ...dispute,
      status: 'Pending Review',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };
    
    const { data, error } = await client
      .from('disputes')
      .insert(newDispute)
      .select()
      .single();

    if (error) {
      console.error("Error creating dispute in Supabase:", error);
      throw error;
    }

    if (data) {
      return data as Dispute;
    }
    throw new Error("Failed to create dispute");
  }
};
