


```
cd functions/
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
firebase deploy --only functions

firebase init emulators
firebase emulators:start


#vision api
GOOGLE_CLOUD_VISION_API_KEY=tu_clave_de_API
firebase functions:config:set vision.key="tu_clave_de_API"


```