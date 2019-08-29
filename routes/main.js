const express = require('express');
const router = express.Router();
const songkick = require('../api/songkick');
const db = require('../db/database');
const bcrypt = require('bcrypt');

const saltRounds = 10;

module.exports = () => {
  router.get('/api/spotify', (req, res) => {
    res.render("spotify", {});
  });

  router.get('/map', async(req, res) => {
    try {
      const eventsRes = await songkick.getVerifiedEvents(43.645144, -79.503008, '2019-08-30');
      const cusEventsRes = await db.getCustomEvents();
      let events = [...cusEventsRes,...eventsRes];
      res.render("main", { events, googleApiKey: process.env.GOOGLE_API_KEY });
    } catch (err) {
      console.log("error during spotify:", err);
    }
  });

  router.get('/login', (req,res) => {
    if (req.session.user_id) {
      res.redirect('/map');
    } else {
      res.render('login');
    }
  });

  router.get('/signup', (req,res) => {
    if (req.session.user_id) {
      res.redirect('/map');
    } else {
      res.render('signup');
    }
  });

  router.get('/newProfile', (req,res) => {
    if (req.session.user_id) {
      res.redirect('/users');
    } else {
      res.render('new_profile');
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
  router.post("/signup", (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      let user = {
        name: req.body.name,
        email: req.body.email,
        password: hash
      };

      db.addUser(user)
        .then(data => {
          req.session.user_id = data.id;
          res.render('new_profile')
        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
        });
    });
  });

  // POST add a profile for a created user
  router.post("/profile", (req, res) => {

    let profile = {
      user_id: req.session.user_id,
      bio: req.body.bio,
      avatar_uri: req.body.avatar_uri
    };

    db.addProfile(profile)
      .then(data => {
        res.redirect('/map');
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });


  return router;
};
