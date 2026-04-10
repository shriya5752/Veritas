import styles from "./Navbar.module.css";

export default function Navbar({ onOpenLab }) {
  return (
    <nav className={styles.nav}>
      <div className="nav-logo"><em>V</em>eritas</div>
      <ul className={styles.links}>
        <li><a href="#how">Method</a></li>
        <li><a href="#training">Dataset</a></li>
        <li><a href="#analyse">Analyse</a></li>
      </ul>
      <button className={styles.cta} onClick={onOpenLab}>Open Lab</button>
    </nav>
  );
}
