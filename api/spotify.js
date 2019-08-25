const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_KEY } = require('../config.js');
const request = require('request-promise-native');
const SpotifyWebApiNode = require('spotify-web-api-node');
const spotifyApi = new SpotifyWebApiNode({
  clientId: SPOTIFY_CLIENT_ID,
  clientSecret: SPOTIFY_CLIENT_KEY,
  redirectUri: 'http://localhost:3000'
});

/*
 *  Retrieve artist information
 *  Retrieve playlist containing songs from artist
 *  Return artist info (name, bio, avatar)
 *
 */
console.log(SPOTIFY_CLIENT_ID)

 const searchForArtist = () => {
   return spotifyApi.search('Glass Animals',['artist','playlist'])
 }

 searchForArtist().then(res => console.log(res))

module.exports = {

}
