import { useRef } from "react";
import type { ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ScrollFeatureRowProps {
  illustration: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  reverse?: boolean;
}

export function ScrollFeatureRow({
  illustration,
  eyebrow,
  title,
  description,
  reverse,
}: ScrollFeatureRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], reverse ? [10, 0, -10] : [-10, 0, 10]);
  const translateY = useTransform(scrollYProgress, [0, 0.5, 1], [40, 0, -40]);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0.4]);

  return (
    <div ref={ref} className={`feature-row ${reverse ? "feature-row--reverse" : ""}`}>
      <motion.div
        className="feature-row__art"
        style={{ rotateY, y: translateY, opacity }}
      >
        {illustration}
      </motion.div>
      <motion.div
        className="feature-row__text"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </motion.div>
    </div>
  );
}
