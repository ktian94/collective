var __dirname = 'C:/Users/Kevin/Documents/collective';

var express = require('express');
var faye = require('faye');
var bodyParser = require('body-parser');
var queryString = require('querystring');
var app = express();

var faye_server = new faye.NodeAdapter({mount: '/faye', timeout: 120});

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
