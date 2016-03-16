//node modules
var express = require('express') // Express web server framework
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var assert = require('assert')

//my modules
var spotifyLoginTools = require ('./spotifyTools/loginTools')
var spotifyPlaylistTools = require ('./spotifyTools/playlistTools')
var handleIncoming = require ('./messageTools/handleIncoming')
var respond = require ('./messageTools/responses')

//app declaration and uses
var app = express()
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

//required documents and tools
var removeList = require ('./databasetools/removeList')
var insert = require ('./databasetools/insert')
var query = require ('./databasetools/querydb')
var update = require ('./databasetools/update')
var validateToken = require ('./databasetools/checkToken')

//mongo database variables
var MongoClient = require('mongodb').MongoClient
var dbTools = require ('./databasetools/abstractTools')
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
    spotifyLoginTools.preLoginScope(req, res)
  })

  // callback endpoint and function:
  // endpoint will get hit when a user is trying to login and
  // has already accepted the scope of our application
  app.get('/callback', function (req, res){
    spotifyLoginTools.homepage (req, res, db, spotifyLoginTools.retrieveAndPrepTokens)
  })

  // createPlaylist endpoint and function
  // extracts the information from the request
  // to name the playlist and check who the
  // host is. then goes through spotify to 
  // make the playlist on their account
  app.post('/createPlaylist', function (req, res){
    var playlistName = req.body.playName
    var host = req.body.host
    spotifyPlaylistTools.createPlaylist (res, db, playlistName, host, spotifyPlaylistTools.preparePlaylistRequest)
  })

  // searches the spotify account and sets
  // their most recent playlist ID as the
  // current playlist to add to.

  // TODO: FIX THIS, so that it does not
  // allow for a playlist that the user
  // does not control.
  app.post('/findPlaylist', function (req, res){
    var host = req.body.host
    removeList.songs (res, db, host)
    spotifyPlaylistTools.findPlaylist (res, db, host)
  })

  // resetAllGuests endpoint and function:
  // removes all the guest from a current
  // host's party
  app.post ('/resetAllGuests', function (req, res){
    var host = req.body.host
    removeList.guests (res, db, host)
  })

  app.post('/addGuest', function (req, res){
    var host = req.body.host
    var guestNum = req.body.guestNum
    dbTools.addGuest (res, d, host, guestNum)
  })

  app.post('/resetSonglist', function (req, res){
    var host = req.body.host
    removeList.songs (res, db, host)
  })

  app.post('/message', function (req, res){ 
    var sender = req.body.From
    var messageBody = req.body.Body.toLowerCase()
    if (messageBody.toLowerCase() === 'ask for invite'){
      handleIncoming.addGuest (res, db, sender, messageBody)
    }else{
      var guest2Find = query.findGuest (sender)
      query.search ('guests', guest2Find, db, function (guestFound){
        if (!guestFound){
          respond.notGuest (sender)
        }else{
          handleIncoming.incoming (res, db, sender, guestFound, messageBody)
        }
      })
    }
  })

  app.listen(80)
})