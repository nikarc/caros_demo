'use strict';

var musicScroller = undefined;

var app = angular.module('CarOS', []);

app.controller('MainController', function ($scope, $interval) {
  $scope.mainwindow = 'main-menu';
  $scope.windowStack = ['main-menu'];
  $scope.time = moment().format('h:mm a');
  $scope.date = moment().format('ddd - MMM Do');
  $scope.yoscroll = false;

  $scope.goBack = function () {
    $scope.windowStack.pop();
    $scope.mainwindow = $scope.windowStack[$scope.windowStack.length - 1];
  };

  $interval(function () {
    $scope.time = moment().format('h:mm a');
  }, 1000);

  $interval(function () {
    $scope.date = moment().format('MM/dd');
  }, 4.32e+7);

  $scope.navigate = function (context) {
    $scope.mainwindow = context;
  };
});

app.controller('MainMenu', function ($scope) {});

/***************
  Music Controller
***************/

app.controller('Music', function ($scope, $filter, $timeout, $http, MusicService) {
  $scope.songs = [];
  $scope.artists = [];
  $scope.albums = [];
  $scope.playing = false;
  $scope.active = {
    sideBar: '',
    listView: '',
    song: ''
  };

  $scope.currentArtist = { artist: null, songs: [] };

  $http({
    method: 'GET',
    url: '/demo/add_files'
  }).then(function(songs) {
    songs.data.songs.forEach((song) => {
      add_music(song, () => {
        console.log('done');
      });
    });
  });

  $scope.$watch(function () {
    return MusicService.currentSong;
  }, function (song) {
    $scope.currentSong = song;
  });

  $scope.$watch(function () {
    return MusicService.currentAlbum;
  }, function (album) {
    $scope.currentAlbum = album;
  });

  $scope.context = '';
  $scope.changeContext = function (ctxt, index) {
    $scope.context = ctxt;
    $scope.currentArtist = { artist: null, albums: [], songs: [] };
    $scope.currentAlbum = {};

    $scope.updateScroller(index);
  };

  $scope.updateScroller = function (index) {
    var list = $('.list-view')[index];

    musicScroller.scrollTo(0, 0, 0);
    $timeout(function () {
      musicScroller.updateDimensions($(list).outerWidth(), $(list).outerHeight() + 25);
    }, 100);
  };


  // get_songs(function (files) {
  //   $scope.songs = angular.copy(files.songs);
  //   $scope.artists = angular.copy(files.artists);
  //   $scope.albums = angular.copy(files.albums);
  // });

  // artist views
  $scope.showAlbums = function (artist, index) {
    $scope.currentArtist = { artist: artist, songs: [], albums: [] };

    $scope.albums.forEach(function (a) {
      artist.albums.forEach(function (al) {
        if (a._id === al) {
          (function () {
            var newAlbum = { title: a.title, image: a.image, songs: [] };

            a.songs.forEach(function (so) {
              $scope.songs.forEach(function (s) {
                if (so === s._id) {
                  newAlbum.songs.push(s);
                }
              });
            });

            $scope.currentArtist.albums.push(newAlbum);
          })();
        }
      });
    });

    $scope.updateScroller(index);
  };

  $scope.showSongs = function (album, index) {
    $scope.currentAlbum = { title: album.title, artist: null, image: album.image, songs: [] };

    $scope.artists.forEach(function (a) {
      if (a._id === album.artist) {
        $scope.currentAlbum.artist = a;
        $scope.currentArtist.artist = a;
      }
    });

    $scope.songs.forEach(function (s) {
      album.songs.forEach(function (so) {
        if (s._id === so) {
          $scope.currentAlbum.songs.push(s);
        }
      });
    });

    $scope.updateScroller(index);
  };

  $scope.getArtist = function (artist) {
    var name = '';
    $scope.artists.forEach(function (a) {
      if (a._id === artist) {
        name = a.name;
      }
    });

    return name;
  };

  // handle song click
  $scope.playSong = function (song, album) {
    var songlist = $scope.songs.sort();

    if (album) {
      MusicService.playSong(song, album, $scope.currentArtist);
    } else {
      MusicService.playSong(song, songlist, $scope.currentArtist);
    }
  };

  $scope.queueSong = function (song) {
    MusicService.queueSong(song);
  };

  $scope.$watch(function () {
    return MusicService.songlist;
  }, function (list) {
    if (list.length > 0) {
      $scope.playing = true;
    } else {
      $scope.playing = false;
    }
    $scope.songlist = angular.copy(list);
  }, true);
});

/***************
  Settings Ctrl
***************/

app.controller('Settings', function ($scope) {
  $scope.settings = {};

  $scope.refreshMusic = function () {
    // fake refresh
  };
});

/***************
  Player Ctrl
***************/

