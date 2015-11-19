import Datastore from "../../node_modules/nedb/index.js";
let db = {};
db.songs = new Datastore({ filename: 'database/caros_songs.db' });
db.artists = new Datastore({ filename: 'database/caros_artists.db' });
db.albums = new Datastore({ filename: 'database/caros_albums.db' });

db.songs.loadDatabase();
db.artists.loadDatabase();
db.albums.loadDatabase();

module.exports = {

  add_music: function(data, callback) {
    console.log(`Adding: ${data.path}`);
    if (data.artist) {
      let song = { title: data.title, path: data.path, number: data.tracknum, duration: data.duration };
      let artist = { name: data.artist };
      let album = { title: data.album, image: data.image };

      db.songs.update({ title: song.title }, { title: song.title, path: song.path, number: data.tracknum, duration: song.duration }, { upsert: true }, (err, num, songDoc) => {
        if (err)
        	console.error(err);

        song._id = songDoc._id;
        db.artists.update({ name: artist.name }, { name: artist.name }, { upsert: true }, (err, num, artistDoc ) => {
          if (err)
          	console.error(err);

          artist._id = artistDoc._id;
          db.albums.update({ title: album.title }, { title: album.title, artist: artist._id, image: album.image }, { upsert: true }, (err, num, albumDoc) => {
            if (err)
            	console.error(err);

            album._id = albumDoc._id;

            db.songs.update({ _id: song._id }, { title: song.title, artist: artist._id, album: album._id, path: song.path, number: data.tracknum, duration: song.duration });
            db.artists.update({ _id: artist._id }, { $addToSet: { songs: song._id, albums: album._id } });
            db.albums.update({ _id: album._id }, { $addToSet: { songs: song._id } });

            setTimeout(() => {
              callback();
            }, 300);
          });
        });
      });
    } else if (data.title && !data.artist) {
      db.songs.update({ title: data.title }, { title: data.title, path: data.path }, { upsert: true }, (err, num, doc) => {
        if (err)
          console.error(err);
      });
    }
  },

  get_songs: function(callback) {
    let songs;
    let artists;
    let albums;

    db.songs.find({}).sort({ title: 1 }).exec((err, docs) => {
      if (err)
      	console.error(err);

      let songs = docs.sort();

      db.artists.find({}).sort({ name: 1 }).exec((err, docs) => {
        if (err)
        	console.error(err);

        let artists = docs.sort();

        db.albums.find({}).sort({ title: 1 }).exec((err, docs) => {
          if (err)
          	console.error(err);

          let albums = docs.sort();

          callback({ artists: artists, albums: albums, songs: songs });
        });
      });
    });
  },

  print_songs: function() {
    db.artists.find({}, (err, docs) => {
      if (err)
       console.error(err);

      console.log(docs);
    });

    db.albums.find({}, (err, docs) => {
      if (err)
        console.error(err);

      console.log(docs);
    });

    db.songs.find({}, (err, docs) => {
      if (err)
        console.error(err);

      console.log(docs);
    });
  },

  print_one_song: function(title) {
    db.songs.findOne({ title: title }, (err, doc) => {
      console.log(doc);
    });
  },

  drop_dbs: function() {
    db.artists.remove({}, {multi: true});
    db.albums.remove({}, {multi: true});
    db.songs.remove({}, {multi: true});
  }

};
