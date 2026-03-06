# from engine.knowledge_base import disease_database

# def predict_disease(top_lesion, lesion_confidence, selected_symptoms):
     
#     # Healthy override rule
#     if lesion_confidence < 0.40 and len(selected_symptoms) == 0:
#         return [("Healthy", 1.0)]
#     if lesion_confidence < 0.40 and len(selected_symptoms) == 0:
#         return [("Healthy", 1.0)]

    
#     scores = {}

#     for disease, data in disease_database.items():

#         lesion_score = 0
#         symptom_score = 0

#         # Lesion Match
#         if top_lesion in data["lesions"]:
#             lesion_score = lesion_confidence

#         # Symptom Match
#         disease_symptoms = set(data["symptoms"])
#         user_symptoms = set(selected_symptoms)

#         if len(disease_symptoms) > 0:
#             match_count = len(disease_symptoms & user_symptoms)
#             symptom_score = match_count / len(disease_symptoms)

#         final_score = (0.6 * lesion_score) + (0.4 * symptom_score)

#         scores[disease] = final_score

#     sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)

#     return sorted_scores
# from engine.knowledge_base import disease_database

# def predict_disease(top_lesion, lesion_confidence, selected_symptoms):
    
#     # 1. Healthy override
#     if lesion_confidence < 0.25 and len(selected_symptoms) == 0:
#         return [("Healthy Skin", 1.0)]

#     # 2. Key "Anchor" Symptoms (The 'Red Flags')
#     # These are symptoms that almost exclusively belong to a few diseases.
#     anchors = {
#         "circular_patch": 3.0, "honey_crusts": 3.0, "rat_tail": 3.0,
#         "moving_flakes": 3.0, "long_claws": 2.5, "black_ear_wax": 2.5,
#         "orange_dots": 3.0, "blue_ear_tips": 3.0, "cauliflower_growth": 2.5
#     }

#     # 3. Conflict Rules (The 'Penalty' System)
#     # If a disease is "Dry" but user selects "Wet", we slash the score.
#     def calculate_penalties(disease_name, user_symptoms):
#         penalty = 0
#         # Example: If it's a dry scaling disease, but user says it's oozing
#         if "scaling" in disease_database[disease_name]["lesions"] and "wet_skin" in user_symptoms:
#             penalty += 0.3
#         return penalty

#     scores = {}

#     for disease, data in disease_database.items():
#         # A. Visual Match (CNN)
#         # We check if the AI-detected lesion (e.g., 'pus') is in the DB for this disease
#         lesion_match = 1.0 if top_lesion in data["lesions"] else 0.0
        
#         # B. Symptom Match (User Input)
#         user_set = set(selected_symptoms)
#         db_set = set(data["symptoms"])
        
#         if not user_set:
#             symptom_score = 0
#         else:
#             match_points = 0
#             for s in user_set:
#                 if s in db_set:
#                     # Give extra points for 'Anchor' symptoms
#                     match_points += anchors.get(s, 1.0)
#                 else:
#                     # Small penalty for symptoms the user checked that DON'T fit this disease
#                     match_points -= 0.2 
            
#             # Intersection (How many of the disease's standard symptoms did we find?)
#             coverage = len(user_set & db_set) / len(db_set) if db_set else 0
            
#             # Combine raw points with coverage
#             symptom_score = (match_points / len(user_set)) * 0.7 + (coverage * 0.3)

#         # C. Weighting & Final Fusion
#         # We trust the Symptoms 60% and the Visual CNN 40% 
#         # because users can see "itching" which a camera cannot.
#         final_score = (0.4 * (lesion_match * lesion_confidence)) + (0.6 * symptom_score)

#         # D. Apply Logic Penalties
#         final_score -= calculate_penalties(disease, selected_symptoms)

#         # Ensure no negative scores
#         scores[disease] = max(0, min(final_score, 0.99))

#     # Sort results
#     sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    
#     # If top score is very low, return "Unknown"
#     if sorted_scores[0][1] < 0.2:
#         return [("Consult a Veterinarian", 0.0)]

#     return sorted_scores
# from engine.knowledge_base import disease_database

# def predict_disease(top_lesion, lesion_confidence, selected_symptoms, user_description=""):
    
#     # 1. Natural Language Keyword Extraction
#     # Scan the description for symptoms if the user didn't check boxes
#     extracted_symptoms = []
#     if user_description:
#         description_lower = user_description.lower()
        
#         # Define a mapping of common words to your database keys
#         # This handles cases where people write "stinks" instead of "bad_odor"
#         keyword_map = {
#             "itching": "itching", "scratching": "itching", "itchy": "itching",
#             "smell": "bad_odor", "stink": "bad_odor", "odor": "bad_odor",
#             "hair loss": "hair_loss", "bald": "hair_loss", "thinning": "hair_loss",
#             "red": "redness", "inflamed": "redness",
#             "pus": "pus", "oozing": "skin_discharge", "discharge": "skin_discharge",
#             "pain": "pain", "hurts": "pain", "sore": "pain",
#             "scabs": "scabs", "crusty": "crusting", "crusts": "crusting",
#             "scales": "scaling", "dandruff": "scaling", "flaky": "scaling",
#             "circle": "circular_patch", "round": "circular_patch",
#             "swelling": "swelling", "lump": "lumps", "bump": "lumps",
#             "bleeding": "bleeding", "blood": "bleeding"
#         }

