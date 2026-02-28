import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, roc_auc_score
import pickle

print("Loading Stroke Dataset...")

df = pd.read_csv("stroke.csv")

# Drop id
df = df.drop("id", axis=1)

# Convert categorical to numeric
df = pd.get_dummies(df, drop_first=True)

# Remove rows with missing values
df = df.dropna()

X = df.drop("stroke", axis=1)
y = df["stroke"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)

print("Accuracy:", accuracy_score(y_test, y_pred))
print("ROC AUC:", roc_auc_score(y_test, model.predict_proba(X_test)[:,1]))

pickle.dump(model, open("stroke_model.pkl", "wb"))

print("Stroke model saved!")