//database modules
var validateHost              = require ('database/host/validate')
var addGuestToDatabase        = require ('database/guest/add')

//twilio modules
var sendNewGuestWelcomeMessage = require ('services/guest/tools/sendNewGuestWelcomeMessage')

//tools
var validateGuestPhoneNumber  = require ('services/guest/tools/validatePhoneNumber')

var errorHandler              = require ('services/errorHandling/errorHandler')

module.exports = function add (requestObject, res){
  return new Promise (function (fulfill, reject){
    validateHost (requestObject)
    .then (function (requestObject){
      return validateGuestPhoneNumber(requestObject)
    })
    .then (function (requestObject){
      return addGuestToDatabase (requestObject)
    })
    .then (function (requestObject){
      return sendNewGuestWelcomeMessage (requestObject)
    })
    .then (function (requestObject){
      res.status(200).json('Guest Successfully added')
    })
    .catch(function (err){
      errorHandler (res, err)
    })
  })
}