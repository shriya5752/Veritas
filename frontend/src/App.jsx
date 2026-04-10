import { useState } from "react";
import Cursor from "./components/Cursor";
import LandingPage from "./pages/LandingPage";
import AnalysisPage from "./pages/AnalysisPage";
import "./styles/globals.css";

export default function App() {
  const [page, setPage] = useState("landing"); // "landing" | "analysis"

  const goAnalysis = () => { setPage("analysis"); window.scrollTo(0, 0); };
  const goLanding  = () => { setPage("landing");  window.scrollTo(0, 0); };

  return (
    <>
      <Cursor />
      {page === "landing"  && <LandingPage  onOpenLab={goAnalysis} />}
      {page === "analysis" && <AnalysisPage onBack={goLanding} />}
    </>
  );
}
