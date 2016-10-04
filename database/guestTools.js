var queryTemplate = require ('./query/JSONtemps')
var upsertTemplate = require ('./upsert/JSONtemps')
var model = require ('./models')
var hostAcountTools = require ('./hostTools')
var addResponse = require ('../twilio/responses')

function addManyGuest (req, res){
  var body = JSON.parse(req)
  var nums = body.guestNums
  var count = nums.length
  for (var i = 0; i < count; i++) {
    addGuest (res, db, body.host, nums[i])
  }
}

function addGuest (req, res){
  hostAcountTools.validateHost (req.body.host)
  .then (function (){
    return validateRequest(req)
  })
  .then (function (){
    return model.Guest.findOneAndUpdate({'phoneNum': '+1'+req.body.guestNum}, upsertTemplate.Guest (req.body.host, '+1'+req.body.guestNum), {upsert:true}).exec()
  })
  .then (function (update){
    res.status(200).json ('guest added succsefully')
  })
  .catch (function (err){
    res.status(400).json('error adding guest: '+err)
  })
}

function validateRequest (req){
  return new Promise (function (fulfill, reject){
    if (req.body.guestNum){
      if (req.body.guestNum.length === 10) fulfill (true)
      else reject ('number not the right length, please retry with the format "1234567890" (no speacial characters)')
    }else reject ('no phone number recieved to add as a guest')
  })
}

function validateGuest (body){
  console.log ('incoming request')
  console.log (body)
  var message = (body.Body).toLowerCase().trim()
  return new Promise (function (fulfill, reject){
    model.Guest.findOne({ 'phoneNum' : body.From }).exec()
    .then (function (guestInfo){
      if (guestInfo){
        guestInfo.lastMessage = message
        fulfill (guestInfo) 
      }else{
        if (message === 'add me please'){
          console.log ('adding guest: '+ body)
          model.Guest.findOneAndUpdate({'phoneNum': body.From}, upsertTemplate.Guest ('clay976', body.From), {upsert:true}).exec()
          .then (function (updated){
            reject ('You have been added succesfully!\n\n Songs can be searched by sending a text like this "Drake One Dance". Confirm your request after it is found. Songs with 2 requests will be added to the playlist.')
          })
        }else{
          reject (addResponse.notGuest)
        }
      }
    })
    .catch (function (err){
      reject ('validating guest failed: ' +err)
    })
  })
}

function updateGuestAndTrackIfNeeded (guestReqObject){
  return new Promise (function (fulfill, reject){
    updateGuestIfNeeded (guestReqObject)
    .then (updateTrackIfNeeded (guestReqObject))
    .then (function (updatedObject){
      fulfill (guestReqObject)
    })
    .catch (function (err){
      reject ('database '+err)
    })
  })
}

function updateGuestIfNeeded (guestReqObject){
  return new Promise (function (fulfill, reject){
    if (guestReqObject.guestUpdate){
      console.log (guestReqObject.guestUpdate)
      model.Guest.findOneAndUpdate({ 'phoneNum' : guestReqObject.guest.phoneNum}, guestReqObject.guestUpdate).exec()
      .then (function (updated){
        fulfill (guestReqObject)
      })
      .catch (function (err){
        reject ('error updating guest in database: ' +err)
      })
    }else fulfill (guestReqObject)
  })
}

function updateTrackIfNeeded (guestReqObject){
  return new Promise (function (fulfill, reject){
    if (guestReqObject.trackUpdate){
      model.Track.findOneAndUpdate({ 'trackID' : guestReqObject.guest.currentTrack.trackID}, guestReqObject.trackUpdate, {upsert:true}).exec()
      .then (function (updated){
        fulfill (guestReqObject)
      })
      .catch (function (err){
        reject ('error updating track in database: ' +err)
      })
    }else fulfill (guestReqObject)
  })
}

module.exports = {
  addManyGuest                : addManyGuest,
  addGuest                    : addGuest,
  validateGuest               : validateGuest,
  updateGuestAndTrackIfNeeded : updateGuestAndTrackIfNeeded
}