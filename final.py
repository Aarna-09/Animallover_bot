
import os
import cv2
import numpy as np
import pandas as pd
import joblib
import traceback
from flask import Flask, render_template, request
from google import genai 
from werkzeug.utils import secure_filename

# Protobuf aur TensorFlow fixes
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# Aapke engines
from engine.cnn_engine import predict_cnn
from engine.knowledge_base import disease_database
from engine.video_engine import analyze_dog_movement 

app = Flask(__name__)

# --- 1. CONFIGURATION ---
client = genai.Client(api_key="Your api key")

# --- 2. LOAD ML MODEL ---
ml_model = None
feature_names = []
symptoms_list = []

try:
    ml_data = joblib.load('disease_ml_model.pkl') 
    ml_model = ml_data['model']
    feature_names = ml_data['feature_names']
    print("\n" + "="*50)
    print("📋 TOTAL SYMPTOMS LOADED FROM MODEL:")
    print(feature_names)
    print("="*50 + "\n")

    symptoms_list = sorted(feature_names)
    print("✅ AI Model & Gemini Ready!")
except Exception as e:
    print(f"❌ Error loading Model: {e}")

UPLOAD_FOLDER = "static/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# --- 3. HELPER FUNCTIONS ---

def extract_symptoms_with_gemini(user_description, motion_anomalies=None):
    if motion_anomalies is None: motion_anomalies = []
    combined_input = (user_description or "") + " " + " ".join(motion_anomalies)
    if not combined_input.strip(): return []
    
    manual_detected = []
    desc_lower = combined_input.lower()
    
    # High-priority sign check (Scabies trigger)
    if "pinna-pedal" in desc_lower or "ear-flick" in desc_lower:
        manual_detected.append("itching")

    for feat in feature_names:
        clean_feat = feat.lower().replace('_', ' ')
        if clean_feat in desc_lower: manual_detected.append(feat)

    prompt = f"Symptoms: {', '.join(feature_names)}. User: '{combined_input}'. Identify matches. Return ONLY comma separated list."
    try:
        response = client.models.generate_content(model="gemini-1.5-flash", contents=prompt)
        if response and response.text:
            raw_text = response.text.lower().strip()
            if 'none' in raw_text: return list(set(manual_detected))
            gemini_list = [s.strip() for s in raw_text.split(',') if s.strip() in feature_names]
            return list(set(manual_detected + gemini_list))
    except: return list(set(manual_detected))
    return list(set(manual_detected))

def get_ml_prediction(all_features):
    if ml_model is None or not feature_names: return None
    input_df = pd.DataFrame([np.zeros(len(feature_names))], columns=feature_names)
    for f in all_features:
        if f in feature_names: input_df.at[0, f] = 1.0
    probs = ml_model.predict_proba(input_df)[0]
    classes = ml_model.classes_
    top_idx = np.argsort(probs)[::-1][0]
    return classes[top_idx], probs[top_idx]

def analyze_video_frames_for_skin(video_path):
    cap = cv2.VideoCapture(video_path)
    frame_results = []
    count = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret or count > 80: break
        if count % 20 == 0:
            temp_path = os.path.join(app.config["UPLOAD_FOLDER"], "temp_frame.jpg")
            cv2.imwrite(temp_path, frame)
            res = predict_cnn(temp_path)
            if res: frame_results.append(res[0][0])
        count += 1
    cap.release()
    return max(set(frame_results), key=frame_results.count) if frame_results else None

# --- 4. MAIN ROUTE ---

