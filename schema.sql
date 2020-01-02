-- Run schema
-- psql -d finGal -f schema.sql 

-- Push db to heroku
-- heroku pg:push FinGal DATABASE_URL --app fin-gal

CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  price NUMERIC(9,6),
  sector VARCHAR(255),
  ceo VARCHAR(255),
  description VARCHAR(255),
  image VARCHAR(255)
);
