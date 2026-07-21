import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSyllabus } from "../../features/courses/hooks";
import type { Course } from "../../features/courses/types";
import { assetUrl } from "../../lib/assetUrl";

const AUTO_SCROLL_MS = 8000;
const PAGE_SIZE = 2;

function countChapters(course: Course): number {
  return course.subjects?.reduce((sum, s) => sum + (s.chapters?.length ?? 0), 0) ?? 0;
}

export function SyllabusPage() {
  const { data: courses, isLoading } = useSyllabus();
  const [groupIndex, setGroupIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const groups: Course[][] = [];
  for (let i = 0; i < (courses?.length ?? 0); i += PAGE_SIZE) {
    groups.push(courses!.slice(i, i + PAGE_SIZE));
  }

  const totalSubjects = courses?.reduce((sum, c) => sum + (c.subjects?.length ?? 0), 0) ?? 0;
  const totalChapters = courses?.reduce((sum, c) => sum + countChapters(c), 0) ?? 0;

  useEffect(() => {
    if (paused || groups.length <= 1) return;
    const id = setInterval(() => {
      setGroupIndex((i) => (i + 1) % groups.length);
    }, AUTO_SCROLL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, groups.length]);

  useEffect(() => {
    const container = scrollRef.current;
    const target = groupRefs.current.get(groupIndex);
    if (!container || !target) return;
    // Scroll the carousel's own scrollLeft directly (not scrollIntoView) so this never
    // nudges the outer page's vertical scroll position — only the carousel moves.
    container.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
  }, [groupIndex]);

  function goTo(index: number) {
    if (groups.length === 0) return;
    setGroupIndex(((index % groups.length) + groups.length) % groups.length);
  }

  return (
    <section className="practice-page">
      <div className="practice-hero practice-hero--syllabus">
        <div className="practice-hero__icon">🧭</div>
        <div className="practice-hero__body">
          <h1>Course Syllabus</h1>
          <p>Every course, chapter by chapter — see exactly what you'll learn before you enroll.</p>
        </div>
        {!!courses?.length && (
          <div className="practice-hero__stats">
            <div>
              <strong>{courses.length}</strong>
              <span>Courses</span>
            </div>
            <div>
              <strong>{totalSubjects}</strong>
              <span>Subjects</span>
            </div>
            <div>
              <strong>{totalChapters}</strong>
              <span>Chapters</span>
            </div>
          </div>
        )}
      </div>

      {isLoading && <p className="practice-empty">Loading syllabus...</p>}

      {groups.length > 1 && (
        <div className="syllabus-nav">
          <button
            type="button"
            className="syllabus-nav__arrow"
            onClick={() => goTo(groupIndex - 1)}
            aria-label="Previous courses"
          >
            ‹
          </button>
          <div className="syllabus-page__dots">
            {groups.map((_, i) => (
              <button
                key={i}
                type="button"
                className={i === groupIndex ? "is-active" : ""}
                onClick={() => setGroupIndex(i)}
                aria-label={`Show courses ${i * PAGE_SIZE + 1}-${i * PAGE_SIZE + PAGE_SIZE}`}
              />
            ))}
          </div>
          <button
            type="button"
            className="syllabus-nav__arrow"
            onClick={() => goTo(groupIndex + 1)}
            aria-label="Next courses"
          >
            ›
          </button>
          <button type="button" className="syllabus-nav__pause" onClick={() => setPaused((p) => !p)}>
            {paused ? "▶ Resume auto-scroll" : "⏸ Pause"}
          </button>
        </div>
      )}

      <div
        className="syllabus-scroll"
        ref={scrollRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {groups.map((group, gi) => (
          <div
            key={gi}
            className="syllabus-group"
            ref={(el) => {
              if (el) groupRefs.current.set(gi, el);
              else groupRefs.current.delete(gi);
            }}
          >
            {group.map((course) => (
              <div key={course.id} className="syllabus-card">
                <div className="syllabus-card__cover">
                  {course.coverImageUrl ? (
                    <img src={assetUrl(course.coverImageUrl)} alt={course.title} />
                  ) : (
                    <div className="syllabus-card__cover-placeholder">{course.title.charAt(0)}</div>
                  )}
                  <span className={`syllabus-card__tag ${course.isPaid ? "is-paid" : "is-free"}`}>
                    {course.isPaid ? `Rs. ${course.price}` : "Free"}
                  </span>
                </div>

                <div className="syllabus-card__body">
                  <h2>{course.title}</h2>
                  <p>{course.description}</p>
                  <p className="course-meta">
                    {course.subjects?.length ?? 0} subjects · {countChapters(course)} chapters
                  </p>

                  <div className="syllabus-card__outline">
                    {course.subjects?.map((subject) => (
                      <details key={subject.id} className="syllabus-outline-item" open>
                        <summary>
                          {subject.title}
                          <span className="course-meta">{subject.chapters?.length ?? 0} ch.</span>
                        </summary>
                        <ul className="chapter-list">
                          {subject.chapters?.map((chapter) => (
                            <li key={chapter.id}>{chapter.title}</li>
                          ))}
                          {subject.chapters?.length === 0 && (
                            <li className="course-meta">No chapters added yet.</li>
                          )}
                        </ul>
                      </details>
                    ))}
                    {course.subjects?.length === 0 && (
                      <p className="course-meta">Syllabus coming soon.</p>
                    )}
                  </div>

                  <Link to={`/courses/${course.id}`} className="btn btn--primary btn--block">
                    View course →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ))}
        {groups.length === 0 && !isLoading && (
          <p className="practice-empty">No courses published yet — check back soon.</p>
        )}
      </div>
    </section>
  );
}
