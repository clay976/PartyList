var SpotifyWebApi = require('spotify-web-api-node');
var credentials 	= {
  clientId 			: 'a000adffbd26453fbef24e8c1ff69c3b',
  clientSecret 	: '899b3ec7d52b4baabba05d6031663ba2',
  redirectUri 	: 'http://104.131.215.55:80/callback'
};
var spotifyApi 		= new SpotifyWebApi(credentials);
var model 				= require ('./models')

function validateHost (host){
	return new Promise (function (fulfill, reject){
	  model.Host.findOne({ 'hostID' : host }).exec()
	  .then (function (hostInfo){
	    if (hostInfo){
	    	console.log ('just validated this host: ' +hostInfo.hostID)
	    	spotifyApi.setAccessToken (hostInfo.access_token)
	      fulfill (hostInfo)
	    }else{
	      reject ("validation error: could not find this host in our database, You must log in to continue")
	    }
	  })
	  .catch (function(err) {
	    reject ("mongo error: "+ err)
	  })
	 })
}

module.exports = {
  validateHost	: validateHost,
  spotifyApi		: spotifyApi
}