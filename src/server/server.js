let http = require('http');
let express = require('express');
let app = express();
let path = require('path');
let fs = require('fs');
let jsonfile = require('jsonfile');


const PORT = 8080;
const user_prefs_file = 'user_prefs.json';

app.use('/static', express.static(__dirname + '/static'));
app.use('/bower', express.static(__dirname + '/bower_components'));
app.use('/music', express.static(__dirname + '/music'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/demo', (req, res) => {
  res.sendFile(path.join(__dirname + '/demo.html'));
});

app.get('/demo/get_songs', (req, res) => {
  let songs = [], artists = [], albums = [];
  jsonfile.readFile('./music.json', (err, db) => {
    if (err)
    	console.error('ERR: ', err);

    db.songs.forEach((song) => {
      songs.push(song);
    });
    db.artists.forEach((artist) => {
      artists.push(artist);
    });
    db.albums.forEach((album) => {
      albums.push(album);
    });

    res.send({ songs: songs, artists: artists, albums: albums });
  });
});

let server = app.listen(process.env.port || PORT, () => {
  let host = server.address().adress;

  console.log(`Server started at http://${host}:${PORT}`);
});
