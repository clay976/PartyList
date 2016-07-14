var query = require ('.querydb')
var update = require ('../update')
var JSONtemplates = require ('./JSONtemplates')
var querystring = require('querystring')

function addManyGuest (req, res, db){
  
}

function addGuest (res, db, host, guestNum){
  if (guestNum.length === 10){
    var guestNum = '+1'+ guestNum
    var guest2Find = query.findGuest (guestNum)
    query.search ('guests', guest2Find, db, function (guestFound){
      if (guestFound){
        res.send ('you already added this guest' + guestNum)
        console.log (guestFound)
      }else{
        guest2Add = insertTools.guest (host, guestNum)
        //TODO: add insert
        res.send (200, 'Guest added succesfully, number: '+ guestNum)
      }
    })
  }else{
    res.send ('number recieved not in the right format, please retry with the format "1234567890" (no speacial characters)')
  }
}

function resetGuest (db, guest2Find){
  var updateObj = update.guestReset ()
  update.updater ('guests', guest2Find, updateObj, db, update.responseHandler (updateObj))
}

module.exports = {
  addManyGuest : addManyGuest,
  resetGuest: resetGuest,
  addGuest: addGuest
}