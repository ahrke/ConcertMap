DROP TABLE IF EXISTS custom_events CASCADE;
CREATE TABLE custom_events (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  name VARCHAR(255),
  description TEXT,
  start_date DATE,
  venue VARCHAR(255),
  latlng POINT
);
