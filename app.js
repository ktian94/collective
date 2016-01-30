var Twitter = require('twitter');
var express = require('express');
var faye = require('faye');
var bodyParser = require('body-parser');
var queryString = require('querystring');
var app = express();

var faye_server = new faye.NodeAdapter({mount: '/faye', timeout: 120});

var client = new Twitter({
  consumer_key: 'VE3o7sCIGjlmKkuW5G4x5cpeG',
  consumer_secret: 'p1VavIQLfEopJwZhLRIGcLV4hy2lwtvxtaNZeTuRaW89ij69zn',
  access_token_key: '3230955631-hRSmgJZ75p3bWYl27Dvx09ZLPsEhOSVhtkdMzAP',
  access_token_secret: 'Z4p1Nbr6uH6NK7vWQAm61U0nRV3Ev7oby0egpW1dGJlT9' 
});

app.get('/', function (req, res) {
  res.sendFile('request-help.html', { root: __dirname });
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

app.get('/monitor', function(req, res) {
  res.sendFile('maps/monitor-map.html', { root: __dirname });
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

faye_server.attach(server);

client.stream('statuses/filter', {track: 'blacklivesmatter'}, function(stream) {
  stream.on('data', function(tweet) {
    console.log(tweet.text);
  });

  stream.on('error', function(error) {
    throw error;
  });

});
