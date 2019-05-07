// initialize global variables, web server, socket.io, filesystem, johnny-five
var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , five = require("johnny-five"),
  board,servo,sensor,motors,speed = 255;

  var five = require("johnny-five"), //initiate board 
  board = new five.Board({port:"COM2"}); //lock program to port 2 for consistance
  
  var led; 



// on board ready
board.on("ready", function() {

  var dataRaw;
 


 //initiate local led variable

 let ledRed = new five.Led(7);
  let ledyellow = new five.Led(13);


  //global variable 
  led = new five.Led(4);

  
 

  // setup a stanard servo, center at start
  servo = new five.Servo({
    pin:6,
    range: [0,90],
    type: "standard",
    center:true
  });

  // reading sensor every second
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
 
board.repl.inject({
  pot: sensor,
  motors: motors,
  led: led
});

// "data" get the current reading from the potentiometer
sensor.on("data", function() {
  if (this.value <300){

    motors.a.forward(speed);

    ledyellow.off();
    ledRed.on();
    console.log(this.value, this.raw);
      


    


  }

  if (this.value >300){

    motors.a.stop();
    ledyellow.on();
    ledRed.off();
    console.log(this.value, this.raw);
  
  }

  if (this.value >300){
    motors.a.stop();

    ledyellow.on();
    ledRed.off();
    console.log(this.value, this.raw);
  }



});




});




// make web server listen on port 80
app.listen(80);


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
  // if led message received
  socket.on('led', function (data) {
    console.log(data);
     if(board.isReady){    led.strobe(data.delay); } 
  });

  //socket.on('click', function() {
  //  led.off();
 // });


// led instance listener/receiver from webpage to turn led on
 socket.on('on', function(){
  led.on();
});

// led instance listener/receiver from webpage to turn led on
socket.on('off', function(){
  led.off();
});
11  
});

