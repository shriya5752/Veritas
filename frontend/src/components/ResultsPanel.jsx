import { useEffect, useRef } from "react";
import jsPDF from "jspdf";
import styles from "./ResultsPanel.module.css";

const LOAD_STEPS = [
  { id: "ls1", label: "Preprocessing image" },
  { id: "ls2", label: "CNN artifact scan" },
  { id: "ls3", label: "Vision Transformer analysis" },
  { id: "ls4", label: "GAN fingerprint matching" },
  { id: "ls5", label: "Source attribution" },
  { id: "ls6", label: "Generating report" },
];

export function LoadingPanel({ activeStep }) {
  return (
    <div className={styles.loadingWrap}>
      <div className={styles.loadRing} />
      <div className={styles.loadSteps}>
        {LOAD_STEPS.map((s, i) => {
          const state = i < activeStep ? "done" : i === activeStep ? "on" : "";
          return (
            <div key={s.id} className={`${styles.loadStep} ${styles[state] || ""}`}>
              {s.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyGlyph}>◎</div>
      <p>Upload an image to begin</p>
    </div>
  );
}

function downloadReport(r) {
  const ts = new Date().toLocaleString();
  const lines = [
    `╔══════════════════════════════════════════════════╗`,
    `║       VERITAS  —  FORENSIC ANALYSIS REPORT       ║`,
    `║       Beyond Detection. Into Derivation.         ║`,
    `╚══════════════════════════════════════════════════╝`,
    ``, `Generated  ${ts}`, ``,
    `VERDICT    ${r.verdict}`,
    `AI Score   ${r.ai_score}%`,
    `Originality ${r.originality_score}%`,
    `Manip.     ${r.manipulation_confidence}%`,
    `GAN Match  ${r.gan_fingerprint}%`, ``,
    `${r.summary}`, ``,
    `── REGION HEATMAP ──────────────────────────────────`, ``,
    ...(r.regions || []).map(rg => `  [${rg.status.toUpperCase().padEnd(7)}] ${rg.name.padEnd(24)} ${rg.score}%`), ``,
    `── FORENSIC FINDINGS ───────────────────────────────`, ``,
    ...(r.findings || []).flatMap(f => [`  [${f.type.toUpperCase()}] ${f.title}`, `         ${f.detail}`, ``]),
    `── SOURCE ATTRIBUTION ──────────────────────────────`, ``,
    ...(r.attribution || []).map(a => `  ${a.model.padEnd(36)} ${a.confidence}%`), ``,
    `════════════════════════════════════════════════════`,
    `VERITAS · QUATROS · PES UNIVERSITY`,
    `════════════════════════════════════════════════════`,
  ].join("\n");

  const blob = new Blob([lines], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "veritas_report.txt"; a.click();
  URL.revokeObjectURL(url);
}

export function ResultContent({ result }) {
  const heatmapRef = useRef([]);
  const attribRef = useRef([]);

  useEffect(() => {
    const t = setTimeout(() => {
      heatmapRef.current.forEach(b => { if (b) b.style.width = b.dataset.w; });
      attribRef.current.forEach(b => { if (b) b.style.width = b.dataset.w; });
    }, 150);
    return () => clearTimeout(t);
  }, [result]);

  const originality = result.originality_score;
  const displayLabel = result.verdict;
  const displayValue = originality > 50 ? originality : 100 - originality;
  const score = displayValue;

  const scoreClass =
    score >= 70
      ? styles.scoreHigh
      : score >= 40
      ? styles.scoreMed
      : styles.scoreLow;

  return (
    <div className={styles.resultContent}>
      {/* Score hero */}
      <div className={styles.scoreHero}>
        <div className={`${styles.scoreNum} ${scoreClass}`}>
        {displayValue.toFixed(1)}%
      </div>
        <div>
          <div className={styles.verdict}>
          {displayLabel}
        </div>
          <div className={styles.verdictSub}>Originality Score</div>
          <div className={styles.summary}>{result.summary}</div>
        </div>
      </div>

      {/* Meters */}
      <div className={styles.meters}>
        {[
          { label: "AI Content Level", val: result.ai_score, gold: false },
          { label: "Manipulation Confidence", val: result.manipulation_confidence, gold: false },
          { label: "GAN Fingerprint Match", val: result.gan_fingerprint, gold: true },
          { label: "Originality Score", val: result.originality_score, gold: true },
        ].map((m, i) => (
          <MeterBar key={i} label={m.label} val={m.val} gold={m.gold} />
        ))}
      </div>

      {/* Heatmap image if present */}
      {result.heatmap && (
        <div style={{ marginBottom: 20 }}>
          <div className={styles.sectionTitle}>Segmentation Heatmap</div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
          <img
            src={`data:image/png;base64,${result.heatmap}`}
            alt="heatmap"
            style={{
              width: "100%",
              maxWidth: "500px",
              height: "auto",
              borderRadius: "12px"
            }}
          />
        </div>
</div>
        </div>
      )}

      {/* Region heatmap */}
      <div style={{ marginBottom: 20 }}>
        <div className={styles.sectionTitle}>Region Heatmap</div>
        <div className={styles.heatmapGrid}>
          {(result.regions || []).map((reg, i) => (
            <div key={i} className={`${styles.heatZone} ${styles[reg.status]}`} style={{ animationDelay: i * 0.05 + "s" }}>
              <div className={styles.hzName}>{reg.name}</div>
              <div className={styles.hzScore}>{reg.score}%</div>
              <div className={styles.hzBar}>
                <div
                  className={styles.hzBarFill}
                  style={{ width: 0 }}
                  data-w={reg.score + "%"}
                  ref={el => (heatmapRef.current[i] = el)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Findings */}
      <div style={{ marginBottom: 20 }}>
        <div className={styles.sectionTitle}>Forensic Findings</div>
        {(result.findings || []).map((f, i) => (
          <div
            key={i}
            className={`${styles.finding} ${f.type === "crit" ? styles.crit : f.type === "warn" ? styles.warn : ""}`}
            style={{ animationDelay: i * 0.07 + "s" }}
          >
            <div className={styles.findingHead}>
              <div className={styles.findingTitle}>{f.title}</div>
              <div className={styles.findingBadge} style={{
                color: f.type === "crit" ? "var(--rose)" : f.type === "warn" ? "var(--rose2)" : "var(--gold2)"
              }}>{f.type}</div>
            </div>
            <div className={styles.findingBody}>{f.detail}</div>
          </div>
        ))}
      </div>

      {/* Attribution */}
      <div style={{ marginBottom: 8 }}>
        <div className={styles.sectionTitle}>Source Attribution</div>
        {(result.attribution || []).map((a, i) => (
          <div key={i} className={styles.attribRow} style={{ animationDelay: i * 0.07 + "s" }}>
            <div className={styles.attribName}>{a.model}</div>
            <div className={styles.attribBarWrap}>
              <div
                className={styles.attribBarFill}
                style={{ width: 0 }}
                data-w={a.confidence + "%"}
                ref={el => (attribRef.current[i] = el)}
              />
            </div>
            <div className={styles.attribPct}>{a.confidence}%</div>
          </div>
        ))}
      </div>

      <button className={styles.pdfBtn} onClick={() => downloadReport(result)}>
        ↓ &nbsp; Download Forensic Report
      </button>
    </div>
  );
}

function MeterBar({ label, val, gold }) {
  const fillRef = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => { if (fillRef.current) fillRef.current.style.width = val + "%"; }, 80);
    return () => clearTimeout(t);
  }, [val]);

  return (
    <div className={styles.meter}>
      <div className={styles.meterLabel}>
        {label} <span>{val}%</span>
      </div>
      <div className={styles.rBar}>
        <div
          className={`${styles.rBarFill} ${gold ? styles.gold : ""}`}
          style={{ width: 0 }}
          ref={fillRef}
        />
      </div>
    </div>
  );
}
