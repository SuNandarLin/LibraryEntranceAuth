//index.js
var button = document.getElementById("button");
var head = document.getElementById("head");
var mytable = document.getElementById("mytable");
var firstNumChild=0;

function dateTime(){
  var today = new Date();
        var dateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()
                      +' ('+today.getHours() + ":" +today.getMinutes()+')';
    return ''+dateTime;
}
function dataMonitor(){
  for(var i = mytable.rows.length-1; i > 0; i--){
    mytable.deleteRow(i);
  }
  var tranRef= firebase.database().ref().child('Transactions_today'); 
  tranRef.once('value',function(snapshot) {

    snapshot.forEach(function(child) {  

      var eachTranRef=tranRef.child(child.key);
      eachTranRef.once("value", function(snapshot) {

        var row=mytable.insertRow(1);
        var Name_Status=row.insertCell(0);
        var Entry_leave=row.insertCell(1);
        var Status=row.insertCell(2);
          
        snapshot.forEach(function(child) {         
          
          if(child.key=='UID'){
            var UIDRef=firebase.database().ref().child('users').child(child.val());
            UIDRef.once("value",function(snapshot){

              if(snapshot.val()!==null){
                var temp;

                snapshot.forEach(function(child){    
                            
                  if(child.key=='Name' || child.key=='Status'){                 
                    if(child.key=='Name'){
                      temp=child.val();
                    }else{
                      temp+=' ('+child.val()+')';
                      Name_Status.appendChild(document.createTextNode(temp));
                    }                 
                  }               
                });
              
              }else{ 
                Name_Status.appendChild(document.createTextNode('Accessed UID: '+child.val()));
              }
            });
          }else if(child.key!=='Status'){
            Entry_leave.appendChild(document.createTextNode(child.key+': '+child.val()+'    '));
          }else{
            Status.appendChild(document.createTextNode(child.val()));
          }                  
        });        
      });
    });  
  });
}

function myclick(){
 
  var sourceRef=firebase.database().ref().child('users');
  var receiveRef= firebase.database().ref().child('dataReceive');
  var tranRef= firebase.database().ref().child('Transactions_today');
  var DoorRef= firebase.database().ref().child('DoorControl');

  receiveRef.on('child_changed',snap => { 

    var uid;
    receiveRef.child('UID').on('value',function(snapshot){
      uid=snapshot.val();
    });

    var ref1= sourceRef.child(uid);  
    ref1.once('value').then(function(snapshot) {
      var datetime=dateTime();  
      if(snapshot.val()==null){
        tranRef.once('value').then(function(snapshot){
          if(snapshot.val()==null){ // transactions htel mhar no tran case-- denied
            tranRef.child('tran_1').child('UID').set(uid);
            tranRef.child('tran_1').child('Status').set('Access Denied');
            DoorRef.child('OpenClose').set('0');
            tranRef.child('tran_1').child('Access time').set(datetime);
            dataMonitor();
          }else{
            var count=snapshot.numChildren(); // yoe yoe denied
            count++;
            tranRef.child('tran_'+count).child('UID').set(uid);
            tranRef.child('tran_'+count).child('Status').set('Access Denied');
            DoorRef.child('OpenClose').set('0');
            tranRef.child('tran_'+count).child('Access time').set(datetime);
            dataMonitor();
          }
        });      
      }else{
        tranRef.once('value').then(function(snapshot){
        
          if(snapshot.val()==null){ // transactions htel mhar no tran case-- authorized
            tranRef.child('tran_1').child('UID').set(uid);
            tranRef.child('tran_1').child('Status').set('Authorized Access');
            DoorRef.child('OpenClose').set('1');
            tranRef.child('tran_1').child('Entry time').set(datetime);
            dataMonitor();
          }else{
            var last_tran;
            var count=snapshot.numChildren();
            var queryRef=tranRef.orderByChild('UID').equalTo(uid);
            queryRef.once('value',function(snapshot) {

              snapshot.forEach(function(child) {
                last_tran=child.key;
              });
          
              if(last_tran==null){
                count++;
                tranRef.child('tran_'+count).child('UID').set(uid);
                tranRef.child('tran_'+count).child('Status').set('Authorized Access');
                DoorRef.child('OpenClose').set('1');
                tranRef.child('tran_'+count).child('Entry time').set(datetime);
                dataMonitor();
              }else{
                exitRef=tranRef.child(last_tran).child('Leave time');
                exitRef.once('value').then(function(snapshot){
                  if(snapshot.val()==null){
                    tranRef.child(last_tran).child('Leave time').set(datetime);
                    DoorRef.child('OpenClose').set('1');
                    dataMonitor();
                  }else{
                    count++;
                    tranRef.child('tran_'+count).child('UID').set(uid);
                    tranRef.child('tran_'+count).child('Status').set('Authorized Access');
                    DoorRef.child('OpenClose').set('1');
                    tranRef.child('tran_'+count).child('Entry time').set(datetime);
                    dataMonitor();              
                  }
                });
              }

            });
          }
        });
      }   
    });
  });
}
