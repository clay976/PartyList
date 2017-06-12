var SpotifyWebApi = require('spotify-web-api-node');
var credentials 	= {
  clientId 			  : 'a000adffbd26453fbef24e8c1ff69c3b',
  clientSecret 	  : '899b3ec7d52b4baabba05d6031663ba2',
  redirectUri     : 'http://104.131.215.55:80/callback'
}
var spotifyApi 		= new SpotifyWebApi(credentials);
var model 				= require ('./models')
var addResponse   = require ('../twilio/responses')

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

function searchDatabaseForHost (guestObject){
  return new Promise (function (fulfill, reject){
    var query     = {'hostID' : guestObject.guest.hostID}

    model.Host.findOne(query).exec()
    .then (function (host){
      guestObject.host = host
      fulfill (guestObject)
    })
    .catch (function (err){
      reject (err)
    })
  }) 
}

function explicitFilter (req, res){
  validateHost (req.body.hostID)
  .then (function (hostInfo){
    console.log (hostInfo)
    model.Host.findOneAndUpdate({ 'hostID' : hostInfo.hostID }, { $set: {'explicit' : req.body.explicit}}).exec()
  })
  .then (res.status(200).json ('explicit filter successfully set to ' +req.body.explicit))
  .catch (function(err) {
    res.status(err.status).json('failed to set explicit filter, ' +err)
    //fixed option: filter out genres next: go to sleep with girlfriend (all actively playing paties: katya), requested songs: sleep, songs requested: sleep
  })
}

function minYear (req, res){
  validateHost (req.body.hostID)
  .then (function (hostInfo){
    model.Host.findOneAndUpdate({ 'hostID' : hostInfo.hostID }, { $set: {'minYear' : req.body.year}}).exec()
  })
  .then (res.status(200).json ('minimum year of songs set to ' +req.body.year))
  .catch (function(err) {
    res.status(err.status).json('failed to set explicit filter, ' +err)
    //fixed option: filter out genres next: go to sleep with girlfriend (all actively playing paties: katya), requested songs: sleep, songs requested: sleep
  })
}

function maxYear (req, res){
  validateHost (req.body.hostID)
  .then (function (hostInfo){
    model.Host.findOneAndUpdate({ 'hostID' : hostInfo.hostID }, { $set: {'maxYear' : req.body.year}}).exec()
  })
  .then (res.status(200).json ('maximum year of songs set to ' +req.body.year))
  .catch (function(err) {
    res.status(err.status).json('failed to set explicit filter, ' +err)
    //fixed option: filter out genres next: go to sleep with girlfriend (all actively playing paties: katya), requested songs: sleep, songs requested: sleep
  })
}

function verifyExplicitFilter (guestObject) {
  return new Promise (function (fulfill, reject){
    if (!guestObject.host.explicit && guestObject.track.explicit){
      reject (addResponse.explicit(guestObject.track.name, guestObject.track.artist))
    }else{
      fulfill (guestObject)
    }
  })
}

function verifyYearFilter (guestObject) {
  return new Promise (function (fulfill, reject){
    console.log ('min ' +guestObject.host.minYear+ ' is less than ' +guestObject.track.yearReleased+ ' which is less than ' +guestObject.host.maxYear)
    if ((guestObject.host.minYear <= guestObject.track.yearReleased) & (guestObject.track.yearReleased <= guestObject.host.maxYear)){
      fulfill (guestObject)
    }else{
      reject (addResponse.yearFilter(guestObject.track.name, guestObject.track.artist, guestObject.host.minYear, guestObject.track.yearReleased, guestObject.host.maxYear))
    }
  })
}

module.exports = {
  validateHost					: validateHost,
  spotifyApi						: spotifyApi,
  searchDatabaseForHost : searchDatabaseForHost,
  explicitFilter        : explicitFilter,
  verifyExplicitFilter  : verifyExplicitFilter,
  verifyYearFilter      : verifyYearFilter,
  minYear               : minYear,
  maxYear               : maxYear
}