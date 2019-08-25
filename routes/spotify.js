const express = require('express');
const router = express.Router();
const songkickApi = require('../api/songkick');

module.exports = () => {
  router.get('/', (req, res) => {
    songkickApi.getConcerts(43.645144, -79.503008,'2019-08-25').then(concerts => {
      let concertList = {
        concerts: concerts
      }

      res.render("main_component", concertList)
    })
  })

  return router;
}

