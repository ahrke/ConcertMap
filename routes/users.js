const express = require('express');
const songkick = require('../api/songkick');
const router = express.Router();

module.exports = (db) => {
  router.get('/testuser', async(req, res) => {
    const user = {
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
        o
        Ride my little pooh bear, wanna take a chance
        Wanna sip this smooth air, kick it in the sand
        I'd say I told you so but you just gonna cry
        You just wanna know those peanut butter vibes

        Mind my simple song, this ain't gonna work
        Mind my wicked words and tipsy topsy smirk
        I can't take this place, I can't take this place
        I just wanna go where I can get some space
        Truth be told
        I've been here, I've done this all before
        I tell you go gloom
        I cut it up and puff it into bloom

        Ride my little pooh bear, wanna take a chance
        Wanna sip this smooth air, kick it in the sand
        I'd say I told you so but you just gonna cry
        You just wanna know those peanut butter vibes

        Hold my hand, flow back to the summer time
        Tangled in the willows, now comes the tide
        How can I believe you, how can I be nice
        Tripping around the tree stumps in your summer smile
        `
    };

    try {
      const eventsRes = await songkick.getVerifiedEvents(43.661539, -79.411079);
      eventsRes.forEach((event) => {
        event.id = event.concert_id;
      });
      res.render('account', { events: eventsRes, user, googleApiKey: process.env.GOOGLE_API_KEY });
    } catch (err) {
      console.log("error from songkick route: ", err);
    }

  });


  router.get("/login/:email/:password", (req, res) => {
    db.userLogin(req.params.email, req.params.password)
      .then(data => {
        req.session.user_id = data.id;
        res.json(data);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  // GET user's custom created events
  router.get("/myEvents", (req, res) => {
    db.getUserCustomEvents(req.session.user_id)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  // GET user's favourites and attended events
  router.get("/myTags", (req, res) => {
    db.getUserEventTags(req.session.user_id)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  // GET user's created trips
  router.get("/myTrips", (req, res) => {
    db.getUserCreatedTrips(req.session.user_id)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  // GET user's favourited trips
  router.get("/myFavs", (req, res) => {
    db.getUserFavouritedTrips(req.session.user_id)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  // GET user profile
  router.get("/:id", (req, res) => {
    db.getProfile(req.params.id)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });


  // POST create a new user
  router.post("/new", (req, res) => {
    let user = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    };

    db.addUser(user)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  // POST update a profile's bio column
  router.post("/profile/updateBio", (req, res) => {
    let user = {
      user_id: req.body.user_id,
      bio: req.body.bio
    };

    db.updateProfileBio(user)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  // POST update a profile's avatar URI column
  router.post("/profile/updateAvatar", (req, res) => {
    let user = {
      user_id: req.body.user_id,
      avatar_uri: req.body.avatar_uri
    };

    db.updateProfileAvatarUri(user)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  // POST add a profile for a created user
  router.post("/profile", (req, res) => {
    console.log("from /users/profile ==> user_id:", typeof req.body.user_id);
    let profile = {
      user_id: req.body.user_id,
      bio: req.body.bio,
      avatar_uri: req.body.avatar_uri
    };
    console.log(profile);

    db.addProfile(profile)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });


  // POST add a favourite or attending tag
  router.post("/tag", (req, res) => {
    let tag = {
      user_id: req.session.user_id,
      event_id: req.body.event_id,
      trip_id: req.body.trip_id,
      cus_event_id: req.body.cus_event_id,
      label: req.body.label
    };

    db.addTag(tag)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });


  // POST add a new custom event
  router.post("/customEvent", (req, res) => {
    let customEvent = {
      user_id: req.session.user_id || 1, // REMOVE
      name: req.body.name,
      description: req.body.description,
      start_date: new Date(req.body.start_date),
      venue: req.body.venue,
      latlng: req.body.latlng.join(', ')
    };

    db.addCustomEvent(customEvent)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });


  // POST add a new trip
  router.post("/newtrip", (req, res) => {
    let trip = {
      user_id: req.session.user_id,
      name: req.body.name
    };

    db.addTrip(trip)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  // POST add a stop for a trip
  router.post("/addStop", (req, res) => {
    let stop = {
      trip_id: req.body.trip_id,
      event_id: req.body.event_id,
      cus_event_id: req.body.cus_event_id
    };

    db.addStop(stop)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });


  return router;
};
