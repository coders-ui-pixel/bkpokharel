import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useBookmarks, useToggleBookmark } from "../../../features/bookmarks/hooks";
import { noteFileUrl } from "../../../features/notes/api";
import { getAccessToken } from "../../../lib/apiClient";
import { PdfViewer } from "../../../components/pdf/PdfViewer";
import { ImportantQuestionViewer } from "../../../components/pdf/ImportantQuestionViewer";
import type { Bookmark } from "../../../features/bookmarks/types";

export function DashboardBookmarksPage() {
  const { data: bookmarks, isLoading } = useBookmarks();
  const toggle = useToggleBookmark();
  const [active, setActive] = useState<Bookmark | null>(null);

  if (active) {
    const token = getAccessToken();
    return (
      <section>
        <button type="button" className="btn btn--ghost" onClick={() => setActive(null)} style={{ marginBottom: 12 }}>
          ← Back to bookmarks
        </button>
        {active.note && (
          <PdfViewer
            noteId={active.note.id}
            filePath={active.note.filePath}
            title={active.note.title}
            secureUrl={noteFileUrl(active.note.chapterId, active.note.id)}
            authHeaders={token ? { Authorization: `Bearer ${token}` } : undefined}
          />
        )}
        {active.importantQuestion && (
          <ImportantQuestionViewer
            item={{
              id: active.importantQuestion.id,
              title: active.importantQuestion.title,
              filePath: active.importantQuestion.filePath,
              mimeType: active.importantQuestion.mimeType,
              chapterId: active.importantQuestion.chapterId,
              orderIndex: 0,
              createdAt: active.createdAt,
            }}
          />
        )}
      </section>
    );
  }

  const noteBookmarks = bookmarks?.filter((b) => b.contentType === "note") ?? [];
  const iqBookmarks = bookmarks?.filter((b) => b.contentType === "important_question") ?? [];

  return (
    <section className="practice-page">
      <div className="practice-hero practice-hero--bookmarks">
        <div className="practice-hero__icon">🔖</div>
        <div className="practice-hero__body">
          <h1>Bookmarks</h1>
          <p>Notes and important-question sheets you've saved for quick access.</p>
        </div>
        {bookmarks && bookmarks.length > 0 && (
          <div className="practice-hero__stats">
            <div>
              <strong>{bookmarks.length}</strong>
              <span>Saved</span>
            </div>
            <div>
              <strong>{noteBookmarks.length}</strong>
              <span>Notes</span>
            </div>
            <div>
              <strong>{iqBookmarks.length}</strong>
              <span>Important Qs</span>
            </div>
          </div>
        )}
      </div>

      {isLoading && <p>Loading...</p>}
      {!isLoading && (bookmarks?.length ?? 0) === 0 && (
        <div className="practice-empty-card">
          <span className="practice-empty-card__icon">🔖</span>
          <p>
            No bookmarks yet — tap the ☆ on any <Link to="/dashboard/notes">note</Link> or{" "}
            <Link to="/dashboard/important-questions">important-question</Link> card to save it here.
          </p>
        </div>
      )}

      <div className="practice-card-grid">
        {bookmarks?.map((b, i) => (
          <motion.div
            key={b.id}
            className="note-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
            whileHover={{ y: -4 }}
          >
            <div className="note-card__top">
              <span className="note-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M6 2h9l3 3v17H6Z" />
                  <path d="M9 11h6M9 15h6M9 7h3" strokeLinecap="round" />
                </svg>
              </span>
              <button
                type="button"
                className="bookmark-star-btn"
                aria-label="Remove bookmark"
                onClick={() => toggle.mutate({ contentType: b.contentType, contentId: b.contentId })}
              >
                ★
              </button>
            </div>
            <h3 className="note-card__title">{b.note?.title ?? b.importantQuestion?.title}</h3>
            <p className="course-meta">{b.contentType === "note" ? "Study note" : "Important questions"}</p>
            <button type="button" className="note-card__cta" onClick={() => setActive(b)}>
              Open <span aria-hidden="true">→</span>
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
