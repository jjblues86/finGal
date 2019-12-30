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
  let companyURL = `https://financialmodelingprep.com/api/v3/company/profile/AAPL`;


  if(searchType === 'search'){
    companyURL += `insearch:${searchStr}`
  }
  console.log('this 1', searchType)

  superagent.get(companyURL)
    .then(result => {
      // console.log('this', result)
      const parseResult = JSON.parse(result.text);
      console.log('this 2', parseResult.profile)


      // let companyData = parseResult.body.map(data => new Company(data))
      let parseResultProfile = parseResult.profile;
      console.log('what', parseResultProfile)
      let company = new Company(parseResultProfile)
      console.log('this 3', company)
      // console.log('this 4', companyData)
      response.render('searches/show', {company});
    })
    .catch(err => console.log(err));
}

function search(request, response){
  response.render('index')
}

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

function errorHandler(request, response){
  if(response) response.status(500).render('error');
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
