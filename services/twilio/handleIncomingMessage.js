var twilio       				= require('config/twilio')

var validateGuest 				= require ('database/guest/validate')
var validateHost  				= require ('database/host/validate')
var searchForNewRequest 		= require ('services/twilio/searchForNewRequest')
var confirmingCurrentTrack		= require ('services/twilio/confirmingCurrentTrack')

module.exports = function handleIncomingMessage (requestObject, res){
	return new Promise (function (fulfill, reject){
	  var resp          = new twilio.services.TwimlResponse()
	  res.writeHead (200, {'Content-Type': 'text/xml'})
	  validateGuest (requestObject)
	  .then (function (requestObject){
	    requestObject.spotifyID = requestObject.databaseGuest.hostID
	    return validateHost (requestObject)
	  })
	  .then (function (requestObject){
	    if ((messageInDictionary(requestObject.guestMessage)) & (requestObject.databaseGuest.currentTracks != '')){ 
	      return confirmingCurrentTrack (requestObject)
	    }else{
	      return searchForNewRequest (requestObject)
	    }
	  })
	  .then (function (requestObject){
	    resp.message (requestObject.response)
	    res.end(resp.toString())
	  })
	  .catch (function (err){
	    if (err.stack){
	      console.log (err.stack)
	      resp.message (err.message)
	      res.end(resp.toString())
	    }else{
	      console.log (err)
	      resp.message (err)
	      res.end(resp.toString())
	    }
	  })
	})
}

function messageInDictionary (guestMessage){
	return ((guestMessage === '1') || (guestMessage === '2') || (guestMessage === '3') ||(guestMessage === '4'))
}
