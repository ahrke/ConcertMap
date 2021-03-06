const express = require('express');
const router = express.Router();
const songkick = require('../api/songkick');

module.exports = (db) => {

  const handleAppError = (req, res, err) => {
    console.log(err);
    res.status(400);
    res.json({ error: err.message });
  };

  const renameSongkickId = (events) => {
    for (let event of events) {
      event.id = String(event['concert_id']);
      delete event['concert_id'];
    }
  };

  router.get("/temp_form", (req, res) => {
    res.render("temp_user_form");
  });

  router.get('/spotify/redirect', (req, res) => {
    res.render("spotify", { mapPageLink: '/map' });
  });

  router.get("/", (req, res) => {
    res.render("lander", { redirectURI: '/spotify/redirect', baseURI: process.env.BASE_URI, spotifyApiID: process.env.SPOTIFY_API_ID, googleApiKey: process.env.GOOGLE_API_KEY });
  });

  router.get('/map', async (req, res) => {
    try {
      const eventsReq = songkick.getVerifiedEvents(43.645144, -79.503008, '2019-08-30');
      const cusEventsReq = db.getCustomEvents();
      const [events, cusEvents] = await Promise.all([eventsReq, cusEventsReq]);
      renameSongkickId(events);
      events.splice(20);
      res.render("main", { events: [...cusEvents, ...events], user_id: req.session.user_id, googleApiKey: process.env.GOOGLE_API_KEY });
    } catch (err) {
      console.log("error during spotify:", err);
    }
  });

  router.get("/profile", async (req, res) => {
    try {
      if (req.session['user_id']) {
        console.log("==|==|> inside getProfile")
        const userIdFilter = { 'user_id': req.session['user_id'] };
        const eventsReq = songkick.getVerifiedEvents(43.645144, -79.503008, '2019-08-30');
        const cusEventsReq = db.getCustomEvents(userIdFilter);
        const profileReq = db.getUserProfile(req.session['user_id']);
        // const tripsReq = await db.getTrips(userIdFilter);
        const [profile, events, cusEvents, trips] = await Promise.all([profileReq]);
        // renameSongkickId(events);
        // events.splice(20);
        res.render('account', { events: [], trips: [], user: profile, googleApiKey: process.env.GOOGLE_API_KEY });
      } else {
        res.redirect("/login");
      }
    } catch (err) {
      handleAppError(req, res, err);
    }
  });

  router.get("/profile/settings", async (req, res) => {
    try {
      if (req.session['user_id']) {
        const profile = await db.getUserProfile(req.session['user_id']);
        res.render('user_settings', { user: profile });
      } else {
        res.redirect("/login");
      }
    } catch (err) {
      handleAppError(req, res, err);
    }
  });

  router.get("/trips", async (req, res) => {
    try {
      const userIdFilter = { 'user_id': req.session['user_id'] };
      const eventsReq = songkick.getVerifiedEvents(43.645144, -79.503008, '2019-08-30');
      const [events] = await Promise.all([eventsReq]);
      renameSongkickId(events);
      events.splice(20);
      res.render('all_trips', { user: userIdFilter, events, trips: [], googleApiKey: process.env.GOOGLE_API_KEY });
    } catch (err) {
      handleAppError(req, res, err);
    }
  });

  router.get("/profile/trips", async (req, res) => {
    try {
      if (req.session['user_id']) {
        const userIdFilter = { 'user_id': req.session['user_id'] };
        const eventsReq = songkick.getVerifiedEvents(43.645144, -79.503008, '2019-08-30');
        const [events] = await Promise.all([eventsReq]);
        renameSongkickId(events);
        events.splice(20);
        res.render('all_trips', { user: userIdFilter, events, trips: [], googleApiKey: process.env.GOOGLE_API_KEY });
      } else {
        res.redirect('/login');
      }
    } catch (err) {
      handleAppError(req, res, err);
    }
  });

  router.get('/login', (req, res) => {
    if (req.session.user_id) {
      res.redirect('/map');
    } else {
      res.render('login');
    }
  });
  router.get('/signup', (req, res) => {
    if (req.session.user_id) {
      res.redirect('/map');
    } else {
      res.render('signup');
    }
  });
  router.get('/newProfile', (req, res) => {
    if (req.session.user_id) {
      res.redirect('/users');
    } else {
      res.render('new_profile');
    }
  });

  router.post("/login", async (req, res) => {
    req.session.user_id = 11;
    res.redirect("/map");
    // console.log(req.body.email)
    // try {
    //   const user = await db.getUserByEmail(req.body.email);
    //   console.log("user ==> ",user)
    //   const [err, isAuthed] = await bcrypt.compare(req.body.password, user.password);
    //   if (isAuthed) {
    //     req.session['user_id'] = user.id;
    //     res.redirect('/profile');
    //   } else {
    //     req.session = null;
    //     res.redirect('/login');
    //     throw new Error(err.toString());
    //   }
    // } catch (err) {
    //   handleAppError(req, res, err);
    // }
  });

  router.get("/logout", (req, res) => {
    req.session = null;
    res.redirect('/');
  });

  return router;
};
