-- schema.sql - Tutor-Hub Database Tables Setup
-- Copy and paste this script into the Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- 1. Create tutors table
CREATE TABLE IF NOT EXISTS public.tutors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT,
  specialties JSONB DEFAULT '[]'::jsonb,
  experience TEXT,
  rating TEXT,
  "videoDuration" TEXT,
  "introText" TEXT,
  rate INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create children table
CREATE TABLE IF NOT EXISTS public.children (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  coins INTEGER DEFAULT 0,
  avatar TEXT,
  "struggleArea" TEXT,
  "successArea" TEXT,
  heatmap JSONB DEFAULT '[]'::jsonb,
  goals JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  "childId" TEXT NOT NULL,
  "childName" TEXT NOT NULL,
  "tutorName" TEXT NOT NULL,
  subject TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create disputes table
CREATE TABLE IF NOT EXISTS public.disputes (
  id TEXT PRIMARY KEY,
  "bookingId" TEXT NOT NULL,
  "childId" TEXT NOT NULL,
  "parentName" TEXT NOT NULL,
  "tutorName" TEXT NOT NULL,
  type TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL,
  date TEXT NOT NULL,
  "chatLog" JSONB DEFAULT '[]'::jsonb,
  "audioUrl" TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Collaboration and progress tables
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  "conversationId" TEXT NOT NULL,
  "senderName" TEXT NOT NULL,
  "senderRole" TEXT NOT NULL,
  "recipientName" TEXT NOT NULL,
  text TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "userRole" TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  "tutorName" TEXT NOT NULL,
  "parentName" TEXT NOT NULL,
  "childName" TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT NOT NULL,
  date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.session_reports (
  id TEXT PRIMARY KEY,
  "bookingId" TEXT NOT NULL,
  "childId" TEXT NOT NULL,
  "childName" TEXT NOT NULL,
  "tutorName" TEXT NOT NULL,
  subject TEXT NOT NULL,
  date TEXT NOT NULL,
  summary TEXT NOT NULL,
  "progressNotes" TEXT NOT NULL,
  engagement INTEGER NOT NULL CHECK (engagement BETWEEN 1 AND 5),
  mastery INTEGER NOT NULL CHECK (mastery BETWEEN 1 AND 5),
  behavior INTEGER NOT NULL CHECK (behavior BETWEEN 1 AND 5)
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_reports ENABLE ROW LEVEL SECURITY;

-- 7. Create Row Level Security Policies
-- NOTE: For production, scope these policies to authenticated users.
-- For local development/testing, these allow public access.

DROP POLICY IF EXISTS "Allow public access tutors" ON public.tutors;
CREATE POLICY "Allow public access tutors" ON public.tutors 
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access children" ON public.children;
CREATE POLICY "Allow public access children" ON public.children 
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access bookings" ON public.bookings;
CREATE POLICY "Allow public access bookings" ON public.bookings 
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access disputes" ON public.disputes;
CREATE POLICY "Allow public access disputes" ON public.disputes 
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access messages" ON public.messages;
CREATE POLICY "Allow public access messages" ON public.messages
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access notifications" ON public.notifications;
CREATE POLICY "Allow public access notifications" ON public.notifications
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access reviews" ON public.reviews;
CREATE POLICY "Allow public access reviews" ON public.reviews
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access session reports" ON public.session_reports;
CREATE POLICY "Allow public access session reports" ON public.session_reports
  FOR ALL USING (true) WITH CHECK (true);

-- 8. Seed Initial Data
INSERT INTO public.tutors (id, name, avatar, specialties, experience, rating, "videoDuration", "introText", rate)
VALUES 
  ('tutor_1', 'Coach Alex M.', 'coach', '["ADHD-Friendly", "Autism-Informed", "Social Skills"]'::jsonb, '8 Years', '4.9/5', '0:30', 'Hey! I focus on interactive game-based social modeling. Let''s build social confidence together!', 45),
  ('tutor_2', 'Sarah Parker, M.Ed.', 'teacher', '["Dyslexia Specialist", "Visual Learning", "English"]'::jsonb, '12 Years', '5.0/5', '0:45', 'Hi parents! My sessions craft custom visual guides to make reading and structural spelling stress-free.', 55),
  ('tutor_3', 'Dr. Jessica Chen', 'teacher', '["Anxiety Support", "Behavioral Therapy", "Self-Regulation"]'::jsonb, '15 Years', '4.95/5', '0:35', 'Welcome. My sessions incorporate mindfulness-based self-regulation templates for learning ease.', 75)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.children (id, name, age, coins, avatar, "struggleArea", "successArea", heatmap, goals)
VALUES 
  ('tyler', 'Tyler Jenkins', 10, 45, 'fox', 'Social cues and conversational turn-taking', 'Non-verbal recognition and emotional expressions', '[4, 2, 0, 1, 3, 4, 2, 3, 0, 4, 3, 2]'::jsonb, '[{"id": "g1", "text": "Take turns in conversation 3 times", "completed": true, "reward": 10}, {"id": "g2", "text": "Share a topic without prompting", "completed": false, "reward": 10}, {"id": "g3", "text": "Maintain task focus for 5 minutes", "completed": false, "reward": 15}]'::jsonb),
  ('emily', 'Emily Jenkins', 8, 90, 'unicorn', 'Sensory overload pacing and executive task focus', 'Written journaling and structured visual aids', '[1, 3, 4, 4, 2, 1, 0, 4, 4, 1, 2, 4]'::jsonb, '[{"id": "g4", "text": "Use breathing techniques during sensory spikes", "completed": true, "reward": 10}, {"id": "g5", "text": "Outline task sequence visually before start", "completed": true, "reward": 10}, {"id": "g6", "text": "Complete writing session without a break", "completed": false, "reward": 15}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.bookings (id, "childId", "childName", "tutorName", subject, date, time, status)
VALUES 
  ('b_1', 'tyler', 'Tyler Jenkins', 'Coach Alex M.', 'Conversational Dynamics', 'Today', '4:00 PM', 'Scheduled'),
  ('b_2', 'tyler', 'Tyler Jenkins', 'Sarah Parker, M.Ed.', 'Active Listening Lab', 'June 28', '2:00 PM', 'Scheduled'),
  ('b_3', 'emily', 'Emily Jenkins', 'Dr. Jessica Chen', 'Anxiety Coping Tools', 'Tomorrow', '10:00 AM', 'Scheduled'),
  ('b_4', 'emily', 'Emily Jenkins', 'Coach Alex M.', 'Visual Arts Focus', 'July 1', '11:30 AM', 'Scheduled')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.disputes (id, "bookingId", "childId", "parentName", "tutorName", type, reason, status, date, "chatLog", "audioUrl")
VALUES 
  ('DISP-8031', 'b_old_1', 'tyler', 'Sarah Jenkins', 'Coach Alex M.', 'Late Cancellation Dispute', 'Parent claims tutor had a connectivity issue and cancelled 5 minutes before. Tutor claims parent missed the notification.', 'Pending Review', 'June 23, 2026', '[{"sender": "Tutor", "time": "13:45", "message": "Hi! Ready for our 14:00 session?"}, {"sender": "Parent", "time": "13:55", "message": "Sorry, Tyler is running a bit late, can we delay 10 minutes?"}, {"sender": "Tutor", "time": "13:58", "message": "I have another student immediately at 15:15, so I cannot delay today. If we cancel it will be subject to standard late policy."}, {"sender": "Tutor", "time": "14:05", "message": "Since there''s no response, I am cancelling this session. Standard rate applies."}]'::jsonb, '/mock-dispute-recording.mp3'),
  ('DISP-9024', 'b_old_2', 'emily', 'David Miller', 'Dr. Jessica Chen', 'Inappropriate Prompt', 'Parent reported whiteboard prompt was stressful. Tutor claims it was an anxiety exposure coping test.', 'Pending Review', 'June 22, 2026', '[{"sender": "System", "time": "10:00", "message": "Session started."}, {"sender": "Tutor", "time": "10:15", "message": "Let''s draw your biggest fear on the whiteboard. What does your anxiety look like?"}, {"sender": "Parent", "time": "10:20", "message": "Emily got very upset drawing this and started crying. We had to stop."}]'::jsonb, '/mock-dispute-sensory.mp3')
ON CONFLICT (id) DO NOTHING;
