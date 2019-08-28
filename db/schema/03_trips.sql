DROP TABLE IF EXISTS trips CASCADE;
CREATE TABLE trips (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  name VARCHAR(255)
);
