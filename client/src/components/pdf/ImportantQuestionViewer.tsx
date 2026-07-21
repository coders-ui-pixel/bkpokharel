import { useRef, useState } from "react";
import { assetUrl } from "../../lib/assetUrl";
import { PdfViewer } from "./PdfViewer";
import type { ImportantQuestionItem } from "../../features/importantQuestions/types";

export function ImportantQuestionViewer({ item }: { item: ImportantQuestionItem }) {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  if (item.mimeType === "application/pdf") {
    return <PdfViewer noteId={item.id} filePath={item.filePath} title={item.title} />;
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  return (
    <div ref={containerRef} className="pdf-viewer">
      <div className="pdf-viewer__toolbar">
        <span className="pdf-viewer__title">{item.title}</span>
        <div className="pdf-viewer__controls">
          <button type="button" onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}>
            Zoom −
          </button>
          <span>{Math.round(scale * 100)}%</span>
          <button type="button" onClick={() => setScale((s) => Math.min(3, s + 0.2))}>
            Zoom +
          </button>
          <button type="button" onClick={toggleFullscreen}>
            ⛶ Fullscreen
          </button>
          <a href={assetUrl(item.filePath)} download className="btn-link">
            Download
          </a>
          {navigator.share && (
            <button
              type="button"
              onClick={() => navigator.share({ title: item.title, url: assetUrl(item.filePath) })}
            >
              Share
            </button>
          )}
        </div>
      </div>
      <div className="pdf-viewer__canvas">
        <img
          src={assetUrl(item.filePath)}
          alt={item.title}
          style={{ transform: `scale(${scale})`, transformOrigin: "top center", maxWidth: "100%" }}
        />
      </div>
    </div>
  );
}
