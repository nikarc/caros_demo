let http = require('http');
let express = require('express');
let app = express();
let path = require('path');
let fs = require('fs');
let jsonfile = require('jsonfile');
let walk = require('walk');
let id3 = require('id3-parser');
let mkdirp = require('mkdirp');


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

app.get('/demo/add_files', (req, res) => {
  let songs = [];
  jsonfile.readFile(user_prefs_file, (err, settings) => {
    if (err)
    	console.error(err);

    if (!settings.firstTimeSetup) {
      jsonfile.readFile(user_prefs_file, (err, obj) => {
        let musicpath = obj.user_preferences.music.path;
        if (obj.firstTimeSetup === false || nocheck) {

          let data = [];
          let walker = walk.walk(musicpath, {followLinks: false});

          walker.on('file', (root, fileStat, next) => {
            if (fileStat.name.indexOf('.mp3') > -1 && root.indexOf('.Trashes') === -1) {
              let filebuffer = fs.readFileSync(path.resolve(root, fileStat.name));

              id3.parse(filebuffer).then((tag) => {
                let songObj = {
                    title: tag.title,
                    artist: tag.artist,
                    album: tag.album,
                    genre: tag.genre,
                    path: path.resolve(root, `${fileStat.name}`),
                    tracknum: parseInt(tag.track.slice(0, tag.track.indexOf('/')))
                };
                if (tag) {
                  let imagepath = path.resolve(__dirname, 'music', 'album_art', `${tag.artist} - ${tag.album}.jpg`);
                  let albums = [];
                  if (albums.indexOf(tag.album.toLowerCase()) === -1) {
                    albums.push(tag.album.toLowerCase());

                    let image = new Buffer(tag.image.data);

                    try {
                      console.log(`creating image at ${imagepath}`);
                      mkdirp(path.resolve(__dirname, 'music', 'album_art'), (err) => {
                        fs.writeFileSync(imagepath, image, { flags: 'wx' });
                      });
                    }
                    catch (e) {
                      console.log(`IMGERROR: ${e}`);
                    }
                  }
                  console.log(`Track #: ${tag.track}`);
                  songObj.image = imagepath;
                } else {
                  console.log(fileStat.name);
                  songObj = {
                    title: fileStat.name,
                    path: path.resolve(root, `${fileStat.name}`)
                  };
                }

                songs.push(songObj);
              });
            }

            next();
          });

          walker.on('end', () => {
            res.send({ songs: songs });

            obj.firstTimeSetup = true;
            jsonfile.writeFile(user_prefs_file, obj, (err) => {
              console.error(err);
            });
          });
        }
      });
    }
  });
});

let server = app.listen(process.env.port || PORT, () => {
  let host = server.address().adress;

  console.log(`Server started at http://${host}:${PORT}`);
});
