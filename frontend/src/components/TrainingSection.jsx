import { useEffect, useRef } from "react";
import styles from "./TrainingSection.module.css";

const CARDS = [
  {
    count: "3,000", label: "Real · Original", barW: "33%",
    sources: [{ name: "ImageNet", detail: "2,000 images" }, { name: "LAION-5B", detail: "1,000 filtered" }]
  },
  {
    count: "3,200", label: "AI Generated", barW: "35%",
    sources: [{ name: "Stable Diffusion", detail: "1,200" }, { name: "Midjourney", detail: "1,000" }, { name: "DALL·E 3", detail: "1,000" }]
  },
  {
    count: "2,000", label: "Edited · Hybrid", barW: "22%",
    sources: [{ name: "CASIA 2.0", detail: "1,000 human edits" }, { name: "DIV2K", detail: "1,000 AI enhanced" }]
  },
  {
    count: "1,000", label: "Provenance", barW: "11%",
    sources: [{ name: "NIST Nimble 2016", detail: "1,000" }, { name: "Lineage-aware manipulation data", detail: "" }]
  },
];

export default function TrainingSection() {
  const sectionRef = useRef(null);
  const barsRef = useRef([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll(".fade-up").forEach(el => el.classList.add("in"));
          setTimeout(() => {
            barsRef.current.forEach(b => { if (b) b.style.width = b.dataset.w; });
          }, 300);
        }
      }),
      { threshold: 0.2 }
    );
    if (sectionRef.current) io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  return (
    <section className={styles.section} id="training" ref={sectionRef}>
      <p className="section-eyebrow fade-up">Model Foundation</p>
      <h2 className="section-heading fade-up">Training<br /><em>dataset</em></h2>

      <div className={`${styles.grid} fade-up`}>
        {CARDS.map((card, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.count}>{card.count}<span>↑</span></div>
            <div className={styles.label}>{card.label}</div>
            <div className={styles.bar}>
              <div
                className={styles.barFill}
                style={{ width: 0 }}
                data-w={card.barW}
                ref={el => (barsRef.current[i] = el)}
              />
            </div>
            <div className={styles.sources}>
              {card.sources.map((s, j) => (
                <span key={j}><strong>{s.name}</strong>{s.detail ? ` — ${s.detail}` : ""}<br /></span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={`${styles.total} fade-up`}>
        <div className={styles.totalLabel}>Total training set</div>
        <div className={styles.totalNum}><em>9,200</em> images across 4 classes</div>
        <div className={styles.totalLabel}>Target accuracy <strong style={{ color: "var(--rose2)" }}>≥ 92%</strong></div>
      </div>
    </section>
  );
}
