import { useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
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

async function downloadReport(r, imageUrl, imageName) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = 210, H = 297;
  const mg = 16;
  const cW = W - mg * 2;

  // ── Palette ──────────────────────────────────────────────
  const olive      = [74,  90,  47];   // #4A5A2F
  const oliveLight = [108, 128, 72];   // #6C8048
  const olivePale  = [235, 239, 224];  // #EBEFE0
  const beige      = [248, 245, 236];  // #F8F5EC
  const beigeDeep  = [220, 213, 194];  // #DCD5C2
  const charcoal   = [42,  42,  42];   // #2A2A2A
  const midGray    = [110, 110, 100];
  const white      = [255, 255, 255];

  const setFill   = (c) => pdf.setFillColor(...c);
  const setStroke = (c) => pdf.setDrawColor(...c);
  const setTxt    = (c) => pdf.setTextColor(...c);

  // ── helper: load image and get natural size ───────────────
  const loadImg = (src) => new Promise((res) => {
    if (!src) return res(null);
    const img = new Image();
    img.onload  = () => res(img);
    img.onerror = () => res(null);
    img.src = src;
  });

  // ── helper: add image keeping aspect ratio ────────────────
  const addImg = (src, fmt, x, y, maxW, maxH, img) => {
    if (!img || !src) {
      setFill(olivePale); pdf.rect(x, y, maxW, maxH, "F");
      setTxt(midGray); pdf.setFontSize(7);
      pdf.text("No image", x + maxW / 2, y + maxH / 2, { align: "center" });
      return;
    }
    const ratio = img.naturalWidth / img.naturalHeight;
    let w = maxW, h = maxW / ratio;
    if (h > maxH) { h = maxH; w = maxH * ratio; }
    const ox = x + (maxW - w) / 2;
    const oy = y + (maxH - h) / 2;
    setFill(olivePale); pdf.rect(x, y, maxW, maxH, "F");
    try { pdf.addImage(src, fmt, ox, oy, w, h, "", "FAST"); } catch {}
  };

  // ── Pre-load both images ──────────────────────────────────
  const [origImg, heatImg] = await Promise.all([
    loadImg(imageUrl),
    loadImg(r.heatmap ? `data:image/png;base64,${r.heatmap}` : null),
  ]);

  let y = 0;

  // ════════════════════════════════════════════════════════
  // HEADER
  // ════════════════════════════════════════════════════════
  setFill(olive); pdf.rect(0, 0, W, 18, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  setTxt(white);
  pdf.text("VERITAS", mg, 13);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  setTxt([200, 215, 170]);
  pdf.text("FORENSIC ANALYSIS REPORT", mg + 35, 13);

  pdf.setFontSize(7);
  setTxt([180, 195, 150]);
  pdf.text(new Date().toLocaleString(), W - mg, 13, { align: "right" });

  y = 24;

  // ════════════════════════════════════════════════════════
  // VERDICT HERO
  // ════════════════════════════════════════════════════════
  setFill(beige); pdf.roundedRect(mg, y, cW, 34, 2, 2, "F");
  setFill(olive); pdf.roundedRect(mg, y, 2, 34, 1, 1, "F");  // left accent stripe

  // Big score
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(28);
  setTxt(olive);
  pdf.text(`${r.originality_score}%`, mg + 8, y + 13);

  // Small label under score
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  setTxt(midGray);
  pdf.text("ORIGINALITY SCORE", mg + 8, y + 19);

  // Divider
  setStroke(beigeDeep); pdf.setLineWidth(0.3);
  pdf.line(mg + 40, y + 5, mg + 40, y + 29);

  // Verdict label
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  setTxt(charcoal);
  pdf.text(r.verdict, mg + 46, y + 13);

  // Verdict sub
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  setTxt(midGray);
  pdf.text("VERDICT", mg + 46, y + 18);

  // Summary
  pdf.setFontSize(8);
  setTxt([80, 80, 70]);
  const sumLines = pdf.splitTextToSize(r.summary, cW - 50);
  pdf.text(sumLines, mg + 46, y + 24);

  y += 40;

  // ════════════════════════════════════════════════════════
  // SCORE METERS  (2×2 grid)
  // ════════════════════════════════════════════════════════
  const meters = [
    { label: "AI Content Level",        val: r.ai_score },
    { label: "Manipulation Confidence", val: r.manipulation_confidence },
    { label: "GAN Fingerprint Match",   val: r.gan_fingerprint },
    { label: "Originality Score",       val: r.originality_score },
  ];
  const mW = (cW - 5) / 2, mH = 16;

  meters.forEach((m, i) => {
    const mx = mg + (i % 2) * (mW + 5);
    const my = y + Math.floor(i / 2) * (mH + 3);
    setFill(beige); pdf.roundedRect(mx, my, mW, mH, 1.5, 1.5, "F");
    setStroke(beigeDeep); pdf.setLineWidth(0.25);
    pdf.roundedRect(mx, my, mW, mH, 1.5, 1.5, "S");

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.5);
    setTxt(midGray);
    pdf.text(m.label.toUpperCase(), mx + 4, my + 5.5);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    setTxt(olive);
    pdf.text(`${m.val}%`, mx + mW - 4, my + 5.5, { align: "right" });

    // track
    setFill(beigeDeep);
    pdf.roundedRect(mx + 4, my + 9, mW - 8, 2.5, 0.5, 0.5, "F");
    // fill
    setFill(oliveLight);
    pdf.roundedRect(mx + 4, my + 9, Math.max(0.5, (mW - 8) * m.val / 100), 2.5, 0.5, 0.5, "F");
  });

  y += mH * 2 + 3 * 2 + 6;

  // ════════════════════════════════════════════════════════
  // IMAGES
  // ════════════════════════════════════════════════════════
  const imgMaxW = (cW - 6) / 2;
  const imgMaxH = 58;

  // section labels
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  setTxt(olive);
  pdf.text("INPUT IMAGE", mg, y - 1);
  pdf.text("SEGMENTATION HEATMAP", mg + imgMaxW + 6, y - 1);

  // frames
  setStroke(beigeDeep); pdf.setLineWidth(0.3);
  pdf.roundedRect(mg, y, imgMaxW, imgMaxH, 1.5, 1.5, "S");
  pdf.roundedRect(mg + imgMaxW + 6, y, imgMaxW, imgMaxH, 1.5, 1.5, "S");

  addImg(imageUrl, "JPEG", mg, y, imgMaxW, imgMaxH, origImg);
  addImg(
    r.heatmap ? `data:image/png;base64,${r.heatmap}` : null,
    "PNG", mg + imgMaxW + 6, y, imgMaxW, imgMaxH, heatImg
  );

  y += imgMaxH + 8;

  // ════════════════════════════════════════════════════════
  // SECTION: helper
  // ════════════════════════════════════════════════════════
  const sectionHead = (label) => {
    setFill(olivePale); pdf.rect(mg, y, cW, 7, "F");
    setFill(olive);     pdf.rect(mg, y, 2.5, 7, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    setTxt(olive);
    pdf.text(label, mg + 6, y + 4.8);
    y += 10;
  };

  // ════════════════════════════════════════════════════════
  // FORENSIC FINDINGS
  // ════════════════════════════════════════════════════════
  sectionHead("FORENSIC FINDINGS");

  (r.findings || []).forEach((f) => {
    const badgeCol =
      f.type === "crit" ? [180, 55, 55] :
      f.type === "warn" ? [160, 110, 40] :
                          [74,  90,  47];

    // badge
    setFill(badgeCol);
    pdf.roundedRect(mg, y, 10, 4, 0.7, 0.7, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(5.5);
    setTxt(white);
    pdf.text(f.type.toUpperCase(), mg + 5, y + 2.8, { align: "center" });

    // title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    setTxt(charcoal);
    pdf.text(f.title, mg + 13, y + 3);

    y += 6;

    // detail
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    setTxt(midGray);
    const dl = pdf.splitTextToSize(f.detail, cW - 4);
    pdf.text(dl, mg + 2, y);
    y += dl.length * 3.8 + 3;
  });

  y += 2;

  // ════════════════════════════════════════════════════════
  // SOURCE ATTRIBUTION
  // ════════════════════════════════════════════════════════
  sectionHead("SOURCE ATTRIBUTION");

  (r.attribution || []).forEach((a) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    setTxt(charcoal);
    pdf.text(a.model, mg + 2, y + 3);

    const barX = mg + 65, barW = cW - 68;
    setFill(beigeDeep);
    pdf.roundedRect(barX, y + 0.5, barW, 4, 0.8, 0.8, "F");
    setFill(oliveLight);
    pdf.roundedRect(barX, y + 0.5, Math.max(0.5, barW * a.confidence / 100), 4, 0.8, 0.8, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    setTxt(olive);
    pdf.text(`${a.confidence}%`, W - mg, y + 3.5, { align: "right" });

    y += 8;
  });

  // ════════════════════════════════════════════════════════
  // FOOTER
  // ════════════════════════════════════════════════════════
  setFill(olivePale); pdf.rect(0, H - 10, W, 10, "F");
  setFill(olive);     pdf.rect(0, H - 10, W, 1, "F");

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  setTxt(midGray);
  pdf.text("VERITAS  ·  QUATROS", W / 2, H - 4, { align: "center" });

  const safeName = (imageName || "image").replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
  pdf.save(`VeritasReport_${safeName}.pdf`);
}

export function ResultContent({ result, imageUrl, imageName }) {
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

      <button
        className={styles.pdfBtn}
        onClick={() => {
          try {
            downloadReport(result, imageUrl, imageName);
          } catch (e) {
            console.error("PDF error:", e);
          }
        }}
      >
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
