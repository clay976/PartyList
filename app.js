//node modules
var express = require('express') // Express web server framework
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var assert = require('assert')

//my modules
var spotifyAccountTools = require ('./spotify/account/tools')
var spotifyAccountTemplate = require ('./spotify/account/JSONtemps')
var spotifyPlaylistTools = require ('./spotify/playlist/tools')
var handleIncoming = require ('./messageTools/handleIncoming')
var respond = require ('./messageTools/responses')

//app declaration and uses
var app = express()
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

//required documents and tools
var removeList = require ('./database/remove')
var search = require ('./database/query/search')
var queryTemplate = require ('./database/query/JSONtemps')
var guestTools = require ('./database/guestTools')

//mongo database variables
var MongoClient = require('mongodb').MongoClient
var mongoUrl = 'mongodb://localhost:27017/party'

//connect to the database, this happens when api starts, and the conection doesn't close until the API shuts down/crashes
MongoClient.connect(mongoUrl, function serveEndpoints (err, db) {
  assert.equal(null, err)
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
    spotifyAccountTools.homepage (req, res, db)
  })  

/*
create a new spotify playlist
________________________________________________________________________________________
TO BE SENT:
  JSON from req.body{               :  type  :              Description                |
    host                            : string :  the username of their spotify account. |
  }
_______________________________________________________________________________________*/
  app.post('/playlist/create', function (req, res){
    spotifyPlaylistTools.createPlaylist (req, res, db)
  })

/*
find the user's latest spotify playlist
________________________________________________________________________________________
TO BE SENT:
  JSON from req.body{               :  type  :              Description                |
    host                            : string :  the username of their spotify account. |
  }
_______________________________________________________________________________________*/
  app.post('/playlist/latest/spotify', function (req, res){
    spotifyPlaylistTools.findPlaylist (res, db, req.body.host)
  })

/*
find this user's latest playlist held in our database
________________________________________________________________________________________
TO BE SENT:
  JSON from req.body{               :  type  :              Description                |
    host                            : string :  the username of their spotify account. |
  }
_______________________________________________________________________________________*/
  app.post('/playlist/latest/party', function (req, res){
    search.search (req.body.host, query.findHost (req.body.host), db, function (hostFound){
      if (hostFound.playlistID != ''){
        res.send (200, 'hosts playlist has been found in DB')
      }else{
        res.send (401, 'sorry, host playlist not found in DB')
      }
    })
  })

  // choose a playlist from the list
  // of avaliable playlists that the
  // user controls
  app.post('/playlist/choose', function (req, res){
    
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
    removeList.guests (res, db, req.body.host)
  })

/*
add many guests to the party in a JSON block
________________________________________________________________________________________
TO BE SENT:
  JSON from req.body{               :  type  :              Description                |
    host                            : string :  the username of their spotify account. |
    guestNums [ 1234567890, etc, ]  : array  :  phone numbers of the guest to be added |
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
    guestTools.addGuest (res, db, req.body.host, req.body.guestNum)
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
    removeList.songs (res, db, req.body.host)
  })

  //this should only be coming from Twilio,
  //to be fixed in gulp branch or something.
  app.post('/message', function (req, res){ 
    search.search ('guests', queryTemplate.findGuest (req.body.From), db, function (guestFound){
      if (!guestFound){
        respond.notGuest (res, req.body.From)
      }else{
        handleIncoming.incoming (res, db, req.body.From, guestFound, req.body.Body.toLowerCase())
      }
    })
  })
  app.listen(80)
})