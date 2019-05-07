// initialize everything, web server, socket.io, filesystem, johnny-five
var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , five = require("johnny-five"),
  board,servo,sensor,motors,speed = 255;
  


  
  var five = require("johnny-five"),
  board = new five.Board({port:"COM2"});
var led;
var hatch;
var hatchLight;
var lightvalue = 0;
var hatchvalue = 0;
var lcd;
  
// on board ready
board.on("ready", function() {

  var dataRaw;
 
 //var array = new five.Leds([7]);
 //array.on();

 //var array1 = new five.Leds([13]);
 //array1.off();


 lcd = new five.LCD({
  // LCD pin name  RS  EN  DB4 DB5 DB6 DB7
  // Arduino pin # 7    8   9   10  11  12
  pins: [22, 23, 24, 25, 26, 27],
  rows: 4,
  cols: 20
});







 let ledRed = new five.Led(53);
  let ledyellow = new five.Led(13);
  hatchLight = new five.Led(3);
   led = new five.Led(4);
  /*
  var rgb = new five.Led.RGB({
    pins: {
      red: 12,
      green: 11,
      blue: 10
    }
  });
  */

  /

  hatch = new five.Button({
    pin: 2,
    isPullup: true
  });





  // setup a stanard servo, center at start
  servo = new five.Servo({
    pin:6,
    range: [0,90],
    type: "standard",
    center:true
  });

  // poll this sensor every second
  sensor = new five.Sensor({
    pin: "A0",
    freq: 1000
  });



//////////motor

// Create a new `motor` hardware instance.

motors = {
  a: new five.Motor({pins: [9, 8], invertPWM: true}), //motor"a" é o da esquerda
  //b: new five.Motor({pins: [10, 8], invertPWM: true})
};

// Inject the `motor` hardware into
// the Repl instance's context;
// allows direct command line access
 
/////////

board.repl.inject({
  pot: sensor,
  motors: motors,
  led: led,
  hatchLight: led,
  lcd: lcd

  //rgb: led
});



lcd.cursor(0, 0).print("water level: ");
//lcd.cursor(1, 1).print("motor: ");
//lcd.cursor(4, 2).print("hello");
  //lcd.blink();
  //lcd.cursor(1, 0).print("Blinking? ");

// "data" get the current reading from the potentiometer
sensor.on("data", function() {
  if (this.value <300){

    lcd.cursor(0,13).print(this.value);
   // lcd.clear().print("water level : "+ this.value);
   // lcd.clear();
    //lcd.cursor(2,2).print("water level : "+ this.value);
    //lcd.cursor(2,2).print("hello");
   // lcd.cursor(12, 1).print("ON");



    motors.a.forward(speed);

    ledyellow.off();
    ledRed.on();
    console.log(this.value, this.raw);

   // rgb.on();
   // rgb.color("#ff0000");
    //rgb.blink(1000);


    


  }

  if (this.value >300){

    lcd.cursor(0,13).print(this.value);

    //motors.a.forward(speed);
    motors.a.stop();

    ledyellow.on();
    ledRed.off();
    console.log(this.value, this.raw);

    //led.on();

    //rgb.off();
  
  }


  hatch.on("down", function(){
    console.log("down");
    hatchLight.stop();
    hatchLight.off();
    hatchvalue = 0;



  });

  hatch.on("up", function(){
    console.log("up");
    hatchLight.blink(300);
    hatchvalue = 1;

  });

  

});




});




// make web server listen on port 80
app.listen(80);

io.sockets.setMaxListeners(40);

/*
app.on("GET", (req, res) => {
  res.write(dataRaw);
});
*/

// handle web server
function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}


// on a socket connection
io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
 
  // if board is ready
  if(board.isReady){
    // read in sensor data, pass to browser
    sensor.on("data",function(){
      dataRaw = this.Raw;
      socket.emit('sensor', { raw: this.raw });
    });
  }

  // if servo message received
  socket.on('servo', function (data) {
    console.log(data);
    if(board.isReady){ servo.to(data.pos);  }
  });

/////////

  socket.on('hatch', function (hatchvalue) { //get button status from client
    socket.emit("hatch", hatchvalue); //send push button status to back to server
  });


////////////

  
  // if led message received
  socket.on('led', function (data) {
    console.log(data);
     if(board.isReady){    led.strobe(data.delay); } 
  });
  
  socket.on('click', function() {
   led.off();
 });

 socket.emit('light', lightvalue);

 
socket.on('hatch', function(){

lightvalue = value;
console.log(value);

  
});


//////////////////// test signal "works"

var lightvalue = 0; //static variable for current status
  socket.on('light', function(data) { //get light switch status from client
    lightvalue = data;
    if (lightvalue) {
      hatchLight.blink();
      console.log(lightvalue); //turn LED on or off, for now we will just show it in console.log
    }
    else {
      hatchLight.stop();
      hatchLight.off();
    }
  });

  /////////////////// end test signal 1


/*
///////////////test signal 2


var lightvalue = 0; //static variable for current status
  hatch.watch(function (err, value) { //Watch for hardware interrupts on pushButton
    if (err) { //if an error
      console.error('There was an error', err); //output error message to console
      return;
    }
    lightvalue = value;
    socket.emit('light', lightvalue); //send button status to client
  });
  socket.on('light', function(data) { //get light switch status from client
    lightvalue = data;
    if (lightvalue != hatchLight.readSync()) { //only change LED if status has changed
      hatchLight.writeSync(lightvalue); //turn LED on or off
    }
  });


//////////////// end test signal 2

*/

 socket.on('on', function(){
  led.on();
});

socket.on('off', function(){
  led.off();
});




// Turn LED off when event led:off is received
/*socket.on('led:off', function(){
  led.off();
});
*/
11  
});

