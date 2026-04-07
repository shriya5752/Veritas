import { useState, useCallback } from "react";
import AnalysisNav from "../components/AnalysisNav";
import UploadPanel from "../components/UploadPanel";
import { LoadingPanel, EmptyState, ResultContent } from "../components/ResultsPanel";
import styles from "./AnalysisPage.module.css";



const STEP_COUNT = 6;

// ── toggle this to use mock data without a real backend ──
const USE_MOCK = false;
const BACKEND_URL = "/analyze";

const MOCK_RESULT = {
  ai_score: 82,
  originality_score: 18,
  manipulation_confidence: 79,
  gan_fingerprint: 65,
  display_score: 82,
  display_label: "AI GENERATED",
  verdict: "AI GENERATED",
  summary:
    "Strong GAN fingerprint signatures detected across primary image regions. Texture synthesis patterns are consistent with Stable Diffusion v1.5 architecture.",
  regions: [
    { name: "Background",   score: 91, status: "ai"      },
    { name: "Face region",  score: 88, status: "ai"      },
    { name: "Hair texture", score: 74, status: "suspect"  },
    { name: "Lighting",     score: 85, status: "ai"      },
    { name: "Edge detail",  score: 62, status: "suspect"  },
    { name: "Metadata",     score: 12, status: "clean"    },
  ],
  findings: [
    { type: "crit", title: "GAN Artifacts Detected",   detail: "Characteristic frequency domain signatures match known generative model outputs with 91% confidence." },
    { type: "crit", title: "No EXIF Origin Data",      detail: "Image lacks authentic camera metadata, consistent with AI generation pipeline output." },
    { type: "warn", title: "Texture Inconsistency",    detail: "Hair region shows synthesis blending artifacts at high frequency bands near the boundary." },
    { type: "info", title: "Resolution Pattern",       detail: "Pixel distribution matches 512×512 upscaled output typical of latent diffusion models." },
  ],
  attribution: [
    { model: "Stable Diffusion v1.5", confidence: 78 },
    { model: "Midjourney v5",         confidence: 14 },
    { model: "DALL-E 3",              confidence: 8  },
  ],
};

export default function AnalysisPage({ onBack }) {
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [fileName, setFileName] = useState("—");
  const [fileSize, setFileSize] = useState("—");
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false); // ← new
  const [activeStep, setActiveStep] = useState(-1);
  const [termText, setTermText] = useState("awaiting input...");
  const [error, setError]       = useState(null);
  const [result, setResult]     = useState(null);
  const [statusDot, setStatusDot] = useState("");
  const [statusText, setStatusText] = useState("Awaiting Input");

  const handleFile = useCallback((f) => {
    setFile(f);
    setError(null);
    setResult(null);
    setScanDone(false); // ← reset on new file
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
    const name = f.name.length > 22 ? f.name.slice(0, 22) + "…" : f.name;
    setFileName(name);
    setFileSize((f.size / 1024).toFixed(1) + "kb");
    setStatusDot("ready");
    setStatusText("Image Loaded");
    setTermText("file ready: " + f.name + " · " + (f.size / 1024).toFixed(0) + "kb");
  }, []);

  // ← new: clears everything and goes back to the drop zone
  const handleNewImage = useCallback(() => {
    setFile(null);
    setPreview(null);
    setFileName("—");
    setFileSize("—");
    setError(null);
    setResult(null);
    setScanDone(false);
    setActiveStep(-1);
    setStatusDot("");
    setStatusText("Awaiting Input");
    setTermText("awaiting input...");
  }, []);

  const runScan = useCallback(async () => {
    if (!file) return;
    setScanning(true);
    setScanDone(false); // ← reset at start of each scan
    setError(null);
    setResult(null);
    setActiveStep(0);
    setStatusDot("running");
    setStatusText("Scanning...");
    setTermText("initialising veritas forensic engine...");

    // Animate steps
    let si = 0;
    const sit = setInterval(() => {
      si++;
      if (si < STEP_COUNT) setActiveStep(si);
      else clearInterval(sit);
    }, 450);

    try {
      let res;

      if (USE_MOCK) {
        setTermText("running mock forensic engine...");
        await new Promise(r => setTimeout(r, 3200));
        res = MOCK_RESULT;
      } else {
        setTermText("connecting to veritas backend...");
        const formData = new FormData();
        formData.append("image", file);
        const resp = await fetch(BACKEND_URL, { method: "POST", body: formData });
        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error(`Backend returned ${resp.status}: ${txt}`);
        }
        res = await resp.json();
        res.display_score = res.ai_score;
        res.display_label = res.verdict;
        if (typeof res.ai_score === "undefined") throw new Error("Backend response missing ai_score field");
        if (!res.verdict) throw new Error("Backend response missing verdict field");
      }

      clearInterval(sit);
      setActiveStep(STEP_COUNT);
      setTimeout(() => {
        setResult(res);
        setScanning(false);
        setActiveStep(-1);
        setScanDone(true); // ← mark done after result is set
      }, 250);

      setStatusDot("done");
      setStatusText(res.verdict);
      setTermText("complete → " + res.display_label + " · score: " + res.display_score + "%");

    } catch (err) {
      clearInterval(sit);
      setError("Analysis failed: " + err.message);
      setScanning(false);
      setActiveStep(-1);
      setScanDone(true); // ← also show actions on error so user can retry
      setStatusDot("");
      setStatusText("Error");
      setTermText("error: " + err.message.slice(0, 60));
      console.error(err);
    }
  }, [file]);

  const showLoading = scanning;
  const showEmpty   = !scanning && !result;
  const showResult  = !scanning && !!result;

  return (
    <div className={styles.page}>
      <AnalysisNav statusDot={statusDot} statusText={statusText} onBack={onBack} />
      <div className={styles.main}>
        <UploadPanel
          file={file}
          preview={preview}
          fileName={fileName}
          fileSize={fileSize}
          scanning={scanning}
          scanDone={scanDone}        // ← new
          termText={termText}
          error={error}
          onFile={handleFile}
          onScan={runScan}
          onRescan={runScan}         // ← same scan, same file
          onReupload={handleNewImage} // ← clears state, opens picker
          onNewImage={handleNewImage} // ← same behaviour
        />
        <div className={styles.resultCol}>
          <div className={styles.resultInner}>
            {showEmpty   && <EmptyState />}
            {showLoading && <LoadingPanel activeStep={activeStep} />}
            {showResult  && <ResultContent result={result} />}
          </div>
        </div>
      </div>
    </div>
  );
}