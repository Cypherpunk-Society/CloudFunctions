
# AI vision as service


## Deploy 

```
sudo apt-get install apt-transport-https ca-certificates gnupg curl sudo
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list

sudo apt-get update && sudo apt-get install google-cloud-cli
gcloud init
gcloud app deploy
```

## start

```
  python3 -m venv venv
  source venv/bin/activate
  pip3 install -r requirements.txt
```


## Demo 

the app should running on http://127.0.0.1:5000

```
curl -X POST -H "Content-Type: application/json" -d '{"url": <image url>}' http://127.0.0.1:5000/detect

```