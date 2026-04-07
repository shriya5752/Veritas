import styles from "./AnalysisNav.module.css";

export default function AnalysisNav({ statusDot, statusText, onBack }) {
  return (
    <nav className={styles.nav}>
      <div className="nav-logo" style={{ fontSize: 22 }}><em>V</em>eritas</div>
      <div className={styles.status}>
        <div className={`${styles.dot} ${styles[statusDot]}`} />
        <span>{statusText}</span>
      </div>
      <button className={styles.back} onClick={onBack}>← Home</button>
    </nav>
  );
}
