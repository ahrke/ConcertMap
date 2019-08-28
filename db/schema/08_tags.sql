
DROP TABLE IF EXISTS tags CASCADE;
CREATE TABLE tags (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id),
  event_id INTEGER,
  trip_id INTEGER REFERENCES trips(id),
  cus_events_id INTEGER REFERENCES custom_events(id),
  label tag_label_t NOT NULL
);
