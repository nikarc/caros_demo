'use strict';

var http = require('http');
var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var jsonfile = require('jsonfile');
var walk = require('walk');
var id3 = require('id3-parser');
var mkdirp = require('mkdirp');

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

app.get('/demo/add_files', function (req, res) {
  var songs = [];
  jsonfile.readFile(user_prefs_file, function (err, settings) {
    if (err) console.error(err);

    if (!settings.firstTimeSetup) {
      jsonfile.readFile(user_prefs_file, function (err, obj) {
        var musicpath = obj.user_preferences.music.path;
        if (obj.firstTimeSetup === false || nocheck) {

          var data = [];
          var walker = walk.walk(musicpath, { followLinks: false });

          walker.on('file', function (root, fileStat, next) {
            if (fileStat.name.indexOf('.mp3') > -1 && root.indexOf('.Trashes') === -1) {
              var filebuffer = fs.readFileSync(path.resolve(root, fileStat.name));

              id3.parse(filebuffer).then(function (tag) {
                var songObj = {
                  title: tag.title,
                  artist: tag.artist,
                  album: tag.album,
                  genre: tag.genre,
                  path: path.resolve(root, '' + fileStat.name),
                  tracknum: parseInt(tag.track.slice(0, tag.track.indexOf('/')))
                };
                if (tag) {
                  (function () {
                    var imagepath = path.resolve(__dirname, 'music', 'album_art', tag.artist + ' - ' + tag.album + '.jpg');
                    var albums = [];
                    if (albums.indexOf(tag.album.toLowerCase()) === -1) {
                      (function () {
                        albums.push(tag.album.toLowerCase());

                        var image = new Buffer(tag.image.data);

                        try {
                          console.log('creating image at ' + imagepath);
                          mkdirp(path.resolve(__dirname, 'music', 'album_art'), function (err) {
                            fs.writeFileSync(imagepath, image, { flags: 'wx' });
                          });
                        } catch (e) {
                          console.log('IMGERROR: ' + e);
                        }
                      })();
                    }
                    console.log('Track #: ' + tag.track);
                    songObj.image = imagepath;
                  })();
                } else {
                  console.log(fileStat.name);
                  songObj = {
                    title: fileStat.name,
                    path: path.resolve(root, '' + fileStat.name)
                  };
                }

                songs.push(songObj);
              });
            }

            next();
          });

          walker.on('end', function () {
            res.send({ songs: songs });

            obj.firstTimeSetup = true;
            // jsonfile.writeFile(user_prefs_file, obj, (err) => {
            //   console.error(err);
            // });
          });
        }
      });
    }
  });
});

var server = app.listen(process.env.port || PORT, function () {
  var host = server.address().adress;

  console.log('Server started at http://' + host + ':' + PORT);
});