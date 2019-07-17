//Node modules

//app modules
//database tools
var model           = require ('database/models')
var validateHost    = require ('database/host/validate')

/*
//adds multiple guests to party list
function addManyGuest (req, res){
  var body  = JSON.parse(req)
  var nums  = body.guestNums
  var count = nums.length
  for (var i = 0; i < count; i++) {
    addGuest (res, db, body.host, nums[i])
  }
}*/
  /*
  var guestQuery    = {'phoneNum': '+1' +guestNum}
  var infoToInsert  = JSONtemplate.Guest (hostID, '+1' +guestNum)
  var hostInfo      = 
  
  hostInfo
  .then (validateRequest(req))
  .then (model.Guest.findOneAndUpdate(guestQuery, infoToInsert, {upsert:true}).exec())
  .then (function (hostInfo){
    
  })*/

module.exports = function getAll (requestObject, res){
  var guestQuery  = {'hostID': requestObject.spotifyID}
  model.Guest.find(guestQuery).exec()
  .then (function (guests){
    return guests
  })
  .then (function (guests){
    res.status(200).json (guests)
  })
  .catch (function (err){
    console.log (err)
  })
}