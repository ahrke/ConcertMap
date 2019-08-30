const express = require('express');
const router = express.Router();

module.exports = (db) => {

  const handleAppError = (req, res, err) => {
    res.status(400);
    res.json({ error: err.message });
  };

  // GET a trip's data (all stops)
  router.get("/trips/:tripId/stops", async (req, res) => {
    try {
      const stops = await db.getTripStops(req.params.tripId);
      res.json(stops);
    } catch (err) {
      handleAppError(req, res, err);
    }
  });

  // POST/PUT routes
  router.post("/users", async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
      delete req.body.password;
      const user = {
        email: req.body.email,
        password: hashedPassword
      };
      res.json(user);
    } catch (err) {
      handleAppError(req, res, err);
    }
  });

  router.post("/users/profile", async (req, res) => {
    try {
      const profile = {
        'user_id': req.session['user_id'],
        'avatar_uri': req.body['avatar_uri'],
        'name': req.body.name,
        'bio': req.body.bio
      };
      res.json(profile);
    } catch (err) {
      handleAppError(req, res, err);
    }
  });

  router.post("/users/tags", async (req, res) => {
    try {
      const tag = {
        'user_id': req.session['user_id'],
        'target_id': req.body['target_id'],
        'target_type': req.body['target_type'],
        'label': req.body.label
      };
      res.json(tag);
    } catch (err) {
      handleAppError(req, res, err);
    }
  });

  router.post("/events", async (req, res) => {
    try {
      const customEvent = {
        'user_id': req.session.user_id || 1,
        'name': req.body.name,
        'description': req.body.description,
        'start_date': new Date(req.body.start_date),
        'venue': req.body.venue,
        'latlng': req.body.latlng.join(', ')
      };
      res.json(customEvent);
    } catch (err) {
      handleAppError(req, res, err);
    }
  });

  router.post("/trips", async (req, res) => {
    try {
      const trip = {
        'user_id': req.session.user_id,
        'name': req.body.name
      };
      res.json(trip);
    } catch (err) {
      handleAppError(req, res, err);
    }
  });

  router.post("/trips/:tripId/stops", async (req, res) => {
    try {
      const stop = {
        'trip_id': req.params.tripId,
        'event_id': req.body['event_id'],
        'id': req.body.id,
        'description': req.body['description']
      };
      res.json(stop);
    } catch (err) {
      handleAppError(req, res, err);
    }
  });

  router.put("/trips/:tripId/stops/:stopId", async (req, res) => {
    try {
      const stop = {
        'trip_id': req.params.tripId,
        'event_id': req.body['event_id'],
        'next_stop_id': req.body['next_stop_id'],
        'description': req.body['description']
      };
      res.json(stop);
    } catch (err) {
      handleAppError(req, res, err);
    }
  });


  return router;
}
