//esp8266 node mcu code for Library entry card
#include <ESP8266WiFi.h>
#include <FirebaseArduino.h>
#include <SoftwareSerial.h>
SoftwareSerial s(D6,D5);
#include <ArduinoJson.h>

#define WIFI_SSID "abc" 
#define WIFI_PASSWORD "asdfghjkl"

#define FIREBASE_HOST "my-sample-project-39d7e.firebaseio.com"
#define FIREBASE_AUTH "NXB1mirrr3nsAVw9bHKwihAHXKCeumrGMQiRycmN"

int solenoid=D2;
void setup() {
  // Initialize Serial port
  Serial.begin(115200);
  s.begin(115200);
  while (!Serial) continue;
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);   
  pinMode(solenoid,OUTPUT);
  //digitalWrite(D3,LOW);
  
}
 
void loop() {
  digitalWrite(solenoid,LOW);
  
  StaticJsonBuffer<1000> jsonBuffer;
  JsonObject& root = jsonBuffer.parseObject(s);
 
  if (root == JsonObject::invalid())
  {
    return;
  }
  
  String data1=root["uid"];
  
  Serial.println(data1);
  
  Firebase.setString("dataReceive/UID",data1);
  delay(1000);
  
  String fget=Firebase.getString("DoorControl/OpenClose"); 
  
  if(fget=="1"){
     digitalWrite(solenoid,HIGH);
     delay(3000);
     digitalWrite(solenoid,LOW);
     fget=="0";
     delay(3500);
     
  }else{
     digitalWrite(solenoid,LOW);
     delay(3000);
  }
  
 }
