//node modules
var fs = require('fs');
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var assert = require('assert');

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
var insert = require ('./databasetools/insert');
var query = require ('./databasetools/querydb');
var update = require ('./databasetools/update');
var validateToken = require ('./databasetools/checkToken');

//mongo database variables
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var mongoUrl = 'mongodb://localhost:27017/party';

//connect to the database, this happens when api starts, and the conection doesn't close until the API shuts down/crashes
MongoClient.connect(mongoUrl, function (err, db) {
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
  app.get('/login', function (req, res) {
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
  app.get('/callback', function (req, res) {
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
      request.post(authOptions, function (error, response, body) {
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
            query.search (host, docuSearch, db, function (found){
              //error handling within the found funtion itself 
              if (found != null){
                console.log ('found existing user');
                // found host so we will update their tokens to access api
                var updateInfo = update.bothTokens (access_token, refresh_token);
                update.updater (host, found, updateInfo,db, function (error){
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
  app.post('/findPlaylist', function (req, res){
    if (host){
      validateToken.checkToken (host, db, function (tokenValid, docFound){
        if (tokenValid){  
          var options = {
            url: 'https://api.spotify.com/v1/users/' + host + '/playlists',
            headers: {'Authorization': 'Bearer ' +docFound.access_token}
          };
          request.get(options, function (error, response, body) {
            console.log ('finding playlist');
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

  app.post ('/resetAllGuests', function (req, res){
    db.clay976.drop();
  });
  app.post('/addGuest', function (req, res){
    if (host){
      var guestNum = req.body.guestNum;
      if (guestNum){
        var guestNum = '+1'+ guestNum;
        var foundGuest = query.findGuest (guestNum);
        query.search ('guests', foundGuest, db, function (guestFound){
          if (guestFound){
            res.send ('you already added this guest');
          }else{
            guest2Add = insert.guest (host, guestNum);
            insert.insert ('guests', guest2Add, db, function (result){
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
  app.post('/message', function (req, res){
    if (host){  
      //TODO: delete these console logs and produce real messages to the user on the application side of things so..
      //that they actually know whats going on in the party instead of this coming to us as devs. 

      //this is also another problem in using twilio with a trial account.
      //we are only able to send messages to verified users and this might casue a problem in the future
      //if we can not find an automated way to add users to tyhe verified list when they message the host of the party!

      //this branch under messages is now under heavy dev for getting these messages back to the sender.

      
      var sender = req.body.From;
      var foundGuest = query.findGuest (sender);
      query.search ('guests', foundGuest, db, function (guestFound){
        if (guestFound){
          var guestRequestsLeft
          var trackID;
          var searchParam = req.body.Body;
          if (searchParam == 'Yes'){
            trackID = guestFound.currentTrack;
            guestRequestsLeft = guestFound.numRequests;
            console.log (trackID);
            var trackObjID = query.findTrack (trackID);
            query.search ('tracks', trackObjID, db, function (trackDocFound){
              if (trackDocFound){
                console.log (trackDocFound);
                var incrementGuest = update.guestConfirm ();
                update.updater ('guests', foundGuest, incrementGuest,db, function (err){
                  if (err){
                    console.log (err);
                  }else{
                    var updateObj = update.tracksReqd ();
                    update.updater ('tracks', trackDocFound, updateObj, db, function (err, resuts){
                      if (!err){
                        messageBody = ('This track has already been requested, Your request will bump it up in the queue!\n\n Requests before next ad: ' +guestRequestsLeft+ '\n\n This song now has ' +trackDocFound.numRequests+ ' requests!');
                        messageObject = messageTool.message (sender, messageBody);
                        twilio.sendMessage(messageObject, function (err, responseData) {
                          messageTool.responseHandler (err, responseData);
                        });
                      }else{
                        console.log (err);
                      };
                    });
                  };
                });
              }else{
                console.log (guestFound);
                var trackIn = insert.track (host, trackID);
                insert.insert ('tracks', trackIn, db, function (result){
                  messageBody = ('Your request is new, it has been added to the play queue!\n\n Requests before next ad: ' +guestFound.numRequests+ '\n\n This song now has ' +1+ ' request!');
                  messageObject = messageTool.message (sender, messageBody);
                  twilio.sendMessage(messageObject, function (err, responseData) {
                    messageTool.responseHandler (err, responseData);
                  });
                });
              };
              console.log (guestFound.numRequests);
              if (guestFound.numRequests = 0){
                messageBody = ('You are recieving an advertisment because you have made 5 successful request');
                messageObject = messageTool.message (sender, messageBody);
                twilio.sendMessage(messageObject, function (err, responseData) {
                  messageTool.responseHandler (err, responseData);
                  var updateObj = update.guestReset ();
                  update.updater ('guests', host, updateObj, db, function (err, resuts){
                    if (err){
                      console.log (err);
                    };
                  });
                });
              };
            });
          }else if (searchParam == 'No'){
            messageBody = ('Sorry about the wrong song, try modifying your search! Remember to not use any special characters.');
            messageObject = messageTool.message (sender, messageBody);
            twilio.sendMessage(messageObject, function (err, responseData) {
              messageTool.responseHandler (err, responseData);
            });
          }else{
            console.log (searchParam);
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
              if ((trackAdd.tracks.total)>0){
                trackID =trackAdd.tracks.items[0].id;
                trackTitle = trackAdd.tracks.items[0].name;
                trackArtist = trackAdd.tracks.items[0].artists[0].name;

                var guestReqObj = update.guestRequest (trackID);
                update.updater ('guests', guestFound, guestReqObj, db, function (err){
                  if (err){
                    console.log (err);
                  };
                });
                messageBody = ('track found: ' +trackTitle+ ' by ' +trackArtist+ '\n\nSend back "Yes" to confirm, "No" to discard this request!');
                messageObject = messageTool.message (sender, messageBody);
                twilio.sendMessage(messageObject, function (err, responseData) {
                  messageTool.responseHandler (err, responseData);
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