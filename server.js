'use strict';
const express = require('express');
const app = express();
const superagent = require('superagent');

const PORT = process.env.PORT || 3000;

require('dotenv').config();

app.use(express.static('./public'));

//Middleware
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', './views/pages');

// app.get('/', (request, response) => {
//   response.render('index');
// });

//Routes
app.get('/', search);
app.post('/searches', newSearch);

// let searchStr = request.body.search;

// console.log('search field', searchStr);

function newSearch(request, response) {
  // console.log('this', request.body)
  // response.render('index.ejs')

  let searchStr = request.body.search;
  // let searchType = request.body.search;

  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>searchStr', searchStr);
  searchAlpha(searchStr)
    .then(result =>{
      console.log('this 12', result)
      let companyURL = `https://financialmodelingprep.com/api/v3/company/profile/${result}`;
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
          console.log('this 4', company)
          response.render('searches/show', { company });
        })
        .catch(err => console.log(err));
    })
}

// console.log('x', x);


// if (searchType === 'search') {
//   companyURL += `insearch:${searchStr}`
// }
// console.log('this 1', searchType)


function search(request, response) {
  response.render('index')
}

app.get('/results', (request, response) => {
  console.log(mockData.symbol, mockData.profile.price)
  response.render('results');
})

//Constructor
function Company(obj) {
  this.name = obj.companyName;
  this.symbol = obj.symbol;
  this.price = obj.price;
  this.sector = obj.sector;
  this.ceo = obj.ceo;
  this.description = obj.description;
  this.image = obj.image;
}

// logic to pull sticker information from the company name to send to the main API

function searchAlpha(userKey){

  return superagent.get(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${userKey}&apikey=7R6ONK4007JF3LU7`).then(response => {

    let stickerObject = response.body.bestMatches[0];

    let symbolShare = stickerObject['1. symbol'];

    let nameShare = stickerObject['2. name'];
    console.log('data to parse to next API', symbolShare, nameShare);

    return symbolShare;

  })

    .catch(error => {
      console.error('catch on it ', error)
    })
}







app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
