
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const vision = require('@google-cloud/vision');

// Inicializa la aplicación Firebase y el cliente de Vision
admin.initializeApp();
const client = new vision.ImageAnnotatorClient();

exports.ImageRecognition = functions.storage.object().onFinalize(async (object) => {

  // Comprueba si el archivo es una imagen
  if (!object.contentType.startsWith("image/")) {
    console.log("Este archivo no es una imagen.");
    return null;
  }

  const isInRootDirectory = !object.name.includes('/');
  if (!isInRootDirectory) {
    console.log("La imagen está en una subcarpeta, no se procesará.");
    return null;
  }

  // Realizar la detección de etiquetas en la imagen
  const [result] = await client.labelDetection(`gs://${object.bucket}/${object.name}`);
  const labels = result.labelAnnotations;
  console.log("Etiquetas encontradas:", labels.map(label => label.description));

  // Subir las etiquetas a Firebase Firestore
  const db = admin.firestore();

  for (const label of labels) {
    const labelDesc = label.description;
    const docRef = db.collection('ImagesLabels').doc(labelDesc);
    const doc = await docRef.get();

    if (!doc.exists) {
      await docRef.set({ images: [object.name] });
    } else {
      await docRef.update({
        images: admin.firestore.FieldValue.arrayUnion(object.name)
      });
    }
  }

  return null; // Termina la ejecución de la función
});


const axios = require('axios');
exports.CypherpunkVision = functions.storage.object().onFinalize(async (object) => {

  // Comprueba si el archivo es una imagen
  if (!object.contentType.startsWith("image/")) {
    console.log("Este archivo no es una imagen.");
    return null;
  }

  const isInRootDirectory = !object.name.includes('/');
  if (!isInRootDirectory) {
    console.log("La imagen está en una subcarpeta, no se procesará.");
    return null;
  }

  // Construir la URL de la imagen
  const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${object.bucket}/o/${encodeURIComponent(object.name)}?alt=media`;

  try {
    // Hacer la solicitud a tu API
    const response = await axios.post('https://e91a-2800-200-f410-cf5-f1d9-acc3-c515-baf1.ngrok-free.app/detect', { url: imageUrl });
    const labels = response.data;

    // Subir las etiquetas a Firebase Firestore
    const db = admin.firestore();

    for (const label of labels) {
      const labelDesc = label.label;
      const docRef = db.collection('CypherpunkVisionLabels').doc(labelDesc);
      const doc = await docRef.get();

      if (!doc.exists) {
        await docRef.set({ images: [object.name] });
      } else {
        await docRef.update({
          images: admin.firestore.FieldValue.arrayUnion(object.name)
        });
      }
    }
  } catch (error) {
    console.error("Error al procesar la imagen:", error);
  }

  return null;
});

