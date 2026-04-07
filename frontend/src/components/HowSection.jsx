import { useEffect, useRef } from "react";
import styles from "./HowSection.module.css";

const STEPS = [
  {
    num: "01", name: "Input",
    desc: "Upload JPG, PNG or WEBP. Provide a URL or push to the REST endpoint.",
    tags: ["JPG", "PNG", "WEBP", "URL"]
  },
  {
    num: "02", name: "Pre-Process",
    desc: "Resize, normalize, extract EXIF metadata, apply noise filters, isolate faces and semantic regions.",
    tags: ["EXIF", "Regions", "Normalize"]
  },
  {
    num: "03", name: "AI Engine",
    desc: "CNN artifact detection, Vision Transformer analysis, GAN fingerprint classification for source attribution.",
    tags: ["CNN", "ViT", "GAN"]
  },
  {
    num: "04", name: "Report",
    desc: "AI derivation %, heatmap overlay, source model attribution, and a downloadable legal-grade report.",
    tags: ["Score", "Heatmap", "PDF"]
  },
];

export default function HowSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll(".fade-up, .reveal-line").forEach(el => el.classList.add("in"));
        }
      }),
      { threshold: 0.12 }
    );
    if (sectionRef.current) io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  return (
    <section className={styles.section} id="how" ref={sectionRef}>
      <span className="reveal-line fade-up" />
      <p className="section-eyebrow fade-up">Method</p>
      <h2 className="section-heading fade-up">
        How Veritas<br /><em>reads an image</em>
      </h2>
      <div className={`${styles.grid} fade-up`}>
        {STEPS.map((step) => (
          <div key={step.num} className={styles.card}>
            <div className={styles.num}>{step.num}</div>
            <div className={styles.name}>{step.name}</div>
            <p className={styles.desc}>{step.desc}</p>
            <div className={styles.tags}>
              {step.tags.map(t => <span key={t} className="stag">{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
