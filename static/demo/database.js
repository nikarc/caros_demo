'use strict';

var Datastore = require('nedb');
var db = {};
db.songs = new Datastore({ filename: 'database/caros_songs.db' });
db.artists = new Datastore({ filename: 'database/caros_artists.db' });
db.albums = new Datastore({ filename: 'database/caros_albums.db' });

db.songs.loadDatabase();
db.artists.loadDatabase();
db.albums.loadDatabase();

function add_music(data, callback) {
  console.log('Adding: ' + data.path);
  if (data.artist) {
    (function () {
      var song = { title: data.title, path: data.path, number: data.tracknum, duration: data.duration };
      var artist = { name: data.artist };
      var album = { title: data.album, image: data.image };

      db.songs.update({ title: song.title }, { title: song.title, path: song.path, number: data.tracknum, duration: song.duration }, { upsert: true }, function (err, num, songDoc) {
        if (err) console.error(err);

        song._id = songDoc._id;
        db.artists.update({ name: artist.name }, { name: artist.name }, { upsert: true }, function (err, num, artistDoc) {
          if (err) console.error(err);

          artist._id = artistDoc._id;
          db.albums.update({ title: album.title }, { title: album.title, artist: artist._id, image: album.image }, { upsert: true }, function (err, num, albumDoc) {
            if (err) console.error(err);

            album._id = albumDoc._id;

            db.songs.update({ _id: song._id }, { title: song.title, artist: artist._id, album: album._id, path: song.path, number: data.tracknum, duration: song.duration });
            db.artists.update({ _id: artist._id }, { $addToSet: { songs: song._id, albums: album._id } });
            db.albums.update({ _id: album._id }, { $addToSet: { songs: song._id } });

            setTimeout(function () {
              callback();
            }, 300);
          });
        });
      });
    })();
  } else if (data.title && !data.artist) {
    db.songs.update({ title: data.title }, { title: data.title, path: data.path }, { upsert: true }, function (err, num, doc) {
      if (err) console.error(err);
    });
  }
}

function get_songs(callback) {
  var songs = undefined;
  var artists = undefined;
  var albums = undefined;

  db.songs.find({}).sort({ title: 1 }).exec(function (err, docs) {
    if (err) console.error(err);

    var songs = docs.sort();

    db.artists.find({}).sort({ name: 1 }).exec(function (err, docs) {
      if (err) console.error(err);

      var artists = docs.sort();

      db.albums.find({}).sort({ title: 1 }).exec(function (err, docs) {
        if (err) console.error(err);

        var albums = docs.sort();

        callback({ artists: artists, albums: albums, songs: songs });
      });
    });
  });
}

function print_songs() {
  db.artists.find({}, function (err, docs) {
    if (err) console.error(err);

    console.log(docs);
  });

  db.albums.find({}, function (err, docs) {
    if (err) console.error(err);

    console.log(docs);
  });

  db.songs.find({}, function (err, docs) {
    if (err) console.error(err);

    console.log(docs);
  });
}

function print_one_song(title) {
  db.songs.findOne({ title: title }, function (err, doc) {
    console.log(doc);
  });
}

function drop_dbs() {
  db.artists.remove({}, { multi: true });
  db.albums.remove({}, { multi: true });
  db.songs.remove({}, { multi: true });
}