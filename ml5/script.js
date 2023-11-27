// script.js
let yolo;


// Cambia la inicialización de YOLO a ObjectDetector
function setup() {
    objectDetector = ml5.objectDetector('cocossd', modelLoaded);
}

function modelLoaded() {
    console.log('Model Loaded!');
}



function handleFileInput(event) {
    const fileInput = event.target;
    const file = fileInput.files[0];

    if (file) {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = function () {
            // Asegúrate de que la imagen esté completamente cargada
            setup(); // Inicializa el detector de objetos
            objectDetector.detect(img, gotResults); // Llama a la detección
        };

        img.onerror = function () {
            console.error('Error loading the image.');
        };
    }
}



function modelLoaded() {
    console.log('YOLO Model Loaded!');
}

function gotResults(error, results) {
    if (error) {
        console.error('Error during YOLO prediction:', error);
    } else {
        console.log('YOLO Prediction Results:', results);

        // Display the top 5 predictions in the console
        for (let i = 0; i < Math.min(results.length, 5); i++) {
            console.log(`Prediction ${i + 1}: ${results[i].label} (Confidence: ${results[i].confidence})`);
        }
    }
}
