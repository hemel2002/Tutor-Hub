"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Brain,
  Check,
  CheckCircle,
  ChevronDown,
  Clock,
  Compass,
  GraduationCap,
  Heart,
  Menu,
  MessageCircle,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Users,
  Video,
  X,
  Zap,
} from "lucide-react";
import styles from "./landing.module.css";

const filters = ["All programs", "Academic", "Confidence", "Neurodiverse"];

const programs = [
  {
    title: "Math confidence lab",
    description: "Build number fluency through visual problem solving, games, and small weekly wins.",
    category: "Academic",
    ages: "Ages 9–13",
    sessions: "10 sessions",
    color: "violet",
    icon: BarChart3,
  },
  {
    title: "Focus & study systems",
    description: "Practical routines for planning, starting, and completing work with less friction.",
    category: "Neurodiverse",
    ages: "Ages 11–16",
    sessions: "8 sessions",
    color: "lime",
    icon: Brain,
  },
  {
    title: "Confident communication",
    description: "Low-pressure coaching for self-expression, social cues, and classroom participation.",
    category: "Confidence",
    ages: "Ages 8–14",
    sessions: "12 sessions",
    color: "coral",
    icon: MessageCircle,
  },
  {
    title: "Reading breakthrough",
    description: "Multi-sensory reading support shaped around pace, strengths, and attention patterns.",
    category: "Academic",
    ages: "Ages 7–12",
    sessions: "10 sessions",
    color: "blue",
    icon: BookOpen,
  },
];

const specialists = [
  {
    name: "Maya Rahman, M.Ed.",
    subject: "Math confidence",
    detail: "Visual learning specialist",
    rating: "4.98",
    reviews: "184",
    color: "violet",
    initials: "MR",
  },
  {
    name: "Alex Morgan",
    subject: "ADHD study skills",
    detail: "Executive function coach",
    rating: "4.96",
    reviews: "132",
    color: "lime",
    initials: "AM",
  },
  {
    name: "Jessica Chen, MSc",
    subject: "Reading & confidence",
    detail: "Dyslexia-informed tutor",
    rating: "5.00",
    reviews: "96",
    color: "coral",
    initials: "JC",
  },
];

const matchProfiles = {
  focus: {
    name: "Alex Morgan",
    role: "Executive function coach",
    match: "96% match",
    note: "Alex uses short focus sprints, visual planning, and calm accountability—an excellent fit for building sustainable study habits.",
    tags: ["ADHD-informed", "Games & visuals", "After-school"],
    initials: "AM",
    color: "lime",
  },
  confidence: {
    name: "Maya Rahman, M.Ed.",
    role: "Confidence-first math specialist",
    match: "98% match",
    note: "Maya turns difficult concepts into visual, low-pressure challenges and celebrates progress before speed.",
    tags: ["Math specialist", "Patient pacing", "Weekly feedback"],
    initials: "MR",
    color: "violet",
  },
  reading: {
    name: "Jessica Chen, MSc",
    role: "Dyslexia-informed reading tutor",
    match: "97% match",
    note: "Jessica combines multi-sensory reading methods with confidence coaching and clear family progress notes.",
    tags: ["Multi-sensory", "Reading support", "Parent updates"],
    initials: "JC",
    color: "coral",
  },
};

