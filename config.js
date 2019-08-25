// to create a module that provides access to environment variables
const dotenv = require('dotenv');
dotenv.config({path: __dirname + '/.env'});

module.exports = {
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_KEY: process.env.SPOTIFY_CLIENT_KEY,
  SONGKICK: process.env.SONGKICK
}
