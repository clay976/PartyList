//node modules
var express = require('express') // Express web server framework
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var querystring = require('querystring')
var model = require ('./database/models')

//my modules
var spotifyAccountTools = require ('./spotify/account/tools')
var spotifyPlaylistTools = require ('./spotify/playlist/tools')
var spotifyAccountTemplate = require ('./spotify/account/JSONtemps')

var twilioIncoming = require ('./twilio/incoming')
var upsertTemplate = require ('./database/upsert/JSONtemps')
var databaseHostTools = require ('./database/hostTools')
//app declaration and uses
var app = express()
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

//required documents and tools
var removeList = require ('./database/remove')
var guestTools = require ('./database/guestTools')

//mongo database variables
var MongoClient = require('mongodb').MongoClient
var mongoose = require("mongoose");
var mongoUrl = 'mongodb://localhost:27017/party'
mongoose.Promise = global.Promise;

//connect to the database, this happens when api starts, and the conection doesn't close until the API shuts down/crashes
mongoose.connect(mongoUrl)

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(db) {
  app.use(express.static(__dirname + '/public')).use(cookieParser())

/*
this will be hit if they are accessing our service from a browser
_______________________________________________________________________
TO BE SENT:
  JSON from req.body{               :  type  :              Description |
  }
________________________________________________________________________*/
  app.get('/login', function (req, res){
    res.redirect('https://accounts.spotify.com/authorize?' + querystring.stringify(spotifyAccountTemplate.buildScope()))
  })

/*
log the user in to access the rest of our things, and to save their access and refresh tokens
________________________________________________________________________________________
TO BE SENT:
  JSON from req.body{               :  type  :              Description                      |
    code                            : string :  the authorization code revieced from spotify |
  }
_____________________________________________________________________________________________*/
  app.get('/callback', function (req, res){
    spotifyAccountTools.homepage (req, res)
  })  

/*
create a new spotify playlist
________________________________________________________________________________________
TO BE SENT:
  JSON from req.body{               :  type  :              Description                |
    host                            : string :  the username of their spotify account. |
  }
_______________________________________________________________________________________*/
  app.post('/playlist/spotify/create', function (req, res){
    spotifyPlaylistTools.createPlaylist (req, res, db)
  })

/*
find the user's latest spotify playlist
________________________________________________________________________________________
TO BE SENT: a JSON object in the body of the request
  JSON from req.body{               :  type  :              Description                |
    host                            : string :  the username of their spotify account. |
  }
_______________________________________________________________________________________*/
  app.post('/playlist/spotify/latest', function (req, res){
    spotifyPlaylistTools.setLatestPlaylist (req, res, db)
  })

/*
find all the user's spotify playlist to choose from.
________________________________________________________________________________________
TO BE SENT:
  JSON from req.body{               :  type  :              Description                 |
    host                            : string :  the username of their spotify account.  |
  }                                                                                     |
                                                                                        |
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
  app.post('/playlist/spotify/getAll', function (req, res){
    spotifyPlaylistTools.findAllPlaylists (req, res, db)
  })

/*
set a specific playlist id (most likely to be used after finding all the user's spotify playlists)
________________________________________________________________________________________
TO BE SENT:
  JSON from req.body{               :  type  :              Description                |
    host                            : string :  the username of their spotify account. |
  }
_______________________________________________________________________________________*/
  app.post('/playlist/spotify/set', function (req, res){
    spotifyPlaylistTools.setSpecificPlaylist (req, res, db)
  })  

/*
find this user's latest playlist held in our database
________________________________________________________________________________________
TO BE SENT:
  JSON from req.body{               :  type  :              Description                |
    host                            : string :  the username of their spotify account. |
  }
_______________________________________________________________________________________*/
  app.post('/playlist/partyList/latest', function (req, res){
  })

/*
Set wether songs added can be explicit or not.
________________________________________________________________________________________
TO BE SENT:
  JSON from req.body{               :  type  :              Description                |
    host                            : string :  the username of their spotify account. |
  }
_______________________________________________________________________________________*/
  app.post('/playlist/explicit', function (req, res){
    spotifyAccountTools.explicitFilter (req, res, db)
  })

/*
remove every guest that is associated with this user
________________________________________________________________________________________
TO BE SENT:
  JSON from req.body{               :  type  :              Description                |
    host                            : string :  the username of their spotify account. |
  }
_______________________________________________________________________________________*/
  app.post ('/guests/removeAll', function (req, res){
    removeList.guests (res, db, req.body.hostID)
  })

/*
remove a guest that is associated with this user
________________________________________________________________________________________
TO BE SENT:
  JSON from req.body{               :  type  :              Description                |
    host                            : string :  the username of their spotify account. |
  }
_______________________________________________________________________________________*/
  app.post ('/guests/remove', function (req, res){
    model.Guest.findOneAndUpdate({'phoneNum': '+1'+req.body.guestNum}, {'hostID': null}).exec()
    .then (function (update){
      res.json ('guest removed from party')
    })
    .catch (function (err){
      res.json (err)
    })
  })

/*
add many guests to the party in a JSON block
________________________________________________________________________________________
TO BE SENT:
  JSON from req.body{                     :  type  :              Description                |
    host                                  : string :  the username of their spotify account. |
    guestNums [ 1234567890, 
                4169834260                : array  :  phone numbers of the guest to be added |
              ]   
  }
_______________________________________________________________________________________*/
  app.post('/guests/addMany', function (req, res){
    guestTools.addManyGuest (req, res, db)
  })


/*
add a single guest to the party in a JSON block
___________________________________________________________________
TO BE SENT:
  JSON from req.body{  :  type  :              Description                |
    host               : string :  the username of their spotify account. |
    guestNum           : string : phone number of the guest to be added   |
  }
_______________________________________________________________________*/
  app.post('/guests/add', function (req, res){
    guestTools.addGuest (req, res, db)
  })

/*
remove the entire list of songs in our db for this user
________________________________________________________________________________________
TO BE SENT:
  JSON from req.body{               :  type  :              Description                |
    host                            : string :  the username of their spotify account. |
  }
_______________________________________________________________________________________*/
  app.post('/songs/removeAll', function (req, res){
    removeList.songs (res, db, req.body.hostID)
  })

  //this should only be coming from Twilio,
  //to be fixed in gulp branch or something.
  app.post('/message', function (req, res){
    twilioIncoming.HandleIncomingMessage (req, res, db)
  })
  app.listen(80)

  setInterval(function refreshToken () {
    var tokenExpirationEpoch
    model.Host.findOne({ 'hostID' : 'clay976' }).exec()
    .then (function (hostInfo){
      databaseHostTools.spotifyApi.setRefreshToken(hostInfo.refresh_token)
      databaseHostTools.spotifyApi.refreshAccessToken()
      .then(function(data) {
        databaseHostTools.spotifyApi.setAccessToken(data.body.access_token)
        model.Host.findOneAndUpdate({'hostID': 'clay976'}, upsertTemplate.Host ('clay976', data.body.access_token, hostInfo.refresh_token, hostInfo.homePage)).exec()
        .then(function(update) {
          console.log ('getting refresh token successful')
        })
        .catch (function (err){
          console.log (err)
        })
      })
      .catch (function (err){
        console.log ('error getting token: '+ err)
      })
    })
    .catch (function (err){
      console.log (err)
    })
  }, 3500000)
})