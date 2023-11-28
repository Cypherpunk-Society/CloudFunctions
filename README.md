# Serverless Video Labeling

## 1. Firebase Login
```
firebase login
```

## 2. Setup Vision API
create an .env to storage the key
```
GOOGLE_CLOUD_VISION_API_KEY=your_api_key
```
then set as vision key
```
firebase functions:config:set vision.key="your_api_key"
```

## 3. Run CypherpunkVision API
Follow the steps on cypherpunks/
then install and use ngrok to use as as API service
```
./ngrok http 5000
```

## 4. Deploy CypherpunkVision and ImageRecognition Cloud Functions 
```
cd ImageRecognition/
firebase deploy
```
## 5. Deploy VideoRecognition Cloud Function 
```
cd ImageRecognition/
firebase deploy
```

## Firebase Functions emulators 
In case you want to test before deploy
```
firebase init emulators
firebase emulators:start
```


### Cloud Functions
![image](https://github.com/Cypherpunk-Society/CloudFunctions/assets/70419764/74e5de1b-5e2a-47fc-a301-3e58dda6f2ec)

### Firestore Database
![image](https://github.com/Cypherpunk-Society/CloudFunctions/assets/70419764/a8622531-c765-4c34-a823-f5f4ca934d9a)

### Firebase Storage
![image](https://github.com/Cypherpunk-Society/CloudFunctions/assets/70419764/3c1a805d-c219-44d9-ae89-999dfde75169)


## Demo

https://github.com/Cypherpunk-Society/CloudFunctions/assets/70419764/3d70148c-ef39-48e9-bb38-3919c9c65ed3

