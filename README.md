# finGal

# Project Description
- We are building a financial app targeting young women (ages 19-30) in which we will provide simple to read financial data and investing information. 

## Problem Domain
- Providing valuable financial information for young women in investing in a simple and straightforward approach.

## API Endpoints
- https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords
- https://financialmodelingprep.com/api/v3/company/profile

## Libraries, Frameworks & Packages
- Express
- PostgreSQL
- Superagent
- EJS
- Method-Override
- financialmodelingprep.com API
- Alpha Vantage API

## Database Schemas
```
 CREATE TABLE users (
  id SERIAL PRIMARY KEY
);

CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  price NUMERIC(9,6),
  sector VARCHAR(255),
  ceo VARCHAR(255),
  description VARCHAR(255),
  image VARCHAR(255),
  user_id INT,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
```

# Group Members
- Jerome Joof
- Martin Papa
- Annie Pineda
- Sergey Voytov
