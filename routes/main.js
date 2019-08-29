const express = require('express');
const router = express.Router();
const songkick = require('../api/songkick');
const db = require('../db/database');

module.exports = () => {
  router.get('/api/spotify', (req, res) => {
    res.render("spotify", {});
  });

  router.get('/map', async(req, res) => {
    try {
      const eventsRes = await songkick.getVerifiedEvents(43.645144, -79.503008, '2019-08-30');
      eventsRes.forEach((event) => {
        event.id = event.concert_id;
      });
      const cusEventsRes = await db.getCustomEvents();
      res.render("main", { events: [...cusEventsRes, ...eventsRes], googleApiKey: process.env.GOOGLE_API_KEY });
    } catch (err) {
      console.log("error during spotify:", err);
    }
  });
  return router;
};
