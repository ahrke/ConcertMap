// load .env data into process.env
require('dotenv').config();

// Web server config
const BIND_HOST  = process.env.BIND_HOST || '0.0.0.0';
const express    = require("express");
const bodyParser = require("body-parser");
const sass = require("node-sass-middleware");
const app = express();
const morgan = require('morgan');
const http = require('http');
const https = require('https');
const fs = require('fs');
const cookieSession = require('cookie-session');

const database = require('./db/database');

// PG database client/connection setup
const { Pool } = require('pg');
const dbParams = require('./lib/db.js');
const db = new Pool(dbParams);
db.connect();

app.use(cookieSession({
  name: 'session',
  keys: ['turtle-force=five', 'backgammon']
}));

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Separated Routes for each Resource
const webRoutes = require('./routes/web');
const apiRoutes = require('./routes/api');

// Mount all resource routes
app.use("/", webRoutes(database));
app.use("/", apiRoutes(database));

(async() => {
  const getListenPromise = (server, ...p) => {
    return new Promise((resolve, reject) => {
      server.on('listening', resolve);
      server.on('error', reject);
      server.listen(...p);
    });
  };

  const httpServer = http.createServer(app);
  try {
    await getListenPromise(httpServer, 3000, BIND_HOST);
    console.log("App listening on port 80");
  } catch (err) {
    await getListenPromise(httpServer, process.env.ALT_PORT, BIND_HOST);
    console.log(`App listening on port ${process.env.ALT_PORT}`);
  }

  if (process.env.SSL_CERT && process.env.SSL_CERT_KEY && process.env.SSL_CA) {
    const privateKey = fs.readFileSync(process.env.SSL_CERT_KEY, 'utf8');
    const certificate = fs.readFileSync(process.env.SSL_CERT, 'utf8');
    const ca = fs.readFileSync(process.env.SSL_CA, 'utf8');
    const httpsServer = https.createServer({ key: privateKey, cert: certificate, ca}, app);
    await getListenPromise(httpsServer, 443, BIND_HOST);
    console.log("App listening on SSL port 443");
  }
})();
