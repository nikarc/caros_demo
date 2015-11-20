'use strict';

var http = require('http');
var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var jsonfile = require('jsonfile');

var PORT = 8080;
var user_prefs_file = 'user_prefs.json';

app.use('/static', express.static(__dirname + '/static'));
app.use('/bower', express.static(__dirname + '/bower_components'));
app.use('/music', express.static(__dirname + '/music'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/demo', function (req, res) {
  res.sendFile(path.join(__dirname + '/demo.html'));
});

app.get('/demo/get_songs', function (req, res) {
  var songs = [],
      artists = [],
      albums = [];
  jsonfile.readFile('./music.json', function (err, db) {
    if (err) console.error('ERR: ', err);

    db.songs.forEach(function (song) {
      songs.push(song);
    });
    db.artists.forEach(function (artist) {
      artists.push(artist);
    });
    db.albums.forEach(function (album) {
      albums.push(album);
    });

    res.send({ songs: songs, artists: artists, albums: albums });
  });
});

var server = app.listen(process.env.port || PORT, function () {
  var host = server.address().adress;

  console.log('Server started at http://' + host + ':' + PORT);
});