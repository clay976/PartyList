// module paths without the ../../.. shit.
require('app-module-path').addPath(__dirname);

//node modules
var express                 = require('express')
const dotenv                = require('dotenv');

//app definitions
dotenv.config();

// routes
var login                   = require('routes/login')
var playlist                = require('routes/playlist')
var guests                  = require('routes/guests')
var message                 = require('routes/message')
var songs                   = require('routes/songs')

//database variable
var MongoClient             = require('mongodb').MongoClient
var mongoose                = require("mongoose");
var mongoUrl                = 'mongodb://localhost:27017/party'
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

})