app.controller('Player', function ($scope, $interval, MusicService) {
  var songlist = MusicService.songlist;
  var player = undefined,
      timer = undefined;

  $scope.duration = 0;
  $scope.playlist = [];

  $scope.scrubber = {};
  $scope.scrubber.value = '0';

  $scope.playing = false;
  $scope.songlist = [];

  $scope.$watch(function () {
    return MusicService.duration;
  }, function (dur) {
    $scope.duration = Math.round(dur);
    if (dur > 1) {
      timer = $interval(function () {
        $scope.scrubber.value = Math.floor(MusicService.player.currentTime);
      }, 1000);
    }
  }, true);

  $scope.$watch(function () {
    return MusicService.paused;
  }, function (paused) {
    $scope.paused = paused;
  });

  $scope.$watch(function () {
    return MusicService.songlist;
  }, function (list) {
    if (list.length > 0) {
      $scope.playing = true;
    } else {
      $scope.playing = false;
    }
    $scope.songlist = angular.copy(list);
  }, true);

  $scope.$watch(function () {
    return MusicService.currentSong;
  }, function (song) {
    $scope.currentSong = song;
  });

  $scope.$watch(function () {
    return MusicService.currentArtist;
  }, function (artist) {
    $scope.currentArtist = artist;
  });

  $scope.$watch(function () {
    return MusicService.currentAlbum;
  }, function (album) {
    $scope.currentAlbum = album;
  });

  // non-interactable scrubber for small-player
  // scrubber width is duration / scrubber value as percentage
  $scope.scrubberWidth = function () {
    if ($scope.duration > 1) {
      return {
        "width": $scope.scrubber.value / $scope.duration * 100 + '%'
      };
    }
  };

  $scope.showFullPlayer = function () {
    $('#player').animate({
      bottom: ''
    });
  };

  $scope.seek = function (seekTo) {
    MusicService.seek(seekTo);
  };

  $scope.playPause = function () {
    if ($scope.paused) {
      MusicService.play();
      timer = $interval(function () {
        $scope.scrubber.value = Math.floor(MusicService.player.currentTime);
      }, 1000);
    } else {
      MusicService.pause();
      $interval.cancel(timer);
    }
  };

  $scope.fastForward = function () {
    MusicService.fastForward($scope.currentSong.number);
  };

  $scope.rewind = function () {
    MusicService.rewind($scope.currentSong.number);
  };

  $scope.prevSong = function () {
    MusicService.prevSong($scope.currentSong.number);
  };
});

/***************
  Music Service
***************/

app.factory('MusicService', function () {
  return {
    songlist: [],
    player: new Audio(),
    duration: 1,
    paused: false,
    playing: false,
    currentSong: {},
    currentArtist: {},
    currentAlbum: {},
    getDuration: function getDuration() {
      return this.duration;
    },
    playSong: function playSong(song, songlist, currentArtist) {
      // WARN: if no songlist, player does not show
      if (songlist) {
        var newsonglist = songlist.songs.sort(function (a, b) {
          return a.number - b.number;
        });

        songlist.songs = newsonglist;
        this.songlist = newsonglist;
      }

      this.currentSong = song;

      if (songlist && songlist.image) {
        this.currentAlbum = songlist;
      }

      if (currentArtist) this.currentArtist = currentArtist;

      this.addEvent();
      this.play(song.path);
      this.playing = true;
    },
    getCurrentTime: function getCurrentTime() {
      return this.player.currentTime;
    },
    play: function play(path) {
      if (path) {
        this.player.src = path;
      }

      this.player.play();
      this.paused = false;

      this.playing = true;

      setTimeout(function () {
        // Update ftscroller div to not hide content behind music player by making scroll height +100px
        var scrollerHeight = $(musicScroller.contentContainerNode).height();
        var scrollerWidth = $(musicScroller.contentContainerNode).width();

        musicScroller.updateDimensions(scrollerWidth, scrollerHeight + 100, true);
      }, 100);

      var that = this;
      this.player.onended = function () {
        if (that.songlist.length > 0) {
          var index = that.songlist.indexOf(that.currentSong) + 1;
          var song = that.songlist[index];

          that.currentSong = song;
          that.player.src = song.path;
          that.player.play();
        }
      };
    },
    pause: function pause() {
      this.player.pause();
      this.paused = true;
    },
    seek: function seek(seekTo) {
      this.player.currentTime = seekTo;
    },
    fastForward: function fastForward(index) {
      var song = this.songlist[index];

      this.playSong(song);
    },
    rewind: function rewind(index) {
      var song = this.songlist[index - 1];

      this.playSong(song);
    },
    prevSong: function prevSong(index) {
      var song = this.songlist[index - 2];

      this.playSong(song);
    },
    addEvent: function addEvent() {
      var _this = this;

      this.player.addEventListener('loadedmetadata', function () {
        _this.duration = _this.player.duration;
      });
    }
  };
});

app.filter('timecode', function () {
  return function (input) {
    var min = Math.floor(input / 60) < 10 ? '0' + Math.floor(input / 60) : Math.floor(input / 60);
    var seconds = Math.floor(input % 60) < 10 ? '0' + Math.floor(input % 60) : Math.floor(input % 60);
    return min + ':' + seconds;
  };
});

// ftscroller
{
  var scrollable = document.getElementById('music-content');
  musicScroller = new FTScroller(scrollable, {
    scrollbars: false,
    scrollingX: false
  });
}
