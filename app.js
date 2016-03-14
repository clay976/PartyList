//node modules
var express = require('express') // Express web server framework
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var assert = require('assert')

//my modules
var spotifyLoginTools = require ('./spotifyTools/loginTools')
var spotifyPlaylistTools = require ('./spotifyTools/playlistTools')
var handleIncoming = require ('./messageTools/message')

//app declaration and uses
var app = express()
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

//global variables the api needs
//var client_id = 'a000adffbd26453fbef24e8c1ff69c3b' // Your client id
//var client_secret = '899b3ec7d52b4baabba05d6031663ba2' // Your client secret
//var redirect_uri = 'http://104.131.215.55:80/callback' // Your redirect uri

//required documents and tools
var removeSonglist = require ('./databasetools/removeSonglist')
var insert = require ('./databasetools/insert')
var query = require ('./databasetools/querydb')
var update = require ('./databasetools/update')
var validateToken = require ('./databasetools/checkToken')

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
    spotifyLoginTools.preLoginScope(req, res)
  })

  // callback endpoint and function:
  // endpoint will get hit when a user is trying to login and
  // has already accepted the scope of our application
  app.get('/callback', function (req, res){
    spotifyLoginTools.callback (req, res, db)
  })

  // createPlaylist endpoint and function
  // extracts the information from the request
  // to name the playlist and check who the
  // host is. then goes through spotify to 
  // make the playlist on their account
  app.post('/createPlaylist', function (req, res){
    var playlistName = req.body.playName
    var host = req.body.host
    spotifyPlaylistTools.createPlaylist (res, db, playlistName, host)
  })


  app.post('/findPlaylist', function (req, res){
    var host = req.body.host
    removeSonglist (db)
    spotifyPlaylistTools.findPlaylist (res, db, host)
  })

  app.post ('/resetAllGuests', function (req, res){
    db.clay976.drop()
  })

  app.post('/addGuest', function (req, res){
    var host = req.body.host
    var guestNum = req.body.guestNum
    if (guestNum.length === 10){
      var guestNum = '+1'+ guestNum
      var guest2Find = query.findGuest (guestNum)
      query.search ('guests', guest2Find, db, function (guestFound){
        if (guestFound){
          res.send ('you already added this guest')
        }else{
          guest2Add = insert.guest (host, guestNum)
          insert.insert ('guests', guest2Add, db, insert.responseHandler)
        }
      })
    }else{
      res.send ('number recieved not in the right format, please retry with the format "1234567890" (no speacial characters)')
    }
  })

  app.post('/resetSonglist', function (req, res){
    removeSonglist (db)
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