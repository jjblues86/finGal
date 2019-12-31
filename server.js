'use strict';
let mockData = {
  "symbol" : "AAPL",
  "profile" : {
    "price" : 291.45,
    "beta" : "1.139593",
    "volAvg" : "36724977",
    "mktCap" : "1345844630130.00",
    "lastDiv" : "2.92",
    "range" : "142-233.47",
    "changes" : -0.75,
    "changesPercentage" : "(-0.25%)",
    "companyName" : "Apple Inc.",
    "exchange" : "Nasdaq Global Select",
    "industry" : "Computer Hardware",
    "website" : "http://www.apple.com",
    "description" : "Apple Inc is designs, manufactures and markets mobile communication and media devices and personal computers, and sells a variety of related software, services, accessories, networking solutions and third-party digital content and applications.",
    "ceo" : "Timothy D. Cook",
    "sector" : "Technology",
    "image" : "https://financialmodelingprep.com/images-New-jpg/AAPL.jpg"
  }
};

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

require('dotenv').config();

app.use(express.static('./public'));

app.set('view engine', 'ejs');
app.set('views', './views/pages');

app.get('/', (request, response) => {
  response.render('index');
});

app.get('/results', (request, response) => {
  console.log(mockData.symbol, mockData.profile.price)
  response.render('results');
})

//Constructor

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
