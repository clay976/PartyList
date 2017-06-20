var JSONtemplate    = require ('./JSONtemps')
var model           = require ('./models')
var hostAcountTools = require ('./hostTools')
var response        = require ('../twilio/responses')

//node modules
var twilio          = require('twilio')
var sid             = 'AC85573f40ef0c3fb0c5aa58477f61b02e'
var atoken          = 'fcea26b2b0ae541d904ba23e12e2c499'
var client          = require('twilio/lib')(sid, atoken);

function addManyGuest (req, res){
  var body  = JSON.parse(req)
  var nums  = body.guestNums
  var count = nums.length
  for (var i = 0; i < count; i++) {
    addGuest (res, db, body.host, nums[i])
  }
}

function addGuest (req, res){
  var guestNum      = req.body.guestNum
  var hostID        = req.body.hostID
  var guestQuery    = {'phoneNum': '+1' +guestNum}
  var infoToInsert  = JSONtemplate.Guest (hostID, '+1' +guestNum)
  var hostInfo      = hostAcountTools.validateHost (hostID)
  
  hostInfo
  .then (validateRequest(req))
  .then (model.Guest.findOneAndUpdate(guestQuery, infoToInsert, {upsert:true}).exec())
  .then (function (hostInfo){
    client.sendMessage(welcomeMessage (guestNum, hostInfo.hostID, hostInfo.reqThreshold, hostInfo.playlistID))
  })
  .then (res.status(200).json ('guest, with phone number: ' +guestNum+ ', added succsefully'))
  .catch(function (err){
    console.log (err.stack)
    res.status(400).json('error adding guest: '+err)
  })
}

//validates that the request from client side is present and in the right format
function validateRequest (req){
  return new Promise (function (fulfill, reject){
    if (req.body.guestNum){
      if (req.body.guestNum.length === 10) {
        fulfill (true)
      }else{
        reject ('number not the right length, please retry with the format "1234567890" (no speacial characters)')
      }
    }else{
      reject ('no phone number recieved to add as a guest')
    }
  })
}

//find the guest in our database by their phone number
//if their number is not found or if they are not apart of anyone's parties currently. They are told they are not a guest.
function validateGuest (guestNumber, message){
  return new Promise (function (fulfill, reject){
    model.Guest.findOne({ 'phoneNum' : guestNumber })
    .then (function (guestInfo){
      if (guestInfo){
        if (guestInfo.hostID){
          console.log (guestInfo)
          var guestObject = JSONtemplate.spotifyGuest (guestInfo)
          guestObject.guest.lastMessage = message
          fulfill (guestObject) 
        }else reject (response.notGuest)
      }else reject (response.notGuest)
    })
    .catch (function (err){
      reject (err)
    })
  })
}

function setCurrentTrack (guestObject){
  return new Promise (function (fulfill, reject){
    var track   = JSONtemplate.setGuestTrack (guestObject.track.trackID, guestObject.track.name, guestObject.track.artist, guestObject.track.numRequests)
    var query   = {'phoneNum' : guestObject.guest.phoneNum}
    var update  = {$set : {'currentTrack' : track}}

    model.Guest.findOneAndUpdate(query, update).exec()
    .then (function (guest){
      fulfill (guestObject)
    })
    .catch (function (err){
      reject (err)
    })
  })
}

// the guest has confirmed the last song that they sent to us so we will see about adding it to the playlist.
function clearAndAddPreviousRequest (guestObject){
  return new Promise (function (fulfill, reject){
    var query   = { 'phoneNum' : guestObject.guest.phoneNum}
    var update  = JSONtemplate.clearGuestTrack (-1, guestObject.guest.currentTrack.trackID)

    model.Guest.findOneAndUpdate(query, update).exec()
    .then (function (guest){
      fulfill (guestObject)
    })
    .catch (function (err){
      reject (err)
    })
  })
}

function welcomeMessage (toNum, hostID, reqThreshold, playlistID){
  return {
    to    :'+1' +toNum,
    from  :'+15878033620',
    body  : response.welcome (hostID, reqThreshold, playlistID)
  }
}

module.exports = {
  addManyGuest                : addManyGuest,
  validateGuest               : validateGuest,
  setCurrentTrack             : setCurrentTrack,
  clearAndAddPreviousRequest  : clearAndAddPreviousRequest,
  addGuest                    : addGuest
}