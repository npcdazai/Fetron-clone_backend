import requests
import json
import pymongo

try:
  myclient = pymongo.MongoClient("mongodb+srv://data_IT:data_IT@apml.6w5pyjg.mongodb.net/Fetron2",tls=True,tlsAllowInvalidCertificates=True)

  mycollection = myclient["Fetron2"]["live_data"]

  collect_data=mycollection.find()

  url = "http://203.115.101.54/mobileapp/vehilestatus_api.php?token=4626"

  payload = {}
  headers = {
    'Cookie': 'PHPSESSID=h1cu19os0gp256g32telk202b4'
  }

  print("Fetching data from API... ")
  response = requests.request("GET", url, headers=headers, data=payload)

  print("Data fetched successfully fetched from API... ")

  # print(response.json())
  # ff=open("response.txt","w")
  # ff.write(response.text)
  # tt=response.text[1: -1]
  # print(json.loads(tt))
  # tt='[{"name": 1,"age": 2}]'

  # tt=tt[1: -1]
  # print(json.loads(tt))
  # print(json.loads(tt))

  # ff=open("response.txt","r")
  # tt=ff.read()

  print("Loading JSON Data...")

  tt=response.text
  tt=tt.replace("\\\n","")
  tt=tt.replace("\\n","")
  tt=tt.replace("\n","")
  # print(json.loads(tt))

  tt=json.loads(tt)
  # t2=open("response2.json","a")
  # t2.write(json.dumps(tt,indent=4))

  print("Inserting the data into the database...")

  mycollection.insert_many(tt)


  print("Successful!")
except Exception as e:
  print("Some error occurred")
  print(e)
# tt=json.dump(tt)
# tt=tt[1:61620]
# tf=open("response2.json","w")
# jt=json.loads(tt)


# rf=open("response2.json","r")
# # r_data=rf.read()
# # if(r_data):
#     # r_data=json.loads(r_data)
# r_data=json.load(rf)
# data_arr={}

# print(r_data)

# for veh in jt:
#     vname=veh["vname"]
#     if(r_data and (vname in r_data)):
#         print("yes")
#         vd=r_data[vname]
#         vd.append({vname: veh})
#         data_arr[vname]=vd
#     else:
#         data_arr[vname]=[veh]

# tf.write(json.dumps(data_arr,indent=4))
# print(data_arr)
# tf.write(json.dumps(data_arr,indent=4))

# print(mycollection)

# mycollection.insert_many(jt)
# print(jt[0])
# json.loads(tt)
# print(json.loads(tt))