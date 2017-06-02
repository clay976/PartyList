var JSONtemplate = require ('./JSONtemps')
var model = require ('./models')
var hostAcountTools = require ('./hostTools')
var response = require ('../twilio/responses')

//node modules
var twilio = require('twilio')
var sid = 'AC85573f40ef0c3fb0c5aa58477f61b02e'
var atoken = 'fcea26b2b0ae541d904ba23e12e2c499'
var client = require('twilio/lib')(sid, atoken);

function addManyGuest (req, res){
  var body = JSON.parse(req)
  var nums = body.guestNums
  var count = nums.length
  for (var i = 0; i < count; i++) {
    addGuest (res, db, body.host, nums[i])
  }
}

function addGuest (req, res){
  var guestNum = req.body.guestNum
  var hostID = req.body.hostID
  var guestQuery = {'phoneNum': '+1' +guestNum}
  var infoToInsert = JSONtemplate.Guest (hostID, '+1' +guestNum)
  var hostInfo = hostAcountTools.validateHost (hostID)
  
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
function validateGuest (body){
  return new Promise (function (fulfill, reject){
    var message = (body.Body).toLowerCase().trim()
    model.Guest.findOne({ 'phoneNum' : body.From }).exec()
    .then (function (guestInfo){
      /*if (message === 'add me please'){
        console.log ('adding guest: '+ body)
        model.Guest.findOneAndUpdate({'phoneNum': body.From}, upsertTemplate.Guest ('clay976', body.From), {upsert:true}).exec()
        .then (function (updated){
          reject ('You have been added succesfully!\n\n Songs can be searched by sending a text like this "Drake One Dance". Confirm your request after it is found. Songs with 2 requests will be added to the playlist. You can find the playlist here:  https://open.spotify.com/user/clay976/playlist/4zTJyhtgvVuNvGFwDDSfJB')
        })
      }else */
      if (guestInfo){
        if (guestInfo.hostID){
          guestInfo.lastMessage = message
          fulfill (guestInfo) 
        }else reject (response.notGuest)
      }else reject (response.notGuest)
    })
    .catch (function (err){
      console.log (err)
      reject (response.errorOnOurEnd)
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
  addGuest                    : addGuest,
  validateGuest               : validateGuest,
  updateGuestAndTrackIfNeeded : updateGuestAndTrackIfNeeded
}