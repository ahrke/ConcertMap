const express = require('express');
const router  = express.Router();
const songkick_api = require('../api/songkick');

module.exports = () => {
  router.get("/:lat/:long/:date", (req, res) => {
    console.log("ROUTER songkick called: ",req.params.lat, req.params.long, req.params.date)
    songkick_api.getConcerts(req.params.lat, req.params.long, req.params.date)
      .then(result => res.json(result))
      .catch(e => {
        console.log("error from songkick route: ",e)
      })
  });
  return router
};
