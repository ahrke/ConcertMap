const express = require('express');
const router = express.Router();
const songkick = require('../api/songkick');

module.exports = () => {
  router.get('/api/spotify', (req, res) => {
    res.render("spotify", {});
  });

  router.get('/map', async(req, res) => {
    try {
      const eventsRes = await songkick.getVerifiedEvents(43.645144, -79.503008, '2019-08-30');
      res.render("main", { events: eventsRes, googleApiKey: process.env.GOOGLE_API_KEY });
    } catch (err) {
      console.log("error during spotify:", err);
    }
  });
  return router;
};
