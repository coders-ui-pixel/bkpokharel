import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useHeroImages } from "../../features/homepage/hooks";
import { assetUrl } from "../../lib/assetUrl";

const SLIDE_MS = 6000;

export function DashboardHeroBanner({ children }: { children: ReactNode }) {
  const { data: images } = useHeroImages("dashboard");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, [images]);

  return (
    <motion.div
      className="dash-hero-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {!!images?.length && (
        <div className="dash-hero-card__slides" aria-hidden="true">
          {images.map((img, i) => (
            <img
              key={img.id}
              src={assetUrl(img.image)}
              alt=""
              className={`dash-hero-card__slide ${i === index ? "is-active" : ""}`}
            />
          ))}
          <div className="dash-hero-card__slide-overlay" />
        </div>
      )}
      {children}
    </motion.div>
  );
}
