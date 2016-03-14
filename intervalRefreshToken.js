/*setInterval(function refreshToken (req, res) {
    if (host){
      // requesting access token from refresh token
      doc = query.findHost (host)
      var refresh_token
      query.search (host,doc, db, function (docum){
        refresh_token = docum.refresh_token
        console.log (refresh_token)
        var authOptions = {
          url: 'https://accounts.spotify.com/api/token',
          headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
          form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
          },
          json: true
        }
        request.post(authOptions, function (error, response, body) {
          if (!error && response.statusCode === 200) {
            access_token = body.access_token
            var documUpdate = query.findHost (host) 
            var updateInfo = update.accessToken (access_token)
            update.updater (host, documUpdate, updateInfo,db, function (error){
              console.log ('updated the access token:')
            })
          }
        })
      })
    }
  }, 3540000)*/