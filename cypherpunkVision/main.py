import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
from tensorflow.keras.preprocessing import image
import numpy as np
import requests
from PIL import Image
from io import BytesIO



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

# url_imagen = "https://www.hogarmania.com/archivos/201911/aves-848x477x80xX.jpg"
url_imagen = "https://firebasestorage.googleapis.com/v0/b/cypherpunks-14935.appspot.com/o/wolf.jpg?alt=media&token=14e5675d-ab82-4a22-b04b-aa3c755ddf6b"
resultados = detectar_objetos(url_imagen)
for resultado in resultados:
    print(resultado)

