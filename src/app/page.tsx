"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import TiltCard from "@/components/TiltCard";
import { 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  ShieldCheck, 
  Award, 
  Users, 
  Clock, 
  Play, 
  UserCheck, 
  HelpCircle,
  Volume2,
  Calendar,
  Layers,
  ArrowRight,
  Zap
} from "lucide-react";

export default function LandingPage() {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  return (
    <div>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <GraduationCap size={32} />
          <span>James Stanfield</span>
        </div>
        <ul className={styles.navLinks}>
          <li><Link href="#why-us">Why Us</Link></li>
          <li><Link href="#courses">Courses</Link></li>
          <li><Link href="#about">About</Link></li>
          <li><Link href="#testimonials">Testimonials</Link></li>
        </ul>
        <div className={styles.navActions}>
          <Link href="/parent">
            <button className={styles.btnOutline}>Parent Portal</button>
          </Link>
          <Link href="/teacher">
            <button className={styles.btnOutline}>Teacher Portal</button>
          </Link>
          <Link href="/admin">
            <button className={styles.btnPrimary}>Admin Panel</button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Everybody can achieve the best result now</h1>
          <p>
            Everyone agrees with the fact that learning management systems are a
            tremendous way to expand learners' knowledge base and help staff
            enhance their skills.
          </p>
          
          {/* Interactive Portal Switcher Banner */}
          <div style={{
            background: "rgba(255, 255, 255, 0.9)",
            padding: "1.5rem",
            borderRadius: "20px",
            border: "1.5px solid var(--color-primary)",
            boxShadow: "0 10px 25px rgba(29, 42, 68, 0.05)",
            marginBottom: "2rem"
          }}>
            <h4 style={{ fontWeight: 700, marginBottom: "0.5rem", color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Zap size={18} fill="var(--color-primary)" /> Interactive Role Demos
            </h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
              Explore the standalone features of the platform by entering any of the role portals:
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link href="/parent" className={styles.btnPrimary} style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
                Parent/Student (AI quiz, Snapshots)
              </Link>
              <Link href="/teacher" className={styles.btnSecondary} style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
                Teacher (Whiteboard, Schedule)
              </Link>
              <Link href="/admin" className={styles.btnPrimary} style={{ fontSize: "0.85rem", padding: "0.5rem 1rem", backgroundColor: "var(--bg-dark-purple)" }}>
                Admin (Dispute, Commission)
              </Link>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <Link href="/parent" className={styles.btnPrimary} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              Enroll course <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Hero Visual Illustration with micro-animations */}
        <div className={styles.heroVisual}>
          <div className={`${styles.floatingBadge} ${styles.badge1} float-element`}>
            <Award size={20} className="sway-element" style={{ color: "var(--color-primary)" }} />
            <span>Success Guarantee</span>
          </div>
          
          <div className={`${styles.floatingBadge} ${styles.badge2} float-element`} style={{ animationDelay: "2s" }}>
            <ShieldCheck size={20} className="pulse-element" style={{ color: "var(--color-accent)" }} />
            <span>Verified Safety Check</span>
          </div>

          {/* Educational SVG Illustration resembling the graduation theme */}
          <svg viewBox="0 0 500 500" className={styles.heroIllustration}>
            {/* Background Clouds */}
            <path d="M 50 400 Q 150 350 250 400 T 450 400" fill="none" stroke="#EBF0FF" strokeWidth="8" strokeLinecap="round" />
            <circle cx="100" cy="180" r="30" fill="rgba(206, 241, 229, 0.6)" className="pulse-element" />
            <circle cx="420" cy="120" r="15" fill="rgba(248, 192, 100, 0.4)" className="float-element" />

            {/* Flying Graduation Cap 1 */}
            <g transform="translate(180, 100) scale(0.8) rotate(-15)" className="float-element">
              <polygon points="50,15 90,35 50,55 10,35" fill="var(--color-primary)" />
              <polygon points="25,43 25,60 50,70 75,60 75,43" fill="var(--color-primary-hover)" />
              <path d="M 90 35 L 90 65" stroke="var(--color-secondary)" strokeWidth="3" />
              <circle cx="90" cy="65" r="4" fill="var(--color-secondary)" />
            </g>

            {/* Flying Graduation Cap 2 */}
            <g transform="translate(300, 80) scale(0.6) rotate(10)" className="float-element" style={{ animationDelay: "1.5s" }}>
              <polygon points="50,15 90,35 50,55 10,35" fill="var(--color-accent)" />
              <polygon points="25,43 25,60 50,70 75,60 75,43" fill="var(--color-accent-hover)" />
              <path d="M 90 35 L 90 65" stroke="var(--color-secondary)" strokeWidth="3" />
              <circle cx="90" cy="65" r="4" fill="var(--color-secondary)" />
            </g>

            {/* Hands holding diplomas */}
            <g transform="translate(100, 220)">
              {/* Hand 1 */}
              <path d="M 50 150 C 50 100 80 80 80 50" stroke="var(--text-navy)" strokeWidth="8" strokeLinecap="round" fill="none" />
              <rect x="70" y="30" width="40" height="20" rx="4" fill="var(--color-secondary)" transform="rotate(-30 70 30)" />
              {/* Hand 2 with certificate */}
              <path d="M 180 160 C 180 120 150 90 150 60" stroke="var(--text-navy)" strokeWidth="8" strokeLinecap="round" fill="none" />
              <path d="M 130 30 L 170 40 L 160 50 L 120 40 Z" fill="#FFF" stroke="var(--text-navy)" strokeWidth="3" />
              <path d="M 145 35 L 140 60" stroke="var(--color-accent)" strokeWidth="4" />
              {/* Hand 3 holding trophy */}
              <path d="M 280 170 C 280 130 250 110 250 80" stroke="var(--text-navy)" strokeWidth="8" strokeLinecap="round" fill="none" />
              <path d="M 230 40 L 270 40 L 265 70 L 235 70 Z" fill="var(--color-secondary)" />
              <path d="M 220 45 C 220 45 210 50 220 60" fill="none" stroke="var(--color-secondary)" strokeWidth="4" strokeLinecap="round" />
              <path d="M 280 45 C 280 45 290 50 280 60" fill="none" stroke="var(--color-secondary)" strokeWidth="4" strokeLinecap="round" />
            </g>

            {/* Trophy Stand */}
            <rect x="330" y="320" width="60" height="80" rx="8" fill="#FFF" stroke="var(--text-navy)" strokeWidth="4" />
            <path d="M 360 250 L 360 320" stroke="var(--text-navy)" strokeWidth="8" />
            <path d="M 335 250 L 385 250" stroke="var(--text-navy)" strokeWidth="8" />
            <path d="M 330 210 Q 360 250 390 210" fill="none" stroke="var(--text-navy)" strokeWidth="8" />
            <path d="M 330 210 L 330 230" stroke="var(--text-navy)" strokeWidth="4" />
            <path d="M 390 210 L 390 230" stroke="var(--text-navy)" strokeWidth="4" />

            {/* Books Stack */}
            <g transform="translate(30, 270) scale(0.9)">
              <rect x="0" y="50" width="80" height="20" rx="4" fill="var(--color-accent)" stroke="var(--text-navy)" strokeWidth="4" />
              <rect x="10" y="30" width="70" height="20" rx="4" fill="var(--color-secondary)" stroke="var(--text-navy)" strokeWidth="4" />
              <rect x="5" y="10" width="75" height="20" rx="4" fill="var(--color-primary)" stroke="var(--text-navy)" strokeWidth="4" />
            </g>

            {/* Paper Airplane */}
            <g transform="translate(370, 70) scale(0.75)" className="float-element">
              <path d="M 0 20 L 40 0 L 20 40 L 15 25 Z" fill="none" stroke="var(--text-navy)" strokeWidth="4" strokeLinejoin="round" />
              <path d="M 15 25 L 0 20" stroke="var(--text-navy)" strokeWidth="4" />
            </g>
          </svg>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-us" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Why you should construct your career with us</h2>
          <p>We provide a premium suite of trust-automated features for modern educational match-making.</p>
        </div>

        <div className={styles.whyUsGrid}>
          {/* Illustration Block */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <svg viewBox="0 0 400 400" style={{ width: "100%", maxWidth: "380px" }} className="float-element">
              {/* Screen Display */}
              <rect x="50" y="50" width="300" height="220" rx="20" fill="#FFF" stroke="var(--text-navy)" strokeWidth="6" />
              <rect x="70" y="70" width="260" height="150" rx="10" fill="var(--bg-mint)" />
              {/* Screen stand */}
              <path d="M 170 270 L 170 330 L 230 330 L 230 270 Z" fill="var(--text-navy)" />
              <ellipse cx="200" cy="330" rx="60" ry="15" fill="var(--text-navy)" />
              
              {/* Kids Illustration */}
              <circle cx="120" cy="140" r="30" fill="var(--color-secondary)" stroke="var(--text-navy)" strokeWidth="4" />
              <circle cx="280" cy="140" r="30" fill="var(--color-accent)" stroke="var(--text-navy)" strokeWidth="4" />
              <path d="M 90 220 Q 120 180 150 220" fill="none" stroke="var(--text-navy)" strokeWidth="4" />
              <path d="M 250 220 Q 280 180 310 220" fill="none" stroke="var(--text-navy)" strokeWidth="4" />
              
              {/* UI Elements */}
              <rect x="170" y="90" width="60" height="15" rx="4" fill="var(--color-primary)" />
              <circle cx="200" cy="150" r="10" fill="var(--color-white)" />
            </svg>
          </div>

          {/* 3D Tilt Cards list */}
          <div className={styles.whyUsCards}>
            <TiltCard className={styles.whyCard}>
              <div className={`${styles.whyIcon} ${styles.iconYellow}`}>
                <Layers size={24} />
              </div>
              <h3 style={{ fontWeight: 700 }}>Multiple Platforms</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                Seamless integration for phone, tablet, and browser learning.
              </p>
            </TiltCard>

            <TiltCard className={styles.whyCard}>
              <div className={`${styles.whyIcon} ${styles.iconGreen}`}>
                <BookOpen size={24} />
              </div>
              <h3 style={{ fontWeight: 700 }}>Simultaneous Courses</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                Enrolls students in multiple skill sessions under one parent account.
              </p>
            </TiltCard>

            <TiltCard className={styles.whyCard}>
              <div className={`${styles.whyIcon} ${styles.iconBlue}`}>
                <TrendingUp size={24} />
              </div>
              <h3 style={{ fontWeight: 700 }}>No Heavy Books</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                All PDFs, quizzes, and resources stored securely in our cloud libraries.
              </p>
            </TiltCard>

            <TiltCard className={styles.whyCard}>
              <div className={`${styles.whyIcon} ${styles.iconPink}`}>
                <UserCheck size={24} />
              </div>
              <h3 style={{ fontWeight: 700 }}>Behavior Reports</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                Easily monitor and review engagement and session logs.
              </p>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section id="courses" className={styles.coursesSection}>
        <div className={styles.sectionHeader}>
          <h2>Featured courses</h2>
          <p>Specifically designed social modeling and skill building programs.</p>
        </div>

        <div className={styles.coursesGrid}>
          {/* Course 1 */}
          <TiltCard className={styles.courseCard}>
            <div className={styles.courseImg} style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url('/picasset/course1.jpg')", backgroundColor: "#CEF1E5" }}>
              <span className={styles.courseTag}>Social Skills</span>
            </div>
            <div className={styles.courseInfo}>
              <div className={styles.courseMeta}>
                <span className={styles.courseMetaItem}><Users size={16} /> 200+ Learners</span>
                <span className={styles.courseMetaItem}><Clock size={16} /> 12 Sessions</span>
              </div>
              <h3>Practical Social Modeling</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                Teaching kids foundational interaction cues and vicarious social skills.
              </p>
              <div className={styles.courseFooter}>
                <span className={styles.coursePrice}>$240</span>
                <Link href="/parent">
                  <button className={styles.btnOutline}>Enroll now</button>
                </Link>
              </div>
            </div>
          </TiltCard>

          {/* Course 2 */}
          <TiltCard className={styles.courseCard}>
            <div className={styles.courseImg} style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url('/picasset/course2.jpg')", backgroundColor: "#FFF1D6" }}>
              <span className={styles.courseTag}>Coping Skills</span>
            </div>
            <div className={styles.courseInfo}>
              <div className={styles.courseMeta}>
                <span className={styles.courseMetaItem}><Users size={16} /> 150+ Learners</span>
                <span className={styles.courseMetaItem}><Clock size={16} /> 8 Sessions</span>
              </div>
              <h3>Stress & Coping Strategies</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                Emotional regulation workshops for neurodivergent and typical learners.
              </p>
              <div className={styles.courseFooter}>
                <span className={styles.coursePrice}>$180</span>
                <Link href="/parent">
                  <button className={styles.btnOutline}>Enroll now</button>
                </Link>
              </div>
            </div>
          </TiltCard>

          {/* Course 3 */}
          <TiltCard className={styles.courseCard}>
            <div className={styles.courseImg} style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url('/picasset/course3.jpg')", backgroundColor: "#FFE7EB" }}>
              <span className={styles.courseTag}>Focus & Study</span>
            </div>
            <div className={styles.courseInfo}>
              <div className={styles.courseMeta}>
                <span className={styles.courseMetaItem}><Users size={16} /> 320+ Learners</span>
                <span className={styles.courseMetaItem}><Clock size={16} /> 10 Sessions</span>
              </div>
              <h3>ADHD Study Hack Lab</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                Actionable focus techniques, gamified trackers, and milestone rewards.
              </p>
              <div className={styles.courseFooter}>
                <span className={styles.coursePrice}>$200</span>
                <Link href="/parent">
                  <button className={styles.btnOutline}>Enroll now</button>
                </Link>
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* Category Banner */}
      <section className={styles.categoryBanner}>
        <div className={styles.categoryIntro}>
          <h2>Get programs by category</h2>
          <p style={{ color: "rgba(255, 255, 255, 0.7)", marginTop: "1rem" }}>
            Explore various disciplines structured to empower tutors and students alike.
          </p>
        </div>

        <div className={styles.categoryGrid}>
          <div className={styles.categoryCard}>
            <h3 style={{ fontWeight: 700 }}>Social Interaction</h3>
            <p>Video modeling, conversation practice, and peer bonding modules.</p>
            <Link href="#courses">Learn more &rarr;</Link>
          </div>
          <div className={styles.categoryCard}>
            <h3 style={{ fontWeight: 700 }}>Specialized Niche</h3>
            <p>Dyslexia specialists, autism-informed, and ADHD-friendly guides.</p>
            <Link href="#courses">Learn more &rarr;</Link>
          </div>
          <div className={styles.categoryCard}>
            <h3 style={{ fontWeight: 700 }}>Behavioral Analytics</h3>
            <p>Class snapshots, progress tracking heatmaps, and feedback reports.</p>
            <Link href="#courses">Learn more &rarr;</Link>
          </div>
        </div>
      </section>

      {/* Success Story Grid */}
      <section id="about" className={styles.storySection}>
        <div className={styles.storyGrid}>
          <div>
            <span style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: "0.95rem" }}>OUR SUCCESS STORY</span>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--text-navy)", margin: "1rem 0" }}>
              Creating trusted environments for specialized learning
            </h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "2rem" }}>
              For years, we've pioneered educational tools that bridge the communication gap, 
              delivering customized social learning plans that yield measurable, real-world growth.
            </p>
            <Link href="/parent" className={styles.btnSecondary}>
              Join us now
            </Link>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statSquare}>
              <span className={styles.statNumber}>40+</span>
              <span className={styles.statLabel}>Years of Success</span>
            </div>
            <div className={styles.statSquare}>
              <span className={styles.statNumber}>100%</span>
              <span className={styles.statLabel}>Vetted Tutors</span>
            </div>
            <div className={styles.statSquare}>
              <span className={styles.statNumber}>10K+</span>
              <span className={styles.statLabel}>Certified Learners</span>
            </div>
            <div className={styles.statSquare}>
              <span className={styles.statNumber}>50+</span>
              <span className={styles.statLabel}>Rated Programs</span>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modeling Demonstration */}
      <section className={styles.videoSection}>
        <div className={styles.sectionHeader}>
          <h2>We Teach Social Skills With VideoModeling</h2>
          <p>Watch how vicarious social modeling helps children learn natural, confident behavioral skills.</p>
        </div>

        <div className={styles.videoContainer}>
          {!isPlayingVideo ? (
            <div style={{ position: "relative", width: "100%", height: "450px", backgroundColor: "#D7F5EC", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div className={styles.videoOverlay}>
                <button className={styles.playBtn} onClick={() => setIsPlayingVideo(true)}>
                  <Play size={36} fill="white" />
                </button>
              </div>
              {/* Vector Mock Video Graphic */}
              <svg viewBox="0 0 800 450" style={{ width: "100%", height: "100%" }}>
                <rect x="0" y="0" width="800" height="450" fill="var(--bg-mint)" opacity="0.4" />
                <circle cx="400" cy="225" r="70" fill="none" stroke="var(--color-primary)" strokeWidth="6" strokeDasharray="10 5" />
                <path d="M 280 280 Q 400 180 520 280" fill="none" stroke="var(--text-navy)" strokeWidth="6" strokeLinecap="round" />
                {/* Floating Cap */}
                <g transform="translate(370, 130) scale(0.6)">
                  <polygon points="50,15 90,35 50,55 10,35" fill="var(--color-primary)" />
                  <polygon points="25,43 25,60 50,70 75,60 75,43" fill="var(--color-primary-hover)" />
                </g>
              </svg>
            </div>
          ) : (
            <div style={{ width: "100%", height: "450px", background: "#000", position: "relative" }}>
              {/* Play simulated educational video with close button */}
              <button 
                onClick={() => setIsPlayingVideo(false)}
                style={{ position: "absolute", top: "20px", right: "20px", zIndex: 10, background: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
              >
                Close Video
              </button>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Video Modeling"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials (Handwritten post-it style notes) */}
      <section id="testimonials" className={styles.testimonialSection}>
        <div className={styles.sectionHeader}>
          <h2>We are loved by 2000+ learners</h2>
          <p>Real stories of growth and trust written by our parent & student community.</p>
        </div>

        <div className={styles.testimonialsGrid}>
          <div className={`${styles.stickyNote} ${styles.noteGreen}`}>
            <p className={styles.noteContent}>
              &ldquo;Finding a Dyslexia specialist who understands how my son learns was a lifesaver. The heatmap dashboard tells me exactly where he's improving.&rdquo;
            </p>
            <div className={styles.noteAuthor}>
              <div className={styles.authorImg} style={{ backgroundColor: "#F8C064" }} />
              <div className={styles.authorMeta}>
                <span className={styles.authorName}>Sarah Jenkins</span>
                <span className={styles.authorRole}>Parent of Tyler (10)</span>
              </div>
            </div>
          </div>

          <div className={`${styles.stickyNote} ${styles.noteYellow}`}>
            <p className={styles.noteContent}>
              &ldquo;The Emergency Substitute feature rescued us last Tuesday. Tyler's regular tutor was sick, but we booked an approved substitute in 15 minutes!&rdquo;
            </p>
            <div className={styles.noteAuthor}>
              <div className={styles.authorImg} style={{ backgroundColor: "#E27E8C" }} />
              <div className={styles.authorMeta}>
                <span className={styles.authorName}>David Miller</span>
                <span className={styles.authorRole}>Parent of Emily (8)</span>
              </div>
            </div>
          </div>

          <div className={`${styles.stickyNote} ${styles.notePink}`}>
            <p className={styles.noteContent}>
              &ldquo;My daughter loves earning Knowledge Coins during lessons. She swapped them for a customized helper avatar yesterday! Outstanding idea.&rdquo;
            </p>
            <div className={styles.noteAuthor}>
              <div className={styles.authorImg} style={{ backgroundColor: "#486BE5" }} />
              <div className={styles.authorMeta}>
                <span className={styles.authorName}>Maria Rosales</span>
                <span className={styles.authorRole}>Parent of Sophie (7)</span>
              </div>
            </div>
          </div>

          <div className={`${styles.stickyNote} ${styles.noteBlue}`}>
            <p className={styles.noteContent}>
              &ldquo;As a tutor, the auto-buffer scheduler blocks out my prep times, and I never have to worry about platform leaks or dynamic invoicing.&rdquo;
            </p>
            <div className={styles.noteAuthor}>
              <div className={styles.authorImg} style={{ backgroundColor: "#CEF1E5" }} />
              <div className={styles.authorMeta}>
                <span className={styles.authorName}>Coach Alex</span>
                <span className={styles.authorRole}>Special Needs Educator</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerCol}>
            <div className={styles.logo} style={{ color: "white" }}>
              <GraduationCap size={32} />
              <span>James Stanfield</span>
            </div>
            <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.9rem" }}>
              Empowering specialized education through technology, trust automation, and interactive video modeling.
            </p>
          </div>

          <div className={styles.footerCol}>
            <h4>Portals</h4>
            <ul>
              <li><Link href="/parent">Parent/Student Portal</Link></li>
              <li><Link href="/teacher">Teacher Dashboard</Link></li>
              <li><Link href="/admin">Marketplace Admin</Link></li>
            </ul>
          </div>

          <div className={styles.footerCol}>
            <h4>Programs</h4>
            <ul>
              <li><Link href="#courses">Social Skills</Link></li>
              <li><Link href="#courses">ADHD Focus Lab</Link></li>
              <li><Link href="#courses">Stress Control</Link></li>
            </ul>
          </div>

          <div className={styles.footerCol}>
            <h4>Company</h4>
            <ul>
              <li><Link href="#about">About Us</Link></li>
              <li><Link href="#testimonials">Reviews</Link></li>
              <li><Link href="/admin">Dispute center</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>&copy; {new Date().getFullYear()} James Stanfield Company. All rights reserved.</span>
          <span>Trust & Safety Vetted Marketplace</span>
        </div>
      </footer>
    </div>
  );
}