#         for keyword, mapped_symptom in keyword_map.items():
#             if keyword in description_lower:
#                 extracted_symptoms.append(mapped_symptom)

#     # Merge checkboxes and text-extracted symptoms
#     # Use set() to avoid duplicates
#     final_symptoms = list(set(selected_symptoms + extracted_symptoms))

#     # 2. Updated Healthy override
#     # Now checks if BOTH checkboxes AND extracted text are empty
#     if lesion_confidence < 0.25 and len(final_symptoms) == 0:
#         return [("Healthy Skin", 1.0)]

#     # 3. Key "Anchor" Symptoms (The 'Red Flags')
#     anchors = {
#         "circular_patch": 3.0, "honey_crusts": 3.0, "rat_tail": 3.0,
#         "moving_flakes": 3.0, "long_claws": 2.5, "black_ear_wax": 2.5,
#         "orange_dots": 3.0, "blue_ear_tips": 3.0, "cauliflower_growth": 2.5
#     }

#     # 4. Conflict Rules (The 'Penalty' System)
#     def calculate_penalties(disease_name, user_symptoms):
#         penalty = 0
#         if "scaling" in disease_database[disease_name]["lesions"] and "wet_skin" in user_symptoms:
#             penalty += 0.3
#         return penalty

#     scores = {}

#     for disease, data in disease_database.items():
#         # A. Visual Match (CNN)
#         lesion_match = 1.0 if top_lesion in data["lesions"] else 0.0
        
#         # B. Symptom Match (Checkbox + Text)
#         user_set = set(final_symptoms)
#         db_set = set(data["symptoms"])
        
#         if not user_set:
#             symptom_score = 0
#         else:
#             match_points = 0
#             for s in user_set:
#                 if s in db_set:
#                     match_points += anchors.get(s, 1.0)
#                 else:
#                     match_points -= 0.2 
            
#             coverage = len(user_set & db_set) / len(db_set) if db_set else 0
#             symptom_score = (match_points / len(user_set)) * 0.7 + (coverage * 0.3)

#         # C. Weighting & Final Fusion
#         # If user provided a description but no image info, boost symptom weight
#         if lesion_confidence < 0.1:
#             final_score = symptom_score
#         else:
#             final_score = (0.4 * (lesion_match * lesion_confidence)) + (0.6 * symptom_score)

#         # D. Apply Logic Penalties
#         final_score -= calculate_penalties(disease, final_symptoms)

#         scores[disease] = max(0, min(final_score, 0.99))

#     # Sort results
#     sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    
#     if not sorted_scores or sorted_scores[0][1] < 0.15:
#         return [("Consult a Veterinarian", 0.0)]

#     return sorted_scores
import spacy
from engine.knowledge_base import disease_database

# Load SpaCy NLP model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    # Fallback if model isn't downloaded
    import os
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

def extract_symptoms_nlp(text):
    """Uses NLP to extract symptoms and handle negations (e.g., 'no itching')"""
    if not text or len(text.strip()) < 3:
        return []
    
    doc = nlp(text.lower())
    extracted = []
    
    symptom_map = {
        "itching": ["itching", "scratching", "itchy", "bites", "scratch", "biting", "licking paws"],
        "bad_odor": ["smell", "stink", "odor", "stinky", "smelly", "scent", "musty"],
        "hair_loss": ["hair loss", "bald", "thinning", "losing hair", "alopecia"],
        "redness": ["red", "inflamed", "rash", "redness", "pink", "irritated"],
        "circular_patch": ["round", "circle", "circular", "ring", "oval"],
        "pus": ["pus", "oozing", "discharge", "liquid", "weeping", "wet", "sticky"],
        "scaling": ["flaky", "dandruff", "scales", "scaling", "dry skin"],
        "pain": ["pain", "sore", "hurts", "tender", "cries"],
        "scabs": ["scab", "crust", "crusty", "yellow crusts"],
        "lethargy": ["lazy", "tired", "lethargic", "weight gain"], # New for Hypothyroidism
        "rat_tail": ["rat tail", "thin tail"] # New for Hypothyroidism
    }

    for sent in doc.sents:
        for symptom_key, variations in symptom_map.items():
            for var in variations:
                if var in sent.text:
                    # NLP Negation Detection: Look for 'no', 'not', 'never', 'without'
                    # Example: "He is NOT scratching" -> tokens 'not' (neg) + 'scratching'
                    is_negated = False
                    for token in sent:
                        if token.lemma_ in ["no", "not", "never", "without", "don't", "doesn't"]:
                            # Check if the negation is close to our symptom word
                            is_negated = True
                            break
                    
                    if not is_negated:
                        extracted.append(symptom_key)
    
    return list(set(extracted))

