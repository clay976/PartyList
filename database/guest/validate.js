//Node modules

//app modules
//database tools
var JSONtemplate    = require ('database/JSONtemps')
var model           = require ('database/models')
var validateHost    = require ('database/host/validate')

//twilio tools
var response        = require ('services/twilio/responses')

//find the guest in our database by their phone number
//if their number is not found or if they are not apart of anyone's parties currently. They are told they are not a guest.
module.exports = function validate (requestObject){
  return new Promise (function (fulfill, reject){
    model.Guest.findOne({ 'phoneNum' : requestObject.guestPhoneNumber })
    .then (function (databaseGuest){
      if (databaseGuest){
        if (databaseGuest.hostID){
          requestObject.databaseGuest = databaseGuest
          requestObject.databaseGuest.lastMessage = requestObject.guestMessage
          fulfill (requestObject)
        }else reject (response.notGuest)
      }else reject (response.notGuest)
    })
    .catch (function (err){
      reject ({
        statusCode  : 500,
        message     : "internal server error with database, please try again",
        stack       : "database/guest/validate"
      })
    })
  })
}