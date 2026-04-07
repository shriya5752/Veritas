import { useEffect, useRef } from "react";
import styles from "./CTABanner.module.css";

export function CTABanner({ onOpenLab }) {
  const ref = useRef(null);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) e.target.querySelectorAll(".fade-up").forEach(el => el.classList.add("in"));
      }),
      { threshold: 0.15 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <section className={styles.banner} id="analyse" ref={ref}>
      <p className="section-eyebrow fade-up" style={{ justifyContent: "center" }}>Forensics Lab</p>
      <h2 className="section-heading fade-up" style={{ marginBottom: 20 }}>
        Upload.<br />Scan. <em>Know.</em>
      </h2>
      <p className={`${styles.sub} fade-up`}>Drop any image. Get your verdict in under 30 seconds.</p>
      <button className={`${styles.btn} fade-up`} onClick={onOpenLab}>
        <span>Open the Forensics Lab</span><span>→</span>
      </button>
    </section>
  );
}

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerLogo}>Veritas</div>
      <div className={styles.footerRight}>
        PES University · Team QUATROS<br />
        Centre for Innovation &amp; Entrepreneurship
      </div>
    </footer>
  );
}
