-- Run schema
-- psql -d finGal -f schema.sql 

-- Push db to heroku
-- heroku pg:push FinGal DATABASE_URL --app fin-gal
DROP TABLE companies;
DROP TABLE users;
CREATE TABLE users (
  id SERIAL PRIMARY KEY
);

CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  price DECIMAL(13,2),
  sector VARCHAR(255),
  ceo VARCHAR(255),
  description VARCHAR(255),
  image VARCHAR(255),
  user_id INT,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

