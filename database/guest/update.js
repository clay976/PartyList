//app modules
//Database modules
var model             = require ('database/models')

module.exports = function update (requestObject){
  return new Promise (function (fulfill, reject){
    var update = requestObject.databaseGuest
    model.Guest.findOneAndUpdate({'phoneNum': requestObject.guestPhoneNumber}, update, {upsert:true}).exec()
    .then (function (update){
      fulfill (requestObject)
    })
    .catch (function (err){
    	reject (err)
    })
  })
}