# train_eye_classifier.py
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

FEATURES = [
    "blink_rate",
    "mean_ibi",
    "left_ear",
    "right_ear",
    "ear_difference"
]

def main():
    print("Loading eye_dataset.csv...")
    df = pd.read_csv("eye_dataset.csv")
    X = df[FEATURES]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=150, max_depth=8, random_state=42
    )
    model.fit(X_train, y_train)

    pred = model.predict(X_test)
    print("Accuracy:", accuracy_score(y_test, pred))
    print("\nClassification Report:\n", classification_report(y_test, pred))

    joblib.dump(
        { "model": model, "features": FEATURES },
        "eye_classifier.pkl"
    )
    print("Saved eye_classifier.pkl successfully.")

if __name__ == "__main__":
    main()
