//node modules
var express                 = require('express')
var bodyParser              = require('body-parser')

//app modules
var findAllPlaylists        = require ('services/spotify/playlist/findAllPlaylists')
var setSpecificPlaylist     = require ('services/spotify/playlist/setSpecificPlaylist')
var createPlaylist          = require ('services/spotify/playlist/createPlaylist')
var deletePlaylist          = require ('services/spotify/playlist/deletePlaylist')
var setLatestPlaylist       = require ('services/spotify/playlist/setLatestPlaylist')
var playlistSettings        = require ('database/host/playlistSettings')

//app definitions
var router                  = express.Router()

//middleware
router.use(bodyParser.json())// for parsing application/json
      .use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

/*
create a new spotify playlist
________________________________________________________________________________________
TO BE SENT:
  JSON from req.body{               :  type  :              Description                |
    host                            : string :  the username of their spotify account. |
    playName                        : string :  Name of playlist to be created         |
  }
_______________________________________________________________________________________*/
  router.post('/spotify/create', function (req, res){
    var host = {}
    host.spotifyID = req.body.hostID
    host.newPlaylistName = req.body.playName
    createPlaylist (host, res)
  })


/*
delete an existing spotify playlist
________________________________________________________________________________________
TO BE SENT:
  JSON from req.body{               :  type  :              Description                |
    host                            : string :  the username of their spotify account. |
    playlistID                      : string :  spotify ID of playlist to be deleted   |
  }
_______________________________________________________________________________________*/
  router.post('/spotify/delete', function (req, res){
    var host = {}
    host.spotifyID = req.body.hostID
    host.playlistID = req.body.playlistID
    deletePlaylist (host, res)
  })

/*
find the user's latest spotify playlist
________________________________________________________________________________________
TO BE SENT: a JSON object in the body of the request
  JSON from req.body{               :  type  :              Description                |
    host                            : string :  the username of their spotify account. |
  }
_______________________________________________________________________________________*/
  router.post('/spotify/latest', function (req, res){
    var host = {}
    host.spotifyID = req.body.hostID
    setLatestPlaylist (host, res)
  })

/*
find all the user's spotify playlist to choose from.
________________________________________________________________________________________
TO BE SENT:
  JSON from req.body{               :  type  :              Description                 |
    host                            : string :  the username of their spotify account.  |
  }                                                                                     |
RETURNED: properly formatted JSON object containing the name and spotify ID of the      |
          playlist of playlist that the user controls.                                  |
  {playlists"[                                                                          |                     
    { name  : foo,                                                                      |
      id    : fwe98ffew78fyweb                                                          |
    },                                                                                  |
    { name  : bar,                                                                      |
      id    : feioqf98yfefhc                                                            |
    }                                                                                   |
  ]}
_______________________________________________________________________________________*/
  router.post('/spotify/getAll', function (req, res){
    var host = {}
    host.spotifyID = req.body.hostID
    findAllPlaylists (host, res)
  })

/*
set a specific playlist id (most likely to be used after finding all the user's spotify playlists)
________________________________________________________________________________________
TO BE SENT:
  JSON from req.body{               :  type  :              Description                |
    host                            : string :  the username of their spotify account. |
  }
_______________________________________________________________________________________*/
  router.post('/spotify/set', function (req, res){
    var host = {}
    host.spotifyID = req.body.hostID
    host.playlistID = req.body.playlistID
    setSpecificPlaylist (host, res)
  })  

/*
find this user's latest playlist held in our database
________________________________________________________________________________________
TO BE SENT:
  JSON from req.body{               :  type  :              Description                |
    host                            : string :  the username of their spotify account. |
  }
_______________________________________________________________________________________*/
  router.post('/partyList/latest', function (req, res){
  })

/*_____________________________________________________PLAYLIST SETTINGS______________________________________
Set wether songs added can be explicit or not.
________________________________________________________________________________________
TO BE SENT:
  JSON from req.body{               :  type  :              Description                |
    host                            : string :  the username of their spotify account. |
  }
_______________________________________________________________________________________*/
  router.post('/settings', function (req, res){
    var host = {}
    host.spotifyID = req.body.hostID
    host.settings = {
    'explicit'      : req.body.explicit,
    'minYear'       : req.body.minYear,
    'maxYear'       : req.body.maxYear,
    'reqThreshold'  : req.body.requests
  }
    playlistSettings (host, res)
  })

module.exports = router