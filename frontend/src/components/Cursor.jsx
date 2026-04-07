import { useEffect, useRef } from "react";

export default function Cursor() {
  const curRef = useRef(null);
  const ringRef = useRef(null);
  const rx = useRef(0);
  const ry = useRef(0);
  const mx = useRef(0);
  const my = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      mx.current = e.clientX;
      my.current = e.clientY;
      if (curRef.current) {
        curRef.current.style.left = e.clientX + "px";
        curRef.current.style.top = e.clientY + "px";
      }
    };

    const animate = () => {
      rx.current += (mx.current - rx.current) * 0.1;
      ry.current += (my.current - ry.current) * 0.1;
      if (ringRef.current) {
        ringRef.current.style.left = rx.current + "px";
        ringRef.current.style.top = ry.current + "px";
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", onMove);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div ref={curRef} style={{
        position: "fixed", width: 5, height: 5,
        background: "var(--rose)", borderRadius: "50%",
        pointerEvents: "none", zIndex: 9999,
        transform: "translate(-50%,-50%)",
        boxShadow: "0 0 8px var(--rose)"
      }} />
      <div ref={ringRef} style={{
        position: "fixed", width: 24, height: 24,
        border: "1px solid rgba(201,133,122,0.5)", borderRadius: "50%",
        pointerEvents: "none", zIndex: 9998,
        transform: "translate(-50%,-50%)",
        transition: "all 0.12s ease"
      }} />
    </>
  );
}
