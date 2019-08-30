DROP TABLE IF EXISTS stops CASCADE;
CREATE TABLE stops (
  id SERIAL PRIMARY KEY NOT NULL,
  next_stop_id INTEGER REFERENCES stops(id),
  trip_id INTEGER REFERENCES trips(id) NOT NULL,
  cus_event_id INTEGER REFERENCES custom_events(id),
  event_id INTEGER,
  description text NOT NULL DEFAULT ''
);
