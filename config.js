// to create a module that provides access to environment variables
const dotenv = require('dotenv');
dotenv.config({path: __dirname + '/.env'});

module.exports = {
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_KEY: process.env.SPOTIFY_CLIENT_KEY,
  SONGKICK: process.env.SONGKICK,
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME,
  DB_SSL: process.env.DB_SSL,
  DB_PORT: process.env.DB_PORT,
  DB_PASSWORD: process.env.DB_PASS
}
