//node modules
var fs = require('fs');
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var assert = require('assert');

//twillio variables
var twilioAccountSID = "SKfbed6a62375068e1b9598e76e5c40d30";
var twilioAccountSecret = "bXbtASPnDrDY0VLkbckdCudFRKMZgXtO";
var twilio = require('twilio')(twilioAccountSID, twilioAccountSecret);
var messageTool = require ('./messageTools/message');

//app declaration and uses
var app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
//global variables the api needs
var client_id = 'a000adffbd26453fbef24e8c1ff69c3b'; // Your client id
var client_secret = '899b3ec7d52b4baabba05d6031663ba2'; // Your client secret
var redirect_uri = 'http://104.131.215.55:80/callback'; // Your redirect uri
var host;

//required documents and tools
var insert = require ('./databasetools/insert');
var query = require ('./databasetools/querydb');
var update = require ('./databasetools/update');
var validateToken = require ('./databasetools/checkToken');

//mongo database variables
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var mongoUrl = 'mongodb://localhost:27017/party';

//connect to the database, this happens when api starts, and the conection doesn't close until the API shuts down/crashes
MongoClient.connect(mongoUrl, function(err, db) {
  assert.equal(null, err);
  var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    };
    return text;
  };
  var stateKey = 'spotify_auth_state';
  app.use(express.static(__dirname + '/public'))
    .use(cookieParser());
  //login function (this will be handles by the fron end soon)
  //the hosts spotify ID needs to be saved as a session varaible on the front end and passes back to the API
  //with every request so we know who is actually making the requests...
  app.get('/login', function(req, res) {
    console.log ('loging in');
    var state = generateRandomString(16);
    res.cookie(stateKey, state);
    // your application requests authorization
    var scope = 'user-read-private user-read-email user-read-birthdate streaming playlist-modify-private playlist-modify-public playlist-read-private';
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      })
    );
  });
  //callback will save the hosts data and some other stuff to be queried in the db later.
  app.get('/callback', function(req, res) {
    //requests refresh and access tokens
    //after checking the state parameter
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;
    if (state === null || state !== storedState) {
      res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        })
      );
    }else{
      res.clearCookie(stateKey);
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
      };
      //this is the actual post to retreive the access and refresh tokens that wqill be used later.
      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          var access_token = body.access_token;
          var refresh_token = body.refresh_token;
          //databasecalls to save access and refresh tokens in the partyList collection
          //unser the tokens document
          var options = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
          };
          // use the access token to access the Spotify Web API
          request.get(options, function(error, response, body) {
            var found;
            host = (body.id).toString();
            console.log ('searching for ' + host);
            docuSearch = query.findHost (host);
            var docuInsert = insert.apiInfo (host,access_token, refresh_token);
            //database call to save the tokens and user id as a host collection document
            query.search (host, docuSearch, db, function(found){
              //error handling within the found funtion itself 
              if (found != null){
                console.log ('found existing user');
                // found host so we will update their tokens to access api
                var updateInfo = update.bothTokens (access_token, refresh_token);
                update.updater (host, found, updateInfo,db, function(error){
                  console.log ('updated the tokens');
                });
              }else{
                console.log ('creating new user');
                insert.insert (host, docuInsert, db, function (result){
                  //error handling withjin the insert funtion itself
                  console.log("Inserted a document into the" +host+ " collection.");
                  console.log (result);
                });
              };
            });
          });
          // we can also pass the token to the browser to make requests from there
          res.redirect('/#' +querystring.stringify({access_token: access_token,refresh_token: refresh_token}));
        }else{
          res.redirect('/#' +querystring.stringify({error: 'invalid_token'}));
        };
      });
    };
  });
  app.post('/createPlaylist', function(req, res){
    if (host){
      var playlistname = req.body.playName;
      if (playlistname) {
        console.log('creating: ' + playlistname);  
        //database casll to obtain access token, if access token is expired then
        //obtain new access token by using refresh token
        validateToken.checkToken (host, db, function(tokenValid, docFound){
          if (tokenValid){   
            var options = {
              url: 'https://api.spotify.com/v1/users/' +host+ '/playlists',
              body: JSON.stringify({
                'name': playlistname,
                'public': false
              }),
              dataType:'json',
              headers: {
                'Authorization': 'Bearer ' + docFound.access_token,
                'Content-Type': 'application/json',
              }
            };
            request.post(options, function(error, response, body) {
              console.log ('creating playlist');
              playlist = JSON.parse (body);
              playlistID = playlist.id
              console.log (playlistID);
            });
            res.send('playlist created');
          }else{
            res.redirect('/login');
          };
        });
      }else{
        console.log('dumb user didnt actually send playlist name');
        res.send({error: 'please_enter_a_name'});
      };
    }else{
      res.redirect('/');
    };
  });
  app.post('/findPlaylist', function(req, res){
    if (host){
      validateToken.checkToken (host, db, function(tokenValid, docFound){
        if (tokenValid){  
          var options = {
            url: 'https://api.spotify.com/v1/users/' + host + '/playlists',
            headers: {'Authorization': 'Bearer ' +docFound.access_token}
          };
          request.get(options, function(error, response, body) {
            console.log ('finding playlist');
            if (!error) {
              playlistItems= JSON.parse (body);
              var playLid = playlistItems.items[0].id;
              console.log ("using latest playlist: "+ playlistItems.items[0].name);
              console.log ("playlist id: " +playLid);
              //updating the users current playlist id with the lastest playlist that was just found.
              var updateInfo = update.playlistID (playLid)
              update.updater (host, docFound, updateInfo, db, function(err){
                if (err){
                  console.log (err);
                }else{
                  console.log ("playlist updated");
                };
              });
              res.send('playlist updated');
            }else{
              console.log (error);
            };
          });
        }else{
          res.redirect('/');
        };  
      });
    }else{
      res.redirect('/');
    };
  });
  app.post('/addGuest', function(req, res){
    if (host){
      var guestNum = req.body.guestNum;
      if (guestNum){
        var guestNum = '+1'+ guestNum;
        var foundGuest = query.findGuest (guestNum);
        query.search ('guests', foundGuest, db, function(guestFound){
          if (guestFound){
            res.send ('you already added this guest');
          }else{
            guest2Add = insert.guest (host, guestNum);
            insert.insert ('guests', guest2Add, db, function(result){
              res.send('guest updated');
            });
          };
        });  
      }else{
        res.send ('you did not put a number in')
      };
    }else{
      res.redirect('/');
    };
  });
  app.post('/message', function(req, res){
    if (host){ 
      console.log (req.body.From); 
      //TODO: delete these console logs and produce real messages to the user on the application side of things so..
      //that they actually know whats going on in the party instead of this coming to us as devs. 

      //need to find out why the message system is not working.
      //giving us an error that says the pohone number is unverified.
      //this is also another problem in using twilio with a trial account.
      //we are only able to send messages to verified users and this might casue a problem in the future
      //if we can not find an automated way to add users to tyhe verified list when they message the host of the party!

      //this branch under messages is now under heavy dev for getting these messages back to the sender.

      
      var sender = req.body.From;
      var foundGuest = query.findGuest (sender);
      query.search ('guests', foundGuest, db, function(guestFound){
        if (guestFound){
          var searchParam = req.body.Body;
          var trackID;
          var trackTitle;
          var playlistID;
          var messageBody
          var options = {
            url: 'https://api.spotify.com/v1/search?q=' +searchParam+ '&type=track&limit=1'
          };   
          request.get(options, function(error, response, body) {
            console.log (body);
            if (error) {
              console.log ('noodle');
            };
            trackAdd = JSON.parse(body);
            if ((trackAdd.tracks.total)>0){
              trackID =trackAdd.tracks.items[0].id;
              console.log (trackID);
              trackTitle = trackAdd.tracks.items[0].name;
              //insert.insert ('trackListing', trackAdd);
              console.log ('adding '+ trackTitle+ ' by ');
              messageBody = ('adding '+ trackTitle+ ' to playlist');
              messageObject = messageTool.message (sender, messageBody);
              console.log (sender);
              console.log (messageObject);
              twilio.messages.create(messageObject, function(err, message) { 
                console.log(message.sid); 
              });
              validateToken.checkToken (host, db, function(tokenValid, docFound){
                playlistID = docFound.playlistID;
                var options = {
                  url: "https://api.spotify.com/v1/users/" +host+ "/playlists/"+playlistID+ "/tracks",
                  body: JSON.stringify({"uris": ["spotify:track:"+trackID]}),
                  dataType:'json',
                  headers: {
                    Authorization: "Bearer " + docFound.access_token,
                    "Content-Type": "application/json",
                  }
                };
                request.post(options, function(error, response, body) {
                });
              });
            };
          });
        }else{
          //message.message ('you are not a guest at a party');
          console.log ('they are not a guest');
        };
      });
    }else{
      res.redirect('/'); 
    };
  });
  app.listen(80);
  setInterval(function refreshToken (req, res) {
    if (host){
      // requesting access token from refresh token
      doc = query.findHost (host);
      var refresh_token;
      query.search (host,doc, db, function(docum){
        refresh_token = docum.refresh_token;
        console.log (refresh_token);
        var authOptions = {
          url: 'https://accounts.spotify.com/api/token',
          headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
          form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
          },
          json: true
        };
        request.post(authOptions, function(error, response, body) {
          if (!error && response.statusCode === 200) {
            access_token = body.access_token;
            var documUpdate = query.findHost (host); 
            var updateInfo = update.accessToken (access_token);
            update.updater (host, documUpdate, updateInfo,db, function(error){
              console.log ('updated the access token:');
              query.search (host, {'host':host}, db, function(found){ 
                if (found != null){
                  console.log (found.access_token);
                };
              });
            });
          };
        });
      });
    };
  }, 3540000);
});