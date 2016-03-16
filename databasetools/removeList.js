var loginTool = require ('../spotifyTools/loginTools')

function songs (res, db, host){
	db.collection('tracks').deleteMany (function(err, results){
		if (err){
			loginTool.homePageRedirect (res, 400, 'songs were not dropped from the database because of an error')
			console.log (err, "error")
		}else{
			loginTool.homePageRedirect (res, 200, 'songs were removed succsefully')
			console.log ('songs were dropped from user: ')
		}
	})
}

function guests (res, db, host){
	db.collection('guests').deleteMany (function(err, results){
		if (err){
			loginTool.homePageRedirect (res, 400, 'guests were not dropped from the database because of an error')
			console.log (err, "error")
		}else{
			loginTool.homePageRedirect (res, 200, 'guests were removed succsefully')
			console.log ('guests were dropped from user: ')
		}
	})
}

module.exports = {
	songs: songs,
	guests: guests
}