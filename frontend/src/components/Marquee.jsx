import styles from "./Marquee.module.css";

const ITEMS = [
  { text: "500K+ synthetic images daily", dim: false },
  { text: "·", dim: true },
  { text: "$78B deepfake damage", dim: false },
  { text: "·", dim: true },
  { text: "Binary detection is not enough", dim: false },
  { text: "·", dim: true },
  { text: "CNN · ViT · GAN Fingerprinting", dim: false },
  { text: "·", dim: true },
  { text: "Legal-grade PDF reports", dim: false },
  { text: "·", dim: true },
  { text: "Region-level heatmap analysis", dim: false },
  { text: "·", dim: true },
];

export default function Marquee() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div className={styles.wrap}>
      <div className={styles.track}>
        {doubled.map((item, i) => (
          <span key={i} className={`${styles.item} ${item.dim ? styles.dim : ""}`}>
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
