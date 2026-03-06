import os
from engine.video_engine import analyze_dog_movement

dataset_path = "C:/ml_projects/Animalslover2/Test_Dataset"
folders = {
    "Healthy": "Healthy",     
    "Dysplasia": "Dysplasia"
}

total_videos = 0
correct_predictions = 0

for folder_name, expected_label in folders.items():
    folder_path = os.path.join(dataset_path, folder_name)
    if not os.path.exists(folder_path): continue
    
    print(f"\n--- Testing {folder_name} Videos (Expected: {expected_label}) ---")
    
    for video in os.listdir(folder_path):
        video_full_path = os.path.join(folder_path, video)
        results = analyze_dog_movement(video_full_path) # Ye list return karta hai
        
        if results and len(results) > 0:
           
            is_abnormal_detected = True 
        else:
            is_abnormal_detected = False
        
        # Prediction check
        predicted_label = "Dysplasia" if is_abnormal_detected else "Healthy"
        
        total_videos += 1
        if predicted_label == expected_label:
            correct_predictions += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
            
        print(f"Video: {video} | AI: {predicted_label} | {status}")

# --- FINAL ACCURACY ---
if total_videos > 0:
    accuracy = (correct_predictions / total_videos) * 100
    print("\n" + "="*30)
    print(f"TOTAL VIDEOS: {total_videos}")
    print(f"CORRECT: {correct_predictions}")
    print(f"ACCURACY: {accuracy:.2f}%")
    print("="*30)