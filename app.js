var Twitter = require('twitter');
var faye = require('faye');
var express = require('express'),  http = require('http');
var bodyParser = require('body-parser');
var queryString = require('querystring');
var app = express();
var server = http.createServer(app);

var hashTagMap = {};
var twitterClientMap = {};

app.get('/', function (req, res) {
  res.sendFile('main-page.html', { root: __dirname });
});

app.post('/', function (req, res) {
  req.on('data', function(chunk) {
    var obj = JSON.parse(chunk);
     faye_server.getClient().publish('/pin', {
        pageName: 'monitor-map',
        lat: obj.lat,
        lng: obj.lng
      });
    });
  res.sendFile('request-received.html', { root: __dirname });
});

//app.get('/user/:id', function(req, res) {
//  res.send('user ' + req.params.id);
//});
//

app.get('/:id', function(req, res) {

  var hashTag = hashTagMap[req.params.id];
  if (!(hashTag in twitterClientMap)) {
	makeStream(hashTag);
  }
  res.sendFile('maps/monitor-map.html', { root: __dirname, phrase:hashTag });

});

var server = app.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

var io = require('socket.io')(server);

function makeStream(phrase){

	var client = new Twitter({
  	consumer_key: 'VE3o7sCIGjlmKkuW5G4x5cpeG',
  	consumer_secret: 'p1VavIQLfEopJwZhLRIGcLV4hy2lwtvxtaNZeTuRaW89ij69zn',
  	access_token_key: '3230955631-hRSmgJZ75p3bWYl27Dvx09ZLPsEhOSVhtkdMzAP',
  	access_token_secret: 'Z4p1Nbr6uH6NK7vWQAm61U0nRV3Ev7oby0egpW1dGJlT9'
	});

	client.stream('statuses/filter', {track: phrase}, function(stream) {
  		stream.on('data', function(tweet) {
  		
			io.sockets.emit(phrase, tweet);   				
     			
  		});

  		stream.on('error', function(error) {
    			throw error;
  		});

	});


	twitterClientMap[phrase] = client;

}

//var io = require('socket.io')(server);

//io.on('connection', function(socket){
  //socket.emit('news', {hello:'world'});
 
//});

