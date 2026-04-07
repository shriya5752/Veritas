import { useEffect, useRef, useState } from "react";
import styles from "./HeroWipe.module.css";

/* ── REAL canvas (gold neural mesh) ── */
function drawReal(cvs) {
  const ctx = cvs.getContext("2d");
  let W, H, nodes = [];
  const N = 60;

  function resize() {
    W = cvs.width = cvs.offsetWidth;
    H = cvs.height = cvs.offsetHeight;
    buildNodes();
  }

  function buildNodes() {
    nodes = [];
    for (let i = 0; i < N; i++) {
      nodes.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.5,
        pulse: Math.random() * Math.PI * 2,
        pSpeed: 0.01 + Math.random() * 0.015,
        gold: Math.random() < 0.3
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const grd = ctx.createRadialGradient(W * 0.3, H * 0.5, 0, W * 0.3, H * 0.5, W * 0.6);
    grd.addColorStop(0, "rgba(184,154,92,0.18)");
    grd.addColorStop(0.4, "rgba(184,154,92,0.06)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);

    const grd2 = ctx.createRadialGradient(W * 0.8, H * 0.2, 0, W * 0.8, H * 0.2, W * 0.35);
    grd2.addColorStop(0, "rgba(232,224,212,0.06)");
    grd2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd2; ctx.fillRect(0, 0, W, H);

    const DIST = 140;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      a.pulse += a.pSpeed;
      a.x += a.vx; a.y += a.vy;
      if (a.x < -10) a.x = W + 10; if (a.x > W + 10) a.x = -10;
      if (a.y < -10) a.y = H + 10; if (a.y > H + 10) a.y = -10;
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < DIST) {
          const alpha = (1 - d / DIST);
          const pulse = (Math.sin(a.pulse) + 1) * 0.5;
          if (a.gold || b.gold) {
            ctx.strokeStyle = `rgba(212,184,122,${alpha * 0.5 * (0.5 + pulse)})`;
            ctx.lineWidth = 0.8;
          } else {
            ctx.strokeStyle = `rgba(232,224,212,${alpha * 0.2 * (0.4 + pulse * 0.4)})`;
            ctx.lineWidth = 0.4;
          }
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const glow = (Math.sin(a.pulse) + 1) * 0.5;
      if (a.gold) {
        const gg = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.r + glow * 8);
        gg.addColorStop(0, `rgba(212,184,122,${0.7 + glow * 0.3})`);
        gg.addColorStop(0.4, `rgba(212,184,122,${0.15 + glow * 0.2})`);
        gg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r + glow * 8, 0, Math.PI * 2);
        ctx.fillStyle = gg; ctx.fill();
      } else {
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,224,212,${0.35 + glow * 0.35})`; ctx.fill();
      }
    }
  }

  let animId;
  function loop() { draw(); animId = requestAnimationFrame(loop); }
  const onResize = () => resize();
  window.addEventListener("resize", onResize);
  resize(); loop();
  return () => { window.removeEventListener("resize", onResize); cancelAnimationFrame(animId); };
}

/* ── AI canvas (glitch + beep rings) ── */
function drawAI(cvs) {
  const ctx = cvs.getContext("2d");
  let W, H, scanY = 0, frame = 0;
  let glitchBlocks = [], beepRings = [], sparks = [];

  function resize() { W = cvs.width = cvs.offsetWidth; H = cvs.height = cvs.offsetHeight; }

  function spawnGlitch() {
    const n = 3 + Math.floor(Math.random() * 5);
    for (let i = 0; i < n; i++) {
      const y = Math.random() * H;
      const h = Math.random() < 0.4 ? (2 + Math.random() * 12) : (Math.random() * 3 + 1);
      glitchBlocks.push({ x: Math.random() * W * 0.4, y, w: Math.random() * W * 0.6 + 80, h, life: 8 + Math.floor(Math.random() * 18), type: Math.floor(Math.random() * 3), alpha: 0.15 + Math.random() * 0.45, drift: (Math.random() - 0.5) * 4 });
    }
    if (Math.random() < 0.25) {
      const y = Math.random() * H;
      glitchBlocks.push({ x: -20, y, w: W + 40, h: 1 + Math.random() * 2, life: 4, type: 3, alpha: 0.6, drift: 0 });
      glitchBlocks.push({ x: -20, y: y + 2, w: W + 40, h: 1, life: 4, type: 4, alpha: 0.5, drift: 0 });
    }
  }

  function spawnBeep() {
    beepRings.push({ x: W * 0.6 + Math.random() * W * 0.35, y: Math.random() * H, r: 0, maxR: 60 + Math.random() * 120, speed: 2.5 + Math.random() * 2, alpha: 0.7 + Math.random() * 0.3, thick: 1 + Math.random() * 1.5, double: Math.random() < 0.4 });
  }

  function spawnSpark() {
    sparks.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3, life: 20 + Math.floor(Math.random() * 20), size: Math.random() < 0.3 ? 2 : 1 });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const grd = ctx.createRadialGradient(W * 0.7, H * 0.5, 0, W * 0.7, H * 0.5, W * 0.7);
    grd.addColorStop(0, "rgba(138,41,48,0.45)"); grd.addColorStop(0.35, "rgba(107,31,36,0.18)");
    grd.addColorStop(0.7, "rgba(80,12,16,0.06)"); grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);

    const grd2 = ctx.createRadialGradient(W * 0.85, H * 0.15, 0, W * 0.85, H * 0.15, W * 0.4);
    grd2.addColorStop(0, "rgba(201,133,122,0.22)"); grd2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd2; ctx.fillRect(0, 0, W, H);

    ctx.lineWidth = 0.5;
    const GRID = 36;
    for (let x = 0; x < W; x += GRID) {
      ctx.strokeStyle = `rgba(201,133,122,${0.07 + 0.04 * Math.sin(frame * 0.02 + x * 0.01)})`;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += GRID) {
      ctx.strokeStyle = `rgba(201,133,122,${0.07 + 0.04 * Math.sin(frame * 0.015 + y * 0.01)})`;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    scanY = (scanY + 1.6) % H;
    const sg = ctx.createLinearGradient(0, scanY - 22, 0, scanY + 22);
    sg.addColorStop(0, "rgba(201,133,122,0)"); sg.addColorStop(0.4, "rgba(232,180,170,0.35)");
    sg.addColorStop(0.5, "rgba(255,200,190,0.55)"); sg.addColorStop(0.6, "rgba(232,180,170,0.35)");
    sg.addColorStop(1, "rgba(201,133,122,0)");
    ctx.fillStyle = sg; ctx.fillRect(0, scanY - 22, W, 44);
    ctx.strokeStyle = "rgba(255,180,170,0.7)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(W, scanY); ctx.stroke();

    glitchBlocks = glitchBlocks.filter(g => g.life > 0);
    for (const g of glitchBlocks) {
      if (g.type === 2) {
        ctx.strokeStyle = `rgba(201,133,122,${g.alpha * 0.8})`; ctx.lineWidth = 0.5;
        ctx.strokeRect(g.x, g.y, g.w, g.h + 4);
      } else {
        ctx.fillStyle = g.type === 0 ? `rgba(201,133,122,${g.alpha})` : g.type === 1 ? `rgba(232,224,212,${g.alpha * 0.6})` : g.type === 3 ? `rgba(201,133,122,${g.alpha})` : `rgba(184,154,92,${g.alpha})`;
        ctx.fillRect(g.x, g.y, g.w, g.h);
        if (g.type === 0 && Math.random() < 0.3) {
          ctx.fillStyle = `rgba(184,154,92,${g.alpha * 0.4})`;
          ctx.fillRect(g.x + Math.random() * 6 - 3, g.y - 1, g.w, g.h);
        }
      }
      g.life--; g.x += g.drift;
    }

    beepRings = beepRings.filter(r => r.r < r.maxR);
    for (const r of beepRings) {
      const prog = r.r / r.maxR, a = r.alpha * (1 - prog) * (1 - prog);
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(201,133,122,${a})`; ctx.lineWidth = r.thick; ctx.stroke();
      if (r.r < 12) {
        ctx.beginPath(); ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,180,170,${0.9 * (1 - r.r / 12)})`; ctx.fill();
      }
      if (r.double && r.r > 8) {
        ctx.beginPath(); ctx.arc(r.x, r.y, r.r * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(201,133,122,${a * 0.5})`; ctx.lineWidth = r.thick * 0.6; ctx.stroke();
      }
      r.r += r.speed;
    }

    sparks = sparks.filter(s => s.life > 0);
    for (const s of sparks) {
      ctx.fillStyle = `rgba(232,180,170,${(s.life / 40) * 0.8})`;
      ctx.fillRect(s.x, s.y, s.size, s.size);
      s.x += s.vx; s.y += s.vy; s.life--;
    }

    const bSize = 18, bOff = 16, bAlpha = 0.3 + 0.15 * Math.sin(frame * 0.04);
    ctx.strokeStyle = `rgba(201,133,122,${bAlpha})`; ctx.lineWidth = 1;
    const bx = W - bOff, by = bOff;
    ctx.beginPath(); ctx.moveTo(bx - bSize, by); ctx.lineTo(bx, by); ctx.lineTo(bx, by + bSize); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx - bSize, H - by); ctx.lineTo(bx, H - by); ctx.lineTo(bx, H - by - bSize); ctx.stroke();

    frame++;
    if (frame % 5 === 0) spawnGlitch();
    if (frame % 62 === 0 || frame % 62 === 28) spawnBeep();
    if (frame % 8 === 0 && Math.random() < 0.5) spawnSpark();
    if (Math.random() < 0.003) { ctx.fillStyle = "rgba(201,133,122,0.05)"; ctx.fillRect(0, 0, W, H); }
  }

  let animId;
  function loop() { draw(); animId = requestAnimationFrame(loop); }
  const onResize = () => resize();
  window.addEventListener("resize", onResize);
  resize();
  for (let i = 0; i < 5; i++) spawnBeep();
  loop();
  return () => { window.removeEventListener("resize", onResize); cancelAnimationFrame(animId); };
}

