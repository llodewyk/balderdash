var express = require('express'),
  morgan = require('morgan'),
  path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');

// This app uses the expressjs framework
var app = express();

// Define the view (templating) engine
app.set('view engine', 'ejs');


// parse application/x-www-form-urlencoded, with extended qs library
app.use(bodyParser.urlencoded({ extended: true }));

// Load all routes in the routes directory
fs.readdirSync('./public/routes').forEach(function (file){
  // There might be non-js files in the directory that should not be loaded
  if (path.extname(file) == '.js') {
    console.log("Adding routes in "+file);
    require('./public/routes/'+ file).init(app);
    }
});

app.use(express.static(__dirname + '/public'));

app.get('/balderdash', function(req, res){
  res.sendfile(__dirname + '/public/index.html');
});

var http = require('http').createServer(app);
var io = require('socket.io').listen(http);

ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
port = process.env.OPENSHIFT_NODEJS_PORT || 50000;

//  Start listening on the specific IP and PORT
http.listen(port, ipaddress);
console.log('Server started on '+ipaddress+':'+port);

var game = require(__dirname + '/serverSocket.js')


io.sockets.on('connection', function (socket) {
    //console.log('client connected');
    game.init(io, socket);
});