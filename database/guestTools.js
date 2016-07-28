var search = require ('./query/search')
var queryTemplate = require ('./query/JSONtemps')
var updateTemplate = require ('./update/JSONtemps')

function addManyGuest (req, res, db){
  var body = JSON.parse(req)
  var host = body.host
  var nums = body.guestNums
  var count = nums.length
  for (var i = 0; i < count; i++) {
    addGuest (res, db, host, nums[i])
  }
}

function addGuest (res, db, host, guestNum){
  if (guestNum.length === 10){
    var guestNum = '+1'+ guestNum
    search.search ('guests', queryTemplate.findGuest (guestNum), db, function (guestFound){
      if (guestFound){
        res.status(200).send('you already added this guest' + guestNum)
      }else{
        //db.collection('guests').insertOne(insertTemplate.guest (host, guestNum), insertResponseHandler)
        res.status(200).send('Guest added succesfully, number: '+ guestNum)
      }
    })
  }else{
    res.status(400).send('number recieved not in the right format, please retry with the format "1234567890" (no speacial characters)')
  }
}

function resetGuest (db, guest2Find){
  db.collection('guest').updateOne(guest2Find, updateTemplate.guestReset(), updateResponseHandler)
}

function validateGuest (body){
  return new Promise (function (fulfill, reject){
    (model.Host.findOne({ 'phoneNum' : body.From }).exec())
    .then (function (guestInfo){
      if (guestInfo.hostID){
        guestInfo.lastMessage = (body.Body).toLowerCare()
        fulfill (guestInfo) 
      }else{
        reject ('could not find this document in our database, this may be a problem on our end, sorry!')
      }
    })
  })
}

module.exports = {
  addManyGuest : addManyGuest,
  resetGuest: resetGuest,
  addGuest: addGuest,
  validateGuest
}