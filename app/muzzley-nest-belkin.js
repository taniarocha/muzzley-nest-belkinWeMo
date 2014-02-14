var nest = require('unofficial-nest-api');
var muzzley = require('muzzley-client');

var username = 'yourNestUser@example.com';
var password = 'yourNestPass';
var widgetUuid='85163d67-9b8d-487c-bf48-37c3c6ce5be9';
var options = {
  token: '39a02128c48b7c2d',
  activityId: 'fc7814'
};

var deviceId = '';
var temperature = '';
var humidity = '';
var away = '';
var someid = '';
var off = '';
var online = '';
var temperatureType = '';

// wemoNode setup
var WemoNode = require('wemonode');
var wemoNode = WemoNode.WemoNode();
wemoNode.setBindAddress('0.0.0.0');

// global object to store the discovered Belkin WeMo
var obj;

// a function to load json data from a file
var fs = require('fs');
function loadJSONfile (filename, encoding) {
  try {
    if (typeof (encoding) == 'undefined') encoding = 'utf8';
    var contents = fs.readFileSync(filename, encoding);
    return JSON.parse(contents);
    
  } catch (err) {
    console.log(err);
  }
} // loadJSONfile

var myData = loadJSONfile('./vars.json');
//create a vars.json file with your data

if(myData){
  console.log(' - My personal data loaded ');
  //console.log(myData);
  username = myData.nestUsername;
  password = myData.nestPassword;
  // data was successfully loaded, init muzzley connection
  connectMuzzley();
}else{
  console.log(' - My personal data not load');
}


function connectMuzzley(){
  muzzley.connectApp(options, function(err, activity) {
    if (err) return console.log('err: ' + err);
    console.log(' - Activity created id: '+activity.activityId);
    
    connectNest();
    connectBelkin();
    // Usually you'll want to show this Activity's QR code image
    // or its id so that muzzley users can join.
    // They are in the `activity.qrCodeUrl` and `activity.activityId`
    // properties respectively.

    activity.on('participantJoin', function(participant) {

      participant.changeWidget('webview', {uuid: widgetUuid, orientation: 'landscape'}, function(err) {
        if (err) return console.log('err: ' + err );

        participant.on('quit', function() {
          console.log('quit');
        });

        var state = 0;
        var id = '';
        // if the object from Belkin is null, define Belkin as off
        if(obj){
          state = obj.binarystate;
          id = obj.id;
        }else{
          state = 'off';
        }
        
        // send to muzzley the object with Nest and Belkin inicial information
        participant.sendSignal('nest_belkin_status',
          {
            nestTemperature: temperature,
            nestTemperatureType: temperatureType,
            nestHumidity: humidity,
            nestAway:away,
            nestId:deviceId,
            nestOff: off,
            nestOnline:online,
            belkinMode:state,
            belkinId:id
          }
        );

        // received from muzzley, when participant change Nest or Belkin status
        participant.on('signalingMessage', function(type, data, callback) {
         
          switch (type) {
              case 'nest_setTemperature':
                console.log('set temperature to '+data.newTemperatureValue + ' ' + deviceId);
                var newTemp = parseInt(data.newTemperatureValue, 10);
                setTemperature(newTemp, deviceId);
                break;
              case 'nest_setAway':
                console.log('set away to: '+data.value + ' ' + deviceId);
                setAway(data.value, deviceId);
                break;
              case 'belkin':
                console.log('set belkin to '+data.value);
                setBelkin(data.value);
                break;
          }
        });
      });
    });
  });
}



function connectNest(){
  nest.login(username, password, function (err, data) {
      if (err) return console.log(err.message);
      nest.fetchStatus(function (data) {
        for (var ddeviceId in data.device) {
          //console.log(data);
          // save the Nest inicial information
          deviceId = ddeviceId;
          
          if (data.device.hasOwnProperty(ddeviceId)) {
            var device = data.shared[ddeviceId];
            temperatureType = data.device[ddeviceId].temperature_scale;
            temperature = data.shared[ddeviceId].target_temperature;
            //the target temperature value is always in Celsius, convert to Fahrenheit if the temperature scale was in Fahrenheit 
            if(temperatureType === 'F'){
              temperature = nest.ctof(temperature);
            }
            temperature = parseInt(temperature, 10);
            humidity = data.device[ddeviceId].current_humidity;
            someid = data.link[ddeviceId].structure;
            someid = someid.substring(someid.indexOf('.')+1, someid.length);
            away = data.structure[someid].away;
            off = data.device[ddeviceId].switch_system_off;
            online = data.track[ddeviceId].online;
            
            console.log(' - Nest: '+deviceId+' temperature: '+temperature+' '+temperatureType);
            console.log(' - Humidity: '+humidity+' away: '+away+' off: '+off+' online: '+online);
          }
          if(online){
            // when find one Nest online, return. In this example only want one Nest device
            return;
          }
          
        }
      });
  });
}

function connectBelkin(){
  wemoNode.on('device_found', function (object) {
    if (object.deviceType == 'socket'){
      obj=object;
      console.log(' - Detected new Belkin WeMo device: ' + object.id);
    }
  }.bind(this));

  wemoNode.on('device_lost', function (object) {
  }.bind(this));

  wemoNode.on('state_changed', function (object) {
    console.log(' - Detected change state on device ' + object.id + '. New state is: ' + object.binarystate);
    obj = object;
  }.bind(this));

  wemoNode.startDiscovery();
}

function setBelkin(value){
  wemoNode.sendCommand('socket_setbinarystate', obj, {'binarystate': value});
}

function setTemperature(temp, deviceId){
  if(temperature != temp){
    nest.login(username, password, function (err, data) {
      if (err) return console.log(err.message);
        nest.fetchStatus(function (data) {
          for (var ddeviceId in data.device) {
            if (data.device.hasOwnProperty(ddeviceId)) {
                if(ddeviceId === deviceId){
                  nest.setTemperature(ddeviceId, temp);
                  console.log(obj.binarystate);
                  if(temp == 18 && obj !== null){
                    if(obj.binarystate == 0) setBelkin(1);
                  }else{
                    if(obj.binarystate == 1) setBelkin(0);
                  }
                }
            }
          }
        });
    });
  }
  temperature = temp;
}

function setAway(value, deviceId){
  if(away != value){
    nest.login(username, password, function (err, data) {
      if (err) return console.log(err.message);
        nest.fetchStatus(function (data) {
          for (var ddeviceId in data.device) {
            if (data.device.hasOwnProperty(ddeviceId)) {
                if(ddeviceId === deviceId){
                  if(value){
                    nest.setAway();
                  }else{
                    nest.setHome();
                  }
                }
            }
          }
        });
    });
  }
  away = value;
}