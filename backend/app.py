"""FastAPI backend for EduPredict student performance system."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from ml_service import ml_service

app = FastAPI(
    title="EduPredict API",
    description="Student academic performance prediction using machine learning",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictionRequest(BaseModel):
    raised_hands: int = Field(ge=0, le=100, description="Number of times student raised hand")
    visited_resources: int = Field(ge=0, le=100, description="Number of educational resources visited")
    discussion: int = Field(ge=0, le=100, description="Discussion participation count")
    absence_days: str = Field(description="'Under-7' or 'Above-7'")


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "EduPredict API"}


@app.get("/api/overview")
def overview():
    return ml_service.get_overview()


@app.get("/api/models")
def models():
    return ml_service.get_model_metrics()


@app.get("/api/correlation")
def correlation():
    return ml_service.get_correlation()


@app.get("/api/charts")
def chart_list():
    return {
        "charts": [
            {"id": "class_count", "name": "Class Distribution"},
            {"id": "semester", "name": "Semester-wise"},
            {"id": "gender", "name": "Gender-wise"},
            {"id": "grade", "name": "Grade-wise"},
            {"id": "absence", "name": "Absence Days"},
            {"id": "topic", "name": "Topic-wise"},
        ]
    }


@app.get("/api/charts/{chart_id}")
def chart_data(chart_id: str):
    try:
        return ml_service.get_chart_data(chart_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post("/api/predict")
def predict(body: PredictionRequest):
    try:
        return ml_service.predict(
            raised_hands=body.raised_hands,
            visited_resources=body.visited_resources,
            discussion=body.discussion,
            absence_days=body.absence_days,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
