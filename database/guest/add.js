var model             = require ('database/models')
var JSONtemplate      = require ('database/JSONtemps')

module.exports = function add (requestObject){
	return new Promise (function (fulfill, reject){
		var guestQuery    = {'phoneNum': requestObject.guestToAdd}
    	var infoToInsert  = JSONtemplate.Guest (requestObject.spotifyID, requestObject.guestToAdd)
        console.log (infoToInsert)
    	model.Guest.findOneAndUpdate(guestQuery, infoToInsert, {upsert:true}).exec()
    	.then (function (newGust){
    		fulfill (requestObject)
    	})
    	.catch (function (err){
    		reject (err)
    	})
	})
}