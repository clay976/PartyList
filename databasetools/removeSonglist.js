module.exports = function(db){
	db.collection('tracks').deleteMany (function(err, results){
	      console.log(results);
	)};
};
