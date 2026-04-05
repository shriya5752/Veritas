# Veritas 

> *"Beyond Detection. Into Derivation."*
>
> *Bringing truth and transparency back to digital media.*
>
> Built by **Team Quatros**

---

## 🚀 Overview
Veritas is an advanced AI-driven system designed to quantify and analyze image manipulation. Unlike traditional "black-box" detectors, Veritas bridges the gap between visual perception and ground truth by classifying images into four distinct categories and providing a precise **manipulation score (0–1)**.

In an era of hybrid visuals, Veritas is built to help journalists, educators, and legal teams identify manipulated content with data-backed confidence.

---

## 🎯 Key Capabilities

### 🔍 Explainability
Provides heatmaps to visually highlight the specific pixels where an image was altered.

### 🔍 Authenticity Detection
Real-time analysis of image integrity using deep learning artifacts.

### 🧠 Four-Class Classification
Categorizes the nature of the manipulation into distinct, actionable classes.

### 📊 Derivation Scoring
Provides a granular intensity score from 0 (Original) to 1 (Highly Altered) to quantify AI contribution.

### ⚡ High-Speed Inference
Optimized PyTorch pipeline designed for rapid, production-ready results.

### 🌐 Web Integration
Full-stack architecture featuring a responsive React-based frontend and Node.js backend.

### 🎨 Sleek UI
Clean, glassmorphic interface with real-time status indicators and intuitive upload workflows.

---

## ⚙️ Tech Stack

### ## Frontend
* **React.js:** Component-based UI for seamless image visualization.
* **Dynamic Overlays:** Real-time feedback and detection status indicators.

### ## Backend
* **Node.js & Express.js:** Robust REST API layer handling model communication.
* **Image Preprocessing:** Efficient buffer handling and formatting for the ML layer.

### ## AI / ML Layer
* **PyTorch:** Core framework for model architecture and inference.
* **EfficientNet-B3:** Leveraging a powerful backbone for high-accuracy feature extraction.
* **Multi-Task Learning:** Simultaneous classification and regression for deeper insights.

---

## 🔬 Design Highlights

### Shared Feature Extraction
Uses a single backbone for dual tasks, ensuring high computational efficiency and faster inference times.

### Dual Output Heads
The architecture splits into two specialized heads: **Classification** predicts the specific category of manipulation, while **Regression** estimates the numerical intensity of the AI contribution.

### Explainability Focus
Designed to move beyond simple "Yes/No" answers into "How much and what kind," providing the transparency required for professional audits.

---

## 🧪 Model Training & Dataset

### Architecture
Custom-trained with a multi-head approach using an **EfficientNet-B3** backbone, chosen for its optimal balance between parameter count and accuracy.

### Data Strategy
Curated datasets involving heavy augmentation (noise, compression, scaling) to ensure the model generalizes across diverse, real-world manipulation types.

### Optimization
Utilizes robust loss functions tailored for both categorical accuracy (Cross-Entropy) and regression precision (MSE/MAE).

---

## 📦 Project Structure
```text
veritas/
├── frontend/          # React application (UI/UX)
├── backend/           # Node.js API (Middleware & Integration)
├── model/             # PyTorch architecture & weights
```

---

## 📈 Future Roadmap

### 🎥 Video Detection
Expanding the pipeline to handle frame-by-frame temporal analysis for deepfake video verification.

### 🌍 Browser Extension
A "Veritas-on-the-go" extension for instant, one-click verification of images on any website.

### 🔗 Social Integration
Automated API hooks for major media platforms to flag synthetic content at the point of ingestion.

---

## 👥 Team Quatros

1. **Shriyadita** - Frontend Development (UI/UX, React integration)  
2. **Shravani** - Backend Development (API, server, integration)  
3. **Tanvi and Shreyashree** - Machine Learning  
   - Dataset research, selection, and curation  
   - Model training and evaluation  
   - Fine-tuning and optimization of the Veritas model  

---
## 📜 License

This project is proprietary and owned by the Quatros team.

You are welcome to view and reference this work for academic or evaluation purposes.  
However, copying, redistribution, or commercial use of any part of this project without permission is not allowed.
