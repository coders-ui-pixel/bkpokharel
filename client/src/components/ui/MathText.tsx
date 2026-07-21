import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

// Matches $$...$$, \[...\], $...$, \(...\) so admins can write LaTeX in either
// dollar-sign or bracket notation inside question text, options, and explanations.
const MATH_PATTERN = /\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^\n$]+?\$|\\\([\s\S]+?\\\)/g;

interface Segment {
  content: string;
  isMath: boolean;
}

function splitMath(text: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(MATH_PATTERN)) {
    const idx = match.index ?? 0;
    if (idx > lastIndex) segments.push({ content: text.slice(lastIndex, idx), isMath: false });
    segments.push({ content: match[0], isMath: true });
    lastIndex = idx + match[0].length;
  }
  if (lastIndex < text.length) segments.push({ content: text.slice(lastIndex), isMath: false });
  return segments;
}

function mathHtml(raw: string): { html: string; display: boolean } | null {
  let display = false;
  let expr = raw;

  if (raw.startsWith("$$") && raw.endsWith("$$")) {
    display = true;
    expr = raw.slice(2, -2);
  } else if (raw.startsWith("\\[") && raw.endsWith("\\]")) {
    display = true;
    expr = raw.slice(2, -2);
  } else if (raw.startsWith("$") && raw.endsWith("$")) {
    expr = raw.slice(1, -1);
  } else if (raw.startsWith("\\(") && raw.endsWith("\\)")) {
    expr = raw.slice(2, -2);
  } else {
    return null;
  }

  try {
    return { html: katex.renderToString(expr, { throwOnError: false, displayMode: display }), display };
  } catch {
    return null;
  }
}

/**
 * Renders plain text with inline/block LaTeX segments (delimited by $...$, $$...$$,
 * \(...\), or \[...\]) mixed in — used anywhere question text, options, explanations,
 * or flash-card content might contain math.
 */
export function MathText({ text, className }: { text: string | null | undefined; className?: string }) {
  const segments = useMemo(() => (text ? splitMath(text) : []), [text]);

  if (!text) return null;

  return (
    <span className={className} style={{ whiteSpace: "pre-wrap" }}>
      {segments.map((segment, i) => {
        if (!segment.isMath) return <span key={i}>{segment.content}</span>;
        const rendered = mathHtml(segment.content);
        if (!rendered) return <span key={i}>{segment.content}</span>;
        return (
          <span
            key={i}
            className={rendered.display ? "math-block" : "math-inline"}
            dangerouslySetInnerHTML={{ __html: rendered.html }}
          />
        );
      })}
    </span>
  );
}
