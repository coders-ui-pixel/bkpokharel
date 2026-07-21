import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FloatingIcon } from "./FloatingIcon";
import { useHeroImages } from "../../features/homepage/hooks";
import { assetUrl } from "../../lib/assetUrl";

const CARD_SLOTS = ["reading", "quiz", "group", "success"] as const;
const DRIFT = ["up", "down", "up", "down"] as const;

function CardPlaceholder() {
  return (
    <div className="hero-card__placeholder">
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8.5" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M21 15l-5-5-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function CardSkeleton() {
  return <div className="hero-card__skeleton" />;
}

export function HeroVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const { data: images, isLoading, isError } = useHeroImages();

  const driftUp = useTransform(scrollYProgress, [0, 1], [90, -220]);
  const driftDown = useTransform(scrollYProgress, [0, 1], [-90, 220]);
  const fade = useTransform(scrollYProgress, [0, 0.12, 0.88, 1], [0, 1, 1, 0.3]);

  return (
    <div ref={ref} className="hero-visual">
      <div className="hero-visual__podium" />

      {CARD_SLOTS.map((slot, i) => {
        const image = images?.[i];
        const y = DRIFT[i] === "up" ? driftUp : driftDown;

        return (
          <motion.div
            key={slot}
            className={`hero-card-wrap hero-card-wrap--${slot}`}
            style={{ y, opacity: fade }}
          >
            <div className="hero-card">
              {isLoading ? (
                <CardSkeleton />
              ) : isError || !image ? (
                <CardPlaceholder />
              ) : (
                <img
                  className="hero-card__art"
                  src={assetUrl(image.image)}
                  alt={image.title}
                  loading="lazy"
                />
              )}
            </div>
          </motion.div>
        );
      })}

      <FloatingIcon name="cap" className="hero-icon hero-icon--cap" />
      <FloatingIcon name="trophy" className="hero-icon hero-icon--trophy" />
      <FloatingIcon name="check" className="hero-icon hero-icon--check" />
      <FloatingIcon name="doc" className="hero-icon hero-icon--doc" />
    </div>
  );
}
