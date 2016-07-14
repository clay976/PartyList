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

  // login endpoint and function:
  // login endpoint is hit by the front end when someone has never saved a login
  // info for our application
  // the are handed the scope of our app and asked to agree before actually loggin in.
  app.get('/login', function (req, res){
    spotifyAccountTools.login(req, res)
  })

  // callback endpoint and function:
  // endpoint will get hit when a user is trying to login and
  // has already accepted the scope of our application
  app.get('/callback', function (req, res){
    spotifyAccountTools.retrieveAndPrepTokens (res, db, (spotifyAccountTemplate.authForTokens (req.query.code)), spotifyAccountTools.getHostInfo)
  })  

  // createPlaylist endpoint and function
  // extracts the information from the request
  // to name the playlist and check who the
  // host is. then goes through spotify to 
  // make the playlist on their account
  app.post('/playlist/create', function (req, res){
    spotifyPlaylistTools.createPlaylist (res, db, req.body.playName, req.body.host)
  })

  // searches the spotify account and sets
  // their most recent playlist ID as the
  // current playlist to add to.

  // TODO: FIX THIS, so that it does not
  // allow for a playlist that the user
  // does not control.
  app.post('/playlist/latest/spotify', function (req, res){
    spotifyPlaylistTools.findPlaylist (res, db, req.body.host)
  })

  // choose the last playlist
  // the host was using found
  // in the database
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

  // resetAllGuests endpoint and function:
  // removes all the guest from a current
  // host's party
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

/*________________________________________________________
TO BE SENT:
  body of request: 
    host           : the username of their spotify account. |
____________________________________________________________*/
  app.post('/songs/removeAll', function (req, res){
    removeList.songs (res, db, req.body.host)
  })

  //this should only be coming from Twilio,
  //to be fixed in gulp branch or something.
  app.post('/message', function (req, res){ 
    search ('guests', queryTemplate.findGuest (req.body.From), db, function (guestFound){
      if (!guestFound){
        respond.notGuest (res, req.body.From)
      }else{
        handleIncoming.incoming (res, db, req.body.From, guestFound, req.body.Body.toLowerCase())
      }
    })
  })
  app.listen(80)
})