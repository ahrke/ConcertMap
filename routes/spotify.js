const express = require('express');
const router = express.Router();
const spotifyApi = require('../api/spotify');

module.exports = () => {
  router.get('/', (req, res) => {
    console.log(req.hash)
    res.render("main_component")
  })

  return router;
}

