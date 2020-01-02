
CREATE TABLE IF NOT EXISTS company(
id SERIAL PRIMARY KEY,
companyName VARCHAR(255),
symbol VARCHAR(255),
price Decimal(19,2),
sector VARCHAR(255),
ceo VARCHAR(255),
companyDescription VARCHAR(255),
companyImage VARCHAR(255)
);

INSERT INTO company (companyName, symbol, price, sector, ceo, companyDescription, companyImage)
VALUES('Company inc', 'Moby Dick', '13.99', 'agriculture', 'Martin Papa', 'best company ever', 'https://via.placeholder.com/150');

