DROP TABLE IF EXISTS artists CASCADE;

CREATE TABLE artists (
  id SERIAL PRIMARY KEY NOT NULL,
  cus_event_id INTEGER REFERENCES custom_events(id) NOT NULL,
  name VARCHAR(255)
)
