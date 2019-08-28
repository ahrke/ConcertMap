DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) NOT NULL,
  name VARCHAR(255),
  avatar_uri VARCHAR(255),
  bio TEXT
);
