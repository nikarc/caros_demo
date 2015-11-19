'use strict';

var http = require('http');
var express = require('express');
var app = express();
var path = require('path');

var PORT = 8080;

app.use('/static', express.static(__dirname + '/static'));
app.use('/bower', express.static(__dirname + '/bower_components'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/demo', function (req, res) {
  res.sendFile(path.join(__dirname + '/demo.html'));
});

var server = app.listen(process.env.port || PORT, function () {
  var host = server.address().adress;

  console.log('Server started at http://' + host + ':' + PORT);
});