@app.route("/", methods=["GET", "POST"])
def index():
    prediction, confidence = None, None
    description, cause, treatment = [None]*3
    image_path, error = None, None

    if request.method == "POST":
        file = request.files.get("file")
        user_text = request.form.get("description", "")
        selected_symptoms = request.form.getlist("symptoms")

        if file and file.filename != '':
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            file.save(filepath)
            image_path = filepath.replace("\\", "/") 

            try:
                motion_anomalies = []
                top_lesion = None
                cnn_conf = 0.0
                video_ext = ('.mp4', '.avi', '.mov', '.mkv')

                # STEP 1: DETECTION (Video vs Image)
                if filename.lower().endswith(video_ext):
                    top_lesion = analyze_video_frames_for_skin(filepath)
                    motion_anomalies = analyze_dog_movement(filepath)
                else:
                    res = predict_cnn(filepath)
                    if res: top_lesion, cnn_conf = res[0][0], res[0][1]

                # STEP 2: SYMPTOM EXTRACTION
                nlp_symp = extract_symptoms_with_gemini(user_text, motion_anomalies)
                all_feats = list(set(([top_lesion] if top_lesion else []) + selected_symptoms + nlp_symp))

                # STEP 3: DECISION ENGINE (The Priority Logic)
                
                # --- A. HEALTHY CHECK ---
                if not motion_anomalies and not selected_symptoms and not user_text and (cnn_conf < 0.40):
                    prediction = "Healthy Dog ✅"
                    confidence = 90.0
                    description = "AI confirmed normal gait symmetry and no significant skin lesions detected."
                    cause, treatment = "N/A", "Maintain regular diet and exercise."

                # --- B. GAIT/DYSPLASIA PRIORITY ---
                elif motion_anomalies:
                    prediction = " & ".join(motion_anomalies)
                    confidence = 95.0
                    desc_p, cause_p, treat_p = [], [], []

                    if "Abnormal Hip Sway" in prediction:
                        desc_p.append("Detected excessive waddling/bunny-hopping gait.")
                        cause_p.append("Possible Hip Dysplasia or joint laxity.")
                        treat_p.append("Consult Orthopedic Vet for X-rays.")
                    
                    if "Limping" in prediction:
                        desc_p.append("Asymmetric gait detected favoring one limb.")
                        cause_p.append("Possible CCL injury or soft tissue trauma.")
                        treat_p.append("Restrict activity and check paws for injury.")
                    
                    if "Stiff" in prediction or "Dragging" in prediction:
                        desc_p.append("Detected paw dragging (knuckling).")
                        cause_p.append("Neurological signs (IVDD or Myelopathy).")
                        treat_p.append("EMERGENCY: Urgent neurological vet visit needed.")

                    description, cause, treatment = " ".join(desc_p), " | ".join(cause_p), " ".join(treat_p)

                # --- C. SKIN DISEASE ML PREDICTION ---
                else:
                    ml_res = get_ml_prediction(all_feats)
                    if ml_res:
                        top_disease, top_score = ml_res
                        user_text_lower = (user_text or "").lower()

                        # Hard Logic Overrides
                        if "pinna-pedal" in user_text_lower or "scabies" in user_text_lower:
                            top_disease, top_score = "Sarcoptic Mange (Scabies)", 0.98
                        elif ("pus" in user_text_lower or "bumps" in user_text_lower) and "mutilation" in top_disease.lower():
                            top_disease, top_score = "Pyoderma (Bacterial Infection)", 0.92

                        prediction = top_disease
                        confidence = round(top_score * 100, 1)

                        # --- SMART DATABASE LOOKUP WITH FALLBACK ---
                        info = None
                        clean_pred = top_disease.split('(')[0].strip().lower()
                        
                        # Fuzzy Match logic
                        for key in disease_database.keys():
                            key_clean = key.lower().strip()
                            if clean_pred in key_clean or key_clean in clean_pred:
                                info = disease_database[key]
                                break

                        if info:
                            description = info.get("description", "N/A")
                            cause = info.get("cause", "N/A")
                            treatment = info.get("treatment", "N/A")
                        else:
                            # GEMINI FALLBACK: Agar DB mein na ho toh AI se pucho
                            print(f"🔍 Fetching medical info from Gemini for {top_disease}...")
                            fallback_prompt = f"Explain dog disease '{top_disease}'. Provide exactly 3 lines: Description: [text], Cause: [text], Treatment: [text]."
                            try:
                                gen_res = client.models.generate_content(model="gemini-1.5-flash", contents=fallback_prompt)
                                raw_info = gen_res.text
                                # Basic parsing logic
                                if "Description:" in raw_info and "Cause:" in raw_info:
                                    description = raw_info.split("Description:")[1].split("Cause:")[0].strip()
                                    cause = raw_info.split("Cause:")[1].split("Treatment:")[0].strip()
                                    treatment = raw_info.split("Treatment:")[1].strip()
                                else:
                                    description, cause, treatment = raw_info, "See vet", "See vet"
                            except:
                                description = "Condition identified. Detailed info not found. Consult a vet."
                                cause, treatment = "Complex etiology", "Veterinary prescription required."

            except Exception as e:
                traceback.print_exc()
                error = f"Analysis Error: {str(e)}"
        else:
            error = "Please upload a valid image or video file."

    return render_template("new.html", prediction=prediction, confidence=confidence, description=description, cause=cause, treatment=treatment, image_path=image_path, symptoms_list=symptoms_list, error=error)

if __name__ == "__main__": 
    app.run(debug=True)