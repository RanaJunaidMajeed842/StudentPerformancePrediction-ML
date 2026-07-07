# EduPredict — Student Performance Prediction

A **Final Year Project** web application that predicts student academic performance (High / Medium / Low) using machine learning. The original CLI-based `Project.py` has been extended with a modern **React** frontend and **FastAPI** Python backend.

## Architecture

```
edu-predict/
├── AI-Data.csv          # Student dataset
├── Project.py           # Original CLI script (preserved)
├── backend/             # FastAPI + scikit-learn API
│   ├── app.py
│   ├── ml_service.py
│   └── requirements.txt
└── frontend/            # React + Vite + Tailwind UI
    └── src/
        ├── pages/       # Dashboard, Analytics, Models, Predict
        └── components/
```

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Recharts |
| Backend  | FastAPI, scikit-learn, pandas       |
| ML Models| Decision Tree, Random Forest, Perceptron, Logistic Regression, MLP |

## Features

- **Dashboard** — Project overview, class distribution, model accuracy comparison
- **Analytics** — Correlation heatmap and interactive charts (semester, gender, grade, absence, topic)
- **ML Models** — Per-model metrics, classification reports, confusion matrices
- **Predict** — Live prediction form with consensus across all five classifiers

## Quick Start

### 1. Backend (Python)

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

API docs: http://127.0.0.1:8000/docs

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:5173

## Original CLI

The original script still works:

```bash
pip install -r requirements.txt
python Project.py
```

## Dataset

`AI-Data.csv` contains student records with demographics, engagement metrics (raised hands, resources visited, discussions), and attendance. Four features are used for ML prediction:

- Raised Hands
- Visited Resources
- Discussion Participation
- Student Absence Days

## License

Academic / educational use.
