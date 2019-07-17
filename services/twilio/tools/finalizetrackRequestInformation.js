//twilio tools
var addResponse         = require ('services/twilio/responses')

module.exports = function finalizeTrackRequestInformation (requestObject){
	return new Promise (function (fulfill, reject){
    var response = 'We Found: \n'
    for (var index = 0; index < 4; index ++){
      if (requestObject.tracks[index].trackID){
        requestObject.tracks[index] = addResponse.askToConfirm (requestObject.tracks[index].name, requestObject.tracks[index].artist, requestObject.tracks[index].numRequests)
      }
      response = response+(index+1)+ ': ' +requestObject.tracks[index]+ '\n\n'
    }
    response = response + 'Send back the track number to confirm.'
    requestObject.response = response
    fulfill (requestObject)
  })
}
