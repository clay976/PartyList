//twilio tools
var addResponse         = require ('twilio/responses')

module.exports = function buildResponse (guestObject){
  return new Promise (function (fulfill, reject){
    var response = 'We Found: \n'
    for (var index = 0; index < 4; index ++){
      if (guestObject.tracks[index].trackID){
        guestObject.tracks[index] = addResponse.askToConfirm (guestObject.tracks[index].name, guestObject.tracks[index].artist, guestObject.tracks[index].numRequests)
      }
      response = response+(index+1)+ ': ' +guestObject.tracks[index]+ '\n\n'
    }
    response = response + 'Send back the track number to confirm.'
    guestObject.response = response
    fulfill (guestObject.response)
  })
}