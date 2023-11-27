
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

  for (const label of labels) {
    const labelDesc = label.description;
    const docRef = db.collection('ImageLabels').doc(labelDesc);
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