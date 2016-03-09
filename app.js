//node modules
var fs = require('fs');
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var assert = require('assert');

//known needed variables.
//this is going to be a heavy refactor of this code to modularize it way more than it is
//right now. not really sure how this is going to go...
var spotifyTools = require ('./spotifyTools/tools');



//twillio variables
var twilioAccountSID = "AC85573f40ef0c3fb0c5aa58477f61b02e";
var twilioAccountSecret = "fcea26b2b0ae541d904ba23e12e2c499";
var twilio = require('twilio/lib')(twilioAccountSID, twilioAccountSecret);
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
var removeSonglist = require ('./databasetools/removeSonglist');
var insert = require ('./databasetools/insert');
var query = require ('./databasetools/querydb');
var update = require ('./databasetools/update');
var validateToken = require ('./databasetools/checkToken');

//mongo database variables
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var mongoUrl = 'mongodb://localhost:27017/party';

//connect to the database, this happens when api starts, and the conection doesn't close until the API shuts down/crashes
MongoClient.connect(mongoUrl, function serveEndpoints (err, db) {
  assert.equal(null, err);
  var stateKey = 'spotify_auth_state';
  app.use(express.static(__dirname + '/public')).use(cookieParser());
  //login function (this will be handles by the fron end soon)
  //the hosts spotify ID needs to be saved as a session varaible on the front end and passes back to the API
  //with every request so we know who is actually making the requests...
  app.get('/login', spotifyTools.login)

  //callback will save the hosts data and some other stuff to be queried in the db later.
  app.get('/callback', spotifyTools.handleHomePage);


  app.post('/createPlaylist', function (req, res){
    if (host){
      var playlistname = req.body.playName;
      if (playlistname) {
        console.log('creating: ' + playlistname);  
        //database call to obtain access token, if access token is expired then
        //obtain new access token by using refresh token
        validateToken.checkToken (host, db, function (tokenValid, docFound){
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
            request.post(options, function (error, response, body) {
              console.log ('creating playlist');
              playlist = JSON.parse (body);
              playlistID = playlist.id
              console.log (playlistID);
            });
            res.redirect('/#' +querystring.stringify({access_token: docFound.access_token,refresh_token: docFound.refresh_token}));
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
  app.post('/findPlaylist', function (req, res){
    if (host){
      removeSonglist (db);
      validateToken.checkToken (host, db, function (tokenValid, docFound){
        if (tokenValid){  
          var options = {
            url: 'https://api.spotify.com/v1/users/' + host + '/playlists',
            headers: {'Authorization': 'Bearer ' +docFound.access_token}
          };
          request.get(options, function (error, response, body) {
            if (!error) {
              playlistItems= JSON.parse (body);
              var playLid = playlistItems.items[0].id;
              console.log ("using latest playlist: "+ playlistItems.items[0].name);
              console.log ("playlist id: " +playLid);
              //updating the users current playlist id with the lastest playlist that was just found.
              var updateInfo = update.playlistID (playLid)
              update.updater (host, docFound, updateInfo, db, function (err){
                if (err){
                  console.log (err);
                }else{
                  console.log ("playlist updated");
                };
              });
              res.redirect('/#' +querystring.stringify({access_token: docFound.access_token,refresh_token: docFound.refresh_token}));
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

  app.post ('/resetAllGuests', function (req, res){
    db.clay976.drop();
  });

  app.post('/addGuest', function (req, res){
    if (host){
      var guestNum = req.body.guestNum;
      if (guestNum){
        var guestNum = '+1'+ guestNum;
        var guest2Find = query.findGuest (guestNum);
        query.search ('guests', guest2Find, db, function (guestFound){
          if (guestFound){
            res.send ('you already added this guest');
          }else{
            guest2Add = insert.guest (host, guestNum);
            insert.insert ('guests', guest2Add, db, function (result){
              res.redirect('/#' +querystring.stringify({access_token: docFound.access_token,refresh_token: docFound.refresh_token}));
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

  app.post('/resetSonglist', function (req, res){
    removeSonglist (db);
  });

  app.post('/message', function (req, res){
    if (host){  
      //TODO: delete these console logs and produce real messages to the user on the application side of things so..
      //that they actually know whats going on in the party instead of this coming to us as devs. 

      //this is also another problem in using twilio with a trial account.
      //we are only able to send messages to verified users and this might casue a problem in the future
      //if we can not find an automated way to add users to tyhe verified list when they message the host of the party!

      //this branch under messages is now under heavy dev for getting these messages back to the sender.
      var sender = req.body.From;
      var guest2Find = query.findGuest (sender);
      query.search ('guests', guest2Find, db, function (guestFound){
        if (guestFound){
          var guestRequestsLeft = guestFound.numRequests;
          var trackID = guestFound.currentTrack;;
          var searchParam = req.body.Body;
          if (searchParam == 'Yes' && trackID != ''){
            var trackObjID = query.findTrack (trackID);
            query.search ('tracks', trackObjID, db, function (trackDocFound){
              if (trackDocFound){
                var updateObj = update.tracksReqd ();
                update.updater ('tracks', trackDocFound, updateObj, db, function (err, resuts){
                  if (!err){
                    messageBody = ('\n\nThis track has already been requested, Your request will bump it up in the queue!\n\n Requests before next ad: ' +guestRequestsLeft+ '\n\n This song now has ' +( trackDocFound.numRequests+1) + ' requests!');
                    messageObject = messageTool.message (sender, messageBody);
                    twilio.sendMessage(messageObject, function (err, responseData) {
                      messageTool.responseHandler (err, responseData);
                    });
                  }else{
                    console.log (err);
                  };
                });
              }else{
                var track2Insert = insert.track (host, trackID);
                insert.insert ('tracks', track2Insert, db, function (result){
                  messageBody = ('\n\nYour request is new, it has been added to the play queue!\n\n Requests before next ad: ' +guestRequestsLeft+ '\n\n This song now has ' +1+ ' request!');
                  messageObject = messageTool.message (sender, messageBody);
                  twilio.sendMessage(messageObject, function (err, responseData) {
                    messageTool.responseHandler (err, responseData);
                  });
                });
              };

              var incrementGuest = update.guestConfirm ();
              update.updater ('guests', guest2Find, incrementGuest,db, function (err){
                if (err){
                  console.log (err);
                }
                if (guestFound.numRequests < 1){
                  messageBody = ('\n\nYou are recieving an advertisment because you have made 5 successful request');
                  messageObject = messageTool.message (sender, messageBody);
                  twilio.sendMessage(messageObject, function (err, responseData) {
                    messageTool.responseHandler (err, responseData);
                    var updateObj = update.guestReset ();
                    update.updater ('guests', guest2Find, updateObj, db, function (err, resuts){
                      if (err){
                        console.log (err);
                      };
                    });
                  });
                };
              });
            });
          }else if (searchParam == 'Yes'){
            messageBody = ('\n\nYou did not request a song to be confirmed yet!');
            messageObject = messageTool.message (sender, messageBody);
            twilio.sendMessage(messageObject, function (err, responseData) {
              messageTool.responseHandler (err, responseData);
            });
          }else if (searchParam == 'No'){
            messageBody = ('\n\nSorry about the wrong song, try modifying your search! Remember to not use any special characters.');
            messageObject = messageTool.message (sender, messageBody);
            twilio.sendMessage(messageObject, function (err, responseData) {
              messageTool.responseHandler (err, responseData);
            });
          }else{
            var trackTitle;
            var playlistID;
            var messageBody
            var options = {
              url: 'https://api.spotify.com/v1/search?q=' +searchParam+ '&type=track&limit=1'
            };   
            // searches spotify with the search parameter
            request.get(options, function (error, response, body) {
              if (error) {
                console.log ('error searching spotify for the song');
              };
              trackAdd = JSON.parse(body);
              if (trackAdd.tracks && trackAdd.tracks.total>0){
                trackID =trackAdd.tracks.items[0].id;
                trackTitle = trackAdd.tracks.items[0].name;
                trackArtist = trackAdd.tracks.items[0].artists[0].name;
                var guestReqObj = update.guestRequest (trackID);
                update.updater ('guests', guestFound, guestReqObj, db, function (err){
                  if (err){
                    console.log (err);
                  };
                });
                var trackObjID = query.findTrack (trackID);
                query.search ('tracks', trackObjID, db, function (trackDocFound){
                  var currentSongRequests;
                  if (trackDocFound){
                    currentSongRequests = trackDocFound.numRequests;
                    messageBody = ('track found: ' +trackTitle+ ' by ' +trackArtist+ '\n\n Current number of requests: ' +currentSongRequests+ '\n\nSend back "Yes" to confirm, "No" to discard this request!');
                  }else{
                    messageBody = ('track found: ' +trackTitle+ ' by ' +trackArtist+ '\n\n Current number of requests: 0 \n\nSend back "Yes" to confirm, "No" to discard this request!');
                  }
                  messageObject = messageTool.message (sender, messageBody);
                  twilio.sendMessage(messageObject, function (err, responseData) {
                    messageTool.responseHandler (err, responseData);
                  });
                });
              }else{
                messageBody = ('sorry, that song could be found, use as many key words as possible, make sure to not use any special characters either!');
                messageObject = messageTool.message (sender, messageBody);
                twilio.sendMessage(messageObject, function (err, responseData) {
                  messageTool.responseHandler (err, responseData);
                });
              };

              //this code needs to be changed so that it runs when we actually want to add a song to the playlist.
              //right now it is running as soon as the track is found, where that does not allow us to minipulate
              //the amount of requests that a song has!
              /*validateToken.checkToken (host, db, function(tokenValid, docFound){
                playlistID = docFound.playlistID;
                //these options create the object to make the spotify request
                var options = {
                  url: "https://api.spotify.com/v1/users/" +host+ "/playlists/"+playlistID+ "/tracks",
                  body: JSON.stringify({"uris": ["spotify:track:"+trackID]}),
                  dataType:'json',
                  headers: {
                    Authorization: "Bearer " + docFound.access_token,
                    "Content-Type": "application/json",
                  }
                };
                //this request is actually adds  the song to the playlist
                request.post(options, function(error, response, body) {
                  if (error){
                    messageBody = ('there was an error adding ' +trackTitle+ ' to the playlist, will provide more usefull error messages in the future');
                  }else{
                    console.log ('adding ' +trackTitle);
                    messageBody = (trackTitle+ ' by ' +trackArtist+ ' has been added to the playlist');
                  };
                  //logging the body of the spotify request will let the dev know if there are errors connecting to spotify.
                  messageObject = messageTool.message (sender, messageBody); 
                  twilio.sendMessage(messageObject, function(err, responseData) {
                    messageTool.responseHandler (err, responseData);
                  });
                console.log (body);
                });
              });*/
            });
          };
        }else{
          messageBody = ('sorry, you are not a guest of this party, you can send back a host code for this party. We have also send the host a text with your number in case they want to add it themselves');
          messageObject = messageTool.message (sender, messageBody);
          twilio.sendMessage(messageObject, function (err, responseData) {
            messageTool.responseHandler (err, responseData);
          });
          console.log ('a non-guest tried to add to the playlist');
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
      query.search (host,doc, db, function (docum){
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
        request.post(authOptions, function (error, response, body) {
          if (!error && response.statusCode === 200) {
            access_token = body.access_token;
            var documUpdate = query.findHost (host); 
            var updateInfo = update.accessToken (access_token);
            update.updater (host, documUpdate, updateInfo,db, function (error){
              console.log ('updated the access token:');
              query.search (host, doc, db, function (found){ 
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