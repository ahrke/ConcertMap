const express = require('express');
const router = express.Router();
const songkickApi = require('../api/songkick');

module.exports = () => {
  router.get('/', (req, res) => {
    songkickApi.getConcerts(43.645144, -79.503008, '2019-08-27')
      .then(concerts => {
        res.render("main_component", { concerts, googleApiKey: process.env.GOOGLE_API_KEY });
      })
      .catch(e => {
        console.error("error during spotify:", e);
        console.log("error during spotify:", e);
      })
  })

  return router;
}

