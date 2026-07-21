import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { assetUrl } from "../../lib/assetUrl";
import { useAuth } from "../../context/AuthContext";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PdfViewerProps {
  noteId: number;
  filePath: string;
  title: string;
  /** Fully-qualified, auth-protected URL. When provided, takes precedence over filePath. */
  secureUrl?: string;
  /** HTTP headers (e.g. Authorization) to send when fetching secureUrl. */
  authHeaders?: Record<string, string>;
}

function lastPageKey(noteId: number) {
  return `mcq-note-${noteId}-last-page`;
}

const BLOCKED_KEY_COMBOS = new Set(["c", "s", "p", "u"]);

export function PdfViewer({ noteId, filePath, title, secureUrl, authHeaders }: PdfViewerProps) {
  const { user } = useAuth();
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(() => {
    const stored = localStorage.getItem(lastPageKey(noteId));
    return stored ? Number(stored) : 1;
  });
  const [scale, setScale] = useState(1.1);
  const [bookmarked, setBookmarked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const pendingScrollTo = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem(lastPageKey(noteId), String(pageNumber));
  }, [noteId, pageNumber]);

  useEffect(() => {
    const bookmarks: number[] = JSON.parse(
      localStorage.getItem(`mcq-note-${noteId}-bookmarks`) ?? "[]"
    );
    setBookmarked(bookmarks.includes(pageNumber));
  }, [noteId, pageNumber]);

  useEffect(() => {
    const node = containerRef.current;

    function blockContextMenu(e: MouseEvent) {
      e.preventDefault();
    }
    function blockDragStart(e: DragEvent) {
      e.preventDefault();
    }
    // Attached to document (not just this container) so Ctrl+P/S/C are blocked
    // even when focus is on a toolbar button rather than the PDF canvas itself.
    function blockShortcuts(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && BLOCKED_KEY_COMBOS.has(key)) {
        e.preventDefault();
      }
    }

    node?.addEventListener("contextmenu", blockContextMenu);
    node?.addEventListener("dragstart", blockDragStart);
    document.addEventListener("keydown", blockShortcuts);
    return () => {
      node?.removeEventListener("contextmenu", blockContextMenu);
      node?.removeEventListener("dragstart", blockDragStart);
      document.removeEventListener("keydown", blockShortcuts);
    };
  }, []);

  // All pages render at once in a continuous scroll, so "current page" is whichever
  // page is most visible in the scroll container — tracked via IntersectionObserver
  // rather than requiring the user to click through pages one at a time.
  useEffect(() => {
    if (!numPages || !canvasRef.current) return;
    const root = canvasRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        let best: { page: number; ratio: number } | null = null;
        for (const entry of entries) {
          const page = Number((entry.target as HTMLElement).dataset.page);
          if (entry.intersectionRatio > 0 && (!best || entry.intersectionRatio > best.ratio)) {
            best = { page, ratio: entry.intersectionRatio };
          }
        }
        if (best) setPageNumber(best.page);
      },
      { root, threshold: [0.15, 0.35, 0.55, 0.75] }
    );
    pageRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [numPages]);

  // Jump to the last-read page once its wrapper has mounted (initial load only).
  useEffect(() => {
    if (!numPages) return;
    const target = pendingScrollTo.current ?? pageNumber;
    pendingScrollTo.current = null;
    const el = pageRefs.current.get(target);
    el?.scrollIntoView({ block: "start" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numPages]);

  function scrollToPage(n: number) {
    const clamped = Math.min(Math.max(1, n), numPages || 1);
    const el = pageRefs.current.get(clamped);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      pendingScrollTo.current = clamped;
    }
    setPageNumber(clamped);
  }

  function toggleBookmark() {
    const key = `mcq-note-${noteId}-bookmarks`;
    const bookmarks: number[] = JSON.parse(localStorage.getItem(key) ?? "[]");
    const next = bookmarks.includes(pageNumber)
      ? bookmarks.filter((p) => p !== pageNumber)
      : [...bookmarks, pageNumber];
    localStorage.setItem(key, JSON.stringify(next));
    setBookmarked(next.includes(pageNumber));
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  const documentFile = secureUrl
    ? { url: secureUrl, httpHeaders: authHeaders }
    : assetUrl(filePath);

  return (
    <div ref={containerRef} className="pdf-viewer pdf-viewer--protected" tabIndex={-1}>
      <div className="pdf-viewer__toolbar">
        <span className="pdf-viewer__title">{title}</span>
        <div className="pdf-viewer__controls">
          <button type="button" onClick={() => scrollToPage(pageNumber - 1)} disabled={pageNumber <= 1}>
            ← Prev
          </button>
          <span>
            Page{" "}
            <input
              type="number"
              min={1}
              max={numPages}
              value={pageNumber}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v >= 1 && v <= numPages) scrollToPage(v);
              }}
            />{" "}
            / {numPages}
          </span>
          <button
            type="button"
            onClick={() => scrollToPage(pageNumber + 1)}
            disabled={pageNumber >= numPages}
          >
            Next →
          </button>
          <button type="button" onClick={() => setScale((s) => Math.max(0.5, s - 0.15))}>
            Zoom −
          </button>
          <span>{Math.round(scale * 100)}%</span>
          <button type="button" onClick={() => setScale((s) => Math.min(3, s + 0.15))}>
            Zoom +
          </button>
          <button type="button" onClick={toggleBookmark}>
            {bookmarked ? "★ Bookmarked" : "☆ Bookmark page"}
          </button>
          <button type="button" onClick={toggleFullscreen}>
            ⛶ Fullscreen
          </button>
        </div>
      </div>

      <div className="pdf-viewer__canvas" ref={canvasRef}>
        <Document
          file={documentFile}
          onLoadSuccess={({ numPages: n }) => setNumPages(n)}
          loading={<p>Loading PDF...</p>}
          error={<p className="form-error">Could not load this PDF.</p>}
        >
          {Array.from({ length: numPages }, (_, i) => i + 1).map((n) => (
            <div
              key={n}
              className="pdf-viewer__page-wrap"
              data-page={n}
              ref={(el) => {
                if (el) pageRefs.current.set(n, el);
                else pageRefs.current.delete(n);
              }}
            >
              <Page pageNumber={n} scale={scale} renderAnnotationLayer={false} renderTextLayer={false} />
              <div className="pdf-viewer__watermark" aria-hidden="true">
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i}>
                    {user?.name} · {user?.email}
                  </span>
                ))}
              </div>
              <span className="pdf-viewer__page-label">{n} / {numPages}</span>
            </div>
          ))}
        </Document>
      </div>
    </div>
  );
}
