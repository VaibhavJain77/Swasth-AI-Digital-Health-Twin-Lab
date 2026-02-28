import pickle
import numpy as np

# Load trained model
model = pickle.load(open("heart_model.pkl", "rb"))

# Example patient input
# Order must match dataset columns
sample_input = np.array([[52, 1, 0, 125, 212, 0, 1, 168, 0, 1.0, 2, 2, 3]])

# Predict probability
probability = model.predict_proba(sample_input)[0][1]

print("Heart Disease Risk Probability:", probability)

# Risk category
if probability < 0.3:
    risk = "Low Risk"
elif probability < 0.6:
    risk = "Moderate Risk"
else:
    risk = "High Risk"

print("Risk Category:", risk)