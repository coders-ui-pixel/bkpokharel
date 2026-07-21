import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HeroScene } from "../../components/three/HeroScene";
import { HeroVisual } from "../../components/home/HeroVisual";
import { FeatureIcon } from "../../components/home/FeatureIcon";
import { StepIcon } from "../../components/home/StepIcon";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";
import { useFeaturedCourses } from "../../features/courses/hooks";
import { assetUrl } from "../../lib/assetUrl";

const features = [
  {
    kind: "examLike" as const,
    tone: "purple",
    title: "Real exam experience",
    body: "Live exams run on a synced countdown so practice feels like the real thing.",
  },
  {
    kind: "results" as const,
    tone: "green",
    title: "Instant results",
    body: "Get scored immediately with per-question explanations after every attempt.",
  },
  {
    kind: "courses" as const,
    tone: "orange",
    title: "Multiple courses",
    body: "Browse a growing catalog of courses, organized chapter by chapter.",
  },
  {
    kind: "anytime" as const,
    tone: "blue",
    title: "Learn anytime",
    body: "Notes and practice are available on your schedule, on any device.",
  },
];

const stats = [
  { value: "Free", label: "To get started" },
  { value: "Live", label: "Synced timed exams" },
  { value: "∞", label: "Practice attempts" },
  { value: "Instant", label: "Scoring & explanations" },
];

const steps = [
  { title: "Create your account", body: "Sign up in just a few seconds." },
  { title: "Choose a course", body: "Enroll instantly and open any chapter's notes or MCQs." },
  { title: "Practice & improve", body: "Track every attempt on your dashboard as your score climbs." },
];

const highlights = [
  {
    quote: "Chapter-wise practice means you only ever study what you're weak on.",
    tag: "Focused practice",
  },
  {
    quote: "A synced countdown and leaderboard make live exams feel like the real thing.",
    tag: "Live exams",
  },
  {
    quote: "Start practicing for free — no trial period, no card required.",
    tag: "Free to start",
  },
];

export function HomePage() {
  const reducedMotion = usePrefersReducedMotion();
  const { data: featuredCourses } = useFeaturedCourses();

  return (
    <div className="home">
      {!reducedMotion && <HeroScene className="home__canvas-bg" />}
      <section className="hero">
        <div className="hero__glow" />
        <div className="hero__grid">
          <div className="hero__content">
            <div className="hero__eyebrow-spacer" />
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Practice. Improve. <span className="hero__accent">Excel.</span>
            </motion.h1>
            <motion.p
              className="hero__subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Mock exams for every student. Chapter-wise notes, unlimited MCQ practice, and
              scheduled live exams — a better way to prepare.
            </motion.p>
            <motion.div
              className="hero__actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link to="/register" className="btn btn--primary">
                Start your free mock exam →
              </Link>
              <Link to="/courses" className="btn btn--ghost">
                Explore courses
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <HeroVisual />
          </motion.div>
        </div>
        <div className="hero__scroll-cue">
          <span />
          <small>Scroll Down</small>
        </div>
      </section>

      <section className="features">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Why students choose us
        </motion.h2>
        <p className="section-subtitle">
          Everything you need to prepare with confidence — free, focused, and built around chapters.
        </p>
        <div className="features__grid">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="feature-card"
              initial={{ opacity: 0, y: 30, rotateX: 25 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              style={{ transformPerspective: 1000 }}
            >
              <FeatureIcon kind={feature.kind} tone={feature.tone} />
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {!!featuredCourses?.length && (
        <section className="featured-courses">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Featured courses
          </motion.h2>
          <p className="section-subtitle">Hand-picked courses to get you started right away.</p>
          <div className="cart-grid featured-courses__grid">
            {featuredCourses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link to={`/courses/${course.id}`} className="cart-card">
                  <div className="cart-card__thumb">
                    {course.coverImageUrl ? (
                      <img src={assetUrl(course.coverImageUrl)} alt={course.title} />
                    ) : (
                      <div className="cart-card__thumb-placeholder">
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M6 2h9l3 3v17H6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                          <path d="M9 11h6M9 15h6M9 7h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                    )}
                    <span className={`cart-card__price-tag ${course.isPaid ? "is-paid" : "is-free"}`}>
                      {course.isPaid ? `Rs. ${course.price}` : "Free"}
                    </span>
                  </div>
                  <div className="cart-card__body">
                    <h2>{course.title}</h2>
                    <p>{course.description}</p>
                    <p className="course-meta">{course._count?.subjects ?? 0} subjects</p>
                    <span className="btn btn--primary btn--block">
                      {course.isPaid ? "View & enroll" : "Enroll for free"}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <section className="stats">
        <div className="stats__bar">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="stat-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="steps">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          How it works
        </motion.h2>
        <p className="section-subtitle">Get started in three simple steps.</p>
        <div className="steps__grid">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              className="step-card"
              initial={{ opacity: 0, y: 30, rotateX: 25 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              style={{ transformPerspective: 1000 }}
            >
              <span className="step-card__number">{i + 1}</span>
              <StepIcon step={(i + 1) as 1 | 2 | 3} />
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="highlights">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Built for focused exam prep
        </motion.h2>
        <div className="highlights__grid">
          {highlights.map((item, i) => (
            <motion.div
              key={item.tag}
              className="highlight-card"
              initial={{ opacity: 0, y: 24, rotateX: 20 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              style={{ transformPerspective: 1000 }}
            >
              <span className="highlight-card__quote-mark">&ldquo;</span>
              <p>{item.quote}</p>
              <span className="highlight-card__tag">{item.tag}</span>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="final-cta__inner"
        >
          <div>
            <h2>Ready to challenge yourself?</h2>
            <p>Take a free mock exam now and take the first step towards your success.</p>
          </div>
          <Link to="/register" className="btn btn--light btn--lg">
            Start your free mock exam →
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
