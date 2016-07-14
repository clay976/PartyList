function findHost (searchQ){
  return (
    { "host" : searchQ }) 
}

function findTrack (trackID){
  return (
    { "trackId":trackID}) 
}

function findGuest (phoneNum){
  return (
    { "phone" : phoneNum }) 
} 

module.exports = {
	findHost : findHost,
	findTrack :	findTrack,
	findGuest : findGuest
}