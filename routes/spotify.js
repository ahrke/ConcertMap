const express = require('express');
const router = express.Router();
const songkickApi = require('../api/songkick');

module.exports = () => {
  router.get('/', (req, res) => {
    songkickApi.getConcerts(43.645144, -79.503008,'2019-08-27').then(concerts => {
      let concertList = {
        concerts: concerts
      }
      console.log(concertList)

      res.render("main_component", concertList)
    })
    .catch(e => {
      console.error("error during spotify:",e)
      console.log("error during spotify:",e)
    })
  })

  return router;
}

