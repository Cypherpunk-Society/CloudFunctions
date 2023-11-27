// script.js
let yolo;

function handleFileInput(event) {
    const fileInput = event.target;
    const file = fileInput.files[0];

    if (file) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        document.body.appendChild(img);

        // Initialize the YOLO model
        yolo = ml5.YOLO(img, modelLoaded);

        // When the image has loaded, make a prediction
        img.onload = function () {
            yolo.detect(gotResults);
        };

        // Handle errors during image loading
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
