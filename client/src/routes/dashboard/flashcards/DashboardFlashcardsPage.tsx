import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MathText } from "../../../components/ui/MathText";
import { useMyEnrollments } from "../../../features/courses/hooks";
import { useSelectedCourse } from "../../../context/SelectedCourseContext";
import {
  useFlashCardsForCourse,
  useUpdateCourseFlashCardProgress,
} from "../../../features/flashcards/hooks";
import type { CourseFlashCard } from "../../../features/flashcards/types";

type ViewFilter = "all" | "attempted" | "favorites";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function isAttempted(card: CourseFlashCard): boolean {
  return card.status !== "new" || card.reviewCount > 0;
}

function MiniCard({
  card,
  onToggleFavorite,
  onMark,
}: {
  card: CourseFlashCard;
  onToggleFavorite: () => void;
  onMark: (status: "known" | "difficult") => void;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      className={`mini-flashcard mini-flashcard--${card.status}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -3 }}
    >
      <div className="mini-flashcard__top">
        <span className={`mini-flashcard__status mini-flashcard__status--${card.status}`}>
          {card.status === "new" ? "New" : card.status === "known" ? "Known" : "Difficult"}
        </span>
        <button
          type="button"
          className="mini-flashcard__fav"
          onClick={onToggleFavorite}
          aria-label="Toggle favorite"
        >
          {card.isFavorite ? "★" : "☆"}
        </button>
      </div>

      <button type="button" className="mini-flashcard__body" onClick={() => setFlipped((f) => !f)}>
        <p><MathText text={flipped ? card.back : card.front} /></p>
        <span className="mini-flashcard__hint">{flipped ? "Showing answer · tap to flip back" : "Tap to reveal answer"}</span>
      </button>

      <div className="mini-flashcard__actions">
        <button type="button" onClick={() => onMark("difficult")} className="mini-flashcard__action mini-flashcard__action--difficult">
          Difficult
        </button>
        <button type="button" onClick={() => onMark("known")} className="mini-flashcard__action mini-flashcard__action--known">
          Known
        </button>
      </div>
    </motion.div>
  );
}

export function DashboardFlashcardsPage() {
  const { data: enrollments } = useMyEnrollments();
  const approvedCourses = enrollments?.filter((e) => e.status === "approved").map((e) => e.course);

  const { selectedCourseId: courseId, setSelectedCourseId: setCourseId } = useSelectedCourse();

  useEffect(() => {
    if (!approvedCourses || approvedCourses.length === 0) return;
    if (courseId === null || !approvedCourses.some((c) => c.id === courseId)) {
      setCourseId(approvedCourses[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvedCourses]);

  const { data: cards, isLoading } = useFlashCardsForCourse(courseId ?? NaN);
  const updateProgress = useUpdateCourseFlashCardProgress(courseId ?? NaN);

  const [viewFilter, setViewFilter] = useState<ViewFilter>("all");
  const [studyDeck, setStudyDeck] = useState<CourseFlashCard[] | null>(null);
  const [studyIndex, setStudyIndex] = useState(0);
  const [studyFlipped, setStudyFlipped] = useState(false);

  const known = cards?.filter((c) => c.status === "known").length ?? 0;
  const difficult = cards?.filter((c) => c.status === "difficult").length ?? 0;
  const attemptedCount = cards?.filter(isAttempted).length ?? 0;
  const favoritesCount = cards?.filter((c) => c.isFavorite).length ?? 0;

  const filteredCards = useMemo(() => {
    if (!cards) return [];
    if (viewFilter === "attempted") return cards.filter(isAttempted);
    if (viewFilter === "favorites") return cards.filter((c) => c.isFavorite);
    return cards;
  }, [cards, viewFilter]);

  const grouped = useMemo(() => {
    const map = new Map<number, { chapterTitle: string; cards: CourseFlashCard[] }>();
    for (const card of filteredCards) {
      const entry = map.get(card.chapterId) ?? { chapterTitle: card.chapterTitle, cards: [] };
      entry.cards.push(card);
      map.set(card.chapterId, entry);
    }
    return Array.from(map.values());
  }, [filteredCards]);

  function startStudySession(doShuffle: boolean) {
    const deck = doShuffle ? shuffle(filteredCards) : filteredCards;
    setStudyDeck(deck);
    setStudyIndex(0);
    setStudyFlipped(false);
  }

  function markCard(card: CourseFlashCard, status: "known" | "difficult") {
    updateProgress.mutate({ id: card.id, input: { status, incrementReview: true } });
  }

  function toggleFavorite(card: CourseFlashCard) {
    updateProgress.mutate({ id: card.id, input: { isFavorite: !card.isFavorite } });
  }

  function studyNext() {
    setStudyFlipped(false);
    setStudyIndex((i) => Math.min(i + 1, (studyDeck?.length ?? 1) - 1));
  }

  const studyCurrent = studyDeck?.[studyIndex];

  if (studyDeck && studyCurrent) {
    return (
      <section className="practice-page">
        <button type="button" className="btn btn--ghost" onClick={() => setStudyDeck(null)} style={{ marginBottom: 16 }}>
          ← Back to all flashcards
        </button>

        <div className="flashcard-stage">
          <motion.div
            className="flashcard"
            onClick={() => setStudyFlipped((f) => !f)}
            animate={{ rotateY: studyFlipped ? 180 : 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flashcard__face flashcard__face--front">
              <p><MathText text={studyCurrent.front} /></p>
              <span className="course-meta">Click to flip</span>
            </div>
            <div className="flashcard__face flashcard__face--back">
              <p><MathText text={studyCurrent.back} /></p>
            </div>
          </motion.div>
        </div>

        <p className="course-meta" style={{ textAlign: "center" }}>
          {studyCurrent.chapterTitle} · Card {studyIndex + 1} / {studyDeck.length}
        </p>

        <div className="flashcard-actions">
          <button type="button" onClick={() => toggleFavorite(studyCurrent)}>
            {studyCurrent.isFavorite ? "★ Favorited" : "☆ Favorite"}
          </button>
          <button
            type="button"
            onClick={() => {
              markCard(studyCurrent, "difficult");
              studyNext();
            }}
          >
            Mark Difficult
          </button>
          <button
            type="button"
            onClick={() => {
              markCard(studyCurrent, "known");
              studyNext();
            }}
          >
            Mark Known
          </button>
          <button type="button" onClick={studyNext} disabled={studyIndex >= studyDeck.length - 1}>
            Skip →
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="practice-page">
      <div className="practice-hero practice-hero--flashcards">
        <div className="practice-hero__icon">🗂</div>
        <div className="practice-hero__body">
          <h1>Flash Cards</h1>
          <p>Every flashcard assigned to this course, in one place — flip, favorite, and track mastery.</p>
        </div>
        {cards && cards.length > 0 && (
          <div className="practice-hero__stats">
            <div>
              <strong>{cards.length}</strong>
              <span>Total</span>
            </div>
            <div>
              <strong>{known}</strong>
              <span>Known</span>
            </div>
            <div>
              <strong>{difficult}</strong>
              <span>Difficult</span>
            </div>
          </div>
        )}
      </div>

      {approvedCourses?.length === 0 && (
        <p className="practice-empty">
          You don't have any approved enrollments yet — <Link to="/courses">browse courses</Link>{" "}
          to get started.
        </p>
      )}

      {isLoading && <p>Loading...</p>}

      {courseId && !isLoading && (cards?.length ?? 0) === 0 && (
        <div className="practice-empty-card">
          <span className="practice-empty-card__icon">🗂</span>
          <p>No flash cards have been added to this course yet.</p>
        </div>
      )}

      {cards && cards.length > 0 && (
        <>
          <div className="practice-course-tabs practice-course-tabs--sub">
            <button
              type="button"
              className={`practice-course-tab ${viewFilter === "all" ? "is-active" : ""}`}
              onClick={() => setViewFilter("all")}
            >
              All Cards ({cards.length})
            </button>
            <button
              type="button"
              className={`practice-course-tab ${viewFilter === "attempted" ? "is-active" : ""}`}
              onClick={() => setViewFilter("attempted")}
            >
              Attempted Flashcards ({attemptedCount})
            </button>
            <button
              type="button"
              className={`practice-course-tab ${viewFilter === "favorites" ? "is-active" : ""}`}
              onClick={() => setViewFilter("favorites")}
            >
              Favorites ({favoritesCount})
            </button>
          </div>

          <div className="flashcard-study-actions">
            <button type="button" className="btn btn--primary" onClick={() => startStudySession(false)} disabled={filteredCards.length === 0}>
              ▶ Start study session
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => startStudySession(true)} disabled={filteredCards.length === 0}>
              🔀 Shuffle &amp; study
            </button>
          </div>

          {filteredCards.length === 0 && (
            <div className="practice-empty-card">
              <span className="practice-empty-card__icon">🔍</span>
              <p>No cards match this filter yet.</p>
            </div>
          )}

          {grouped.map((group) => (
            <div key={group.chapterTitle} className="practice-chapter-block">
              <div className="practice-chapter-block__heading">
                <span>{group.chapterTitle}</span>
                <span className="practice-chapter-block__count">{group.cards.length}</span>
              </div>
              <div className="mini-flashcard-grid">
                {group.cards.map((card) => (
                  <MiniCard
                    key={card.id}
                    card={card}
                    onToggleFavorite={() => toggleFavorite(card)}
                    onMark={(status) => markCard(card, status)}
                  />
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </section>
  );
}
