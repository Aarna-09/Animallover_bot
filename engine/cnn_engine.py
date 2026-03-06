import os
# Protobuf error ko bypass karne ke liye ye line sabse upar rakhein
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"

import tensorflow as tf
import numpy as np

MODEL_PATH = "models/lesion_weights.h5"
IMG_SIZE = 224

# Build SAME architecture as training
base_model = tf.keras.applications.EfficientNetB0(
    weights=None,
    include_top=False,
    input_shape=(IMG_SIZE, IMG_SIZE, 3)
)

base_model.trainable = False

model = tf.keras.Sequential([
    base_model,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dense(128, activation="relu"),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(6, activation="softmax")
])

# Load weights
model.load_weights(MODEL_PATH)

class_names = [
    "hair_loss",
    "normal",
    "pus",
    "redness",
    "scaling",
    "wet_lesion"
]

def predict_cnn(image_path):

    img = tf.keras.preprocessing.image.load_img(
        image_path,
        target_size=(IMG_SIZE, IMG_SIZE)
    )

    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0

    preds = model.predict(img_array)[0]

    results = []
    for i, score in enumerate(preds):
        results.append((class_names[i], float(score)))

    results = sorted(results, key=lambda x: x[1], reverse=True)

    return results
