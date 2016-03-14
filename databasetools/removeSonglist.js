module.exports = function(db){
	db.collection('tracks').deleteMany (function(err, results){
		if (err){
			console.log (err, "error")
		}
	})
}
