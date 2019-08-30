const express = require('express');
const router = express.Router();
const songkick = require('../api/songkick');

module.exports = (db) => {

  const handleAppError = (req, res, err) => {
    res.status(400);
    res.json({ error: err.message });
  };

  router.get("/temp_form", (req, res) => {
    res.render("temp_user_form");
  });

  router.get('/spotify/redirect', (req, res) => {
    res.render("spotify", { mapPageLink: '/map' });
  });

  router.get("/", (req, res) => {
    res.render("lander", { baseURI: process.env.BASE_URI, spotifyApiID: process.env.SPOTIFY_API_ID, googleApiKey: process.env.GOOGLE_API_KEY });
  });

  router.get('/map', async (req, res) => {
    try {
      const eventsReq = songkick.getVerifiedEvents(43.645144, -79.503008, '2019-08-30');
      const cusEventsReq = db.getCustomEvents();
      const [events, cusEvents] = await Promise.all([eventsReq, cusEventsReq]);
      for (let event of events) {
        event.id = String(event['concert_id']);
        delete event['concert_id'];
      }
      res.render("main", { events: [...cusEvents, ...events], googleApiKey: process.env.GOOGLE_API_KEY });
    } catch (err) {
      console.log("error during spotify:", err);
    }
  });

  router.get("/profile", async (req, res) => {
    try {
      if (req.session['user_id']) {
        const eventsReq = songkick.getVerifiedEvents(43.645144, -79.503008, '2019-08-30');
        const cusEventsReq = db.getCustomEvents({ 'user_id': req.session['user_id'] });
        const profileReq = db.getUserProfile(req.session['user_id']);
        const [profile, events, cusEvents] = await Promise.all([profileReq, eventsReq, cusEventsReq]);
        res.render('account', { events: [...cusEvents, ...events], user: profile, googleApiKey: process.env.GOOGLE_API_KEY });
      } else {
        res.redirect("/login");
      }
    } catch (err) {
      handleAppError(req, res, err);
    }
  });

  router.get("/settings", async (req, res) => {
    try {
      if (req.session['user_id']) {
        const profile = await db.getProfile(req.session['user_id']);
        res.render('user_settings', profile);
      } else {
        res.redirect("/login");
      }
    } catch (err) {
      handleAppError(req, res, err);
    }
  });

  router.get("/trips", async (req, res) => {
    try {
      const trips = await db.getTrips();
      res.render('all_trips', { 'user_id': req.session['user_id'], trips, googleApiKey: process.env.GOOGLE_API_KEY });
    } catch (err) {
      handleAppError(req, res, err);
    }
  });

  router.get("/profile/trips", async (req, res) => {
    try {
      if (req.session['user_id']) {
        const userId = req.session['user_id'];
        const tripsReq = db.getTrips({ 'user_id': userId });
        const userTagsReq = db.getUserTags(userId);
        let [userTags, trips] = await Promise.all([userTagsReq, tripsReq]);
        for (let trip of trips) {
          // Why???
          trip.heart = false;
          trip['user_id'] = userId;
        }
        res.render('all_trips', { 'user_id': req.session['user_id'], trips, googleApiKey: GOOGLE_API_KEY });
      } else {
        res.redirect('/login');
      }
    } catch (err) {
      handleAppError(req, res, err);
    }
  });

  router.post("/login", async (req, res) => {
    try {
      const user = await db.getUserByEmail(req.body.email);
      const [err, isAuthed] = await bcrypt.compare(req.body.password, user.password);
      if (isAuthed) {
        req.session['user_id'] = user.id;
        res.redirect('/profile');
      } else {
        req.session = null;
        res.redirect('/login');
        throw new Error(err.toString());
      }
    } catch (err) {
      handleAppError(req, res, err);
    }
  });

  router.get("/logout", (req, res) => {
    req.session = null;
    res.redirect('/');
  });

  return router;
};
