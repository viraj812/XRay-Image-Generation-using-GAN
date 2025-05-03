from flask import Flask, send_from_directory, send_file
from flask_cors import CORS
import numpy as np
import tensorflow as tf
from io import BytesIO
import os
import cv2
from PIL import Image

app = Flask(__name__, static_folder='../build')
CORS(app)

# Serve model files
@app.route('/model/<path:filename>')
def serve_model(filename):
    return send_from_directory('../model', filename)

@app.route('/api/generate', methods=['GET'])
def generate_image():
    try:
        # Load the generator model
        generator = tf.keras.models.load_model('../model/xray_generator.keras')
        
        # Generate random noise
        noise = np.random.normal(0, 1, (3, 500))
        
        # Generate image using the model
        generated_image = generator.predict(noise)
        
        # Rescale the image from [-1, 1] to [0, 255]
        generated_image = (generated_image + 1) * 127.5
        generated_image = generated_image.astype(np.uint8)
        
        # Remove the batch dimension
        generated_image = generated_image[0]
        
        # Convert single-channel grayscale to RGB
        if generated_image.shape[-1] == 1:
            generated_image = np.repeat(generated_image, 3, axis=-1)
        
        # Convert to PIL Image and save to bytes
        img = Image.fromarray(generated_image)
        img_bytes = BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        return send_file(img_bytes, mimetype='image/png')
    except Exception as e:
        print(f"Error generating image: {str(e)}")
        print(f"Image shape: {generated_image.shape if 'generated_image' in locals() else 'Not generated'}")
        return str(e), 500

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000) 