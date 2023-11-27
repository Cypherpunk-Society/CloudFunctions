const { Storage } = require('@google-cloud/storage');
const { PubSub } = require('@google-cloud/pubsub');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const storage = new Storage();
const pubsub = new PubSub();
const topicName = 'process-video'; // Reemplaza con tu nombre de tema
const subscriptionName = 'process-video-sub'; // Reemplaza con tu nombre de suscripción

// Función para procesar mensajes de Pub/Sub
async function processMessage(message) {
  const data = JSON.parse(Buffer.from(message.data, 'base64').toString());
  const videoPath = data.videoPath;
  const bucketName = data.bucketName;
  const videoName = data.videoName;

  // Descarga el video
  const localVideoPath = `/tmp/${videoName}`;
  await storage.bucket(bucketName).file(videoPath).download({ destination: localVideoPath });

  // Procesa el video con ffmpeg
  const frameOutputPath = `/tmp/frames/${videoName}/frame-%03d.png`;
  ffmpeg(localVideoPath)
    .output(frameOutputPath)
    .on('end', async () => {
      // Sube los frames a Cloud Storage
      const frameDir = path.dirname(frameOutputPath);
      const files = fs.readdirSync(frameDir);
      for (const file of files) {
        const framePath = path.join(frameDir, file);
        await storage.bucket(bucketName).upload(framePath, {
          destination: `Frames/${videoName}/${file}`,
        });
      }

      // Limpieza: elimina los archivos locales
      fs.unlinkSync(localVideoPath);
      files.forEach(file => fs.unlinkSync(path.join(frameDir, file)));
    })
    .run();
}

// Escucha los mensajes de Pub/Sub
const subscription = pubsub.subscription(subscriptionName);
subscription.on('message', message => {
  console.log('Mensaje recibido', message.data.toString());
  processMessage(message).catch(console.error);
  message.ack();
});
