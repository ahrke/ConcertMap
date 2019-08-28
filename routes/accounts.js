const express = require('express');
const songkick = require('../api/songkick');
const router = express.Router();

module.exports = () => {
  router.get('/:id', async(req, res) => {
    let user = {
      name: 'Dave',
      id: req.params.id,
      bio: `
        I come close
        Let me show you everything I know
        The jungle slang
        Spinning around my head and I stare
        While my naked fool
        Fresh out of an icky gooey womb
        A woozy womb
        Dope so good, a silky smooth perfume
        `
    };

    try {
      const eventsRes = await songkick.getVerifiedEvents(43.645144, -79.503008, '2019-08-30');
      res.render('account', { user, events: eventsRes, googleApiKey: process.env.GOOGLE_API_KEY });
    } catch (err) {
      console.log("error during spotify:", err);
    }
  });

  return router;
}
