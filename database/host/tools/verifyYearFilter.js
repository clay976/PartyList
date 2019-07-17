var addResponse   = require ('services/twilio/responses')

module.exports = function verifyYearFilter (requestObject) {
  return new Promise (function (fulfill, reject){
    for (var index = 0; index < 4; index ++){
      if ((requestObject.tracks[index].yearReleased < requestObject.databaseHost.minYear ) || (requestObject.databaseHost.maxYear < requestObject.tracks[index].yearReleased)){
        requestObject.tracks[index] = addResponse.yearFilter(requestObject.tracks[index].name, requestObject.tracks[index].artist, requestObject.databaseHost.minYear, requestObject.tracks[index].yearReleased, requestObject.databaseHost.maxYear)
        requestObject.databaseGuest.currentTracks[index] = requestObject.tracks[index]
      }
    }
    fulfill (requestObject)
  })
}