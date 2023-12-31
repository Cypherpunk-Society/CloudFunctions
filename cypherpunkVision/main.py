
from flask import Flask, request, jsonify
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
from tensorflow.keras.preprocessing import image
import numpy as np
import requests
from PIL import Image
from io import BytesIO

app = Flask(__name__)

# Cargar modelo preentrenado de MobileNetV2
modelo = MobileNetV2(weights='imagenet')

def preprocesar_imagen(url):
    respuesta = requests.get(url)
    img = Image.open(BytesIO(respuesta.content))
    img = img.resize((224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    return img_array

def detectar_objetos(url):
    img = preprocesar_imagen(url)
    predicciones = modelo.predict(img)
    return decode_predictions(predicciones, top=3)[0]

@app.route('/detect', methods=['POST'])
def detect():
    content = request.json
    url_imagen = content['url']
    resultados = detectar_objetos(url_imagen)
    return jsonify([{"label": res[1], "confidence": float(res[2])} for res in resultados])

@app.route('/', methods=['GET'])
def hello():
    return "cypherpunk vision"

if __name__ == '__main__':
    app.run(debug=False)
