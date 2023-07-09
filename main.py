import json
import requests
host = 'http://127.0.0.1:3000/user'


user = {
    'username': 'username',
    'password': '123456'
}

def sendPost(data):
    requests.post(host, data = data)


def sendGet():
    r = requests.get(host)
    return r.text

#h = sendGet()

def sendPut(data):
    requests.put(host, data = data)

def delete():
    requests.delete(host)

#delete()
#sendPut(json.dumps(user))
# print(json.loads(h))
sendPost(json.dumps(user))