function responseHandler (err, results) {
  if (err){
    console.log ('there was an error updating the document')
  }else{
    console.log ('document updated succsefully')
  }
}

module.exports = {
  responseHandler: responseHandler
}