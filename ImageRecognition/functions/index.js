
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const vision = require('@google-cloud/vision');

// Inicializa la aplicación Firebase y el cliente de Vision
admin.initializeApp();
const client = new vision.ImageAnnotatorClient();

exports.ImageRecognition = functions.storage.object().onFinalize(async (object) => {
  // ... (tu código existente)

  // Comprueba si el archivo es una imagen
  if (!object.contentType.startsWith("image/")) {
    console.log("Este archivo no es una imagen.");
    return null;
  }

  // Realizar la detección de etiquetas en la imagen
  const [result] = await client.labelDetection(`gs://${object.bucket}/${object.name}`);
  const labels = result.labelAnnotations;
  console.log("Etiquetas encontradas:", labels.map(label => label.description));

  // Subir las etiquetas a Firebase Firestore
  const db = admin.firestore();
  const docRef = db.collection('Images');
  await docRef.add({ 
    imageName: object.name,
    labels: labels.map(label => label.description) // Guarda solo las descripciones de las etiquetas
  });

  return null; // Termina la ejecución de la función
});
