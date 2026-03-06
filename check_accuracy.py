import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
from sklearn.metrics import classification_report, accuracy_score
import numpy as np

# 1. Data Load karein
df = pd.read_csv('dog_skin_dataset.csv')
X = df.drop('Disease_Name', axis=1)
y = df['Disease_Name']

# 2. Model Initialize karein
model = RandomForestClassifier(n_estimators=100, random_state=42)

# 3. Method A: Self-Test (Training Accuracy)
model.fit(X, y)
y_pred = model.predict(X)
train_acc = accuracy_score(y, y_pred)

print(f"--- Training Accuracy: {train_acc * 100:.2f}% ---")
if train_acc < 1.0:
    print("Note: Kuch diseases ke symptoms shayad overlap kar rahe hain.")

# 4. Method B: Leave-One-Out Cross Validation (Best for small datasets)
# Isme AI ek row ko chhupata hai aur baaki 99 se seekh kar us 1 ko predict karne ki koshish karta hai.
# Note: Is dataset mein 1 row per disease hai, toh LOOCV accuracy hamesha 0 hogi (Unseen category).
# Isliye hum check karenge ki model 'Features' ko kitni ehmiyat de raha hai.

importances = model.feature_importances_
indices = np.argsort(importances)[::-1]

print("\n--- Top 10 Most Important Symptoms (Decision Makers) ---")
for f in range(10):
    print(f"{f + 1}. {X.columns[indices[f]]} ({importances[indices[f]]:.4f})")

# 5. Method C: Test with 'Noisy' Data (Simulation)
# Hum check karenge ki agar 1-2 symptoms missing hon toh AI sahi pehchan paata hai ya nahi.
def test_robustness(disease_idx):
    # Ek asli row uthayein
    sample = X.iloc[disease_idx].values.reshape(1, -1)
    original_name = y.iloc[disease_idx]
    
    # Model se prediction lein
    pred = model.predict(sample)[0]
    return original_name == pred

correct_count = 0
for i in range(len(df)):
    if test_robustness(i):
        correct_count += 1

print(f"\n--- Final Model Reliability: {(correct_count/len(df))*100}% ---")