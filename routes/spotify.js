const express = require('express');
const router = express.Router();
const spotifyApi = require('../api/spotify');

module.exports = () => {
  router.get('/', (req, res) => {
    res.render("artist")
  })

  return router;
}

