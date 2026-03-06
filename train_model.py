import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

# 1. Load the dataset
df = pd.read_csv('dog_skin_dataset.csv')

# 2. Separate Features (Symptoms) and Target (Disease Name)
X = df.drop('Disease_Name', axis=1)
y = df['Disease_Name']

# 3. Initialize and Train Random Forest

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

# 4. Save the Model and the List of Features

model_data = {
    'model': model,
    'feature_names': list(X.columns)
}

joblib.dump(model_data, 'disease_ml_model.pkl')
print("Model trained and saved as 'disease_ml_model.pkl'!")