const faqs = [
  {
    question: "How are tutors verified?",
    answer:
      "Every specialist completes identity and credential checks, a teaching review, and a structured safety screening before appearing in search.",
  },
  {
    question: "Can I change tutors if the fit is not right?",
    answer:
      "Yes. Your first-session fit promise lets you rematch at no extra cost, and your learning profile transfers so you do not have to start over.",
  },
  {
    question: "What do parents receive after a session?",
    answer:
      "Parents receive a concise session snapshot with skills practised, engagement notes, next steps, and progress toward the current goal.",
  },
  {
    question: "Does Tutor Hub support neurodiverse learners?",
    answer:
      "Yes. You can match with ADHD-friendly, autism-informed, dyslexia-informed, and sensory-aware specialists, then tailor pace and session format.",
  },
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(filters[0]);
  const [goal, setGoal] = useState<keyof typeof matchProfiles>("confidence");
  const [learningStyle, setLearningStyle] = useState("Visual & hands-on");
  const [schedule, setSchedule] = useState("Weekday afternoons");
  const [matchResult, setMatchResult] = useState<(typeof matchProfiles)[keyof typeof matchProfiles] | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  const visiblePrograms = useMemo(
    () =>
      activeFilter === filters[0]
        ? programs
        : programs.filter((program) => program.category === activeFilter),
    [activeFilter],
  );

  const createMatch = () => {
    setMatchResult(matchProfiles[goal]);
  };

  return (
    <main className={styles.page}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>

      <header className={styles.header}>
        <nav className={styles.nav} aria-label="Main navigation">
          <Link href="/" className={styles.brand} aria-label="Tutor Hub home">
            <span className={styles.brandMark}>
              <GraduationCap size={21} strokeWidth={2.4} />
            </span>
            <span>Tutor Hub</span>
          </Link>

          <div className={styles.desktopNav}>
            <a href="#how-it-works">How it works</a>
            <a href="#programs">Programs</a>
            <a href="#specialists">Tutors</a>
            <a href="#stories">Success stories</a>
          </div>

          <div className={styles.navActions}>
            <Link href="/login" className={styles.signIn}>
              Sign in
            </Link>
            <a href="#match" className={styles.navCta}>
              Find my tutor
              <ArrowRight size={16} />
            </a>
          </div>

          <button
            className={styles.menuButton}
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {mobileOpen && (
          <div className={styles.mobileNav}>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)}>How it works</a>
            <a href="#programs" onClick={() => setMobileOpen(false)}>Programs</a>
            <a href="#specialists" onClick={() => setMobileOpen(false)}>Tutors</a>
            <a href="#stories" onClick={() => setMobileOpen(false)}>Success stories</a>
            <Link href="/login">Sign in</Link>
            <a href="#match" className={styles.mobileCta} onClick={() => setMobileOpen(false)}>
              Find my tutor <ArrowRight size={16} />
            </a>
          </div>
        )}
      </header>

      <div id="main-content">
        <section className={styles.hero}>
          <div className={styles.heroGlow} />
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <div className={styles.eyebrow}>
                <span><Sparkles size={14} /></span>
                Personalised tutoring, built around your learner
              </div>
              <h1>
                The right tutor changes
                <span> more than grades.</span>
              </h1>
              <p className={styles.heroText}>
                Match with a verified specialist who understands how your child learns,
                then follow every small win in one calm, connected space.
              </p>
              <div className={styles.heroActions}>
                <a href="#match" className={styles.primaryButton}>
                  Find the right tutor
                  <ArrowRight size={18} />
                </a>
                <button className={styles.textButton} type="button" onClick={() => setPreviewOpen(true)}>
                  <span className={styles.playIcon}><Play size={15} fill="currentColor" /></span>
                  See a session preview
                </button>
              </div>
              <div className={styles.heroTrust}>
                <div className={styles.avatarStack} aria-hidden="true">
                  <span>MR</span><span>AM</span><span>JC</span>
                </div>
                <div>
                  <div className={styles.ratingLine}>
                    {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={14} fill="currentColor" />)}
                    <strong>4.9</strong>
                  </div>
                  <small>Trusted by 2,000+ learning families</small>
                </div>
              </div>
            </div>

            <div className={styles.heroVisual} aria-label="Tutor Hub learner dashboard preview">
              <div className={styles.visualDots} />
              <div className={styles.dashboardCard}>
                <div className={styles.dashboardTop}>
                  <div>
                    <small>LEARNING SPACE</small>
                    <strong>Good afternoon, Sophie</strong>
                  </div>
                  <span className={styles.notificationDot} />
                </div>

                <div className={styles.sessionCard}>
                  <div className={`${styles.tutorAvatar} ${styles.violetAvatar}`}>MR</div>
                  <div className={styles.sessionCopy}>
                    <span>NEXT SESSION · 4:00 PM</span>
                    <strong>Math confidence lab</strong>
                    <small>with Maya Rahman</small>
                  </div>
                  <span className={styles.joinButton}>Join</span>
                </div>

                <div className={styles.progressCard}>
                  <div className={styles.progressHeader}>
                    <div>
                      <span>Confidence journey</span>
                      <strong>Growing every week</strong>
                    </div>
                    <span className={styles.upBadge}>+18%</span>
                  </div>
                  <div className={styles.chart} aria-hidden="true">
                    <span style={{ height: "28%" }} />
                    <span style={{ height: "42%" }} />
                    <span style={{ height: "38%" }} />
                    <span style={{ height: "61%" }} />
                    <span style={{ height: "72%" }} />
                    <span style={{ height: "88%" }} />
                  </div>
                  <div className={styles.chartLabels}>
                    <span>Week 1</span><span>Today</span>
                  </div>
                </div>
              </div>

              <div className={styles.safetyBadge}>
                <span><ShieldCheck size={18} /></span>
                <div><strong>100% verified</strong><small>Safety-first specialists</small></div>
              </div>
              <div className={styles.winBadge}>
                <span><Award size={18} /></span>
                <div><strong>New milestone!</strong><small>Asked for help independently</small></div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.trustStrip} aria-label="Tutor Hub benefits">
          <div><ShieldCheck size={20} /><span><strong>Vetted specialists</strong>Credentials and safety checked</span></div>
          <div><Compass size={20} /><span><strong>Fit-first matching</strong>Goals, style, pace, personality</span></div>
          <div><BarChart3 size={20} /><span><strong>Visible progress</strong>A useful snapshot after every session</span></div>
          <div><Heart size={20} /><span><strong>First-session promise</strong>Easy rematch if the fit is not right</span></div>
        </section>

        <section id="how-it-works" className={styles.section}>
          <div className={styles.sectionIntro}>
            <span className={styles.kicker}>A BETTER WAY TO FIND SUPPORT</span>
            <h2>From “where do we start?” to a plan that feels right.</h2>
            <p>Share what matters. We organise the rest around your learner.</p>
          </div>

          <div className={styles.stepsGrid}>
            <article className={styles.stepCard}>
              <span className={styles.stepNumber}>01</span>
              <div className={`${styles.stepIcon} ${styles.violetIcon}`}><Target size={23} /></div>
              <h3>Tell us the goal</h3>
              <p>Choose the subject, challenge, confidence goal, and learning preferences.</p>
            </article>
            <article className={styles.stepCard}>
              <span className={styles.stepNumber}>02</span>
              <div className={`${styles.stepIcon} ${styles.limeIcon}`}><Search size={23} /></div>
              <h3>Meet your best matches</h3>
              <p>Compare fit notes, teaching style, availability, experience, and reviews.</p>
            </article>
            <article className={styles.stepCard}>
              <span className={styles.stepNumber}>03</span>
              <div className={`${styles.stepIcon} ${styles.coralIcon}`}><Zap size={23} /></div>
              <h3>Learn, reflect, grow</h3>
              <p>Join sessions and see clear next steps, milestones, and progress snapshots.</p>
            </article>
          </div>
        </section>

        <section id="match" className={styles.matchSection}>
          <div className={styles.matchIntro}>
            <span className={styles.matchPill}><Compass size={15} /> EXCLUSIVE TO TUTOR HUB</span>
            <h2>Meet your Learning Compass.</h2>
            <p>
              Go beyond subject filters. Build a thoughtful first match from the way your
              learner responds, practises, and stays engaged.
            </p>
            <ul>
              <li><CheckCircle size={18} />Teaching-style compatibility</li>
              <li><CheckCircle size={18} />Goal and schedule alignment</li>
              <li><CheckCircle size={18} />A human-readable reason for every match</li>
            </ul>
          </div>

          <div className={styles.matchPanel}>
            <div className={styles.matchPanelHeader}>
              <div><span>LEARNING COMPASS</span><strong>Build a first match</strong></div>
              <span className={styles.privateTag}><ShieldCheck size={13} /> Private</span>
            </div>

            {!matchResult ? (
              <div className={styles.matchForm}>
                <label>
                  <span>What matters most right now?</span>
                  <select value={goal} onChange={(event) => setGoal(event.target.value as keyof typeof matchProfiles)}>
                    <option value="confidence">Confidence in maths</option>
                    <option value="focus">Focus and study habits</option>
                    <option value="reading">Reading fluency</option>
                  </select>
                </label>
                <label>
                  <span>How do they learn best?</span>
                  <select value={learningStyle} onChange={(event) => setLearningStyle(event.target.value)}>
                    <option>Visual & hands-on</option>
                    <option>Conversation & stories</option>
                    <option>Short, structured steps</option>
                  </select>
                </label>
                <label>
                  <span>Ideal session time</span>
                  <select value={schedule} onChange={(event) => setSchedule(event.target.value)}>
                    <option>Weekday afternoons</option>
                    <option>Weekday evenings</option>
                    <option>Weekend mornings</option>
                  </select>
                </label>
                <button type="button" onClick={createMatch}>
                  Create my match <Sparkles size={17} />
                </button>
                <small>No account needed. Takes less than a minute.</small>
              </div>
            ) : (
              <div className={styles.matchResult} aria-live="polite">
                <div className={styles.resultTop}>
                  <div className={`${styles.resultAvatar} ${styles[`${matchResult.color}Avatar`]}`}>
                    {matchResult.initials}
                  </div>
                  <div>
                    <span>{matchResult.match}</span>
                    <h3>{matchResult.name}</h3>
                    <p>{matchResult.role}</p>
                  </div>
                </div>
                <div className={styles.fitReason}>
                  <strong><Sparkles size={15} /> Why this match works</strong>
                  <p>{matchResult.note}</p>
                </div>
                <div className={styles.resultTags}>
                  {matchResult.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <div className={styles.resultActions}>
                  <Link href="/login">Meet your tutor <ArrowRight size={16} /></Link>
                  <button type="button" onClick={() => setMatchResult(null)}>Adjust answers</button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section id="programs" className={`${styles.section} ${styles.programSection}`}>
          <div className={styles.programHeader}>
            <div className={styles.sectionIntroLeft}>
              <span className={styles.kicker}>LEARNING THAT MEETS THEM THERE</span>
              <h2>Programs built for real learners.</h2>
              <p>Clear goals, flexible pacing, and specialists who adapt as confidence grows.</p>
            </div>
            <div className={styles.filters} aria-label="Filter programs">
              {filters.map((filter) => (
                <button
                  type="button"
                  key={filter}
                  className={activeFilter === filter ? styles.activeFilter : ""}
                  aria-pressed={activeFilter === filter}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.programGrid}>
            {visiblePrograms.map((program) => {
              const Icon = program.icon;
              return (
                <article className={styles.programCard} key={program.title}>
                  <div className={`${styles.programVisual} ${styles[`${program.color}Visual`]}`}>
                    <span className={styles.programCategory}>{program.category}</span>
                    <span className={styles.programOrb}><Icon size={31} /></span>
                    <span className={styles.visualRing} />
                    <span className={styles.visualDot} />
                  </div>
                  <div className={styles.programBody}>
                    <div className={styles.programMeta}>
                      <span><Users size={14} />{program.ages}</span>
                      <span><Clock size={14} />{program.sessions}</span>
                    </div>
                    <h3>{program.title}</h3>
                    <p>{program.description}</p>
                    <Link href="/login">
                      Explore program <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="specialists" className={styles.specialistSection}>
          <div className={styles.sectionIntro}>
            <span className={styles.kicker}>PEOPLE WHO KNOW HOW TO REACH THEM</span>
            <h2>Trusted expertise. Warm, human teaching.</h2>
            <p>Every profile is verified, reviewed, and built to help you understand the fit.</p>
          </div>

          <div className={styles.specialistGrid}>
            {specialists.map((specialist, index) => (
              <article className={styles.specialistCard} key={specialist.name}>
                <div className={`${styles.specialistPortrait} ${styles[`${specialist.color}Portrait`]}`}>
                  <span>{specialist.initials}</span>
                  <div className={styles.available}><span /> Available this week</div>
                  {index === 0 && <div className={styles.topMatch}><Award size={14} /> Top match</div>}
                </div>
                <div className={styles.specialistBody}>
                  <div className={styles.specialistRating}>
                    <Star size={15} fill="currentColor" />
                    <strong>{specialist.rating}</strong>
                    <span>({specialist.reviews} reviews)</span>
                  </div>
                  <h3>{specialist.name}</h3>
                  <strong className={styles.specialistSubject}>{specialist.subject}</strong>
                  <p>{specialist.detail}</p>
                  <div className={styles.specialistFooter}>
                    <span><Video size={15} /> Free intro call</span>
                    <Link href="/login" aria-label={`View ${specialist.name}'s profile`}>
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className={styles.centerAction}>
            <a href="#match">See your best matches <ArrowRight size={17} /></a>
          </div>
        </section>

        <section id="stories" className={styles.storySection}>
          <div className={styles.storyCard}>
            <div className={styles.quoteMark}>“</div>
            <blockquote>
              For the first time, Noah does not call himself “bad at maths.” Maya found the
              pace he needed, and the weekly snapshots helped us celebrate progress we used
              to miss.
            </blockquote>
            <div className={styles.storyAuthor}>
              <span>SL</span>
              <div><strong>Sarah L.</strong><small>Parent of Noah, age 11</small></div>
            </div>
          </div>
          <div className={styles.storyStats}>
            <span className={styles.kicker}>PROGRESS YOU CAN FEEL</span>
            <h2>Small wins become lasting confidence.</h2>
            <div className={styles.statsGrid}>
              <div><strong>92%</strong><span>of families report stronger learning confidence</span></div>
              <div><strong>4.9/5</strong><span>average specialist rating across the marketplace</span></div>
              <div><strong>87%</strong><span>of learners reach their first milestone in six weeks</span></div>
              <div><strong>&lt; 2 min</strong><span>average time to build a Learning Compass match</span></div>
            </div>
          </div>
        </section>

        <section className={styles.faqSection}>
          <div className={styles.faqIntro}>
            <span className={styles.kicker}>GOOD QUESTIONS, CLEAR ANSWERS</span>
            <h2>Everything you need to feel ready.</h2>
            <p>Still deciding? Explore the answers families ask us most.</p>
            <Link href="/login">Talk to the Tutor Hub team <ArrowRight size={16} /></Link>
          </div>
          <div className={styles.faqList}>
            {faqs.map((faq, index) => {
              const open = activeFaq === index;
              return (
                <div className={styles.faqItem} key={faq.question}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setActiveFaq(open ? null : index)}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown size={19} className={open ? styles.chevronOpen : ""} />
                  </button>
                  {open && <p>{faq.answer}</p>}
                </div>
              );
            })}
          </div>
        </section>

        <section className={styles.finalCta}>
          <div className={styles.ctaSparkleOne}><Sparkles size={26} /></div>
          <div className={styles.ctaSparkleTwo}><Sparkles size={18} /></div>
          <span>YOUR NEXT SMALL WIN STARTS HERE</span>
          <h2>Find someone who sees how your learner learns.</h2>
          <p>Build a thoughtful match in under two minutes. No pressure, no payment required.</p>
          <div>
            <a href="#match">Find my tutor <ArrowRight size={18} /></a>
            <Link href="/login">Explore the family portal</Link>
          </div>
        </section>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <Link href="/" className={styles.brand}>
              <span className={styles.brandMark}><GraduationCap size={21} /></span>
              <span>Tutor Hub</span>
            </Link>
            <p>Specialist tutoring that puts the learner, the family, and every small win in the same place.</p>
          </div>
          <div>
            <h3>For families</h3>
            <a href="#match">Find a tutor</a>
            <a href="#programs">Programs</a>
            <Link href="/parent">Family portal</Link>
          </div>
          <div>
            <h3>For tutors</h3>
            <Link href="/login">Join Tutor Hub</Link>
            <Link href="/teacher">Tutor portal</Link>
            <a href="#how-it-works">How it works</a>
          </div>
          <div>
            <h3>Platform</h3>
            <a href="#specialists">Our specialists</a>
            <a href="#stories">Success stories</a>
            <Link href="/admin">Trust & safety</Link>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} Tutor Hub. Learning, made personal.</span>
          <div><span>Privacy</span><span>Terms</span><span>Accessibility</span></div>
        </div>
      </footer>

      {previewOpen && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setPreviewOpen(false)}>
          <div
            className={styles.previewModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.modalClose}
              aria-label="Close preview"
              onClick={() => setPreviewOpen(false)}
            >
              <X size={20} />
            </button>
            <div className={styles.previewStage}>
              <div className={styles.previewTutor}>MR</div>
              <div className={styles.previewWhiteboard}>
                <span>12 × 4 = ?</span>
                <div><i /><i /><i /><i /></div>
              </div>
              <div className={styles.previewLearner}>S</div>
            </div>
            <span className={styles.previewKicker}><Video size={15} /> SESSION PREVIEW</span>
            <h2 id="preview-title">A calm, confidence-first learning space.</h2>
            <p>
              Tutors can combine a live whiteboard, focus prompts, visual models, and
              collaborative rewards—while parents receive a useful snapshot afterward.
            </p>
            <div className={styles.previewFeatures}>
              <span><Check size={15} /> Live visual tools</span>
              <span><Check size={15} /> Flexible pacing</span>
              <span><Check size={15} /> Session snapshots</span>
            </div>
            <Link href="/login" onClick={() => setPreviewOpen(false)}>
              Explore the full demo <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
