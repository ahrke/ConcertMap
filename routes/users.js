const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { GOOGLE_API_KEY } = require('../config');

let saltRounds = 10;

module.exports = (db) => {

  // GET user's settings page
  router.get("/settings", (req, res) => {
    if (req.session.user_id) {
      db.getProfile(req.session.user_id)
        .then(data => {
          let user = {
            name: data.name,
            bio: data.bio,
            avatar_uri: data.avatar_uri
          }
          res.render("user_settings", {user});
        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
        });
    } else {
      res.redirect("/login");
    }
  })

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

  // GET logout user
  router.get("/logout", (req, res) => {
    if (req.session) req.session = null;
    res.redirect('/');
  })

  // GET user profile
  router.get("/", (req, res) => {
    if (req.session.user_id) {
      db.getProfile(req.session.user_id)
        .then(data => {
          console.log("from inside getProfile, data:", data)
          let user = {
            name: data.name,
            bio: data.bio,
            avatar_uri: data.avatar_uri
          }

          // GET user's custom events markers. We'll need to pass that to the user's page
          db.getUserCustomEvents(req.session.user_id)
            .then(data => {
              let events = data;

              // We need to change the event's latlng value from an object to an array for markerRender()
              for (let event of events) {
                event.latlng = [event.latlng.x, event.latlng.y];
              }

              res.render('account', {events, user, googleApiKey: GOOGLE_API_KEY});
            })
            .catch(err => {
              res
                .status(500)
                .json({ error: err.message });
            });
        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
        });
    } else {
      res.redirect("/login");
    }
  });



  // POST user login
  router.post("/login", (req, res) => {
    // if (req.session.user_id) {
    //   res.redirect('/users/' + req.session.user_id);
    // }

    let user = {
      email: req.body.email,
      password: req.body.password
    }

    db.getUserWithEmail(user.email)
      .then(data => {
        bcrypt.compare(user.password, data.password, function(fail, succ) {
          if (succ) {
            req.session.user_id = data.id;
            res.redirect('/users/')
          } else {
            console.log("invalid login", fail);
            req.session = null;
            res.redirect('/login');
          }
        });
      });
  });

  // POST create a new user
  router.post("/new", (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      let user = {
        name: req.body.name,
        email: req.body.email,
        password: hash
      };

      console.log("from bcrypt, hash:", hash)

      db.addUser(user)
        .then(data => {
          res.json(data)
        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
        });
    });
  })

  // POST update a profile's bio column
  router.post("/profile/updateBio", (req, res) => {
    if (req.session.user_id) {
      let user = {
        user_id: req.session.user_id,
        bio: req.body.bio
      };

      db.updateProfileBio(user)
        .then(data => {
          let user = data;
          res.redirect('/settings', {user})
        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
        });
    } else {
      res.redirect('/login');
    }
  })

  // POST update a profile's avatar URI column
  router.post("/profile/updateAvatar", (req, res) => {
    if (req.session.user_id) {
      let user = {
        user_id: req.session.user_id,
        avatar_uri: req.body.avatar_uri
      };

      db.updateProfileAvatarUri(user)
        .then(data => {
          let user = data;
          res.redirect('/settings', {user})
        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
        });
    } else {
      res.redirect('/login');
    }
  })

  // POST add a profile for a created user
  router.post("/profile", (req, res) => {

    let profile = {
      user_id: req.body.user_id,
      bio: req.body.bio,
      avatar_uri: req.body.avatar_uri
    };
    console.log(profile)

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
      user_id: req.session.user_id,
      name: req.body.name,
      description: req.body.description,
      start_date: req.body.start_date,
      venue: req.body.venue,
      latlng: req.body.latlng
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
}
