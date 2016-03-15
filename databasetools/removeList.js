function songs (db){
	db.collection('tracks').deleteMany (function(err, results){
		if (err){
			console.log (err, "error")
		}
	})
}

function guests (db){
	db.collection('guests').deleteMany (function(err, results){
		if (err){
			console.log (err, "error")
		}
	})
}

module.exports = {
	songs: songs,
	guests: guests
}