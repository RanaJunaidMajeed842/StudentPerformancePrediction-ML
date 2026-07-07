"""Machine learning service for student performance prediction."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
import sklearn.ensemble as es
import sklearn.linear_model as lm
import sklearn.metrics as m
import sklearn.neural_network as nn
import sklearn.preprocessing as pp
import sklearn.tree as tr
import sklearn.utils as u

DATA_PATH = Path(__file__).resolve().parent.parent / "AI-Data.csv"

CLASS_LABELS = {0: "H", 1: "L", 2: "M"}
CLASS_COLORS = {"H": "#22c55e", "M": "#f59e0b", "L": "#ef4444"}

MODEL_NAMES = [
    "decision_tree",
    "random_forest",
    "perceptron",
    "logistic_regression",
    "mlp",
]

MODEL_DISPLAY = {
    "decision_tree": "Decision Tree",
    "random_forest": "Random Forest",
    "perceptron": "Perceptron",
    "logistic_regression": "Logistic Regression",
    "mlp": "Neural Network (MLP)",
}


@dataclass
class ModelResult:
    name: str
    display_name: str
    accuracy: float
    report: dict[str, Any]
    confusion_matrix: list[list[int]]


class MLService:
    def __init__(self) -> None:
        self.raw_data = pd.read_csv(DATA_PATH)
        self.models: dict[str, Any] = {}
        self.absence_encoder = pp.LabelEncoder()
        self.class_encoder = pp.LabelEncoder()
        self._train_models()

    def _prepare_training_data(self) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        data = self.raw_data.copy()
        drop_cols = [
            "gender",
            "StageID",
            "GradeID",
            "NationalITy",
            "PlaceofBirth",
            "SectionID",
            "Topic",
            "Semester",
            "Relation",
            "ParentschoolSatisfaction",
            "ParentAnsweringSurvey",
            "AnnouncementsView",
        ]
        data = data.drop(columns=drop_cols)
        u.shuffle(data)

        self.absence_encoder.fit(data["StudentAbsenceDays"])
        self.class_encoder.fit(data["Class"])

        data["StudentAbsenceDays"] = self.absence_encoder.transform(data["StudentAbsenceDays"])
        data["Class"] = self.class_encoder.transform(data["Class"])

        features = data[["raisedhands", "VisITedResources", "Discussion", "StudentAbsenceDays"]].values
        labels = data["Class"].values

        split_idx = int(len(data) * 0.70)
        x_train = features[:split_idx]
        x_test = features[split_idx + 1 :]
        y_train = labels[:split_idx]
        y_test = labels[split_idx + 1 :]
        return x_train, x_test, y_train, y_test

    def _train_models(self) -> None:
        x_train, x_test, y_train, y_test = self._prepare_training_data()
        self.x_test = x_test
        self.y_test = y_test

        estimators = {
            "decision_tree": tr.DecisionTreeClassifier(random_state=42),
            "random_forest": es.RandomForestClassifier(random_state=42),
            "perceptron": lm.Perceptron(random_state=42),
            "logistic_regression": lm.LogisticRegression(max_iter=1000, random_state=42),
            "mlp": nn.MLPClassifier(activation="logistic", max_iter=1000, random_state=42),
        }

        self.model_results: dict[str, ModelResult] = {}
        for key, model in estimators.items():
            model.fit(x_train, y_train)
            self.models[key] = model
            preds = model.predict(x_test)
            report = m.classification_report(
                y_test, preds, target_names=["H", "L", "M"], output_dict=True, zero_division=0
            )
            self.model_results[key] = ModelResult(
                name=key,
                display_name=MODEL_DISPLAY[key],
                accuracy=float(report["accuracy"]),
                report=report,
                confusion_matrix=m.confusion_matrix(y_test, preds).tolist(),
            )

    def get_overview(self) -> dict[str, Any]:
        class_counts = self.raw_data["Class"].value_counts().reindex(["H", "M", "L"], fill_value=0)
        return {
            "title": "EduPredict",
            "subtitle": "Student Academic Performance Prediction System",
            "total_students": len(self.raw_data),
            "features_used": [
                "Raised Hands",
                "Visited Resources",
                "Discussion Participation",
                "Student Absence Days",
            ],
            "class_distribution": [
                {"class": label, "count": int(class_counts[label]), "color": CLASS_COLORS[label]}
                for label in ["H", "M", "L"]
            ],
            "models_count": len(self.models),
            "best_model": max(self.model_results.values(), key=lambda r: r.accuracy).display_name,
            "best_accuracy": max(r.accuracy for r in self.model_results.values()),
        }

    def get_model_metrics(self) -> list[dict[str, Any]]:
        results = []
        for key in MODEL_NAMES:
            result = self.model_results[key]
            results.append(
                {
                    "id": key,
                    "name": result.display_name,
                    "accuracy": round(result.accuracy, 4),
                    "accuracy_pct": round(result.accuracy * 100, 1),
                    "precision": round(result.report["weighted avg"]["precision"], 4),
                    "recall": round(result.report["weighted avg"]["recall"], 4),
                    "f1": round(result.report["weighted avg"]["f1-score"], 4),
                    "confusion_matrix": result.confusion_matrix,
                    "class_report": {
                        cls: {
                            "precision": round(result.report[cls]["precision"], 4),
                            "recall": round(result.report[cls]["recall"], 4),
                            "f1": round(result.report[cls]["f1-score"], 4),
                            "support": int(result.report[cls]["support"]),
                        }
                        for cls in ["H", "M", "L"]
                    },
                }
            )
        return results

    def get_correlation(self) -> dict[str, Any]:
        numeric = self.raw_data.copy()
        numeric["StudentAbsenceDays"] = numeric["StudentAbsenceDays"].map({"Under-7": 1, "Above-7": 0})
        numeric["Class_num"] = numeric["Class"].map({"H": 2, "M": 1, "L": 0})
        cols = ["raisedhands", "VisITedResources", "Discussion", "StudentAbsenceDays", "Class_num"]
        corr = numeric[cols].corr()
        labels = ["Raised Hands", "Resources", "Discussion", "Absences", "Performance"]
        matrix = corr.values.round(3).tolist()
        return {"labels": labels, "matrix": matrix}

    def get_chart_data(self, chart_id: str) -> dict[str, Any]:
        charts = {
            "class_count": {
                "type": "bar",
                "title": "Performance Class Distribution",
                "data": self._count_by("Class", order=["L", "M", "H"]),
            },
            "semester": {
                "type": "grouped_bar",
                "title": "Performance by Semester",
                "categories": sorted(self.raw_data["Semester"].unique().tolist()),
                "series": self._hue_series("Semester", order=["L", "M", "H"]),
            },
            "gender": {
                "type": "grouped_bar",
                "title": "Performance by Gender",
                "categories": ["M", "F"],
                "series": self._hue_series("gender", categories=["M", "F"], order=["L", "M", "H"]),
            },
            "grade": {
                "type": "grouped_bar",
                "title": "Performance by Grade",
                "categories": [
                    "G-02", "G-04", "G-05", "G-06", "G-07",
                    "G-08", "G-09", "G-10", "G-11", "G-12",
                ],
                "series": self._hue_series(
                    "GradeID",
                    categories=[
                        "G-02", "G-04", "G-05", "G-06", "G-07",
                        "G-08", "G-09", "G-10", "G-11", "G-12",
                    ],
                    order=["L", "M", "H"],
                ),
            },
            "absence": {
                "type": "grouped_bar",
                "title": "Performance by Absence Days",
                "categories": ["Under-7", "Above-7"],
                "series": self._hue_series(
                    "StudentAbsenceDays",
                    categories=["Under-7", "Above-7"],
                    order=["L", "M", "H"],
                ),
            },
            "topic": {
                "type": "grouped_bar",
                "title": "Performance by Topic",
                "categories": sorted(self.raw_data["Topic"].unique().tolist()),
                "series": self._hue_series("Topic", order=["L", "M", "H"]),
            },
        }
        if chart_id not in charts:
            raise ValueError(f"Unknown chart: {chart_id}")
        return charts[chart_id]

    def _count_by(self, column: str, order: list[str]) -> list[dict[str, Any]]:
        counts = self.raw_data[column].value_counts()
        return [
            {"name": label, "value": int(counts.get(label, 0)), "color": CLASS_COLORS.get(label, "#6366f1")}
            for label in order
        ]

    def _hue_series(
        self,
        column: str,
        categories: list[str] | None = None,
        order: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        order = order or ["L", "M", "H"]
        if categories is None:
            categories = sorted(self.raw_data[column].unique().tolist())
        series = []
        for cls in order:
            counts = []
            for cat in categories:
                count = len(self.raw_data[(self.raw_data[column] == cat) & (self.raw_data["Class"] == cls)])
                counts.append(count)
            series.append({"name": cls, "data": counts, "color": CLASS_COLORS[cls]})
        return series

    def predict(self, raised_hands: int, visited_resources: int, discussion: int, absence_days: str) -> dict[str, Any]:
        if absence_days not in ("Under-7", "Above-7"):
            raise ValueError("absence_days must be 'Under-7' or 'Above-7'")

        encoded_absence = int(self.absence_encoder.transform([absence_days])[0])
        features = np.array([[raised_hands, visited_resources, discussion, encoded_absence]])

        predictions = {}
        for key in MODEL_NAMES:
            pred_code = int(self.models[key].predict(features)[0])
            predictions[key] = {
                "model": MODEL_DISPLAY[key],
                "prediction": CLASS_LABELS[pred_code],
                "color": CLASS_COLORS[CLASS_LABELS[pred_code]],
            }

        consensus = max(
            set(p["prediction"] for p in predictions.values()),
            key=lambda x: sum(1 for p in predictions.values() if p["prediction"] == x),
        )

        return {
            "input": {
                "raised_hands": raised_hands,
                "visited_resources": visited_resources,
                "discussion": discussion,
                "absence_days": absence_days,
            },
            "predictions": predictions,
            "consensus": {"prediction": consensus, "color": CLASS_COLORS[consensus]},
        }


ml_service = MLService()
