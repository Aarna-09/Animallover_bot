import cv2
import numpy as np
from ultralytics import YOLO

pose_model = YOLO(r'C:\ml_projects\Animalslover2\models\best.pt')

def analyze_dog_movement(video_path):
    cap = cv2.VideoCapture(video_path)
    anomalies = []
    left_hind_paws = []
    right_hind_paws = []
    hip_points_x = []
    frame_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break

        if frame_count % 2 == 0:
            results = pose_model(frame, verbose=False)
            for r in results:
                if r.keypoints and r.keypoints.xyn is not None:
                    kp = r.keypoints.xyn[0].cpu().numpy()
                    
                    for i, point in enumerate(kp):
                        print(f"Index {i}: {point}")
                    # YOLOv11 Dog Pose (24 points) mapping:
                    # Hind Paws: 22 (Left), 23 (Right) - Approximate based on Stanford Pose
                    # Hips: 19 (Left Hip), 20 (Right Hip)
                    if len(kp) >= 23:
                        left_hind_paws.append(kp[22][1]) 
                        right_hind_paws.append(kp[23][1])
                        
                        # Hip Sway check ke liye central point
                        center_hip_x = (kp[19][0] + kp[20][0]) / 2  
                        hip_points_x.append(center_hip_x)
        
        frame_count += 1
        if frame_count > 150: break

    cap.release()

        
    if len(left_hind_paws) > 15:
       
        # 1. Lift Analysis
        sway_score = np.std(hip_points_x)
        l_lift = np.ptp(left_hind_paws)
        r_lift = np.ptp(right_hind_paws)
        
        print(f"📊 Live Stats -> Sway: {sway_score:.4f}")

        # 2. Logic Condition 
        if sway_score > 0.045: 
            anomalies.append("Abnormal Hip Sway (Signs of Hip Dysplasia)")
        
        if abs(l_lift - r_lift) > 0.055:
            anomalies.append("Limping / Asymmetric Hind Gait")

    
    return anomalies