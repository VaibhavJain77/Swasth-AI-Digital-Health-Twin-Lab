print("Starting...")

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, roc_auc_score
import pickle

# Load dataset
df = pd.read_csv("heart.csv")
print("Dataset Loaded:", df.shape)

# Split
X = df.drop("target", axis=1)
y = df["target"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print("Training model...")

model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)

print("Evaluating...")

y_pred = model.predict(X_test)

print("Accuracy:", accuracy_score(y_test, y_pred))
print("ROC AUC:", roc_auc_score(y_test, model.predict_proba(X_test)[:, 1]))

# Save model
pickle.dump(model, open("heart_model.pkl", "wb"))

print("Model saved successfully!")