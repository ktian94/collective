var Twitter = require('twitter');
var express = require('express'),  http = require('http');
var bodyParser = require('body-parser');
var queryString = require('querystring');
var app = express();
var server = http.createServer(app);

var twitterClientMap = {};

app.use(express.static(__dirname + '/'));

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

app.get('/:hashtag', function(req, res) {

  var hashtag = req.params.hashtag;
if (hashtag != 'favicon.ico'){  

  if (!(hashtag in twitterClientMap)) {
	 makeStream(hashtag);
  }
  res.sendFile('maps/monitor-map.html', { root: __dirname });
  //getLast50(hashtag);
}
});

var server = app.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

var io = require('socket.io')(server);

function makeStream(phrase){
	
	console.log(phrase);
	var client = new Twitter({
  	consumer_key: 'VE3o7sCIGjlmKkuW5G4x5cpeG',
  	consumer_secret: 'p1VavIQLfEopJwZhLRIGcLV4hy2lwtvxtaNZeTuRaW89ij69zn',
  	access_token_key: '3230955631-hRSmgJZ75p3bWYl27Dvx09ZLPsEhOSVhtkdMzAP',
  	access_token_secret: 'Z4p1Nbr6uH6NK7vWQAm61U0nRV3Ev7oby0egpW1dGJlT9'
	});

	client.stream('statuses/filter', {track: phrase}, function(stream) {
  		stream.on('data', function(tweet) {
  		
       console.log(tweet);
			 io.sockets.emit(phrase, tweet);   				
     			
  		});

  		stream.on('error', function(error) {
    			console.log(error);
  		});

	});

	twitterClientMap[phrase] = client;

}

function getLast50(phrase){

  var client = new Twitter({
    consumer_key: 'VE3o7sCIGjlmKkuW5G4x5cpeG',
    consumer_secret: 'p1VavIQLfEopJwZhLRIGcLV4hy2lwtvxtaNZeTuRaW89ij69zn',
    access_token_key: '3230955631-hRSmgJZ75p3bWYl27Dvx09ZLPsEhOSVhtkdMzAP',
    access_token_secret: 'Z4p1Nbr6uH6NK7vWQAm61U0nRV3Ev7oby0egpW1dGJlT9'
  });
  console.log('hey' + phrase);
  client.get('search/tweets', {q: phrase}, function(error, tweets, response){
    for (i = 0; i < 50; i++) { 
      io.sockets.emit(phrase, tweets[i]);
      // console.log(tweets[i]);
    }
  });


  twitterClientMap[phrase] = client;

}

function removeStream(phrase) {
  if (phrase in twitterClientMap) {
    delete twitterClientMap[phrase];
  } 
}
