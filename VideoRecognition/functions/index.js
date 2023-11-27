
//firebase
const functions = require("firebase-functions");
const { FieldValue } = require("firebase-admin/firestore");
const admin = require("firebase-admin");
const vision = require('@google-cloud/vision');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const { Storage } = require('@google-cloud/storage');
const os = require('os');
const path = require('path');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
admin.initializeApp();
const client = new vision.ImageAnnotatorClient();
const storage = new Storage();
const bucketName = "cypherpunks-14935.appspot.com"; // Reemplazar con el nombre de tu bucket
const frameRate = 1

const runtimeOpts = {
    timeoutSeconds: 540, 
    memory: '1GB'
}

exports.VideoFrameAnalysis = functions.runWith(runtimeOpts).storage.object().onFinalize(async (object) => {
     // Verifica si el archivo es un video
    if (!object.contentType.startsWith("video/")) {
        console.log("Este archivo no es un video.");
        return null;
    }

    // Construye la ruta del archivo sin el prefijo 'gs://'
    const filePath = object.name;

    // console.log("Nombre del archivo:", object.name);
    // console.log("Ruta del archivo:", filePath);

    // Extrae frames del video
    const { frames, tempLocalFile, frameDir } = await extractFramesFromVideo(filePath);


    // Subir frames a Firebase Storage y analizar con Vision API
    const frameStoragePath = `Frames/${path.basename(filePath)}`;
    for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        // const frameName = path.basename(frame);
        const frameName = `frame_${String(i).padStart(4, '0')}.png`;
        const frameUploadPath = `${frameStoragePath}/${frameName}`;
        await storage.bucket(bucketName).upload(frame, {destination: frameUploadPath});
       

        
        const [result] = await client.labelDetection(frame);
        const labels = result.labelAnnotations;
        // console.log(`Etiquetas encontradas en frame ${i}: ${labels.map(label => label.description)}`);

        // Subir las etiquetas y la información del frame a Firestore
        const db = admin.firestore();

        // Actualizar el índice invertido para cada etiqueta
        for (const label of labels) {
            const labelDesc = label.description;
            const labelRef = db.collection('VideosLabels').doc(labelDesc);
            const labelDoc = await labelRef.get();
            if (!labelDoc.exists) {
                await labelRef.set({ frames: [frameUploadPath] });
            } else {
                await labelRef.update({
                    frames: FieldValue.arrayUnion(frameUploadPath)
                });
            }
        }
    }

    // clean
    await cleanUp(tempLocalFile, frameDir);

    return null;
});




async function extractFramesFromVideo(filePath) {

    const storage = new Storage();
    const uniqueSuffix = `${Date.now()}-${Math.random()}`; // Genera un sufijo único
    const tempLocalFile = path.join(os.tmpdir(), `${path.basename(filePath)}-${uniqueSuffix}`);
    const tempLocalDir = path.dirname(tempLocalFile);
    const frameDir = path.join(tempLocalDir, 'frames');
    const bucketName = "cypherpunks-14935.appspot.com";

    // console.log("Archivo temporal local:", tempLocalFile);
    // Verifica y limpia si es necesario
    if (fs.existsSync(tempLocalFile)) {
        // console.log("El archivo temporal ya existe, eliminándolo...");
        fs.unlinkSync(tempLocalFile); // Elimina si es un archivo
    }

    // Descarga el video del bucket a la máquina local
    try {
        // console.log("Iniciando descarga del archivo...");
        await storage.bucket(bucketName).file(filePath).download({ destination: tempLocalFile });
        // console.log("Archivo descargado correctamente");
    } catch (error) {
        console.error("Error al descargar el archivo:", error);
        throw error;
    }

    // console.log("Archivo descargado:", tempLocalFile);

    // Asegúrate de que el directorio de frames exista
    if (!fs.existsSync(frameDir)) {
        fs.mkdirSync(frameDir);
    }

    return new Promise((resolve, reject) => {
        ffmpeg(tempLocalFile)
            .on('end', function () {
                fs.readdir(frameDir, (err, files) => {
                    if (err) {
                        reject(err);
                    } else {
                        // Devuelve las rutas de los frames extraídos
                        resolve({ frames: files.map(file => path.join(frameDir, file)), tempLocalFile, frameDir });
                    }
                });
            })
            .on('error', function (err) {
                reject(err);
            })
            .outputOptions([`-vf fps=${frameRate}`])
            .output(path.join(frameDir, 'frame_%04d.png'))
            .run();
    });
}


async function cleanUp(tempLocalFile, frameDir) {
    try {
        // Elimina el directorio de frames
        if (fs.existsSync(frameDir)) {
            fs.rmdirSync(frameDir, { recursive: true });
            console.log('Directorio de frames eliminado.');
        }

        // Elimina el archivo de video temporal
        if (fs.existsSync(tempLocalFile)) {
            fs.unlinkSync(tempLocalFile);
            console.log('Archivo de video temporal eliminado.');
        }
    } catch (err) {
        console.error('Error durante la limpieza:', err);
    }
}
