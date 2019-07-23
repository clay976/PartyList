// module paths without the ../../.. shit.
require('app-module-path').addPath(__dirname);

//node modules
var express                 = require('express')
var mongoose                = require("mongoose")
const dotenv                = require('dotenv')

//API Wrappers
spotifyApi                  = require ('config/SpotifyAPI')

//app definitions
dotenv.config();

// routes
var login                   = require('routes/login')
var playlist                = require('routes/playlist')
var guests                  = require('routes/guests')
var message                 = require('routes/message')
var songs                   = require('routes/songs')

//database variable
var model                   = require ('database/models')
var mongoUrl                = process.env.MONGO_URL
mongoose.Promise            = global.Promise;

//connect to the database, this happens when api starts, and the conection doesn't close until the API shuts down/crashes
mongoose.connect(mongoUrl, { useNewUrlParser: true, useFindAndModify: false})

//app declaration and uses
var db = mongoose.connection;
db.on('error', function(error){
	console.log ("Server Failed to Start, There was an error connecting to the database.")
	console.error.bind(console, 'connection error:')
});
db.once('connected', function(db) {

  var app = express()
  app.use(express.static(__dirname + '/public'))
  .use('/login', login)
  .use('/playlist', playlist)
  .use('/guests', guests)
  .use('/message', message) 
  .use('/songs', songs) 
  .listen(80)

  console.log ("Server Started successfully")

  setInterval(autoRefreshHosts, 3000000)

  async function autoRefreshHosts (){
    try{
      var currentTime = Date.now ()
      var diff = currentTime - 3000000
      let hostsToRefresh =  await model.Host.find({ 'timeSet' : { $lt: diff}}).exec()
      var promises = hostsToRefresh.map (async host => {
        spotifyAPI.setRefrshToken (host.access_token)
        let response = await spotifyAPI.refreshAccessToken()
        console.log (response.body)
        host.access_token = response.body.access_token
        host.save()
        return host
      })
      
      let results = await Promise.all (promises)
      console.log ('==================REFRESH SUCCESSFULL=================')
      console.log (results)

    }catch (err){
      console.log ('there was a problem refreshing hosts tokens')
      console.log (err)
    }
  }  
})