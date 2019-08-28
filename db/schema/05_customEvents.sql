DROP TABLE IF EXISTS customEvents CASCADE;
CREATE TABLE customEvents (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  name VARCHAR(255),
  description TEXT,
  start_date DATE,
  venue VARCHAR(255),
  latlng POINT
);
