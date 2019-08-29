const express = require('express');
const router = express.Router();
const songkick = require('../api/songkick');

module.exports = () => {
  router.get("/event/:id", (req, res) => {
    songkick.getEventInfo(req.params.id)
      .then(data => {
        res.json(data)
      })
      .catch(err => {
        console.log("error fetching event info for ",req.params.id,":",err);
        res.redirect('/');
      })
  })

  router.get("/:lat/:long/:date", async(req, res) => {
    try {
      const events = await songkick.getVerifiedEvents(req.params.lat, req.params.long);
      res.json(events);
    } catch (err) {
      console.log("error from songkick route: ", err);
    }
  });


  return router;
};
