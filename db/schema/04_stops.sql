DROP TABLE IF EXISTS stops CASCADE;
CREATE TABLE stops (
  id SERIAL PRIMARY KEY NOT NULL,
  trip_id INTEGER REFERENCES trips(id) NOT NULL,
  event_id INTEGER,
  custom_event_id INTEGER REFERENCES customEvents(id)
);