# def predict_disease(cnn_lesion, cnn_confidence, selected_symptoms, user_description=""):
#     """
#     Final Decision Engine: Combines CNN, Checkboxes, and NLP Description.
#     """
#     # 1. Extract symptoms from text description using NLP
#     nlp_extracted = extract_symptoms_nlp(user_description)
    
#     # 2. Merge all symptoms (Checkboxes + NLP)
   
#     final_symptoms = list(set(selected_symptoms + nlp_extracted))
#     # If the CNN is not confident AND no symptoms are reported/found
#     if cnn_confidence < 0.35 and len(final_symptoms) == 0:
#         return [("Healthy Skin", 0.95)]
    
#     # If CNN sees 'normal' or 'clear' skin specifically (depending on your model classes)
#     if cnn_lesion.lower() in ["healthy", "normal", "clear_skin"] and cnn_confidence > 0.7:
#         if len(final_symptoms) == 0:
#             return [("Healthy Skin", 0.98)]
#     scores = {}

#     for disease, data in disease_database.items():
#         # Start with base score from CNN (30% weight)
#         # We check if the CNN identified the 'type' of lesion correctly
#         score = 0
#         if cnn_lesion in data.get("lesion_types", []):
#             score += (cnn_confidence * 0.2)

#         # 3. Symptom Matching (70% weight)
#         matched_symptoms = set(final_symptoms) & set(data["symptoms"])
        
#         # Base Points for each match
#         score += (len(matched_symptoms) * 0.4)

#         # 4. Anchor Symptom Logic (Extra 0.5 points for unique signatures)
#         # These are symptoms that are very specific to one disease
#         anchors = data.get("anchors", [])
#         for anchor in anchors:
#             if anchor in final_symptoms:
#                 score += 0.5

#         # 5. Penalty Logic (Subtract if a required symptom is missing)
#         # Example: If it's Mange but NO itching is reported, reduce score
#         required = data.get("required_symptoms", [])
#         for req in required:
#             if req not in final_symptoms and len(final_symptoms) > 0:
#                 score -= 0.3

#         scores[disease] = round(score, 2)

#     # Sort diseases by score
#     sorted_diseases = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    
#     # Format the results for the frontend
#     results = []
#     for name, score in sorted_diseases[:3]: # Return Top 3
#         # Ensure we don't show negative scores
#         final_conf = max(0, min(score, 0.99)) 
#         results.append((name, final_conf))

#     # If nothing matches at all
#     if not results or results[0][1] < 0.1:
#         return [("Unknown Condition", 0.1)]

#     return results
def predict_disease(cnn_lesion, cnn_confidence, selected_symptoms, user_description=""):
    """
    Improved Engine: Prioritizes Symptoms over CNN to avoid the 'Always Healthy' bug.
    """
    # 1. Extract and Merge
    nlp_extracted = extract_symptoms_nlp(user_description)
    final_symptoms = list(set(selected_symptoms + nlp_extracted))
    
    # DEBUG: See what the AI is actually detecting in your terminal
    print(f"DEBUG: NLP found: {nlp_extracted}")
    print(f"DEBUG: Final symptom list for scoring: {final_symptoms}")

    # ==========================================
    # 2. THE SCORING LOOP (Always run this if symptoms exist!)
    # ==========================================
    scores = {}

    for disease, data in disease_database.items():
        if disease == "Healthy Skin":
            continue # We handle healthy as a separate condition below
            
        score = 0
        
        # CNN Match (30% contribution)
        if cnn_lesion in data.get("lesion_types", []):
            score += (cnn_confidence * 0.3)

        # Symptom Matching (Highest Priority)
        matched_symptoms = set(final_symptoms) & set(data.get("symptoms", []))
        
        # We give 0.5 points per match to ensure symptoms can "overrule" a confused CNN
        score += (len(matched_symptoms) * 0.5)

        # Anchor Bonus (Unique signatures)
        for anchor in data.get("anchors", []):
            if anchor in final_symptoms:
                score += 0.6

        # Penalty Logic
        for req in data.get("required_symptoms", []):
            if req not in final_symptoms and len(final_symptoms) > 0:
                score -= 0.4

        scores[disease] = round(score, 2)

    # Sort the results
    sorted_diseases = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    
    
    # 3. SMART HEALTHY VS DISEASE DECISION
   
    # If we have matches with a decent score, return those
    if sorted_diseases and sorted_diseases[0][1] > 0.2:
        results = []
        for name, score in sorted_diseases[:3]:
            # Normalize for UI (Convert score to a 0-1 scale)
            final_conf = max(0.1, min(score, 0.99))
            results.append((name, final_conf))
        return results

    # If NO symptoms matched and CNN is either "Healthy" or very low confidence
    if len(final_symptoms) == 0:
        if cnn_lesion.lower() in ["healthy", "normal"] or cnn_confidence < 0.4:
            return [("Healthy Skin", 0.95)]

    # Absolute Fallback
    return [("Unknown / Healthy", 0.90)]