export default function HeroWipe({ onOpenLab }) {
  const realRef = useRef(null);
  const aiRef = useRef(null);
  const dividerRef = useRef(null);
  const wipeAiRef = useRef(null);
  const heroRef = useRef(null);
  const wipeDragging = useRef(false);
  const wipeT = useRef(0);
  const wipeRaf = useRef(null);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    let cleanReal, cleanAI;
    if (realRef.current) cleanReal = drawReal(realRef.current);
    if (aiRef.current) cleanAI = drawAI(aiRef.current);
    return () => { cleanReal?.(); cleanAI?.(); };
  }, []);

  // Wipe animation
  useEffect(() => {
    function setWipe(pct) {
      pct = Math.max(5, Math.min(95, pct));
      if (wipeAiRef.current) wipeAiRef.current.style.clipPath = `polygon(${pct}% 0%,100% 0%,100% 100%,${pct}% 100%)`;
      if (dividerRef.current) dividerRef.current.style.left = pct + "%";
    }
    function loop() {
      if (!wipeDragging.current) { wipeT.current += 0.003; setWipe(50 + Math.sin(wipeT.current) * 28); }
      wipeRaf.current = requestAnimationFrame(loop);
    }
    wipeRaf.current = requestAnimationFrame(loop);
    return () => { if (wipeRaf.current) cancelAnimationFrame(wipeRaf.current); };
  }, []);

  function onMouseMove(e) {
    if (!wipeDragging.current) return;
    const r = heroRef.current.getBoundingClientRect();
    const pct = ((e.clientX - r.left) / r.width) * 100;
    wipeAiRef.current.style.clipPath = `polygon(${Math.max(5, Math.min(95, pct))}% 0%,100% 0%,100% 100%,${Math.max(5, Math.min(95, pct))}% 100%)`;
    dividerRef.current.style.left = Math.max(5, Math.min(95, pct)) + "%";
  }

  // Particle spawner
  useEffect(() => {
    const iv = setInterval(() => {
      const id = Date.now() + Math.random();
      const x = Math.random() * 100;
      const dur = 5 + Math.random() * 8;
      const size = Math.random() < 0.3 ? 2 : 1;
      setParticles(p => [...p.slice(-30), { id, x, dur, size }]);
    }, 400);
    return () => clearInterval(iv);
  }, []);

  return (
    <section
      className={styles.hero}
      ref={heroRef}
      onMouseMove={onMouseMove}
      onMouseUp={() => (wipeDragging.current = false)}
      onTouchMove={e => {
        wipeDragging.current = true;
        const r = heroRef.current.getBoundingClientRect();
        const pct = ((e.touches[0].clientX - r.left) / r.width) * 100;
        const clamped = Math.max(5, Math.min(95, pct));
        wipeAiRef.current.style.clipPath = `polygon(${clamped}% 0%,100% 0%,100% 100%,${clamped}% 100%)`;
        dividerRef.current.style.left = clamped + "%";
      }}
      onTouchEnd={() => (wipeDragging.current = false)}
    >
      {/* Real side */}
      <div className={styles.wipeReal}>
        <canvas ref={realRef} className={styles.canvas} />
        <div className={styles.realLabel}>Original · Unaltered</div>
      </div>

      {/* AI side */}
      <div className={styles.wipeAi} ref={wipeAiRef}>
        <canvas ref={aiRef} className={styles.canvas} />
        <div className={styles.aiLabel}>Synthetic · AI Derived</div>
      </div>

      {/* Divider */}
      <div
        className={styles.divider}
        ref={dividerRef}
        onMouseDown={e => { wipeDragging.current = true; e.preventDefault(); }}
      >
        <div className={styles.handle}>⟺</div>
      </div>

      {/* Scanlines overlay */}
      <div className={styles.scanlines} />

      {/* Particles */}
      <div className={styles.particles}>
        {particles.map(p => (
          <div key={p.id} className={styles.particle} style={{
            left: p.x + "%", bottom: -4,
            width: p.size, height: p.size,
            animationDuration: p.dur + "s",
            animationDelay: Math.random() * 1 + "s"
          }} />
        ))}
      </div>

      {/* Hero text */}
      <div className={styles.content}>
        <div className={styles.kicker}>Image forensics · Derivation analysis</div>
        <h1 className={styles.title}>
          Veri<span className={styles.accent}>tas</span>
        </h1>
        <p className={styles.tagline}>
          Beyond detection. <em>Into derivation.</em><br />
          Know not just <em>if</em> — but <em>how much</em>, <em>where</em>, and <em>from what.</em>
        </p>
        <button className={styles.cta} onClick={onOpenLab}>
          <span>Analyse an Image</span><span>→</span>
        </button>
      </div>

      <div className={styles.hint}>← drag to compare · original vs synthetic →</div>
    </section>
  );
}
