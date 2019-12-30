'use strict';
const express = require('express');
const app = express();
const superagent = require('superagent');

const PORT = process.env.PORT || 3000;

require('dotenv').config();

//Middleware
app.use(express.urlencoded({extended: true}));

app.set('view engine', 'ejs');
app.set('views', './views/pages');

app.get('/', (request, response) => {
  response.render('index');
});

//Routes
app.get('/', search);
app.post('/', newSearch);


function search(request, response){

  let searchStr = request.body.search;
  let searchType = request.body.search;
  let companyURL = `https://financialmodelingprep.com/api/v3/company/profile/AAPL`;


  if(searchType === 'search'){
    companyURL += `insearch:${searchStr}`
  }
  console.log('this', searchType)

  superagent.get(companyURL)
    .then(result => {
      let companyData = result.body.profile.map(data => new Company(data))
      console.log('this', companyData)
      response.render('pages/index', {companyData});
    })
    .catch(err => errorHandler(err));
}

function newSearch(request, response){
  response.render('index')
}

//Constructor
function Company(obj){
  this.name = obj.profile.companyName;
  this.symbol = obj.symbol;
  this.price = obj.profile.price;
  this.sector = obj.profile.sector;
  this.beta = obj.profile.beta;
  this.description = obj.profile.description;
  this.image = obj.profile.image;
}

function errorHandler(request, response){
  if(response) response.status(500).render('error');
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
