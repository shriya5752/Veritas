import { useRef } from "react";
import styles from "./UploadPanel.module.css";

export default function UploadPanel({
  file, preview, fileName, fileSize,
  scanning, scanDone, termText, error,
  onFile, onScan, onRescan, onReupload, onNewImage
}) {
  const dropRef = useRef(null);
  const fileInputRef = useRef(null);

  function handleDrop(e) {
    e.preventDefault();
    dropRef.current?.classList.remove(styles.over);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) onFile(f);
  }

  function handleFile(e) {
    if (e.target.files[0]) onFile(e.target.files[0]);
  }

  function handleNewImage() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
    if (onNewImage) onNewImage();
  }

  return (
    <div className={styles.col}>
      <div className={styles.panelLabel}>
        Image Input
        <div className={styles.liveDot} />
      </div>

      {!preview ? (
        <div
          className={styles.drop}
          ref={dropRef}
          onDragOver={e => { e.preventDefault(); dropRef.current?.classList.add(styles.over); }}
          onDragLeave={() => dropRef.current?.classList.remove(styles.over)}
          onDrop={handleDrop}
        >
          <input type="file" accept="image/*" onChange={handleFile} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }} />
          <span className={styles.dropIcon}>⊕</span>
          <div className={styles.dropTitle}>Drop your image</div>
          <div className={styles.dropSub}>JPG · PNG · WEBP · max 10MB</div>
        </div>
      ) : (
        <div className={styles.previewWrap}>
          <img src={preview} alt="preview" className={styles.previewImg} />
          <div className={styles.previewMeta}>
            <span>{fileName}</span>
            <span>{fileSize}</span>
          </div>
        </div>
      )}

      {error && <div className={styles.err}>{error}</div>}

      <button
        className={`${styles.scanBtn} ${scanning ? styles.loading : ""}`}
        disabled={!file || scanning}
        onClick={onScan}
      >
        <div className={styles.sp} />
        <span className={styles.btnTxt}>Run Veritas Scan</span>
      </button>

      {/* Post-scan action buttons — only shown after a scan completes */}
      {scanDone && !scanning && (
        <div className={styles.postScanActions}>
          <button
            className={`${styles.actionBtn} ${styles.actionRescan}`}
            onClick={onRescan}
            title="Run the scan again on the same image"
          >
            <span className={styles.actionIcon}>↻</span>
            Rescan
          </button>

          <button
            className={`${styles.actionBtn} ${styles.actionReupload}`}
            onClick={onReupload}
            title="Upload a different version of this image"
          >
            <span className={styles.actionIcon}>⇪</span>
            Re‑upload
          </button>

          <button
            className={`${styles.actionBtn} ${styles.actionNew}`}
            onClick={handleNewImage}
            title="Start fresh with a completely new image"
          >
            <span className={styles.actionIcon}>＋</span>
            New Image
          </button>

          {/* Hidden file input for "New Image" */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            style={{ display: "none" }}
          />
        </div>
      )}

      <div className={styles.terminal}>
        <span className={styles.prompt}>v~$</span>
        <span>{termText}</span>
      </div>
    </div>
  );
}