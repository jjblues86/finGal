'use strict';
const express = require('express');
const app = express();
const superagent = require('superagent');

const PORT = process.env.PORT || 3000;

require('dotenv').config();


app.use(express.static('./public'));

//Middleware
app.use(express.urlencoded({extended: true}));

app.set('view engine', 'ejs');
app.set('views', './views/pages');

// app.get('/', (request, response) => {
//   response.render('index');
// });

//Routes
app.get('/', search);
app.post('/searches', newSearch);


function newSearch(request, response){
  // console.log('this', request.body)
  // response.render('index.ejs')

  let searchStr = request.body.search;
  let searchType = request.body.search;
  let companyURL = `https://financialmodelingprep.com/api/v3/company/profile/${searchStr}`;
  // let companyURL = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=BA&apikey=ORAVID4KP25O67E4`
  // let companyURL = `https://financialmodelingprep.com/api/v3/company/stock/list`;


  if(searchType === 'search'){
    companyURL += `insearch:${searchStr}`
  }
  console.log('this 1', searchType)

  superagent.get(companyURL)
    .then(result => {

      // console.log('this', result)
      const parseResult = JSON.parse(result.text);
      console.log('this 2', parseResult)


      // let company = result.body.symbolsList.map(data => new Company(data))
      // let regex = regex.search('\d+|$', company).group();
      // console.log('here', regex

      let parseResultProfile = parseResult.profile;
      // let company = Object.entries(parseResultProfile).map(data => new Company(data));
      // console.log('what', company)
      let company = new Company(parseResultProfile)
      // let company = new Company(companyData)

      console.log('this 3', company)
      // console.log('this 4', company)
      response.render('searches/show', {company});
    })
    .catch(err => console.log(err));
}

function search(request, response){
  response.render('index')
}

app.get('/results', (request, response) => {
  // console.log(mockData.symbol, mockData.profile.price)
  response.render('results');
})

//Constructor
function Company(obj){
  this.name = obj.companyName;
  this.symbol = obj.symbol;
  this.price = obj.price;
  this.sector = obj.sector;
  this.beta = obj.beta;
  this.description = obj.description;
  this.image = obj.image;
}

// function Company(obj){
//   this.symbol = obj.symbol;
//   this.name = obj.name;
//   this.equity = obj.equity;
//   this.region = obj.region;
// }

// function Company(obj){
//   this.symbol = obj.symbol;
//   this.name = obj.name;
//   this.price = obj.price;
// }

function errorHandler(request, response){
  if(response) response.status(500).render('error');
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
